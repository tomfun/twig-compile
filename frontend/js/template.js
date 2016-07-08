import _ from 'lodash';
import moduleRjs from 'module';

let global = {};
const store = {};

export function load(name, req, onLoad, config) {
  if ((config && config.isBuild && (config.inlineTWIG === false)) || (req && req.toUrl(name).indexOf('empty:') === 0)) {
    // avoid inlining if inlineTWIG:false
    // and don't inline files marked as empty!
    onLoad(null);
    return;
  }
  if (store[name]) {
    onLoad(store[name]);
    return;
  }

  const prefix = moduleRjs.config().prefix || 'templates/';
  (req || require)([`${prefix}${name}`], (template) => {
    store[name] = function (context) {
      return template.render(_.merge({}, global, context));
    };

    onLoad(store[name]);
  });
}

export function setGlobals(globals) {
  global = globals;
}
