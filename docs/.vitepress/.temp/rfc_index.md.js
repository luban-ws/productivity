import { ssrRenderAttrs } from "vue/server-renderer";
import { useSSRContext } from "vue";
import { _ as _export_sfc } from "./plugin-vue_export-helper.1tPrXgE0.js";
const __pageData = JSON.parse('{"title":"RFCs (Request for Comments)","description":"","frontmatter":{},"headers":[],"relativePath":"rfc/index.md","filePath":"rfc/index.md"}');
const _sfc_main = { name: "rfc/index.md" };
function _sfc_ssrRender(_ctx, _push, _parent, _attrs, $props, $setup, $data, $options) {
  _push(`<div${ssrRenderAttrs(_attrs)}><h1 id="rfcs-request-for-comments" tabindex="-1">RFCs (Request for Comments) <a class="header-anchor" href="#rfcs-request-for-comments" aria-label="Permalink to &quot;RFCs (Request for Comments)&quot;">​</a></h1><p>This directory contains RFCs for the <strong>Productivity</strong> monorepo.</p><h2 id="active-rfcs" tabindex="-1">Active RFCs <a class="header-anchor" href="#active-rfcs" aria-label="Permalink to &quot;Active RFCs&quot;">​</a></h2><table tabindex="0"><thead><tr><th>RFC</th><th>Title</th><th>Status</th></tr></thead><tbody><tr><td><a href="./0001-universal-publish-tool.html">0001</a></td><td>Universal Publish Tool Design</td><td>Draft</td></tr></tbody></table><h2 id="rfc-process" tabindex="-1">RFC Process <a class="header-anchor" href="#rfc-process" aria-label="Permalink to &quot;RFC Process&quot;">​</a></h2><ol><li><strong>Draft</strong>: Initial proposal.</li><li><strong>Review</strong>: Team discussion.</li><li><strong>Accepted</strong>: Approved for implementation.</li><li><strong>Implemented</strong>: Code landed.</li></ol></div>`);
}
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("rfc/index.md");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["ssrRender", _sfc_ssrRender]]);
export {
  __pageData,
  index as default
};
