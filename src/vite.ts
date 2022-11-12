import { config } from "process";
import { Plugin } from "vite";
import type { Options } from ".";

export default function VitePluginDeployCheck(options: Options): Plugin {
  return {
    name: "vite-plugin-deploy-check",
    enforce: "post",
    apply: "build",
    configResolved(_config) {
      config = _config;
    },
    buildEnd: {
      order: "post",
      sequential: true,
      handler() {},
    },
  };
}
