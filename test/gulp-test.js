'use strict';

var _    = require('lodash')
  , path = require('path')
  , fs   = require('fs');

var verboseError = function (res) {
  console.log(res.text);
};

describe('base functionality', function () {
  //before(function (done) {
  //  this.timeout(25000);
  //  unpacking(done);
  //});

  describe('test1', function () {
    var result;
    before(function (done) {
      fs.readFile(__dirname + '/test1data/output/block/store/listing.twig.js', {}, function (err, data) {
        //console.log('will@@@@: ', err, data);
        result = data;
        //console.log('will: \n', data.toString());
        //console.log(' \n\n ------- \n\n');
        done(err);
      })
    });
    it('test transform', function (done) {
      var twig_compile = require('../twig-compile');
      var config = {
        module:         'amd',
        twig:           'twig',
        compileOptions: {
          lookPaths: [__dirname + '/test1data/input/'],
          viewPrefix: 'views/'
        }
      };
      fs.readFile(__dirname + '/test1data/input/block/store/listing.twig', {}, function (err, data) {
        var file = {
          isNull:   function () {
            return false;
          },
          isStream: function () {
            return false;
          },
          relative: 'block/store/listing.twig',
          contents: data,
          path:     __dirname + '/test1data/input/block/store/listing.twig'
        };

        twig_compile.transform(config, file, "some", function (n, file) {
          //var have = file.contents.toString();
          //console.log('have: \n', have);
          //console.log(' \n\n ------- \n\n');
          result.equals(file.contents).should.be.equal(true);
          done(err);
        });
      });
    });

  });
});
