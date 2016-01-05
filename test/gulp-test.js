'use strict';

var _          = require('lodash')
    , path       = require('path');

var verboseError = function (res) {
    console.log(res.text);
};

/**
 * root jsdoc
 */
describe('base functionality', function () {
  //before(function (done) {
  //  this.timeout(25000);
  //  unpacking(done);
  //});

  describe('test1', function () {
    it('load gulp', function (done) {
      var gulp            = require('gulp')
        , _               = require('lodash')
        , bower           = require('main-bower-files')
        , bowerNormalizer = require('gulp-bower-normalize')
        , rename          = require('gulp-rename')
        , install         = require('gulp-install')
        , watch           = require('gulp-watch')
        , babel           = require('gulp-babel')
        , uglify          = require('gulp-uglify')
        , gutil           = require('gulp-util')
        , gulpif          = require('gulp-if')
        , rjs             = require('gulp-requirejs-optimize')
        , twig_compile    = require('./twig-compile')
        , shell           = require('gulp-shell')
        , sourcemaps      = require('gulp-sourcemaps')
        , sass            = require('gulp-sass')
        , autoprefixer    = require('gulp-autoprefixer')
        , cmq             = require('gulp-merge-media-queries')
        , progeny         = require('gulp-progeny')
        , minifyCss       = require('gulp-minify-css')
        , browserSync     = require('browser-sync')
        , minimatch       = require("minimatch");




      request
          .get('/')
          .expect(HTTPStatus.OK)
          .end(done);
    });

  });
});
