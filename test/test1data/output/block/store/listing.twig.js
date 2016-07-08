define(["twig", "views/block/store/item.twig"], function (Twig) {
  var twig = Twig.twig, template;
  var currentTwigVersion = Twig.VERSION.split('.');
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
  checkVersion(0,8,2);
  var autoGeneratedData = {id:"block/store/listing.twig", allowInlineIncludes: true, data:[{"type":"raw","value":"<div class=\"catalog\">\n  <div class=\"stores-list\">\n    "},{"type":"logic","token":{"type":"Twig.logic.type.for","key_var":null,"value_var":"item","expression":[{"type":"Twig.expression.type.variable","value":"stores","match":["stores"]}],"output":[{"type":"raw","value":"      "},{"type":"logic","token":{"type":"Twig.logic.type.include","only":false,"includeMissing":false,"stack":[{"type":"Twig.expression.type.string","value":"block/store/item.twig"}],"withStack":[{"type":"Twig.expression.type.object.start","value":"{","match":["{"]},{"type":"Twig.expression.type.operator.binary","value":":","precidence":16,"associativity":"rightToLeft","operator":":","key":"store"},{"type":"Twig.expression.type.variable","value":"item","match":["item"]},{"type":"Twig.expression.type.comma"},{"type":"Twig.expression.type.operator.binary","value":":","precidence":16,"associativity":"rightToLeft","operator":":","key":"w"},{"type":"Twig.expression.type.number","value":223,"match":["223",null]},{"type":"Twig.expression.type.comma"},{"type":"Twig.expression.type.operator.binary","value":":","precidence":16,"associativity":"rightToLeft","operator":":","key":"h"},{"type":"Twig.expression.type.number","value":259,"match":["259",null]},{"type":"Twig.expression.type.object.end","value":"}","match":["}"]}]}},{"type":"raw","value":"    "}]}},{"type":"raw","value":"  </div>\n</div>\n<div class=\"pagination\">\n  <ul>\n    <li><a href=\"#\">1</a></li>\n    <li><span>2</span></li>\n    <li><a href=\"#\">3</a></li>\n    <li><a href=\"#\">4</a></li>\n    <li><a href=\"#\">5</a></li>\n    <li><a href=\"#\">6</a></li>\n    <li><a href=\"#\">7</a></li>\n  </ul>\n  <a href=\"#\" class=\"prev\">Предыдущая</a>\n  <a href=\"#\" class=\"next\">Следующая</a>\n</div>"}], precompiled: true};

  template = twig(autoGeneratedData);
  template._autoGeneratedData = autoGeneratedData;//in case You want pass some options
  return template;
});