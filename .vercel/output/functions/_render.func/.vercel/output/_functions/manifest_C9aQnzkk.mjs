import 'cookie';
import 'kleur/colors';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_DqJiZ3vx.mjs';
import 'es-module-lexer';
import { W as decodeKey } from './chunks/astro/server_BL52J2lG.mjs';
import 'clsx';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///home/user/website_flogge/","adapterName":"@astrojs/vercel/serverless","routes":[{"file":"datenschutz/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/datenschutz","isIndex":false,"type":"page","pattern":"^\\/datenschutz\\/?$","segments":[[{"content":"datenschutz","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/datenschutz.astro","pathname":"/datenschutz","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"en/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/en","isIndex":true,"type":"page","pattern":"^\\/en\\/?$","segments":[[{"content":"en","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/en/index.astro","pathname":"/en","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"impressum/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/impressum","isIndex":false,"type":"page","pattern":"^\\/impressum\\/?$","segments":[[{"content":"impressum","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/impressum.astro","pathname":"/impressum","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[],"styles":[],"routeData":{"route":"/api/subscribe","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/subscribe\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"subscribe","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/subscribe.ts","pathname":"/api/subscribe","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"site":"https://florian-obermeier.com","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/home/user/website_flogge/src/pages/datenschutz.astro",{"propagation":"none","containsHead":true}],["/home/user/website_flogge/src/pages/en/index.astro",{"propagation":"none","containsHead":true}],["/home/user/website_flogge/src/pages/impressum.astro",{"propagation":"none","containsHead":true}],["/home/user/website_flogge/src/pages/index.astro",{"propagation":"none","containsHead":true}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:src/pages/api/subscribe@_@ts":"pages/api/subscribe.astro.mjs","\u0000@astro-page:src/pages/datenschutz@_@astro":"pages/datenschutz.astro.mjs","\u0000@astro-page:src/pages/en/index@_@astro":"pages/en.astro.mjs","\u0000@astro-page:src/pages/impressum@_@astro":"pages/impressum.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","/home/user/website_flogge/node_modules/astro/dist/env/setup.js":"chunks/astro/env-setup_Cr6XTFvb.mjs","\u0000@astrojs-manifest":"manifest_C9aQnzkk.mjs","/astro/hoisted.js?q=0":"_astro/hoisted.CORNlfXq.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/florian-portrait.Cn5bVH_0.jpg","/_astro/inter-cyrillic-ext-300-normal.CgCALhwJ.woff2","/_astro/inter-cyrillic-300-normal.BnqRxXuy.woff2","/_astro/inter-greek-ext-300-normal.l2DDyC6M.woff2","/_astro/inter-greek-300-normal.DmGD3g_f.woff2","/_astro/inter-vietnamese-300-normal.Bdr24Bqb.woff2","/_astro/inter-cyrillic-600-normal.CWCymEST.woff2","/_astro/inter-latin-300-normal.BVlfKGgI.woff2","/_astro/inter-cyrillic-ext-600-normal.Dfes3d0z.woff2","/_astro/inter-greek-ext-600-normal.DRtmH8MT.woff2","/_astro/inter-greek-600-normal.plRanbMR.woff2","/_astro/inter-vietnamese-600-normal.Cc8MFFhd.woff2","/_astro/inter-latin-ext-600-normal.D2bJ5OIk.woff2","/_astro/inter-latin-600-normal.LgqL8muc.woff2","/_astro/inter-latin-ext-300-normal.CPgO9Ksf.woff2","/_astro/inter-cyrillic-ext-400-normal.BQZuk6qB.woff2","/_astro/inter-greek-ext-400-normal.DGGRlc-M.woff2","/_astro/inter-greek-400-normal.B4URO6DV.woff2","/_astro/inter-vietnamese-400-normal.DMkecbls.woff2","/_astro/inter-latin-ext-400-normal.C1nco2VV.woff2","/_astro/inter-latin-400-normal.C38fXH4l.woff2","/_astro/playfair-display-cyrillic-400-normal.CjW2EstV.woff2","/_astro/playfair-display-vietnamese-400-normal.BV2APVTb.woff2","/_astro/playfair-display-latin-ext-400-normal.BxlSGspa.woff2","/_astro/playfair-display-latin-400-normal.CFtfchNt.woff2","/_astro/inter-cyrillic-ext-500-normal.B0yAr1jD.woff2","/_astro/inter-greek-ext-500-normal.C4iEst2y.woff2","/_astro/inter-cyrillic-500-normal.BasfLYem.woff2","/_astro/inter-greek-500-normal.BIZE56-Y.woff2","/_astro/inter-vietnamese-500-normal.DOriooB6.woff2","/_astro/inter-latin-500-normal.Cerq10X2.woff2","/_astro/inter-latin-ext-500-normal.CV4jyFjo.woff2","/_astro/playfair-display-vietnamese-700-normal.CaKJSIny.woff2","/_astro/playfair-display-cyrillic-700-normal.Dw3uKy19.woff2","/_astro/playfair-display-latin-ext-700-normal.C58ejOkc.woff2","/_astro/playfair-display-latin-700-normal.CuDiGg7c.woff2","/_astro/playfair-display-cyrillic-500-normal.GO7-LTbC.woff2","/_astro/playfair-display-vietnamese-500-normal.Jyt54flB.woff2","/_astro/playfair-display-latin-ext-500-normal.DE-Iylxw.woff2","/_astro/playfair-display-cyrillic-400-italic.drKdN10-.woff2","/_astro/playfair-display-latin-500-normal.DIxvyhka.woff2","/_astro/playfair-display-vietnamese-400-italic.CD15TOr5.woff2","/_astro/inter-cyrillic-400-normal.obahsSVq.woff2","/_astro/playfair-display-latin-ext-400-italic.zVOgzDMq.woff2","/_astro/playfair-display-latin-400-italic.LeeEXsx5.woff2","/_astro/inter-greek-ext-300-normal.DLbbeei1.woff","/_astro/inter-vietnamese-300-normal.DDGmYYdT.woff","/_astro/inter-greek-300-normal.BrhSP0vQ.woff","/_astro/inter-cyrillic-300-normal.LR1W_oT8.woff","/_astro/inter-cyrillic-600-normal.4D_pXhcN.woff","/_astro/inter-cyrillic-ext-300-normal.RId2JxDB.woff","/_astro/inter-latin-300-normal.i8F0SvXL.woff","/_astro/inter-cyrillic-ext-600-normal.Bcila6Z-.woff","/_astro/inter-greek-ext-600-normal.B8X0CLgF.woff","/_astro/inter-greek-600-normal.BZpKdvQh.woff","/_astro/inter-vietnamese-600-normal.BuLX-rYi.woff","/_astro/inter-latin-ext-600-normal.CIVaiw4L.woff","/_astro/inter-latin-600-normal.CiBQ2DWP.woff","/_astro/inter-cyrillic-ext-400-normal.DQukG94-.woff","/_astro/inter-greek-ext-400-normal.KugGGMne.woff","/_astro/inter-latin-ext-300-normal.Dp1L8vcn.woff","/_astro/inter-greek-400-normal.q2sYcFCs.woff","/_astro/playfair-display-cyrillic-400-normal.ZiRag6zj.woff","/_astro/playfair-display-vietnamese-400-normal.BbvUAu4N.woff","/_astro/inter-latin-400-normal.CyCys3Eg.woff","/_astro/inter-latin-ext-400-normal.77YHD8bZ.woff","/_astro/inter-vietnamese-400-normal.Bbgyi5SW.woff","/_astro/playfair-display-latin-ext-400-normal.qdZwdvNS.woff","/_astro/playfair-display-latin-400-normal.DHYHbkg3.woff","/_astro/inter-cyrillic-500-normal.CxZf_p3X.woff","/_astro/inter-cyrillic-ext-500-normal.BmqWE9Dz.woff","/_astro/inter-greek-ext-500-normal.2j5mBUwD.woff","/_astro/inter-vietnamese-500-normal.mJboJaSs.woff","/_astro/inter-greek-500-normal.Xzm54t5V.woff","/_astro/inter-latin-500-normal.BL9OpVg8.woff","/_astro/playfair-display-vietnamese-700-normal.Cr1rw0mr.woff","/_astro/playfair-display-cyrillic-700-normal.Dk1mTcxf.woff","/_astro/playfair-display-latin-700-normal.Bc_1Q1cG.woff","/_astro/inter-latin-ext-500-normal.BxGbmqWO.woff","/_astro/playfair-display-vietnamese-500-normal._Z41d-72.woff","/_astro/playfair-display-latin-ext-700-normal.D5HUU8GT.woff","/_astro/playfair-display-cyrillic-500-normal.DmDODJdV.woff","/_astro/playfair-display-latin-500-normal.BScSeVwi.woff","/_astro/playfair-display-cyrillic-400-italic.24vVh5t9.woff","/_astro/inter-cyrillic-400-normal.HOLc17fK.woff","/_astro/playfair-display-latin-ext-400-italic.CZOjvne0.woff","/_astro/playfair-display-latin-ext-500-normal.CFxFMdkY.woff","/_astro/playfair-display-vietnamese-400-italic.Cpv4sfwY.woff","/_astro/playfair-display-latin-400-italic.hIeePEuE.woff","/_astro/datenschutz.BCL34T-S.css","/_astro/index.DEPD7G0-.css","/_astro/index.imj0RjKI.css","/cover-ki.jpg","/cover-stille.jpg","/favicon.svg","/googlef516ae4dec0d5167.html","/og-image.png","/robots.txt","/sitemap.xml","/_astro/hoisted.CORNlfXq.js","/datenschutz/index.html","/en/index.html","/impressum/index.html","/index.html"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"rwdq0cjvAQeVQPjrxP15nuNL1CwlhUzmlKWE38i9Eog=","experimentalEnvGetSecretEnabled":false});

export { manifest };
