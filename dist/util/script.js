'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findScriptData = undefined;

var _vm = require('vm');

var _vm2 = _interopRequireDefault(_vm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Runs a script inside of a sandboxed VM to extract its data.
 */
var findScriptData = exports.findScriptData = function findScriptData(scriptContent) {
  try {
    var sandbox = { window: {} };
    var script = new _vm2.default.Script(scriptContent);
    var ctx = new _vm2.default.createContext(sandbox); // eslint-disable-line new-cap
    var value = script.runInContext(ctx);
    return {
      value: value,
      sandbox: sandbox
    };
  } catch (e) {
    throw new Error('Could not extract script data: ' + e);
  }
}; /**
    * ascr - Art Scraper <https://bitbucket.org/msikma/ascr>
    * Copyright © 2019, Michiel Sikma
    */