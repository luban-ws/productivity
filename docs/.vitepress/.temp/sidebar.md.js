import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"","description":"","frontmatter":{},"headers":[],"relativePath":"_sidebar.md","filePath":"_sidebar.md"}');
const _sfc_main = { name: "_sidebar.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><ul><li><p><a href="./README.html">📚 Home</a></p></li><li><p><strong>Documentation</strong></p><ul><li><a href="./rfc/README.html">RFCs</a></li></ul></li><li><p><strong>Packages</strong></p><ul><li><a href="./../packages/@zouwu-wf/workflow/README.html">Workflow</a></li><li><a href="./../packages/@zouwu-wf/cli/README.html">CLI</a></li><li><a href="./../packages/@zouwu-wf/expression-parser/README.html">Expression Parser</a></li></ul></li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("_sidebar.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _sidebar = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  _sidebar as default
};
