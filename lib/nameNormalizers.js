'use strict';

var path = require('path');

var symfonyFormatRegex = /(\w*):(.*):(.+)/;
var symfonyBundleNameRegex = /([a-z])([A-Z])/g;
var symfonyBundleNameRegex2 = /(.)([A-Z])([a-z])/g;

// or us regerxp ^'(.*)'$|^"(.*)"$ for strong quote replacement
// http://symfony.com/doc/current/best_practices/templates.html
// http://symfony.com/doc/current/book/templating.html#template-naming-locations
// look at tests, pay **attention**:
// BranderEAVBundle             brander_eav           brander-eav
//                                     +                     -
function symfonyTwigNormalize(file) {
  if (!file) {
    return false;
  }
  var out = file.replace(/^['"]/, '').replace(/['"]$/, '');
  if (out === file) {
    return false;
  }
  var parsed = out.match(symfonyFormatRegex);
  if (parsed) {
    if (parsed[1]) {
      var b = parsed[1];
      parsed[1] = b
        .replace(symfonyBundleNameRegex, (a, b, c) => b + '-' + c.toLowerCase())
        .replace(symfonyBundleNameRegex2, (a, b, c, d) => b + '-' + c.toLowerCase() + d)
        .replace('-bundle', '')
        .toLowerCase();
    }
    out = path.join(parsed[1], parsed[2], parsed[3]);
  }
  return out;
}

module.exports = {
  symfonyTwigNormalize: symfonyTwigNormalize,
};
