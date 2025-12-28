import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"Zouwu Workflow Documentation","description":"","frontmatter":{},"headers":[],"relativePath":"README.md","filePath":"README.md"}');
const _sfc_main = { name: "README.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="zouwu-workflow-documentation" tabindex="-1">Zouwu Workflow Documentation <a class="header-anchor" href="#zouwu-workflow-documentation" aria-label="Permalink to &quot;Zouwu Workflow Documentation&quot;">​</a></h1><p>Welcome to the official documentation for <strong>Zouwu Workflow</strong>.</p><h2 id="🚀-core-modules" tabindex="-1">🚀 Core Modules <a class="header-anchor" href="#🚀-core-modules" aria-label="Permalink to &quot;🚀 Core Modules&quot;">​</a></h2><ul><li><strong><a href="./../packages/@zouwu-wf/workflow/">@zouwu-wf/workflow</a></strong>: The core workflow engine and runtime.</li><li><strong><a href="./../packages/@zouwu-wf/cli/">@zouwu-wf/cli</a></strong>: Command-line tools for generating types and validators.</li><li><strong><a href="./../packages/@zouwu-wf/expression-parser/">@zouwu-wf/expression-parser</a></strong>: Secure, template-based expression parsing.</li></ul><h2 id="📚-resources" tabindex="-1">📚 Resources <a class="header-anchor" href="#📚-resources" aria-label="Permalink to &quot;📚 Resources&quot;">​</a></h2><ul><li><strong><a href="./rfc/README.html">RFCs</a></strong>: Design documents and specifications.</li><li><strong><a href="https://github.com/yourusername/zouwu-workflow" target="_blank" rel="noreferrer">GitHub Repository</a></strong></li></ul></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("README.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const README = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  README as default
};
