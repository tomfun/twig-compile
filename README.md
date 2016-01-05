### Parts of gulp file

```javascript
var config = {
  ENV: env,
  dependencies: {
  //....
    views: {
      path: './src/Rt/Bundle/AppBundle/Resources/frontend/views',//where placed twig files
      extensions: [ 'twig' ],//extension
      options: {
        module: 'amd',//for future improvements
        twig: 'twig',
        compileOptions: {
          viewPrefix: 'views/'//directory, where will be placed compiled templates
        }
      }
    }
  //....
  }
  DEST_PATH: './web/dependencies'
};
````

```javascript
'use strict';

var gulp = require('gulp')
  , _ = require('lodash')
  , bower = require('main-bower-files')
  , bowerNormalizer = require('gulp-bower-normalize')
  , rename = require('gulp-rename')
  , install = require('gulp-install')
  , watch = require('gulp-watch')
  , babel = require('gulp-babel')
  , uglify = require('gulp-uglify')
  , gutil = require('gulp-util')
  , gulpif = require('gulp-if')
  , rjs = require('gulp-requirejs-optimize')
  , twig_compile = require('./twig-compile')
  , shell = require('gulp-shell')
  , sourcemaps = require('gulp-sourcemaps')
  , sass = require('gulp-sass')
  , autoprefixer = require('gulp-autoprefixer')
  , cmq = require('gulp-merge-media-queries')
  , progeny = require('gulp-progeny')
  , minifyCss = require('gulp-minify-css')
  , browserSync = require('browser-sync');
  
  //.........
  var logger = function (prefix) {
    return require('gulp-print')(function (filepath) {
      return prefix + ': ' + filepath;
    });
  };
  //.........
  
(function (handle) {

  var conf = config.dependencies.views, paths = [ conf.path + '/**/*.twig' ];

  conf.options.compileOptions.lookPaths = [ conf.path ];

  var ENV_VAR = '_GULP_DEP_VIEW_BUILD';
  gulp.task('dependencies:views:watch', [ 'dependencies:views:build' ], function () {
    return watch(paths, function (file) {
      // twigjs bug :(
      var env = {};
      env[ ENV_VAR ] = file.path;

      return gulp.src([ file.path ], {read: false})
        .pipe(shell([
          'node_modules/.bin/gulp dependencies:views:build'
        ], {
          quiet: true,
          env: env,
          cwd: __dirname
        }))
        .pipe(logger('views'));
    });
  });

  gulp.task('dependencies:views:build', function () {
    return handle(conf, process.env[ ENV_VAR ] || paths);
  });
})(function (conf, paths) {
  return gulp.src(paths)
    .pipe(twig_compile(conf.options))
    .on('error', function () {
      //notify
      console.error(arguments);
    })
    .pipe(logger('views'))
    .pipe(gulp.dest(config.DEST_PATH + '/js/' + conf.options.compileOptions.viewPrefix));
});
```