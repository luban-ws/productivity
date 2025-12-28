import {
  parse
} from "./chunk-XYISGOBX.js";
import "./chunk-VBKVCXND.js";
import "./chunk-HKOWWNCY.js";
import "./chunk-ZW4MJBY6.js";
import "./chunk-YGMCE3YU.js";
import "./chunk-NPNSPRNA.js";
import "./chunk-TN5TYZ3K.js";
import "./chunk-Y2SXRVWB.js";
import "./chunk-ULL77AYX.js";
import "./chunk-ARA7U4J4.js";
import {
  package_default
} from "./chunk-DKVJ5HIV.js";
import {
  selectSvgElement
} from "./chunk-BBB4UPCD.js";
import {
  configureSvgSize
} from "./chunk-TO45NE36.js";
import {
  __name,
  log
} from "./chunk-WPDVW4LA.js";
import "./chunk-KMFRRLYH.js";
import "./chunk-I5UQYLG7.js";
import "./chunk-FDBJFBLO.js";

// node_modules/.pnpm/mermaid@11.12.2/node_modules/mermaid/dist/chunks/mermaid.core/infoDiagram-WHAUD3N6.mjs
var parser = {
  parse: __name(async (input) => {
    const ast = await parse("info", input);
    log.debug(ast);
  }, "parse")
};
var DEFAULT_INFO_DB = {
  version: package_default.version + (true ? "" : "-tiny")
};
var getVersion = __name(() => DEFAULT_INFO_DB.version, "getVersion");
var db = {
  getVersion
};
var draw = __name((text, id, version) => {
  log.debug("rendering info diagram\n" + text);
  const svg = selectSvgElement(id);
  configureSvgSize(svg, 100, 400, true);
  const group = svg.append("g");
  group.append("text").attr("x", 100).attr("y", 40).attr("class", "version").attr("font-size", 32).style("text-anchor", "middle").text(`v${version}`);
}, "draw");
var renderer = { draw };
var diagram = {
  parser,
  db,
  renderer
};
export {
  diagram
};
//# sourceMappingURL=infoDiagram-WHAUD3N6-GUA2B7ZA.js.map
