import { s as styles_default, b as stateRenderer_v3_unified_default, a as stateDiagram_default, S as StateDB } from "./chunk-DI55MBZ5.CG32GM1s.js";
import { _ as __name } from "./app.js";
import "./chunk-55IACEB6.C_xcOgTI.js";
import "./chunk-QN33PNHL.B29y2Pyx.js";
import "vue/server-renderer";
import "vue";
import "./plugin-vue_export-helper.1tPrXgE0.js";
var diagram = {
  parser: stateDiagram_default,
  get db() {
    return new StateDB(2);
  },
  renderer: stateRenderer_v3_unified_default,
  styles: styles_default,
  init: /* @__PURE__ */ __name((cnf) => {
    if (!cnf.state) {
      cnf.state = {};
    }
    cnf.state.arrowMarkerAbsolute = cnf.arrowMarkerAbsolute;
  }, "init")
};
export {
  diagram
};
