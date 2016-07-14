'use strict';

const _ = require('lodash');
const symfonyTwigNormalize = require('../lib/nameNormalizers').symfonyTwigNormalize;

describe('symfony bundle normalize', () => {
  const tests = {
    'twig/base.html.twig':                     '"TwigBundle::base.html.twig"',
    'fos-js-routing/base.html.twig':           '\'FOSJsRoutingBundle::base.html.twig\'',
    'sensio-framework-extra/base.html.twig':   '"SensioFrameworkExtraBundle::base.html.twig"',
    'jms-di-extra/static/page/home.html.twig': '"JMSDiExtraBundle:static/page:home.html.twig"',
    'fos-elastica/Default/layout.twig':        '"FOSElasticaBundle:Default:layout.twig"',
    'brander-eav/layout.twig':                 '"BranderEAVBundle::layout.twig"'
  };
  _.each(tests, (be, must) => {
    it(`${must} must return for ${be}`, () => symfonyTwigNormalize(be).should.be.equal(must));
  });
});
