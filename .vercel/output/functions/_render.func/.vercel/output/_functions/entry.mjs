import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_BJNRo146.mjs';
import { manifest } from './manifest_C9aQnzkk.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/api/subscribe.astro.mjs');
const _page2 = () => import('./pages/datenschutz.astro.mjs');
const _page3 = () => import('./pages/en.astro.mjs');
const _page4 = () => import('./pages/impressum.astro.mjs');
const _page5 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/api/subscribe.ts", _page1],
    ["src/pages/datenschutz.astro", _page2],
    ["src/pages/en/index.astro", _page3],
    ["src/pages/impressum.astro", _page4],
    ["src/pages/index.astro", _page5]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "5d7aa518-3aa8-4119-adba-b8f494048e95",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
