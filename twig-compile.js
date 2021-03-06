"use strict";

var through = require('through2');
var fs = require('fs');
var path = require('path');
var Twig;
var twig;
var nameNormilizer;
var gutil = require('gulp-util');
var _ = require('lodash');
var symfonyTwigNormalize = require('./lib/nameNormalizers').symfonyTwigNormalize;

var PluginError = gutil.PluginError;

var currentTwigVersion;
var clearTemplate;

var checkVersion = function (mj, mi, fx, supress) {
  if (supress) {
    return currentTwigVersion[0] == mj && currentTwigVersion[1] == mi && currentTwigVersion[2] == fx;
  }
  if (currentTwigVersion[0] != mj) {
    console.error("Twig has another version");
  } else {
    if (currentTwigVersion[1] != mi) {
      console.warn("Twig has another version");
    } else {
      if (currentTwigVersion[2] != fx) {
        console.log("Twig has another version");
        return false;
      } else {
        return true;
      }
    }
  }
};

module.exports = function (opt) {
  return through.obj(module.exports.transform.bind(this, opt));
};

module.exports.transform = function transform(opt, file, enc, cb) {
  if (file.isNull()) return cb(null, file);
  if (file.isStream()) return cb(new PluginError('gulp-twig-compile', 'Streaming not supported'));

  var options = _.merge({
    twig:           'twig',
    compileOptions: {
      viewPrefix:           '',
      es5:                  false,
      checkFrontendVersion: false,
    },
  }, opt);
  options = _.merge({
    compileOptions: {
      requireName: function (v, template) {
        return '"' + options.compileOptions.viewPrefix + v + '"';
      },
      existFile:   function (originalfile) {
        var lookPaths;
        var file = originalfile;
        if (_.isPlainObject(options.compileOptions.lookPaths)) {
          var filePrefix = originalfile.match(/^([^\/\\]+[\/\\])/);
          filePrefix = filePrefix && filePrefix[1] || '';
          lookPaths = options.compileOptions.lookPaths[filePrefix] || [];
          if (lookPaths.length) {
            file = file.replace(filePrefix, '');
          } else {
            lookPaths = options.compileOptions.lookPaths[''] || [];
          }
        } else {
          lookPaths = _.toArray(options.compileOptions.lookPaths) || [];
        }
        return _.some(lookPaths, function (lookPath) {
          var fileName = path.join(/*__dirname, */lookPath, file);
          // console.log('lookPath', lookPath, fileName);
          return fs.existsSync(fileName);
        });
      },
      id:          function (file) {
        return file.relative;
      },
      resetId:     false
    }
  }, options);
  var data;
  try {
    var templateId = options.compileOptions.id(file);
    if (options.compileOptions.resetId) {
      //console.log('reset template: ', templateId, clearTemplate(templateId))
      clearTemplate(templateId);
    }
    var template = twig({id: templateId, data: file.contents.toString('utf8'), allowInlineIncludes: true});
    data = template.compile(options);
  } catch (err) {
    return cb(new PluginError('gulp-twig-compile', err));
  }

  file.contents = new Buffer(data);
  file.path = file.path + '.js';

  cb(null, file);
};

module.exports.setTwigNameNormalizer = function setTwigNameNormalizer(normalizer) {
  nameNormilizer = normalizer;
};

module.exports.setTwig = function setTwig(TwigOtherVersion) {
  Twig = TwigOtherVersion || require('twig');
  twig = Twig.twig;
  currentTwigVersion = Twig.VERSION.split('.');
  if (checkVersion(0, 8, 5, true)) {
    console.error("This version of Twig has bug!")
  }

  /*
   * Change Twig to add additional compile options
   * (main feature: parse dependencies and add ones in requirejs define arguments)
   */
  Twig.cache(false);//for watch

  Twig.extend(function (Twig) {
    /*
     * Add ability of loading inline templates
     */
    Twig.compiler.wrap = function (id, tokens) {
      id = id.split("\\").join("/");//windows fix
      return 'var autoGeneratedData = {id:"' + id.replace('"', '\\"') + '", allowInlineIncludes: true, data:' + tokens + ', precompiled: true};\n\n';
    };
    /*
     * When compile amd module (that is all we can...) pass additional arguments (template, options)
     */
    Twig.compiler.compile = function (template, options) {
      // Get tokens
      var tokens = JSON.stringify(template.tokens),
          id     = template.id,
          output;

      if (options.module) {
        if (Twig.compiler.module[options.module] === undefined) {
          throw new Twig.Error("Unable to find module type " + options.module);
        }
        output = Twig.compiler.module[options.module](id, tokens, options.twig, template, options);
      } else {
        output = Twig.compiler.wrap(id, tokens);
      }
      return output;
    };
    /*
     * Customize Twig errors
     */
    Twig.log = {
      trace: function () {
        if (Twig.trace) {
          gutil.log(gutil.colors.grey(Array.prototype.slice.call(arguments)));
        }
      },
      debug: function () {
        if (Twig.debug) {
          gutil.log(gutil.colors.grey(Array.prototype.slice.call(arguments)));
        }
      },
      error: function () {
        gutil.log(gutil.colors.grey(Array.prototype.slice.call(arguments)));
      }
    };
    /*
     * Inject in parsing and get static (not evaluated!) template dependencies
     */
    var overrideOld = {},
        override    = function (name, i) {// Twig.
          overrideOld[name] = Twig.logic.handler[name].compile;
          Twig.logic.handler[name].compile = function (token) {
            var match = token.match,
                expression = match[i].trim();
            if (!this.compiliationMetadata) {
              this.compiliationMetadata = [];
            }
            this.compiliationMetadata.push(expression);

            var templateName = nameNormilizer(expression);
            if (templateName) {
              match[i] = '"' + templateName + '"';
            }

            return overrideOld[name].apply(this, arguments);
          };
        };
    override('Twig.logic.type.extends', 1);
    override('Twig.logic.type.include', 2);
    override('Twig.logic.type.use', 1);
    override('Twig.logic.type.import', 1);

    /*
     * There is Main work
     */
    Twig.compiler.module.amd = function (id, tokens, pathToTwig, template, options) {
      var requiredViews = [];
      // * *  old way of getting extend
      //try {
      //    Twig.parse.apply(template, [template.tokens, {}])
      //} catch (e) {
      //    gutil.log(gutil.colors.red('while compiling ' + id + ' was error'), e);
      //}
      //if (template.extend) {
      //    requiredViews.push(template.extend);
      //}

      /* amd requireds */
      var requireds = _.map(_.filter(template.compiliationMetadata, function (realFile) {
        if (!realFile) {
          return false;
        }
        var file = nameNormilizer(realFile);
        var isOk = options.compileOptions.willCompile && _.indexOf(options.compileOptions.willCompile, file) !== -1;
        isOk = isOk || options.compileOptions.existFile(file);
        if (!isOk) {
          gutil.log(gutil.colors.yellow('while compiling ' + id + ' can\'t find template: ') + file + gutil.colors.gray(' (' + realFile + ')'));
        }
        return isOk;
      }), function (realFile, i) {
        var file = nameNormilizer(realFile)
        return options.compileOptions.requireName(file, template, realFile)
      });
      requireds.unshift('"' + pathToTwig + '"');

      requireds = requireds.join(', ');

      var outCompiledModule =
            'define(["exports", ' + requireds + '], function (exports, Twig) {\n  var twig = Twig.twig, template;\n';
      if (options.compileOptions.checkFrontendVersion) {
        outCompiledModule += '  var currentTwigVersion = Twig.VERSION.split(\'.\');\n'
          + '  var checkVersion = '
          + String(checkVersion) + ";\n"
          + '  checkVersion(' + currentTwigVersion[0] + ',' + currentTwigVersion[1] + ',' + currentTwigVersion[2] + ');\n';
      }
      outCompiledModule = outCompiledModule
        + '  ' + Twig.compiler.wrap(id, tokens)
        + '  template = twig(autoGeneratedData);\n';
      if (!options.compileOptions.es5) {
        outCompiledModule = outCompiledModule
          + '  Object.defineProperty(exports, "__esModule", {\n'
          + '    value: true\n'
          + '  });\n'
          + '  exports.default = template;\n'
          + '  exports.render = template.render.bind(template);\n'
          + '  exports.autoGeneratedData = autoGeneratedData;\n'
          + '\n});';
      } else {
        outCompiledModule = outCompiledModule
          + '  template._autoGeneratedData = autoGeneratedData;//in case You want pass some options\n  return template;\n});';
      }
      return outCompiledModule;
    };

    /*
     * Reset private twig templates storage
     * It gives ability create another template with same id (usefull for watch)
     */
    clearTemplate = function (templateId) {
      return delete Twig.Templates.registry[templateId];
    };
  });
};

module.exports.setTwig(require('twig'));

module.exports.setTwigNameNormalizer(symfonyTwigNormalize);
