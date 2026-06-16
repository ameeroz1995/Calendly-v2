const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["chunk-hFDNlS-5.js","chunk-BnhNuwzA.js","chunk-DdVLKENW.js"])))=>i.map(i=>d[i]);
var ge=n=>{throw TypeError(n)};var me=(n,i,e)=>i.has(n)||ge("Cannot "+e);var x=(n,i,e)=>(me(n,i,"read from private field"),e?e.call(n):i.get(n)),q=(n,i,e)=>i.has(n)?ge("Cannot add the same private member more than once"):i instanceof WeakSet?i.add(n):i.set(n,e),J=(n,i,e,o)=>(me(n,i,"write to private field"),o?o.call(n,e):i.set(n,e),e);import{initializeApp as je}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";import{onAuthStateChanged as Oe,signOut as Le,GoogleAuthProvider as Ne,signInWithPopup as We,getAuth as Ge}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";import{onValue as Ue,runTransaction as Ke,remove as Ve,update as He,set as Qe,get as Ye,ref as qe,getDatabase as Je}from"https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";(function(){const i=document.createElement("link").relList;if(i&&i.supports&&i.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function e(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(t){if(t.ep)return;t.ep=!0;const r=e(t);fetch(t.href,r)}})();window._firebase={initializeApp:je,getAuth:Ge,getDatabase:Je,signInWithPopup:We,GoogleAuthProvider:Ne,signOut:Le,onAuthStateChanged:Oe,ref:qe,get:Ye,set:Qe,update:He,remove:Ve,runTransaction:Ke,onValue:Ue};const Xe="modulepreload",Ze=function(n){return"/"+n},be={},V=function(i,e,o){let t=Promise.resolve();if(e&&e.length>0){document.getElementsByTagName("link");const a=document.querySelector("meta[property=csp-nonce]"),d=a?.nonce||a?.getAttribute("nonce");t=Promise.allSettled(e.map(c=>{if(c=Ze(c),c in be)return;be[c]=!0;const p=c.endsWith(".css"),m=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${c}"]${m}`))return;const b=document.createElement("link");if(b.rel=p?"stylesheet":Xe,p||(b.as="script"),b.crossOrigin="",b.href=c,d&&b.setAttribute("nonce",d),document.head.appendChild(b),p)return new Promise((A,F)=>{b.addEventListener("load",A),b.addEventListener("error",()=>F(new Error(`Unable to preload CSS for ${c}`)))})}))}function r(a){const d=new Event("vite:preloadError",{cancelable:!0});if(d.payload=a,window.dispatchEvent(d),!d.defaultPrevented)throw a}return t.then(a=>{for(const d of a||[])d.status==="rejected"&&r(d.reason);return i().catch(r)})},ye=window.morphdom,et={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},l=n=>n==null?"":String(n).replace(/[&<>"']/g,i=>et[i]),s=(n,...i)=>n.reduce((e,o,t)=>{let r=i[t];return r==null||typeof r=="boolean"?r="":Array.isArray(r)&&(r=r.join("")),e+o+r},"");function $(n={}){const{template:i,state:e,methods:o}=n,t="c"+Math.random().toString(36).slice(2,8);window.__app=window.__app||{},window.__app[t]={},window.__el=window.__el||{};const r=new Proxy({},{get(u,g){if(typeof g!="symbol")return`__app['${t}'].${String(g)}`}});let a={},d={},c={},p={},m=[],b={},A={},F=[];const B={onBeforeElUpdated(u,g){return u.isEqualNode(g)?!1:(u.tagName==="INPUT"&&g.tagName==="INPUT"&&(u.type==="checkbox"||u.type==="radio"?g.checked=u.checked:g.value=u.value),u.tagName==="TEXTAREA"&&g.tagName==="TEXTAREA"&&(g.value=u.value),u.tagName==="SELECT"&&g.tagName==="SELECT"&&(g.value=u.value),!0)}};function K(u,g){d[u]=g}function O(){Object.keys(c).forEach(u=>{const g=d[u];if(!g)return;let h=p[u];h||(h=new Set,p[u]=h),c[u].forEach(k=>{h.has(k.cb)||(g.addEventListener(k.type,k.cb),h.add(k.cb))})})}function D(){Object.keys(c).forEach(u=>{const g=d[u];g&&p[u]&&c[u].forEach(h=>{p[u].has(h.cb)&&(g.removeEventListener(h.type,h.cb),p[u].delete(h.cb))})})}function f(u){u.id&&K(u.id,u),u.querySelectorAll("[id]").forEach(g=>K(g.id,g))}function S(u){const g=i({state:u,fn:r}),h=document.createElement("div");h.innerHTML=g.trim();const k=[...h.children];let L;return k.length===1?L=k[0]:k.length>1?(L=document.createElement("div"),L.style.display="contents",k.forEach(ee=>L.appendChild(ee))):L=h.firstElementChild||document.createElement("div"),L.querySelectorAll("[data-cid]").forEach(ee=>{const Me=ee.getAttribute("data-cid"),re=window.__el&&window.__el[Me];re&&re!==L&&ee.replaceWith(re)}),L}let w;a={...e},w=S(a);const z={fn:r,uid:t,getState(){return{...a}},register(u){for(const[g,h]of Object.entries(u))window.__app[t][g]=h,z[g]=h;return y},$(u){return d[u]},on(u,g){return b[u]||(b[u]=[]),b[u].push(g),y},off(u,g){return b[u]&&(b[u]=b[u].filter(h=>h!==g)),y},emit(u,...g){const h=b[u];return h?.length&&h.forEach(k=>k(...g)),y},message(u,...g){return y.emit(u,...g)},trigger(u,g,h){if(c[g]=(c[g]||[]).concat([{type:u,cb:h}]),d[g]){let k=p[g];k||(k=new Set,p[g]=k),k.has(h)||(d[g].addEventListener(u,h),k.add(h))}return y},defer(u,g=0){const h=setTimeout(()=>{u(),F=F.filter(k=>k!==h)},g);return F.push(h),y},destroy(){return F.forEach(clearTimeout),F=[],m.forEach(u=>{try{u()}catch(g){console.error("Unsub error:",g)}}),m=[],D(),delete window.__app[t],delete window.__el[t],b={},c={},p={},a={},d={},A={},w=null,y},unsub(u){return typeof u=="function"&&m.push(u),y},delete(u){const g=d[u];return g&&(c[u]&&(c[u].forEach(h=>{p[u]&&p[u].has(h.cb)&&(g.removeEventListener(h.type,h.cb),p[u].delete(h.cb))}),delete c[u],delete p[u]),g.remove(),delete d[u]),y},morph(u,g){const h=d[u];if(h){const k=document.createElement("div");k.innerHTML=g.trim();const L=k.firstElementChild||k;ye(h,L,B)}return y},render(u={}){if(!w)return y;a={...a,...u};const g=S(a);return g&&(d={},p={},ye(w,g,B),f(w),O()),y},setCache(u,g){return A[u]=g,y},getCache(u){return A[u]},deleteCache(u){return delete A[u],y},element(){return w},toString(){return window.__el[t]=w,`<span data-cid="${t}"></span>`},valueOf(){return w}},y=new Proxy(z,{get(u,g,h){return typeof g=="string"&&Object.prototype.hasOwnProperty.call(d,g)?d[g]:Reflect.get(u,g,h)},set(u,g,h,k){return Reflect.set(u,g,h,k)},has(u,g){return typeof g=="string"&&Object.prototype.hasOwnProperty.call(d,g)?!0:Reflect.has(u,g)},ownKeys(u){return[...new Set([...Reflect.ownKeys(u),...Object.keys(d)])]},getOwnPropertyDescriptor(u,g){return typeof g=="string"&&Object.prototype.hasOwnProperty.call(d,g)?{enumerable:!0,configurable:!0,value:d[g]}:Reflect.getOwnPropertyDescriptor(u,g)}});return w&&f(w),typeof Symbol<"u"&&Symbol.dispose&&(z[Symbol.dispose]=function(){this.destroy()}),o&&y.register(o),w&&Object.assign(w,z),y}function tt({routes:n,initial:i="/",useHash:e=!0}){let o=i,t={},r={};const a=new Map;let d=null;function c(f){const S=[],w=f.replace(/\//g,"\\/").replace(/:(\w+)/g,(z,y)=>(S.push(y),"([^/]+)")).replace(/\*/g,".*");return{regex:new RegExp(`^${w}$`),keys:S}}const p=Object.entries(n).map(([f,S])=>({...c(f),pattern:f,fn:S}));function m(f){const[S,w]=f.split("?",2),z={};w&&w.split("&").forEach(y=>{const[u,g]=y.split("=",2);z[decodeURIComponent(u)]=g!==void 0?decodeURIComponent(g):!0});for(const y of p){const u=S.match(y.regex);if(u){const g={};return y.keys.forEach((h,k)=>g[h]=decodeURIComponent(u[k+1])),{...y,params:g,query:z}}}return null}function b(f){const S=m(f);return S?(t=S.params,r=S.query,S.fn):null}function A(f,{replace:S=!1}={}){const w=m(f);if(w){const y=a.get(w.pattern);if(y&&!y({from:o,to:f,params:w.params}))return!1}const z=a.get("*");return z&&!z({from:o,to:f,params:w?w.params:{}})?!1:(o=f,e&&(S?window.history.replaceState(null,"",`#${f}`):window.location.hash=f),D(w),!0)}function F(){window.history.back()}function B(){window.history.forward()}function K(f,S){a.set(f,S)}function O(f){d=f}function D(f){f=f||m(o),f&&(t=f.params,r=f.query),d&&d({path:o,params:t,query:r})}return e&&(o=window.location.hash.slice(1)||i,setTimeout(()=>D(),0),window.addEventListener("hashchange",()=>{o=window.location.hash.slice(1)||i,D()})),{get current(){return o},get params(){return t},get query(){return r},match:b,go:A,back:F,forward:B,guard:K,onChange:O,href(f){return`#${f}`}}}const ot=[{route:"/",icon:"dashboard",label:"Dashboard"},{route:"/calendar",icon:"calendar",label:"Calendar"},{route:"/event-types",icon:"clock",label:"Event Types"},{route:"/availability",icon:"calendar",label:"Availability"},{route:"/routing-forms",icon:"check",label:"Routing"},{route:"/pools",icon:"users",label:"Pools"},{route:"/workspaces",icon:"copy",label:"Workspaces"},{route:"/resources",icon:"copy",label:"Resources"},{route:"/contacts",icon:"users",label:"Contacts"},{route:"/time-tracking",icon:"chart",label:"Time Tracking"},{route:"/audit-log",icon:"shield",label:"Audit Log"},{route:"/compliance",icon:"shield",label:"Compliance"},{route:"/webhooks",icon:"webhook",label:"Webhooks"},{route:"/api-keys",icon:"key",label:"API Keys"},{route:"/event-types/editor",icon:"edit",label:"Page Editor",accent:!0},{route:"/settings",icon:"settings",label:"Settings"}],nt=[{route:"/",icon:"dashboard",label:"Home"},{route:"/calendar",icon:"calendar",label:"Calendar"},{route:"/event-types",icon:"clock",label:"Events"},{route:"/workspaces",icon:"copy",label:"Workspaces"},{route:"/settings",icon:"settings",label:"Settings"}],he={"/":"Dashboard","/login":"Sign In","/calendar":"Calendar Connections","/event-types":"Event Types","/event-types/editor":"Booking Page Editor","/availability":"Availability","/book/:hostId/:eventTypeId":"Book a Meeting","/book/otl/:token":"Book a Meeting","/routing-forms":"Routing Forms","/pools":"Routing Pools","/workspaces":"Workspaces","/workspaces/:id":"Workspace","/resources":"Resources","/contacts":"Contacts","/contacts/:id":"Contact","/time-tracking":"Time Tracking","/audit-log":"Audit Log","/compliance":"Compliance","/webhooks":"Webhooks","/api-keys":"API Keys","/settings":"Settings"},ce={dashboard:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',calendar:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>',clock:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',check:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>',users:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M5.5 20v-1a5.5 5.5 0 0110.7-2"/><path d="M18.5 20v-1a5.5 5.5 0 00-2.2-4.5"/></svg>',copy:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>',chart:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',shield:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',webhook:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 012 17c.01-.7.2-1.4.57-2"/><path d="M6 7.02h6.03c1.12 0 2-.88 2.46-1.84A4 4 0 0122 7c-.01.7-.2 1.4-.57 2"/><path d="M12 2v4M12 18v4"/></svg>',key:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="8" cy="15" r="4"/><path d="M10.8 12.2L16 7l3 3-5.3 5.3"/><path d="M21 2l-3.5 3.5M21 2h-6M21 2v6"/></svg>',edit:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',settings:'<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',hamburger:'<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>'};function it(n){const i=String(n).trim().split(/\s+/);return i.length===1?i[0].substring(0,2).toUpperCase():(i[0][0]+i[i.length-1][0]).toUpperCase()}function rt({state:n,fn:i}){const e=n.isPublicRoute;return s`<div id="app-shell" style="display:flex;min-height:100dvh;max-width:100vw;overflow-x:hidden;">

    ${e?"":st(n,i)}
    ${at(n,i,e)}
    ${e?"":dt(n,i)}
    ${ct()}

  </div>`}function st(n,i){return s`
    <!-- Sidebar Overlay -->
    <div id="sidebar-overlay"
         class="sidebar-overlay${n.sidebarOpen?" show":""}"
         onclick="${i.toggleSidebar}()"></div>

    <aside id="sidebar" class="sidebar${n.sidebarOpen?" open":""}">
      <div class="sidebar-logo">
        <div class="sidebar-logo-icon">C</div>
        <span class="sidebar-logo-text">Calendly</span>
      </div>

      <nav class="sidebar-nav">
        ${ot.map(e=>s`
          <a class="sidebar-nav-item${n.route===e.route?" active":""}"
             href="#${e.route}"
             data-route="${e.route}"
             onclick="${i.navigateTo}('${e.route}')"
             style="${e.accent?"color:#7047EB;":""}">
            ${ce[e.icon]||""}
            ${l(e.label)}
          </a>
        `).join("")}
      </nav>

      <div class="sidebar-user">
        <div class="sidebar-user-avatar">${n.user?l(it(n.user.displayName||n.user.email||"?")):"?"}</div>
        <div>
          <div class="sidebar-user-name">${n.user?l(n.user.displayName||n.user.email||"Not signed in"):"Not signed in"}</div>
          <div class="sidebar-user-role">Administrator</div>
        </div>
      </div>
    </aside>
  `}function at(n,i,e){return s`
    <main id="main-area" class="main-area" style="${e?"margin-left:0;":""}">
      ${e?"":lt(n,i)}
      <div id="app-content" class="main-content${e?" public":""}"
           style="${e?"padding-top:40px;max-width:100%;":""}">
        ${n.contentHtml||""}
      </div>
    </main>
  `}function lt(n,i){return s`
    <div class="main-topbar">
      <div style="display:flex;align-items:center;gap:12px;">
        <button class="hamburger-btn" onclick="${i.toggleSidebar}()" aria-label="Toggle menu">
          ${ce.hamburger}
        </button>
        <div class="main-topbar-title">${l(n.pageTitle)}</div>
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        ${n.user?s`
          <button class="btn btn-primary btn-sm" onclick="${i.signOut}()">Sign Out</button>
        `:""}
      </div>
    </div>
  `}function dt(n,i){return s`
    <nav id="mobile-nav" class="mobile-nav">
      ${nt.map(e=>s`
        <a class="mobile-nav-item${n.route===e.route?" active":""}"
           href="#${e.route}"
           onclick="${i.navigateTo}('${e.route}')">
          ${ce[e.icon]||""}
          ${l(e.label)}
        </a>
      `).join("")}
    </nav>
  `}function ct(){return s`<div class="toast-container" id="toast-container"></div>`}const pt={route:"/",currentParams:{},currentQuery:{},user:null,authLoading:!0,sidebarOpen:!1,isPublicRoute:!1,pageTitle:"Calendly",loading:!1,error:null,_viewCtrl:null},ut=["/login"],vt="/book/",Ce="/",de="/login",te=Object.freeze({AUTH_CHANGED:"auth:changed",BOOKING_CREATED:"booking:created",BOOKING_CANCELLED:"booking:cancelled",SLOT_SELECTED:"slot:selected",DATE_SELECTED:"date:selected",SHOW_TOAST:"toast:show",SEARCH_CHANGED:"search:changed",ROW_CLICKED:"row:clicked",ROUTE_CHANGING:"route:changing",ROUTE_CHANGED:"route:changed",TIMER_TICK:"timer:tick",TIMER_STARTED:"timer:started",TIMER_STOPPED:"timer:stopped",TASK_ADDED:"task:added",TASK_TOGGLED:"task:toggled",TASK_DELETED:"task:deleted",WEBHOOK_TESTED:"webhook:tested",API_KEY_GENERATED:"apikey:generated",API_KEY_REVOKED:"apikey:revoked",CALENDAR_CONNECTED:"calendar:connected",CALENDAR_DISCONNECTED:"calendar:disconnected",CALENDAR_SYNCED:"calendar:synced",EVENT_TYPE_CREATED:"eventtype:created",EVENT_TYPE_UPDATED:"eventtype:updated",EVENT_TYPE_DELETED:"eventtype:deleted",CONNECTION_CHANGED:"connection:changed"}),fe=typeof location<"u"&&location.hostname==="localhost";function gt(){const n=new Map;let i=0;function e(c,p){n.has(c)||n.set(c,new Map);const m=n.get(c);for(const[A,F]of m)if(F===p)return()=>m.delete(A);const b=Symbol("listener");return m.set(b,p),()=>{m.delete(b)}}function o(c,p){const m=i;return e(c,b=>{i===m&&p(b)})}function t(c,p){fe&&console.debug("[EventBus]",c,p);const m=n.get(c);!m||m.size===0||m.forEach(b=>{try{b(p)}catch(A){console.error("[EventBus] handler error on",c,A)}})}function r(){i++,fe&&console.debug("[EventBus] generation →",i)}function a(){return i}function d(){n.clear()}return Object.freeze({on:e,onGuarded:o,emit:t,nextGen:r,generation:a,reset:d})}const H=gt(),mt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,bt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,yt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,ht=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`,ft=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,xt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,kt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,wt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,$t=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,At=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,St=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,Et=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,Ct=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,Ft=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,Tt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,_t=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,Bt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,It=s`<svg viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>`,Dt=s`<svg viewBox="0 0 24 24"><rect x="1" y="1" width="10" height="10" fill="#F25022"/><rect x="13" y="1" width="10" height="10" fill="#7FBA00"/><rect x="1" y="13" width="10" height="10" fill="#00A4EF"/><rect x="13" y="13" width="10" height="10" fill="#FFB900"/></svg>`,zt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" class="animate-spin"><circle cx="12" cy="12" r="10" stroke-opacity="0.25"/><path d="M12 2a10 10 0 0 1 10 10" stroke-opacity="1"/></svg>`,Rt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,Pt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,Mt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,jt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,Ot=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>`,Lt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>`,Nt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,Wt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,Gt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,Ut=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,Kt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,Vt=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,Ht=s`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>`,v=Object.freeze({search:mt,dashboard:bt,calendar:yt,clock:ht,users:ft,link:xt,settings:kt,chart:wt,check:$t,x:At,chevron:St,chevronLeft:Et,edit:Ct,trash:Ft,plus:Tt,download:_t,copy:Bt,google:It,microsoft:Dt,spinner:zt,alert:Rt,info:Pt,shield:Mt,lock:jt,key:Ot,mail:Lt,bell:Nt,globe:Wt,webhook:Gt,eye:Ut,eyeOff:Kt,menu:Vt,moreVertical:Ht});function Qt({state:n,fn:i}){return n.authLoading?s`<div style="display:flex;align-items:center;justify-content:center;min-height:60vh;">
      <div style="text-align:center;">
        <div style="color:#7047EB;margin-bottom:16px;">${v.spinner}</div>
        <div style="color:#8A8993;">Loading...</div>
      </div>
    </div>`:n.user?s`<div style="text-align:center;padding:64px 24px;">
      <div class="fade-in">
        <h2 style="margin-bottom:8px;">Already signed in</h2>
        <p style="color:#8A8993;margin-bottom:16px;">Redirecting to dashboard...</p>
      </div>
    </div>`:n.authError&&!n.authLoading?s`<div style="display:flex;align-items:center;justify-content:center;min-height:60vh;">
      <div style="text-align:center;max-width:400px;width:100%;">
        <div style="color:#FF4A5A;font-size:48px;margin-bottom:16px;">${v.alert}</div>
        <h2 style="margin-bottom:8px;">Sign-in failed</h2>
        <p style="color:#8A8993;margin-bottom:16px;">${l(n.authError)}</p>
        <button class="btn btn-primary btn-lg" onclick="${i.signIn}()" style="width:100%;justify-content:center;">
          ${v.google} Try Again
        </button>
      </div>
    </div>`:s`
    <div style="display:flex;align-items:center;justify-content:center;min-height:60vh;">
      <div class="fade-in" style="text-align:center;max-width:400px;width:100%;">
        <div style="width:56px;height:56px;border-radius:14px;background:#7047EB;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Geist',sans-serif;font-weight:700;font-size:24px;margin:0 auto 24px;">C</div>
        <h2 style="margin-bottom:8px;">Welcome to Calendly</h2>
        <p style="color:#8A8993;margin-bottom:32px;">Enterprise scheduling & lifecycle management</p>
        <button class="btn btn-primary btn-lg" onclick="${i.signIn}()" style="width:100%;justify-content:center;">
          ${v.google} Sign in with Google
        </button>
      </div>
    </div>
  `}function Yt({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return Qt({state:o,fn:t})},state:{authLoading:!1,user:null,authError:""},methods:{setAuthState(o,t,r){e.render({user:o,authLoading:t,authError:r||""})}}});return e}function qt({count:n=1}={}){const i=$({template({state:e}){let o="";for(let t=0;t<e.count;t++)o+=s`
          <div class="card fade-in" style="animation-delay:${t*50}ms;">
            <div class="skeleton" style="height:16px;width:60%;margin-bottom:12px;"></div>
            <div class="skeleton" style="height:12px;width:40%;margin-bottom:8px;"></div>
            <div class="skeleton" style="height:12px;width:50%;"></div>
          </div>
        `;return s`<div id="skeletoncards-root">${o}</div>`},state:{count:n},methods:{setCount(e){i.render({count:e})}}});return i}function G(n=1){return qt({count:n}).toString()}const xe={success:"badge-success",warning:"badge-warning",danger:"badge-danger",info:"badge-info",neutral:"badge-neutral"};function Jt({variant:n="neutral",label:i=""}={}){const e=$({template({state:o}){const t=xe[o.variant]||xe.neutral;return s`<span id="badge-root" class="badge ${t}">${l(o.label)}</span>`},state:{variant:n,label:i},methods:{setVariant(o){e.render({variant:o})},setLabel(o){e.render({label:o})},update(o,t){e.render({variant:o,label:t})}}});return e}function _(n="neutral",i=""){return Jt({variant:n,label:i}).toString()}var I,W,U;const N=class N{constructor(i,e,o){q(this,I);q(this,W);q(this,U);J(this,I,i),J(this,W,e),J(this,U,o)}get ok(){return x(this,I)}static ok(i){return new N(!0,i,null)}static err(i){return new N(!1,null,i)}static from(i){try{const e=i();return new N(!0,e,null)}catch(e){return new N(!1,null,e)}}map(i){return x(this,I)?N.from(()=>i(x(this,W))):this}flatMap(i){if(!x(this,I))return this;try{return i(x(this,W))}catch(e){return N.err(e)}}mapErr(i){return x(this,I)?this:N.from(()=>{throw i(x(this,U))})}tap(i){if(x(this,I))try{i(x(this,W))}catch{}return this}tapErr(i){if(!x(this,I))try{i(x(this,U))}catch{}return this}recover(i){if(x(this,I))return this;try{return i(x(this,U))}catch(e){return N.err(e)}}unwrap(){return x(this,I)?[x(this,W),null]:[null,x(this,U)]}unwrapOr(i){return x(this,I)?x(this,W):i}unwrapOrThrow(){if(x(this,I))return x(this,W);throw x(this,U)}};I=new WeakMap,W=new WeakMap,U=new WeakMap;let oe=N;var T;const R=class R{constructor(i){q(this,T);J(this,T,i)}static from(i){return new R((async()=>{try{return[!0,await i(),null]}catch(e){return[!1,null,e]}})())}static fromPromise(i){return new R((async()=>{try{return[!0,await i,null]}catch(e){return[!1,null,e]}})())}static ok(i){return new R(Promise.resolve([!0,i,null]))}static err(i){return new R(Promise.resolve([!1,null,i]))}map(i){return new R(x(this,T).then(([e,o,t])=>{if(!e)return[!1,null,t];try{return[!0,i(o),null]}catch(r){return[!1,null,r]}}))}flatMap(i){return new R(x(this,T).then(async([e,o,t])=>{if(!e)return[!1,null,t];try{const r=await i(o);return r instanceof R?x(r,T):r instanceof oe?r.unwrap():[!0,r,null]}catch(r){return[!1,null,r]}}))}mapErr(i){return new R(x(this,T).then(([e,o,t])=>e?[!0,o,null]:[!1,null,i(t)]))}tap(i){return new R(x(this,T).then(([e,o,t])=>{if(e)try{i(o)}catch{}return[e,o,t]}))}tapErr(i){return new R(x(this,T).then(([e,o,t])=>{if(!e)try{i(t)}catch{}return[e,o,t]}))}recover(i){return new R(x(this,T).then(async([e,o,t])=>{if(e)return[!0,o,null];try{const r=await i(t);return r instanceof oe?r.unwrap():[!0,r,null]}catch(r){return[!1,null,r]}}))}async unwrap(){const[i,e,o]=await x(this,T);return i?[e,null]:[null,o]}async unwrapOr(i){const[e,o]=await x(this,T);return e?o:i}async unwrapOrThrow(){const[i,e,o]=await x(this,T);if(i)return e;throw o}then(i,e){return x(this,T).then(i,e)}};T=new WeakMap;let Q=R;const Fe=1e4,fn={apiKey:window.__CALENDLY_API_KEY||"AIzaSy-placeholder",authDomain:window.__CALENDLY_AUTH_DOMAIN||"calendly-v2.firebaseapp.com",databaseURL:window.__CALENDLY_DATABASE_URL||"https://calendly-v2-default-rtdb.firebaseio.com",projectId:window.__CALENDLY_PROJECT_ID||"calendly-v2"},Z=window._firebase;let Te=null;function xn(n){Te=n}function E(n){return Z.ref(Te,n)}function ne(n=Fe){const i=new AbortController,e=setTimeout(()=>i.abort(),n);return{controller:i,timer:e}}function ie(n,i){return new Promise((e,o)=>{const t=()=>{n.removeEventListener("abort",t),o(new Error(i+" timeout after "+Fe+"ms"))};n.addEventListener("abort",t)})}function M(n){return Q.from(async()=>{const{controller:i,timer:e}=ne();try{return await Promise.race([Z.get(E(n)),ie(i.signal,"Firebase read")])}finally{clearTimeout(e)}})}function _e(n,i){return Q.from(async()=>{const{controller:e,timer:o}=ne();try{return await Promise.race([Z.set(E(n),i),ie(e.signal,"Firebase write")]),!0}finally{clearTimeout(o)}})}function pe(n,i){return Q.from(async()=>{const{controller:e,timer:o}=ne();try{return await Promise.race([Z.update(E(n),i),ie(e.signal,"Firebase update")]),!0}finally{clearTimeout(o)}})}function Be(n){return Q.from(async()=>{const{controller:i,timer:e}=ne();try{return await Promise.race([Z.remove(E(n)),ie(i.signal,"Firebase remove")]),!0}finally{clearTimeout(e)}})}function Xt({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading dashboard</div>
      <div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div>
      <button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button>
    </div>`;if(n.loading)return s`<div>${G(4)}</div>`;const e=n.dashboard||{},o=e.bookingsToday??0,t=e.pendingCount??0,r=e.activeWorkspaces??0,a=e.recentBookings||[],d=e.noShowRate,c=e.newWorkspacesThisWeek??0;return s`
    <div class="fade-in">
      <!-- KPI Cards -->
      <div class="stat-grid">
        <div class="stat-card fade-in">
          <div class="stat-card-label">Bookings Today</div>
          <div class="stat-card-value">${o}</div>
        </div>
        <div class="stat-card fade-in" style="animation-delay:50ms;">
          <div class="stat-card-label">Pending</div>
          <div class="stat-card-value">${t}</div>
          <div class="stat-card-change" style="color:#F5A623;">Requires review</div>
        </div>
        <div class="stat-card fade-in" style="animation-delay:100ms;">
          <div class="stat-card-label">Active Workspaces</div>
          <div class="stat-card-value">${r}</div>
          ${c>0?s`<div class="stat-card-change" style="color:#8A8993;">${c} created this week</div>`:""}
        </div>
        <div class="stat-card fade-in" style="animation-delay:150ms;">
          <div class="stat-card-label">No-Show Rate</div>
          <div class="stat-card-value" style="color:#00C48C;">${d!=null?l(String(d))+"%":"—"}</div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div style="display:flex;gap:8px;margin-bottom:24px;flex-wrap:wrap;">
        <button class="btn btn-primary btn-sm" onclick="${i.navigateTo}('/event-types')">+ New Event Type</button>
        <button class="btn btn-ghost btn-sm" onclick="${i.navigateTo}('/availability')">Manage Availability</button>
      </div>

      <!-- Recent Bookings -->
      <div class="card fade-in" style="animation-delay:200ms;">
        <div class="card-header">Recent Bookings</div>
        ${a.length===0?s`
          <div style="text-align:center;padding:32px;color:#8A8993;">
            No bookings yet. Share your booking link to get started.
          </div>
        `:s`
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Invitee</th><th>Event</th><th>Date</th><th>Time</th><th>Status</th></tr></thead>
              <tbody>
                ${a.map(p=>s`
                  <tr>
                    <td>${l(p.formData?.name||p.inviteeId)}</td>
                    <td>${l(p.eventTypeId)}</td>
                    <td>${l(p.date||"—")}</td>
                    <td>${l(p.slotId||"—")}</td>
                    <td>${_(p.status==="confirmed"?"success":p.status==="cancelled"?"danger":"warning",p.status||"pending")}</td>
                  </tr>
                `).join("")}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `}function Zt({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return Xt({state:o,fn:t})},state:{dashboard:{},error:"",loading:!0},methods:{}});return e.load=async function(){const t=e.getState().user?.uid;if(!t){e.render({loading:!1});return}try{const[r,a]=await M(E(`/host_bookings/${t}`)).unwrap();if(a)throw a;const d=r?Object.keys(r):[],c=[];for(const y of d.slice(0,50)){const[u,g]=await M(E(`/bookings/${y}`)).unwrap();!g&&u&&c.push(u)}const[p,m]=await M(E("/workspaces")).unwrap(),b=p?Object.values(p).filter(y=>y.hostId===t):[],A=new Date().toISOString().slice(0,10),F=c.filter(y=>(y.createdAt||"").startsWith(A)).length,B=c.filter(y=>y.status==="pending").length,K=b.filter(y=>y.status==="active").length,O=new Date;O.setDate(O.getDate()-O.getDay());const D=b.filter(y=>new Date(y.createdAt||0)>=O).length,f=c.sort((y,u)=>(u.createdAt||"").localeCompare(y.createdAt||"")).slice(0,5),S=c.filter(y=>y.status==="confirmed"||y.status==="cancelled"||y.status==="no_show"),w=c.filter(y=>y.status==="no_show").length,z=S.length>0?Math.round(w/S.length*100):null;e.render({loading:!1,error:"",dashboard:{bookingsToday:F,pendingCount:B,activeWorkspaces:K,newWorkspacesThisWeek:D,noShowRate:z,recentBookings:f}})}catch(r){console.error("[dashboard] load error:",r),e.render({loading:!1,error:r.message||"Failed to load dashboard"})}},e}const ke={green:"status-dot-green",yellow:"status-dot-yellow",red:"status-dot-red",gray:"status-dot-gray"};function eo({color:n="gray"}={}){const i=$({template({state:e}){const o=ke[e.color]||ke.gray;return s`<span id="statusdot-root" class="status-dot ${o}"></span>`},state:{color:n},methods:{setColor(e){i.render({color:e})}}});return i}function Y(n="gray"){return eo({color:n}).toString()}function to({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading data</div>
      <div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div>
      <button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button>
    </div>`;if(n.loading)return s`<div>${G(2)}</div>`;const e=n.calendarConnections||[],o=e.filter(t=>t.status==="active").length>=10;return s`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div><h2>Calendar Connections</h2><p style="color:#8A8993;font-size:0.875rem;">Sync your availability across Google and Microsoft calendars</p></div>
      <button class="btn btn-primary btn-sm" onclick="${i.connectCalendar}('google')" ${o?"disabled":""}>${v.plus} Connect Calendar</button>
    </div>

    ${n.calendarError?s`<div class="card" style="margin-bottom:16px;border-color:#FF4A5A;"><p style="color:#FF4A5A;font-size:0.875rem;">${l(n.calendarError)}</p></div>`:""}

    ${e.length===0?s`
      <div class="empty-state">
        <div style="font-size:48px;margin-bottom:16px;">${v.calendar}</div>
        <div class="empty-state-title">No calendars connected</div>
        <div class="empty-state-desc">Connect your Google or Microsoft calendar to sync availability.</div>
        <button class="btn btn-primary btn-sm" onclick="${i.connectCalendar}('google')">+ Connect Google Calendar</button>
      </div>
    `:""}

    <div style="display:flex;flex-direction:column;gap:12px;">
      ${e.map(t=>s`
        <div class="card fade-in" style="display:flex;align-items:center;gap:16px;">
          <div style="width:40px;height:40px;border-radius:10px;background:${t.provider==="google"?"#fff":"#0078D4"};display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.25rem;color:${t.provider==="google"?"#4285F4":"#fff"};flex-shrink:0;">
            ${t.provider==="google"?"G":"O"}
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;">${l(t.email||"Unknown")}</div>
            <div style="font-size:0.875rem;color:#8A8993;">${l(t.provider==="google"?"Google Calendar":"Microsoft Outlook")} · ${t.lastSync?"Synced "+oo(t.lastSync):"Not synced"}</div>
          </div>
          ${Y(t.status==="active"?"green":t.status==="error"?"red":"yellow")}
          <button class="btn btn-ghost btn-sm" onclick="${i.syncCalendar}('${l(t.cid)}')">Sync</button>
          <button class="btn btn-ghost btn-sm" onclick="${i.disconnectCalendar}('${l(t.cid)}')" style="color:#FF4A5A;">Disconnect</button>
        </div>
      `).join("")}
    </div>

    ${o?s`<p style="margin-top:12px;color:#F5A623;font-size:0.875rem;">Maximum 10 calendar connections reached.</p>`:""}
  `}function oo(n){const i=Date.now()-new Date(n).getTime(),e=Math.floor(i/6e4);if(e<1)return"just now";if(e<60)return`${e}m ago`;const o=Math.floor(e/60);return o<24?`${o}h ago`:`${Math.floor(o/24)}d ago`}function no({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return to({state:o,fn:t})},state:{calendarConnections:[],calendarError:"",error:"",loading:!1},methods:{connectCalendar(o){e.render({loading:!0}),V(async()=>{const{getCurrentUser:t}=await import("./chunk-hFDNlS-5.js");return{getCurrentUser:t}},__vite__mapDeps([0,1])).then(({getCurrentUser:t})=>{const r=t();if(r){const a=[...e.getState().calendarConnections||[]],d="cal_"+Math.random().toString(36).slice(2,8);a.push({cid:d,provider:o,email:r.email||"unknown",status:"active",lastSync:null,createdAt:new Date().toISOString()}),e.render({calendarConnections:a,loading:!1})}}).catch(()=>e.render({loading:!1}))},disconnectCalendar(o){const t=(e.getState().calendarConnections||[]).filter(r=>r.cid!==o);e.render({calendarConnections:t})},syncCalendar(o){const t=(e.getState().calendarConnections||[]).map(r=>r.cid===o?{...r,_syncing:!0}:r);e.render({calendarConnections:t}),setTimeout(()=>{const r=(e.getState().calendarConnections||[]).map(a=>a.cid===o?{...a,_syncing:!1,lastSync:new Date().toISOString()}:a);e.render({calendarConnections:r})},2e3)}}});return e}const se=1;function io({state:n,fn:i}){if(n.loading)return s`<div>${G(4)}</div>`;if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading event types</div>
      <div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div>
      <button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button>
    </div>`;const e=n.eventTypes||[],o=(n.eventTypeSearch||"").toLowerCase(),t=n.showCreateForm,r=n.editingId,d=(n.user||{}).plan==="free",c=e.filter(b=>b.active!==!1).length,p=d&&c>=se,m=o?e.filter(b=>b.title?.toLowerCase().includes(o)):e;return!t&&e.length===0?s`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
        <div><h2>Event Types</h2><p style="color:#8A8993;font-size:0.875rem;">Create event types for people to book time with you</p></div>
        <button class="btn btn-primary btn-sm" onclick="${i.showCreateForm}()">${v.plus} New</button>
      </div>
      <div class="empty-state">
        <div style="font-size:48px;margin-bottom:16px;">${v.calendar}</div>
        <div class="empty-state-title">No event types</div>
        <div class="empty-state-desc">Create your first event type to start accepting bookings.</div>
        <button class="btn btn-primary btn-sm" onclick="${i.showCreateForm}()">${v.plus} Create Event Type</button>
      </div>
    `:s`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
      <div>
        <h2>Event Types</h2>
        <p style="color:#8A8993;font-size:0.875rem;">${e.length} event type${e.length!==1?"s":""} · ${c} active</p>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <div style="position:relative;width:200px;">
          <input class="input" placeholder="Search..." value="${l(o||"")}" oninput="${i._searchEventTypes}()" style="padding-left:32px;">
          <span style="position:absolute;left:8px;top:50%;transform:translateY(-50%);color:#8A8993;">${v.search}</span>
        </div>
        <button class="btn btn-primary btn-sm" onclick="${i.showCreateForm}()"
          ${p?"disabled":""}
          title="${p?"Free tier limited to "+se+" event type":""}">${v.plus} New</button>
      </div>
    </div>

    ${p?s`<div class="card" style="border-left:3px solid #F5A623;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
      <span style="color:#F5A623;">${v.alert}</span>
      <span style="color:#F4F3F6;font-size:0.875rem;">Free tier limit reached (${se} event type). Upgrade to create more.</span>
    </div>`:""}

    ${t?ro(n,i):""}
    ${r?so(n,i,r):""}

    ${m.length===0&&o?s`
      <div class="empty-state">
        <div style="font-size:32px;margin-bottom:8px;">${v.search}</div>
        <div class="empty-state-title">No results for "${l(o)}"</div>
        <div class="empty-state-desc">Try a different search term.</div>
      </div>
    `:""}

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">
      ${m.map(b=>s`
        <div class="card fade-in" style="cursor:pointer;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span class="status-dot status-dot-${b.active?"green":"gray"}"></span>
            <span style="font-weight:600;">${l(b.title)}</span>
          </div>
          <div style="font-size:0.875rem;color:#8A8993;display:flex;gap:16px;">
            <span>${v.clock} ${l(String(b.duration))}m</span>
            <span>${v.link} ${l(b.location||"none")}</span>
          </div>
          <div style="display:flex;gap:8px;margin-top:8px;align-items:center;">
            ${_(b.active?"info":"neutral",b.active?"Active":"Inactive")}
            ${b.visibility==="hidden"?_("neutral","Hidden"):""}
            <span style="flex:1;"></span>
            <button class="btn btn-ghost btn-sm" onclick="${i.editEventType}('${l(b.eid)}')" style="font-size:0.75rem;min-height:32px;">Edit</button>
            <a class="btn btn-ghost btn-sm" href="#/event-types/editor" style="font-size:0.75rem;min-height:32px;">Page</a>
            <button class="btn btn-ghost btn-sm" onclick="${i.deleteEventType}('${l(b.eid)}')" style="color:#FF4A5A;font-size:0.75rem;min-height:32px;">Delete</button>
          </div>
        </div>
      `).join("")}
    </div>
  `}function ro(n,i){return s`<div class="card fade-in" style="margin-bottom:16px;">
    <div class="card-header">Create Event Type</div>
    <div style="display:flex;flex-direction:column;gap:12px;max-width:480px;">
      <div><label class="input-label">Title</label><input id="et-title" class="input" placeholder="e.g. Strategy Call" oninput="${i._setFormField}('title')"></div>
      <div><label class="input-label">Duration (minutes)</label><input id="et-duration" class="input" type="number" min="5" max="480" value="30" oninput="${i._setFormField}('duration')"></div>
      <div><label class="input-label">Location</label><select id="et-location" class="select" onchange="${i._setFormField}('location')"><option value="zoom">Zoom</option><option value="meet">Google Meet</option><option value="teams">Microsoft Teams</option><option value="none">None</option></select></div>
      <div><label class="input-label">Visibility</label><select id="et-visibility" class="select" onchange="${i._setFormField}('visibility')"><option value="public">Public</option><option value="hidden">Hidden (direct link only)</option></select></div>
      <div><label class="input-label">Color</label><input id="et-color" class="input" type="color" value="#7047EB" oninput="${i._setFormField}('color')"></div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary btn-sm" onclick="${i.createEventType}()">Create</button>
        <button class="btn btn-ghost btn-sm" onclick="${i.hideCreateForm}()">Cancel</button>
      </div>
    </div>
  </div>`}function so(n,i,e){const o=(n.eventTypes||[]).find(t=>t.eid===e);return o?s`<div class="card fade-in" style="margin-bottom:16px;border-left:3px solid #7047EB;">
    <div class="card-header">Edit: ${l(o.title)}</div>
    <div style="display:flex;flex-direction:column;gap:12px;max-width:480px;">
      <div><label class="input-label">Title</label><input id="et-edit-title" class="input" value="${l(o.title)}"></div>
      <div><label class="input-label">Duration (minutes)</label><input id="et-edit-duration" class="input" type="number" min="5" max="480" value="${l(String(o.duration||30))}"></div>
      <div><label class="input-label">Location</label><select id="et-edit-location" class="select">
        ${["zoom","meet","teams","none"].map(t=>s`<option value="${t}" ${o.location===t?"selected":""}>${t==="meet"?"Google Meet":t==="teams"?"Microsoft Teams":t==="none"?"None":"Zoom"}</option>`).join("")}
      </select></div>
      <div><label class="input-label">Visibility</label><select id="et-edit-visibility" class="select">
        <option value="public" ${o.visibility!=="hidden"?"selected":""}>Public</option>
        <option value="hidden" ${o.visibility==="hidden"?"selected":""}>Hidden (direct link only)</option>
      </select></div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-primary btn-sm" onclick="${i.saveEventType}('${l(o.eid)}')">Save Changes</button>
        <button class="btn btn-ghost btn-sm" onclick="${i.cancelEdit}()">Cancel</button>
      </div>
    </div>
  </div>`:""}function ao({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return io({state:o,fn:t})},state:{editingId:"",error:"",eventTypeSearch:"",eventTypes:[],loading:!0,showCreateForm:!1,user:null},methods:{showCreateForm(){e.render({showCreateForm:!0,editingId:""})},hideCreateForm(){e.render({showCreateForm:!1,editingId:""})},editEventType(o){e.render({editingId:o,showCreateForm:!1})},cancelEdit(){e.render({editingId:""})},async createEventType(){const o=(document.getElementById("et-title")?.value||"").trim();if(!o)return;const t=e.getState().user?.uid,r=parseInt(document.getElementById("et-duration")?.value||"30"),a=document.getElementById("et-location")?.value||"zoom",d=document.getElementById("et-visibility")?.value||"public",c=document.getElementById("et-color")?.value||"#7047EB",p="evt_"+Math.random().toString(36).slice(2,8),m=new Date().toISOString(),b={eid:p,title:o,duration:r,location:a,visibility:d,color:c,active:!0,createdAt:m};t&&await _e(E(`/event_types/${t}/${p}`),b).unwrap(),e.load(),e.render({showCreateForm:!1})},async saveEventType(o){const t=e.getState().user?.uid,r=(document.getElementById("et-edit-title")?.value||"").trim(),a=parseInt(document.getElementById("et-edit-duration")?.value||"30"),d=document.getElementById("et-edit-location")?.value||"zoom",c=(e.getState().eventTypes||[]).find(m=>m.eid===o);if(!c)return;const p={...c,title:r||c.title,duration:a,location:d,updatedAt:new Date().toISOString()};t&&await pe(E(`/event_types/${t}/${o}`),p).unwrap(),e.load(),e.render({editingId:""})},async deleteEventType(o){const t=e.getState().user?.uid;t&&await Be(E(`/event_types/${t}/${o}`)).unwrap(),e.load(),e.render({editingId:""})},_setFormField(o){},_searchEventTypes(){const t=(document.querySelector("#event-types-search")||document.querySelector('input[placeholder*="Search"]'))?.value||"";e.render({eventTypeSearch:t})}}});return e.load=async function(){const o=e.getState().user?.uid;if(!o){e.render({loading:!1});return}try{const[t,r]=await M(E(`/event_types/${o}`)).unwrap();if(r)throw r;const a=t?Object.values(t):[];e.render({eventTypes:a,loading:!1,error:""})}catch(t){console.error("[event-types] load error:",t),e.render({loading:!1,error:t.message||"Failed to load event types"})}},e}const lo=[{id:"header",label:"Header"},{id:"description",label:"Description"},{id:"calendar",label:"Calendar"},{id:"form",label:"Form Fields"},{id:"testimonials",label:"Testimonials"},{id:"faq",label:"FAQ"},{id:"image",label:"Image"},{id:"spacer",label:"Spacer"},{id:"footer",label:"Footer"}],co=["classic","modern","compact"],po=["#7047EB","#00C48C","#FF4A5A","#F5A623"];function uo({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Failed to load editor</div>
      <div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div>
      <button class="btn btn-primary" onclick="${i.navigateTo}('/event-types')">← Back to Event Types</button>
    </div>`;if(n.loading)return s`<div style="text-align:center;padding:64px;">
      <div style="color:#8A8993;margin-bottom:16px;">${v.spinner}</div>
      <div style="color:#8A8993;font-size:0.875rem;">Loading editor...</div>
    </div>`;const e=n.pageConfig||{},o=e.layout||"modern",t=e.primaryColor||"#7047EB",r=n.currentEventType||n.editingEventType||{},a=n.saving===!0;return s`
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;flex-wrap:wrap;">
      <button class="btn btn-ghost btn-sm" onclick="${i.navigateTo}('/event-types')">${v.chevronLeft} Back</button>
      <h2 style="margin:0;">Edit Booking Page</h2>
      ${r.title?s`<span class="badge badge-info" style="font-size:0.75rem;">${l(r.title)}</span>`:""}
    </div>

    ${n.saveError?s`<div class="card" style="border-left:3px solid #FF4A5A;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
      <span style="color:#FF4A5A;">${v.alert}</span>
      <span style="color:#F4F3F6;font-size:0.875rem;">${l(n.saveError)}</span>
      <button class="btn btn-ghost btn-sm" style="margin-left:auto;color:#8A8993;" onclick="${i.dismissSaveError}()">${v.x}</button>
    </div>`:""}

    <div style="display:grid;grid-template-columns:220px 1fr 260px;gap:16px;align-items:start;">

      <!-- ── Left: Block Palette ───────────────────────────── -->
      <div class="card" style="position:sticky;top:80px;">
        <div class="card-header">Blocks</div>
        <div style="display:flex;flex-direction:column;gap:2px;">
          ${lo.map(d=>s`
            <button class="sidebar-nav-item" style="min-height:36px;color:#8A8993;font-size:0.875rem;" onclick="${i.addBlock}('${l(d.id)}')">
              ${l(d.label)}
            </button>
          `).join("")}
        </div>
        <div style="margin-top:16px;">
          <div class="card-header">Layout</div>
          <div style="display:flex;gap:4px;">
            ${co.map(d=>s`
              <button class="btn ${d===o?"btn-primary":"btn-ghost"} btn-sm"
                style="flex:1;text-transform:capitalize;"
                onclick="${i.setLayout}('${d}')"
                ${a?"disabled":""}>${l(d)}</button>
            `).join("")}
          </div>
        </div>
      </div>

      <!-- ── Center: Live Preview ──────────────────────────── -->
      <div class="card" style="padding:0;overflow:hidden;">
        <div style="background:#1A1923;padding:10px 16px;border-bottom:1px solid #262431;display:flex;align-items:center;gap:8px;">
          <span class="status-dot status-dot-green"></span>
          <span style="font-size:0.875rem;color:#8A8993;">Live Preview</span>
          <span style="margin-left:auto;font-size:0.75rem;color:#8A8993;">375px</span>
        </div>
        <div style="max-width:375px;margin:0 auto;padding:32px 20px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="width:48px;height:48px;border-radius:12px;background:${t};color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Geist',sans-serif;font-weight:700;font-size:20px;margin:0 auto 12px;">${l((r.title||"M")[0].toUpperCase())}</div>
            <div style="font-family:'Geist',sans-serif;font-weight:700;font-size:1.25rem;">${l(r.title||"Meeting")}</div>
            <div style="font-size:0.875rem;color:#8A8993;margin-top:4px;">${l(String(r.duration||30))} min</div>
          </div>
          <div style="background:#12111A;border:1px solid #262431;border-radius:10px;padding:16px;">
            <div style="font-size:0.875rem;color:#8A8993;margin-bottom:8px;">Select Date</div>
            <div class="slot-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:12px;">
              <button class="slot-btn selected">Jun 16</button><button class="slot-btn">Jun 17</button><button class="slot-btn">Jun 18</button><button class="slot-btn">Jun 19</button>
            </div>
            <div style="font-size:0.875rem;color:#8A8993;margin-bottom:8px;">Select Time</div>
            <div class="slot-grid" style="grid-template-columns:repeat(3,1fr);margin-bottom:12px;">
              <button class="slot-btn">9:00 AM</button><button class="slot-btn">10:30 AM</button><button class="slot-btn">2:00 PM</button>
            </div>
            <div style="font-size:0.875rem;color:#8A8993;margin-bottom:8px;">Your Info</div>
            <input class="input" placeholder="Full name" style="margin-bottom:8px;background:#1A1923;" disabled>
            <input class="input" placeholder="Email" style="margin-bottom:12px;background:#1A1923;" disabled>
            <button class="btn btn-primary btn-lg" style="width:100%;background:${t};" disabled>${l(e.buttonText||"Confirm Booking")}</button>
          </div>
          <div style="text-align:center;font-size:0.75rem;color:#8A8993;margin-top:12px;">Powered by Calendly v2</div>
        </div>
      </div>

      <!-- ── Right: Properties ─────────────────────────────── -->
      <div class="card" style="position:sticky;top:80px;">
        <div class="card-header">Properties</div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div>
            <label class="input-label">Header Title</label>
            <input id="pe-title" class="input" value="${l(e.headerTitle||r.title||"")}" ${a?"disabled":""}>
          </div>
          <div>
            <label class="input-label">Description</label>
            <textarea id="pe-desc" class="input" rows="3" style="resize:vertical;" ${a?"disabled":""}>${l(e.description||"")}</textarea>
          </div>
          <div>
            <label class="input-label">Primary Color</label>
            <div style="display:flex;gap:6px;align-items:center;">
              ${po.map(d=>s`<button
                style="width:28px;height:28px;border-radius:6px;background:${d};border:2px solid ${d===t?"#F4F3F6":"transparent"};cursor:pointer;"
                onclick="${i.setColor}('${d}')"
                ${a?"disabled":""}
                title="${l(d)}"></button>`).join("")}
              <input type="color" value="${t}" style="width:28px;height:28px;border-radius:6px;cursor:pointer;border:none;" ${a?"disabled":""}>
            </div>
          </div>
          <div>
            <label class="input-label">Button Text</label>
            <input id="pe-btn" class="input" value="${l(e.buttonText||"Confirm Booking")}" ${a?"disabled":""}>
          </div>
          <button class="btn btn-primary" onclick="${i.savePage}()" style="width:100%;" ${a?"disabled":""}>
            ${a?s`${v.spinner} Saving...`:"Save Page"}
          </button>
          <button class="btn btn-ghost btn-sm" onclick="${i.previewPage}()" style="width:100%;color:#7047EB;" ${a?"disabled":""}>
            ${v.eye} Open Preview
          </button>
        </div>
      </div>

    </div>
  `}function vo({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return uo({state:o,fn:t})},state:{currentEventType:{},editingEventType:{},error:"",loading:!1,pageConfig:{},saveError:"",saving:!1},methods:{addBlock(o){const t={...e.getState().pageConfig},r=[...t.blocks||[],{type:o,config:{}}];e.render({pageConfig:{...t,blocks:r}})},setLayout(o){const t={...e.getState().pageConfig};e.render({pageConfig:{...t,layout:o}})},setColor(o){const t={...e.getState().pageConfig};e.render({pageConfig:{...t,primaryColor:o}})},savePage(){e.render({saving:!0,saveError:""}),setTimeout(()=>e.render({saving:!1,saveError:""}),500)},previewPage(){window.open("#/event-types/editor?preview=1","_blank")},dismissSaveError(){e.render({saveError:""})}}});return e}function go({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading availability</div>
      <div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div>
      <button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button>
    </div>`;if(n.loading)return s`<div style="text-align:center;padding:48px;color:#8A8993;" ">${v.spinner}<div style="margin-top:8px;">Loading availability...</div></div>`;const e=n.workingHours||{},o=n.bookingRules||{},t=["mon","tue","wed","thu","fri","sat","sun"],r=["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];return s`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div><h2>Availability</h2><p style="color:#8A8993;font-size:0.875rem;">Configure your working hours and booking rules</p></div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost btn-sm" onclick="${i.copyBookingLink}()">${v.link} Copy Booking Link</button>
        <button class="btn btn-primary btn-sm" onclick="${i.saveAvailability}()">${n.saving?"Saving...":"Save Changes"}</button>
      </div>
    </div>

    ${n.availabilityError?s`<div class="card" style="margin-bottom:16px;border-color:#FF4A5A;"><p style="color:#FF4A5A;font-size:0.875rem;">${l(n.availabilityError)}</p></div>`:""}

    <div style="display:grid;grid-template-columns:1fr 300px;gap:20px;">
      <div>
        <!-- Working Hours -->
        <div class="card" style="margin-bottom:16px;">
          <div class="card-header">Working Hours</div>
          <div style="display:flex;flex-direction:column;gap:8px;">
            ${t.map((a,d)=>{const c=e[a]||{start:"09:00",end:"17:00",enabled:d<5};return s`
                <div style="display:flex;align-items:center;gap:8px;">
                  <label style="display:flex;align-items:center;gap:4px;width:36px;font-size:0.875rem;color:#8A8993;cursor:pointer;">
                    <input type="checkbox" ${c.enabled?"checked":""} style="accent-color:#7047EB;width:16px;height:16px;" onchange="${i._toggleDay}('${a}')">
                    ${l(r[d])}
                  </label>
                  ${c.enabled?s`
                    <input id="wh-start-${a}" class="input" type="time" value="${l(c.start)}" style="width:110px;min-height:36px;">
                    <span style="color:#8A8993;">–</span>
                    <input id="wh-end-${a}" class="input" type="time" value="${l(c.end)}" style="width:110px;min-height:36px;">
                  `:s`<span style="color:#8A8993;font-size:0.875rem;">Unavailable</span>`}
                </div>
              `}).join("")}
          </div>
        </div>

        <!-- Month Calendar Preview -->
        <div class="card">
          <div class="card-header">Month Preview</div>
          <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;">
            ${r.map(a=>s`<div style="font-size:0.75rem;color:#8A8993;padding:4px;">${l(a)}</div>`).join("")}
            ${mo(n.monthGrid||[])}
          </div>
        </div>
      </div>

      <!-- Booking Rules -->
      <div>
        <div class="card" style="margin-bottom:12px;">
          <div class="card-header">Booking Rules</div>
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div><label class="input-label">Max bookings per day</label><input id="br-maxPerDay" class="input" type="number" min="1" max="20" value="${o.maxPerDay||3}"></div>
            <div><label class="input-label">Minimum notice (hours)</label><input id="br-minNotice" class="input" type="number" min="0" max="72" value="${o.minNoticeHours||2}"></div>
            <div><label class="input-label">Max advance (days)</label><input id="br-maxAdvance" class="input" type="number" min="1" max="365" value="${o.maxAdvanceDays||60}"></div>
            <div><label class="input-label">Buffer between slots (minutes)</label><input id="br-buffer" class="input" type="number" min="0" max="120" value="${o.bufferMinutes||15}"></div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">Booking Link</div>
          <p style="font-size:0.875rem;color:#8A8993;margin-bottom:8px;">Share this link for people to book time with you:</p>
          <div style="display:flex;gap:4px;">
            <input class="input" value="https://book.example.com/${l(n.user?.uid||"you")}/first-event" readonly style="font-size:0.75rem;">
            <button class="btn btn-ghost btn-sm" onclick="${i.copyBookingLink}()" style="flex-shrink:0;">${v.copy}</button>
          </div>
        </div>
      </div>
    </div>
  `}function mo(n){return!n||!n.length?s`<div style="grid-column:1/-1;text-align:center;padding:32px 0;color:#8A8993;font-size:0.875rem;">No availability data for this month. Set your working hours to generate time slots.</div>`:n.flat().map(i=>{if(!i)return s`<div></div>`;const e=i.hasSlots,o=i.isToday;return s`
      <div style="padding:8px 4px;border-radius:10px;font-size:0.875rem;${o?"background:#7047EB;color:#fff;font-weight:600;":e?"background:rgba(112,71,235,0.12);font-weight:600;":"color:#8A8993;"}">
        ${i.day||""}
      </div>
    `}).join("")}function bo({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return go({state:o,fn:t})},state:{availabilityError:"",bookingRules:{},error:"",loading:!0,monthGrid:{},saving:!1,user:null,workingHours:{}},methods:{_toggleDay(o){const t={...e.getState().workingHours};t[o]=t[o]?{...t[o],enabled:!t[o].enabled}:{enabled:!0,start:"09:00",end:"17:00"},e.render({workingHours:t})},copyBookingLink(){const t="https://book.example.com/"+(e.getState().user?.uid||"you")+"/first-event";navigator.clipboard&&navigator.clipboard.writeText(t).catch(()=>{})},saveAvailability(){e.render({saving:!0});const o=e.getState().user?.uid;if(!o){e.render({saving:!1,availabilityError:"Not authenticated"});return}const t=e.getState().workingHours||{},r={},a=document.getElementById("br-maxPerDay")?.value,d=document.getElementById("br-minNotice")?.value,c=document.getElementById("br-maxAdvance")?.value,p=document.getElementById("br-buffer")?.value;a&&(r.maxPerDay=parseInt(a)),d&&(r.minNoticeHours=parseInt(d)),c&&(r.maxAdvanceDays=parseInt(c)),p&&(r.bufferMinutes=parseInt(p)),pe(E(`/booking_rules/${o}`),{workingHours:t,bookingRules:r,updatedAt:new Date().toISOString()}).unwrap().then(()=>e.render({saving:!1,availabilityError:""})).catch(m=>{console.error("[availability] save error:",m),e.render({saving:!1,availabilityError:m.message||"Save failed"})})}}});return e.load=async function(){const o=e.getState().user?.uid;if(!o){e.render({loading:!0});return}try{const[t,r]=await M(E(`/availability/${o}`)).unwrap();if(r)throw r;const a=t?t.val?t.val():t:{},d={},c={};for(const[p,m]of Object.entries(a||{}))d[p]=Object.values(m||{});for(const p of["mon","tue","wed","thu","fri"])c[p]={enabled:!0,start:"09:00",end:"17:00"};e.render({monthGrid:d,workingHours:c,loading:!0,error:""})}catch(t){console.error("[availability] load error:",t),e.render({loading:!0,error:t.message||"Failed to load availability"})}},e}const we={sm:32,md:40,lg:64};function yo({user:n,size:i="md"}={}){const e=$({template({state:o}){const t=we[o.size]||we.md,r=fo(o.user),a=o.user?.photoURL;return a?s`
          <div id="useravatar-root" style="width:${t}px;height:${t}px;border-radius:50%;background-image:url(${l(a)});background-size:cover;background-position:center;flex-shrink:0;" title="${l(o.user?.name||o.user?.email||"")}"></div>
        `:s`
        <div id="useravatar-root" class="sidebar-user-avatar" style="width:${t}px;height:${t}px;font-size:${Math.round(t*.38)}px;" title="${l(o.user?.name||o.user?.email||"User")}">
          ${l(r)}
        </div>
      `},state:{user:n||null,size:i},methods:{setUser(o){e.render({user:o})},setSize(o){e.render({size:o})}}});return e}function ho(n,i="md"){return yo({user:n,size:i}).toString()}function fo(n){if(!n)return"?";const i=n.name||n.email||"",e=String(i).trim().split(/\s+/);return e.length===1?e[0].substring(0,2).toUpperCase():(e[0][0]+e[e.length-1][0]).toUpperCase()}const ae=["date_select","slot_select","form","confirm"],xo=["Select Date","Select Time","Your Info","Confirm"],ue="calendly_booking_wizard";function Ie(){try{const n=sessionStorage.getItem(ue);return n?JSON.parse(n):null}catch{return null}}function le(n){try{sessionStorage.setItem(ue,JSON.stringify(n))}catch{}}function De(){try{sessionStorage.removeItem(ue)}catch{}}function ko({state:n,fn:i}){if(!n._wizardRestored){const b=Ie();b&&b.eventTypeId===n.currentParams?.eventTypeId&&i.restoreWizard&&i.restoreWizard(b)}if(n.loading)return s`<div style="display:flex;align-items:center;justify-content:center;min-height:50vh;">
      <div style="text-align:center;color:#8A8993;">${v.spinner}<div style="margin-top:8px;">Loading...</div></div>
    </div>`;if(n.bookingError){const b=n.bookingError;return b==="event_deleted"?s`<div style="max-width:480px;margin:0 auto;"><div class="card" style="text-align:center;padding:32px;">
        <div style="font-size:48px;margin-bottom:16px;color:#FF4A5A;">${v.alert}</div>
        <h2 style="margin-bottom:8px;">Event No Longer Available</h2>
        <p style="color:#8A8993;">This event type has been removed by the host.</p>
      </div></div>`:b==="no_availability"?s`<div style="max-width:480px;margin:0 auto;"><div class="card" style="text-align:center;padding:32px;">
        <div style="font-size:48px;margin-bottom:16px;">${v.calendar}</div>
        <h2 style="margin-bottom:8px;">No Availability</h2>
        <p style="color:#8A8993;">The host has no available time slots right now. Check back later.</p>
      </div></div>`:b==="slot_taken"?s`<div style="max-width:480px;margin:0 auto;"><div class="card" style="text-align:center;padding:32px;">
        <div style="font-size:48px;margin-bottom:16px;color:#F5A623;">${v.clock}</div>
        <h2 style="margin-bottom:8px;">Slot Just Taken</h2>
        <p style="color:#8A8993;margin-bottom:16px;">This time slot was just booked by someone else. Please choose another time.</p>
        <button class="btn btn-primary" onclick="${i.setBookingStep}('date_select')">Choose Another Time</button>
      </div></div>`:b==="password_gate"?s`<div style="max-width:480px;margin:0 auto;"><div class="card" style="text-align:center;padding:32px;">
        <div style="font-size:48px;margin-bottom:16px;">${v.lock}</div>
        <h2 style="margin-bottom:8px;">Password Protected</h2>
        <p style="color:#8A8993;margin-bottom:16px;">Please enter the event password to continue.</p>
        <input id="booking-password" class="input" type="password" placeholder="Event password" style="margin-bottom:12px;">
        <button class="btn btn-primary" onclick="${i.submitPassword}()">Submit</button>
      </div></div>`:s`<div style="max-width:480px;margin:0 auto;"><div class="card" style="text-align:center;padding:32px;">
      <div style="font-size:48px;margin-bottom:16px;color:#FF4A5A;">${v.alert}</div>
      <h2 style="margin-bottom:8px;">Something went wrong</h2>
      <p style="color:#8A8993;">${l(b)}</p>
    </div></div>`}const e=n.bookingStep||"date_select",o=ae.indexOf(e),t=n.bookingEventType||{},r=n.bookingHost||{},a=n.bookingSlots||[],d=n.bookingSelectedDate||"",c=n.bookingSelectedSlot||"",p=n.bookingFormData||{},m=n.bookingSuccess;return i._persistWizard&&i._persistWizard({step:e,selectedDate:d,selectedSlot:c,formData:p,eventTypeId:t.id}),m?(De(),s`
      <div style="max-width:480px;margin:0 auto;">
        <div class="card" style="text-align:center;padding:32px;">
          <div style="font-size:48px;margin-bottom:16px;color:#00C48C;">${v.check}</div>
          <h2 style="margin-bottom:8px;">Booking Confirmed!</h2>
          <p style="color:#8A8993;margin-bottom:8px;">${l(t.title)} with ${l(r.name||"host")}</p>
          <p style="color:#8A8993;">${l(d)} at ${l(c)}</p>
          <p style="color:#8A8993;margin-top:12px;font-size:0.875rem;">A confirmation has been sent to your email.</p>
        </div>
      </div>`):s`
    <div style="max-width:480px;margin:0 auto;">
      <div class="card" style="text-align:center;padding:32px;">
        <div style="width:48px;height:48px;border-radius:12px;background:#7047EB;color:#fff;display:flex;align-items:center;justify-content:center;font-family:'Geist',sans-serif;font-weight:700;font-size:20px;margin:0 auto 16px;">C</div>
        <h2>${l(t.title||"Book a Meeting")}</h2>
        <p style="color:#8A8993;margin-bottom:4px;">${l(String(t.duration||30))} min · ${l(t.location||"Video call")}</p>
        ${r.name?s`<div style="margin-bottom:16px;display:flex;align-items:center;justify-content:center;gap:8px;">${ho(r,"sm")}<span style="font-size:0.875rem;color:#8A8993;">${l(r.name)}</span></div>`:""}

        <!-- Step indicator -->
        <div class="wizard-steps" style="margin-bottom:24px;">
          ${ae.map((b,A)=>{const F=A===o,B=A<o;return s`<div class="wizard-step ${F?"active":""} ${B?"done":""}">
              <div class="wizard-step-num">${B?v.check:A+1}</div>
              <span>${xo[A]}</span>
            </div>${A<ae.length-1?s`<div class="wizard-connector ${B?"done":""}"></div>`:""}`}).join("")}
        </div>

        ${e==="date_select"?wo(n,i,a,d):""}
        ${e==="slot_select"?$o(n,i,a,d,c):""}
        ${e==="form"?Ao(n,i,p,t):""}
        ${e==="confirm"?So(n,i,p,d,c,t):""}
      </div>
    </div>
  `}function wo(n,i,e,o){const t=[...new Set(e.map(r=>r.date))].slice(0,14);return s`
    <div style="text-align:left;">
      <label class="input-label">Select Date</label>
      ${t.length===0?s`<p style="color:#8A8993;padding:16px;text-align:center;">No available dates in the next 14 days.</p>`:""}
      <div class="slot-grid" style="grid-template-columns:repeat(4,1fr);">
        ${t.map(r=>s`
          <button class="slot-btn${o===r?" selected":""}" onclick="${i.selectBookingDate}('${l(r)}')">${l(r.slice(5))}</button>
        `).join("")}
      </div>
    </div>
  `}function $o(n,i,e,o,t){const r=e.filter(a=>a.date===o&&a.status==="free");return s`
    <div style="text-align:left;">
      <label class="input-label">Select Time — ${l(o)}</label>
      <button class="btn btn-ghost btn-sm" onclick="${i.setBookingStep}('date_select')" style="margin-bottom:8px;">← Change date</button>
      ${r.length===0?s`<p style="color:#8A8993;padding:16px;text-align:center;">No available times on this date.</p>`:""}
      <div class="slot-grid">
        ${r.map(a=>s`
          <button class="slot-btn${t===a.iso?" selected":""}" onclick="${i.selectBookingSlot}('${l(a.iso)}')">${l(a.time)}</button>
        `).join("")}
      </div>
    </div>
  `}function Ao(n,i,e,o){const t=o.formFields||[{id:"name",label:"Your Name",type:"text",required:!0},{id:"email",label:"Email",type:"email",required:!0}];return s`
    <div style="text-align:left;">
      <button class="btn btn-ghost btn-sm" onclick="${i.setBookingStep}('slot_select')" style="margin-bottom:12px;">← Change time</button>
      ${t.map(r=>s`
        <div style="margin-bottom:12px;">
          <label class="input-label">${l(r.label)} ${r.required?'<span style="color:#FF4A5A;">*</span>':""}</label>
          ${r.type==="textarea"?s`<textarea id="bf-${l(r.id)}" class="input" rows="3" placeholder="${l(r.placeholder||"")}" style="resize:vertical;">${l(e[r.id]||"")}</textarea>`:s`<input id="bf-${l(r.id)}" class="input" type="${r.type==="email"?"email":"text"}" value="${l(e[r.id]||"")}" placeholder="${l(r.placeholder||"")}">`}
        </div>
      `).join("")}
      <button class="btn btn-primary btn-lg" onclick="${i.confirmBooking}()" style="width:100%;">Continue</button>
    </div>
  `}function So(n,i,e,o,t,r){return s`
    <div style="text-align:left;">
      <h3 style="margin-bottom:16px;">Confirm Your Booking</h3>
      <div class="card" style="margin-bottom:16px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#8A8993;">Event</span><span>${l(r.title)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#8A8993;">Date</span><span>${l(o)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#8A8993;">Time</span><span>${l(t)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#8A8993;">Duration</span><span>${l(String(r.duration||30))} min</span></div>
        ${e.name?s`<div style="display:flex;justify-content:space-between;margin-bottom:8px;"><span style="color:#8A8993;">Name</span><span>${l(e.name)}</span></div>`:""}
        ${e.email?s`<div style="display:flex;justify-content:space-between;"><span style="color:#8A8993;">Email</span><span>${l(e.email)}</span></div>`:""}
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn btn-ghost btn-sm" onclick="${i.setBookingStep}('form')">← Back</button>
        <button class="btn btn-primary btn-lg" onclick="${i.submitBooking}()" style="flex:1;">Confirm Booking</button>
      </div>
    </div>
  `}function $e({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return ko({state:o,fn:t})},state:{_wizardRestored:!1,bookingError:"",bookingEventType:{},bookingFormData:{},bookingHost:{},bookingSelectedDate:"",bookingSelectedSlot:"",bookingSlots:[],bookingStep:"",bookingSuccess:!1,currentParams:{},loading:!0},methods:{setBookingStep(o){e.render({bookingStep:o,bookingError:""})},selectBookingDate(o){le({...e.getState(),bookingSelectedDate:o}),e.render({bookingSelectedDate:o,bookingStep:"slot_select"})},selectBookingSlot(o){const t=e.getState();le({...t,bookingSelectedSlot:o}),e.render({bookingSelectedSlot:o,bookingStep:"form"})},confirmBooking(){const r=(e.getState().bookingEventType||{}).formFields||[{id:"name",type:"text"},{id:"email",type:"email"}],a={};for(const d of r){const c=document.getElementById("bf-"+d.id);c&&(a[d.id]=c.value||"")}e.render({bookingFormData:a,bookingStep:"confirm"})},submitBooking(){const o=e.getState();e.render({loading:!0,bookingError:""}),V(async()=>{const{bookSlot:t}=await import("./chunk-DdVLKENW.js");return{bookSlot:t}},__vite__mapDeps([2,1])).then(({bookSlot:t})=>t(o.currentParams?.hostId||"",o.bookingSelectedDate,o.bookingSelectedSlot,o.user?.uid||null,{eventTypeId:o.currentParams?.eventTypeId||o.bookingEventType?.id||"",formData:o.bookingFormData||{},requiresPhi:!1}).unwrap()).then(([t,r])=>{if(r){console.error("[booking] submit failed:",r),e.render({loading:!0,bookingError:r.message||"Booking failed"});return}De(),e.render({loading:!0,bookingSuccess:!0,bookingError:""})}).catch(t=>{console.error("[booking] unexpected error:",t),e.render({loading:!0,bookingError:t.message||"Unexpected error"})})},submitPassword(){const o=document.getElementById("booking-password"),t=o?o.value:"",r=e.getState().bookingEventType||{};t&&t===r.password?e.render({bookingError:"",bookingStep:"date_select"}):e.render({bookingError:"Incorrect password"})},restoreWizard(o){o&&e.render({_wizardRestored:!0,bookingStep:o.step||"date_select",bookingSelectedDate:o.selectedDate||"",bookingSelectedSlot:o.selectedSlot||"",bookingFormData:o.formData||{}})},_persistWizard(o){le({...e.getState(),...o})}}});return e.load=async function(){const o=e.getState(),t=o.currentParams?.hostId,r=o.currentParams?.eventTypeId;if(!t||!r){e.render({loading:!0,bookingError:"event_deleted"});return}e.render({loading:!0,bookingError:""});try{const[a,d]=await M(E(`/event_types/${t}/${r}`)).unwrap();if(d)throw d;const c=a?.val?a.val():a;if(!c||c.active===!1){e.render({loading:!0,bookingError:"event_deleted"});return}const[p,m]=await M(E(`/users/${t}`)).unwrap(),b=m?{}:p?.val?p.val():p||{},[A,F]=await M(E(`/availability/${t}`)).unwrap();let B=[];if(!F&&A){const D=A?.val?A.val():A;for(const[,f]of Object.entries(D||{}))for(const[,S]of Object.entries(f||{}))S.status==="free"&&B.push(S)}const K=!!c.password,O=B.length>0;if(e.render({loading:!0,bookingEventType:c,bookingHost:b,bookingSlots:B,bookingStep:"date_select",bookingError:K?"password_gate":O?"":"no_availability"}),!o._wizardRestored){const D=Ie();D&&D.eventTypeId===r&&e.restoreWizard(D)}}catch(a){console.error("[booking] load error:",a),e.render({loading:!0,bookingError:a.message||"Failed to load booking page"})}},e}const Eo=[{id:"text",label:"Text"},{id:"select",label:"Multiple Choice"},{id:"radio",label:"Single Choice"},{id:"checkbox",label:"Checkboxes"}];function Co({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading routing forms</div>
      <div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div>
      <button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button>
    </div>`;if(n.loading)return s`<div>${G(3)}</div>`;const e=n.routingForms||[],o=n.routingMode||"list",t=n.builderForm||null,r=n.pools||[],a=n.saving===!0;return o==="preview"&&t?To(n,i,t):o==="building"?Fo(n,i,t,r,a):s`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:12px;">
      <div><h2>Routing Forms</h2><p style="color:#8A8993;font-size:0.875rem;">Qualify and route leads based on their answers</p></div>
      <button class="btn btn-primary btn-sm" onclick="${i.createForm}()">${v.plus} New Form</button>
    </div>

    ${n.saveError?s`<div class="card" style="border-left:3px solid #FF4A5A;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
      <span style="color:#FF4A5A;">${v.alert}</span>
      <span style="color:#F4F3F6;font-size:0.875rem;">${l(n.saveError)}</span>
    </div>`:""}

    ${e.length===0?s`
      <div class="empty-state">
        <div style="font-size:48px;margin-bottom:16px;">${v.webhook}</div>
        <div class="empty-state-title">No routing forms</div>
        <div class="empty-state-desc">Create a routing form to qualify and route leads to the right team member.</div>
        <button class="btn btn-primary btn-sm" onclick="${i.createForm}()">${v.plus} Create Routing Form</button>
      </div>
    `:s`
      <div style="display:flex;flex-direction:column;gap:12px;">
        ${e.map(d=>s`
          <div class="card fade-in" style="cursor:pointer;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-weight:600;">${l(d.name)}</div>
                <div style="font-size:0.875rem;color:#8A8993;margin-top:4px;">
                  ${(d.questions||[]).length} question${d.questions?.length!==1?"s":""} · ${(d.rules||[]).length} rule${d.rules?.length!==1?"s":""}
                </div>
              </div>
              <div style="display:flex;gap:4px;align-items:center;">
                ${_(d.active?"info":"neutral",d.active?"Active":"Draft")}
                <button class="btn btn-ghost btn-sm" onclick="${i.editForm}('${l(d.fid)}')" style="font-size:0.75rem;min-height:32px;">${v.edit}</button>
                <button class="btn btn-ghost btn-sm" onclick="${i.previewForm}('${l(d.fid)}')" style="font-size:0.75rem;min-height:32px;">${v.eye}</button>
                <button class="btn btn-ghost btn-sm" onclick="${i.deleteForm}('${l(d.fid)}')" style="color:#FF4A5A;font-size:0.75rem;min-height:32px;">${v.trash}</button>
              </div>
            </div>
          </div>
        `).join("")}
      </div>
    `}
  `}function Fo(n,i,e,o,t){const r=e?.questions||[],a=e?.rules||[];return s`
    <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
      <button class="btn btn-ghost btn-sm" onclick="${i.closeBuilder}()">${v.chevronLeft} Back</button>
      <h2>${e?.fid?"Edit":"New"} Routing Form</h2>
    </div>

    ${n.saveError?s`<div class="card" style="border-left:3px solid #FF4A5A;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
      <span style="color:#FF4A5A;">${v.alert}</span>
      <span style="color:#F4F3F6;font-size:0.875rem;">${l(n.saveError)}</span>
    </div>`:""}

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;align-items:start;">

      <!-- Left: Questions -->
      <div class="card">
        <div class="card-header">Form Name</div>
        <input id="rf-name" class="input" value="${l(e?.name||"")}" placeholder="e.g. Sales Qualification" ${t?"disabled":""} style="margin-bottom:12px;">

        <div class="card-header">Questions</div>
        ${r.map((d,c)=>s`
          <div class="card fade-in" style="margin-bottom:8px;padding:12px;border-left:3px solid #7047EB;">
            <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
              <input class="input" value="${l(d.label||"")}" placeholder="Question text" style="flex:1;" ${t?"disabled":""} oninput="${i._updateQuestion}(${c}, 'label')">
              <select class="select" style="width:140px;" onchange="${i._updateQuestion}(${c}, 'type')" ${t?"disabled":""}>
                ${Eo.map(p=>s`<option value="${p.id}" ${d.type===p.id?"selected":""}>${p.label}</option>`).join("")}
              </select>
            </div>
            ${d.type==="select"||d.type==="radio"?s`
              <div style="margin-bottom:8px;">
                ${(d.options||[]).map((p,m)=>s`
                  <div style="display:flex;gap:4px;align-items:center;margin-bottom:4px;">
                    <input class="input" value="${l(p)}" placeholder="Option ${m+1}" style="flex:1;" ${t?"disabled":""}>
                    <button class="btn btn-ghost btn-sm" style="color:#FF4A5A;min-height:28px;padding:2px 6px;" onclick="${i._removeOption}(${c}, ${m})" ${t?"disabled":""}>${v.x}</button>
                  </div>
                `).join("")}
                <button class="btn btn-ghost btn-sm" onclick="${i._addOption}(${c})" style="font-size:0.75rem;" ${t?"disabled":""}>+ Add Option</button>
              </div>
            `:""}
            <div style="display:flex;gap:4px;">
              ${c>0?s`<button class="btn btn-ghost btn-sm" onclick="${i._moveQuestionUp}(${c})" style="font-size:0.75rem;min-height:28px;" ${t?"disabled":""}>↑ Up</button>`:""}
              ${c<r.length-1?s`<button class="btn btn-ghost btn-sm" onclick="${i._moveQuestionDown}(${c})" style="font-size:0.75rem;min-height:28px;" ${t?"disabled":""}>↓ Down</button>`:""}
              <span style="flex:1;"></span>
              <button class="btn btn-ghost btn-sm" onclick="${i._removeQuestion}(${c})" style="color:#FF4A5A;font-size:0.75rem;min-height:28px;" ${t?"disabled":""}>${v.trash} Remove</button>
            </div>
            <label style="display:flex;align-items:center;gap:4px;margin-top:8px;font-size:0.75rem;color:#8A8993;">
              <input type="checkbox" ${d.required?"checked":""} onchange="${i._toggleRequired}(${c})" ${t?"disabled":""}> Required
            </label>
          </div>
        `).join("")}
        <button class="btn btn-ghost btn-sm" onclick="${i._addQuestion}()" style="width:100%;" ${t?"disabled":""}>${v.plus} Add Question</button>
      </div>

      <!-- Right: Routing Rules -->
      <div class="card">
        <div class="card-header">Routing Rules</div>
        <p style="font-size:0.875rem;color:#8A8993;margin-bottom:12px;">Define where leads go based on their answers. Rules are evaluated top-to-bottom; first match wins.</p>

        ${a.map((d,c)=>s`
          <div class="card fade-in" style="margin-bottom:8px;padding:12px;border-left:3px solid #00C48C;">
            <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
              <span style="font-size:0.875rem;">If</span>
              <select class="select" style="width:auto;flex:1;min-width:120px;" onchange="${i._updateRule}(${c}, 'questionIndex')" ${t?"disabled":""}>
                ${r.map((p,m)=>s`<option value="${m}" ${d.questionIndex===m?"selected":""}>${l(p.label||"Q"+(m+1))}</option>`).join("")}
              </select>
              <select class="select" style="width:auto;min-width:70px;" onchange="${i._updateRule}(${c}, 'operator')" ${t?"disabled":""}>
                <option value="equals" ${d.operator==="equals"?"selected":""}>=</option>
                <option value="not_equals" ${d.operator==="not_equals"?"selected":""}>≠</option>
                <option value="contains" ${d.operator==="contains"?"selected":""}>contains</option>
              </select>
              <input class="input" value="${l(d.answer||"")}" placeholder="Answer" style="width:auto;flex:1;min-width:100px;" ${t?"disabled":""} oninput="${i._updateRule}(${c}, 'answer')">
              <span style="font-size:0.875rem;">→ route to</span>
              <select class="select" style="width:auto;flex:1;min-width:120px;" onchange="${i._updateRule}(${c}, 'poolId')" ${t?"disabled":""}>
                <option value="">Select pool</option>
                ${o.map(p=>s`<option value="${p.pid}" ${d.poolId===p.pid?"selected":""}>${l(p.name)}</option>`).join("")}
              </select>
              <button class="btn btn-ghost btn-sm" onclick="${i._removeRule}(${c})" style="color:#FF4A5A;min-height:28px;" ${t?"disabled":""}>${v.x}</button>
            </div>
          </div>
        `).join("")}
        <button class="btn btn-ghost btn-sm" onclick="${i._addRule}()" style="width:100%;" ${t||r.length===0?"disabled":""} title="${r.length===0?"Add questions first":""}">${v.plus} Add Rule</button>

        ${a.length===0?s`<p style="text-align:center;padding:16px;color:#8A8993;font-size:0.875rem;">No routing rules yet. Add questions first, then create rules.</p>`:""}
      </div>
    </div>

    <!-- Action buttons -->
    <div style="display:flex;gap:8px;margin-top:16px;justify-content:flex-end;">
      <button class="btn btn-ghost btn-sm" onclick="${i.previewFormBuilder}()" ${t||r.length===0?"disabled":""}>${v.eye} Preview</button>
      <button class="btn btn-primary" onclick="${i.saveForm}()" ${t?"disabled":""}>
        ${t?s`${v.spinner} Saving...`:"Save Form"}
      </button>
    </div>
  `}function To(n,i,e){const o=e?.questions||[];return s`
    <div style="max-width:640px;margin:0 auto;">
      <div style="display:flex;align-items:center;gap:16px;margin-bottom:20px;">
        <button class="btn btn-ghost btn-sm" onclick="${i.closePreview}()">${v.chevronLeft} Back to Editor</button>
        <h2>Preview: ${l(e?.name||"Form")}</h2>
        <span class="badge badge-info" style="margin-left:auto;">Preview Mode</span>
      </div>

      <div class="card" style="padding:32px;">
        <h2 style="text-align:center;margin-bottom:24px;">${l(e?.name||"Form")}</h2>
        ${o.map((t,r)=>s`
          <div style="margin-bottom:16px;">
            <label class="input-label">${l(t.label||"Question "+(r+1))} ${t.required?'<span style="color:#FF4A5A;">*</span>':""}</label>
            ${t.type==="text"?s`<input class="input" placeholder="Your answer" disabled>`:t.type==="select"?s`<select class="select" disabled>${(t.options||[]).map(a=>s`<option>${l(a)}</option>`).join("")}</select>`:t.type==="radio"?s`<div style="display:flex;flex-direction:column;gap:6px;">${(t.options||[]).map(a=>s`<label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="radio" name="preview-q-${r}" disabled> ${l(a)}</label>`).join("")}</div>`:t.type==="checkbox"?s`<div style="display:flex;flex-direction:column;gap:6px;">${(t.options||[]).map(a=>s`<label style="display:flex;align-items:center;gap:8px;cursor:pointer;"><input type="checkbox" disabled> ${l(a)}</label>`).join("")}</div>`:""}
          </div>
        `).join("")}
        <button class="btn btn-primary btn-lg" style="width:100%;" disabled>Submit</button>
      </div>
    </div>
  `}function _o({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return Co({state:o,fn:t})},state:{builderForm:{},error:"",loading:!1,pools:[],routingForms:[],routingMode:"",saveError:"",saving:!1},methods:{createForm(){e.render({routingMode:"building",builderForm:{fid:"",name:"",active:!0,questions:[],rules:[]}})},editForm(o){const r=(e.getState().routingForms||[]).find(a=>a.fid===o);r&&e.render({routingMode:"building",builderForm:{...r}})},deleteForm(o){const t=(e.getState().routingForms||[]).filter(r=>r.fid!==o);e.render({routingForms:t})},closeBuilder(){e.render({routingMode:"list",builderForm:null})},saveForm(){const o=e.getState(),t=o.builderForm;if(!t)return;const r=(document.getElementById("rf-name")?.value||"").trim();if(!r){e.render({saveError:"Form name is required"});return}const a=new Date().toISOString(),d={...t,name:r,updatedAt:a};d.fid||(d.fid="rf_"+Math.random().toString(36).slice(2,8),d.createdAt=a);const c=[...o.routingForms||[]],p=c.findIndex(m=>m.fid===d.fid);p>=0?c[p]=d:c.push(d),e.render({routingForms:c,routingMode:"list",builderForm:null,saveError:"",saving:!1})},previewForm(o){const r=(e.getState().routingForms||[]).find(a=>a.fid===o);r&&e.render({routingMode:"preview",builderForm:{...r}})},previewFormBuilder(){e.render({routingMode:"preview"})},closePreview(){e.render({routingMode:"building"})},_addQuestion(){const o={...e.getState().builderForm},t=[...o.questions||[],{type:"text",label:"",required:!1}];e.render({builderForm:{...o,questions:t}})},_removeQuestion(o){const t={...e.getState().builderForm},r=(t.questions||[]).filter((a,d)=>d!==o);e.render({builderForm:{...t,questions:r}})},_moveQuestionUp(o){if(o<=0)return;const t={...e.getState().builderForm},r=[...t.questions||[]];[r[o-1],r[o]]=[r[o],r[o-1]],e.render({builderForm:{...t,questions:r}})},_moveQuestionDown(o){const t={...e.getState().builderForm},r=t.questions||[];if(o>=r.length-1)return;const a=[...r];[a[o],a[o+1]]=[a[o+1],a[o]],e.render({builderForm:{...t,questions:a}})},_updateQuestion(o,t){const r={...e.getState().builderForm},a=[...r.questions||[]];if(!a[o])return;const d=document.querySelector(`select[onchange*="_updateQuestion(${o}, 'type')"]`),c=document.querySelector(`input[oninput*="_updateQuestion(${o}, 'label')"]`),p=t==="type"?d?.value||"text":c?.value||"";a[o]={...a[o],[t]:p},e.render({builderForm:{...r,questions:a}})},_addOption(o){const t={...e.getState().builderForm},r=[...t.questions||[]];if(!r[o])return;const a=[...r[o].options||[],""];r[o]={...r[o],options:a},e.render({builderForm:{...t,questions:r}})},_removeOption(o,t){const r={...e.getState().builderForm},a=[...r.questions||[]];if(!a[o])return;const d=(a[o].options||[]).filter((c,p)=>p!==t);a[o]={...a[o],options:d},e.render({builderForm:{...r,questions:a}})},_addRule(){const o={...e.getState().builderForm},t=[...o.rules||[],{questionIndex:0,answer:"",action:"assign",targetPoolId:""}];e.render({builderForm:{...o,rules:t}})},_removeRule(o){const t={...e.getState().builderForm},r=(t.rules||[]).filter((a,d)=>d!==o);e.render({builderForm:{...t,rules:r}})},_updateRule(o,t){const r={...e.getState().builderForm},a=[...r.rules||[]];if(!a[o])return;const d=document.querySelector(`[oninput*="_updateRule(${o}, '${t}')"]`);a[o]={...a[o],[t]:d?.value||""},e.render({builderForm:{...r,rules:a}})},_toggleRequired(){}}});return e}function Bo({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading pools</div>
      <div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div>
      <button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button>
    </div>`;if(n.loading)return s`<div>${G(3)}</div>`;const e=n.pools||[],o=n.showCreatePool;return s`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div><h2>Routing Pools</h2><p style="color:#8A8993;font-size:0.875rem;">Groups of team members for round-robin or collective assignment</p></div>
      <button class="btn btn-primary btn-sm" onclick="${i.showCreatePool}()">${v.plus} New Pool</button>
    </div>

    ${o?s`
      <div class="card fade-in" style="margin-bottom:16px;">
        <div class="card-header">Create Pool</div>
        <div style="max-width:480px;">
          <div style="margin-bottom:12px;"><label class="input-label">Pool Name</label><input id="pl-name" class="input" placeholder="e.g. Sales Team"></div>
          <div style="margin-bottom:12px;"><label class="input-label">Strategy</label><select id="pl-strategy" class="select"><option value="round_robin">Round Robin</option><option value="collective">Collective</option></select></div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary btn-sm" onclick="${i.createPool}()">Create</button>
            <button class="btn btn-ghost btn-sm" onclick="${i.hideCreatePool}()">Cancel</button>
          </div>
        </div>
      </div>
    `:""}

    <div style="display:flex;flex-direction:column;gap:12px;">
      ${e.map(t=>s`
        <div class="card fade-in">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <span style="font-weight:600;">${l(t.name)}</span>
            ${_(t.strategy==="collective"?"warning":"info",t.strategy==="collective"?"Collective":"Round Robin")}
          </div>
          <div style="font-size:0.875rem;color:#8A8993;margin-bottom:8px;">${(t.members||[]).length} members</div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;">
            ${[...t.members||[]].sort((r,a)=>(r.priority||99)-(a.priority||99)).map(r=>s`
              <span class="badge badge-neutral" style="display:inline-flex;align-items:center;gap:6px;">
                ${Y("green")} ${l(r.name||r.uid)}
                ${r.priority!=null?s`<span style="font-size:0.625rem;color:#8A8993;">P${r.priority}</span>`:""}
              </span>
            `).join("")}
          </div>
          <div style="margin-top:8px;display:flex;gap:8px;">
            <button class="btn btn-ghost btn-sm" onclick="${i.openPool}('${l(t.pid)}')">Edit</button>
            <button class="btn btn-ghost btn-sm" onclick="${i.deletePool}('${l(t.pid)}')" style="color:#FF4A5A;">Delete</button>
          </div>
        </div>
      `).join("")}
    </div>

    ${e.length===0?s`
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <div class="empty-state-title">No routing pools</div>
        <div class="empty-state-desc">Create a pool to distribute bookings across your team.</div>
        <button class="btn btn-primary btn-sm" onclick="${i.showCreatePool}()">+ Create Pool</button>
      </div>
    `:""}
  `}function Io({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return Bo({state:o,fn:t})},state:{error:"",loading:!1,pools:[],showCreatePool:!1},methods:{createPool(){const o=(document.getElementById("pool-name")?.value||"").trim();if(!o)return;const t="pl_"+Math.random().toString(36).slice(2,8),r=new Date().toISOString(),a={pid:t,name:o,members:[],active:!0,createdAt:r},d=[...e.getState().pools||[],a];e.render({pools:d,showCreatePool:!1})},deletePool(o){const t=(e.getState().pools||[]).filter(r=>r.pid!==o);e.render({pools:t})},hideCreatePool(){e.render({showCreatePool:!1})},openPool(o){},showCreatePool(){e.render({showCreatePool:!0})}}});return e}function Do({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading workspaces</div>
      <div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div>
      <button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button>
    </div>`;if(n.loading)return s`<div>${G(3)}</div>`;const e=n.workspaces||[];return s`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <h2>Workspaces</h2>
    </div>

    ${e.length===0?s`
      <div class="empty-state">
        <div class="empty-state-icon">📂</div>
        <div class="empty-state-title">No workspaces</div>
        <div class="empty-state-desc">Workspaces are created automatically when someone books with you.</div>
      </div>
    `:""}

    <div style="display:flex;flex-direction:column;gap:12px;">
      ${e.map(o=>s`
        <div class="card fade-in" style="cursor:pointer;" onclick="${i.navigateTo}('/workspaces/${l(o.wid)}')">
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div>
              <div style="font-weight:600;">${l(o.clientName||"Guest")} — ${l(o.eventTypeId||"Meeting")}</div>
              <div style="font-size:0.875rem;color:#8A8993;">${l(o.createdAt?new Date(o.createdAt).toLocaleDateString():"Unknown date")}</div>
            </div>
            ${_(o.status==="active"?"success":o.status==="completed"?"neutral":"warning",o.status||"Active")}
          </div>
          <div style="margin-top:8px;font-size:0.875rem;color:#8A8993;">
            ${Object.keys(o.tasks||{}).length} tasks · ${Object.keys(o.messages||{}).length} messages
          </div>
        </div>
      `).join("")}
    </div>
  `}function zo({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return Do({state:o,fn:t})},state:{error:"",loading:!0,workspaces:[]},methods:{}});return e.load=async function(){const o=e.getState().user?.uid;if(!o){e.render({loading:!0});return}try{const[t,r]=await M(E("/workspaces")).unwrap();if(r)throw r;const d=(t?Object.values(t):[]).filter(c=>c.hostId===o||c.clientId===o);e.render({workspaces:d,loading:!0,error:""})}catch(t){console.error("[workspaces] load error:",t),e.render({loading:!0,error:t.message||"Failed to load workspaces"})}},e}function Ro({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;"><div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div><div class="card-header" style="color:#FF4A5A;">Error loading workspace</div><div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div><button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button></div>`;if(n.loading)return s`<div style="text-align:center;padding:48px;color:#8A8993;">Loading workspace...</div>`;if(n.workspaceError==="forbidden")return s`<div class="empty-state"><div style="font-size:48px;margin-bottom:16px;">${v.lock}</div><div class="empty-state-title">Access Denied</div><div class="empty-state-desc">You don't have access to this workspace.</div></div>`;const e=n.activeWorkspace||{},o=Object.values(e.tasks||{}).sort((p,m)=>(p.createdAt||"").localeCompare(m.createdAt||"")),t=Object.values(e.messages||{}).sort((p,m)=>(p.createdAt||"").localeCompare(m.createdAt||"")),r=e.timers?.current?.running,a=r&&e.timers?.current?.paused===!0,d=e.timers?.current?.mode||"session",c=r?Po(Date.now()-(e.timers.current.startTime||0)):"00:00:00";return s`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <button class="btn btn-ghost btn-sm" onclick="${i.navigateTo}('/workspaces')">← Back</button>
      <h2>${l(e.clientName||"Guest")} — ${l(e.eventTypeId||"Meeting")}</h2>
      ${_(e.status==="active"?"success":"warning",e.status||"Active")}
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;">
      <!-- Tasks -->
      <div class="card">
        <div class="card-header">Tasks</div>
        <div style="display:flex;flex-direction:column;gap:8px;min-height:120px;">
          ${o.map(p=>s`
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.875rem;">
              <input type="checkbox" ${p.completed?"checked":""} onchange="${i.toggleTask}('${l(p.tid)}', !${p.completed})" style="accent-color:#7047EB;">
              <span style="${p.completed?"text-decoration:line-through;color:#8A8993;":""}">${l(p.title)}</span>
              <button class="btn btn-ghost btn-sm" onclick="${i.deleteTask}('${l(p.tid)}')" style="margin-left:auto;min-height:28px;padding:2px 6px;font-size:0.75rem;color:#FF4A5A;">${v.trash}</button>
            </label>
          `).join("")}
          ${o.length===0?s`<div style="text-align:center;color:#8A8993;padding:16px;font-size:0.875rem;">No tasks yet</div>`:""}
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <input id="ws-task-input" class="input" placeholder="Add task..." style="font-size:0.875rem;" onkeydown="${i._taskKeydown}()">
          <button class="btn btn-primary btn-sm" onclick="${i.addTask}()">Add</button>
        </div>
      </div>

      <!-- Timer -->
      <div class="card">
        <div class="card-header">Timer</div>
        <div style="text-align:center;padding:16px;">
          <div style="font-family:'Geist',sans-serif;font-weight:700;font-size:2.5rem;font-variant-numeric:tabular-nums;">${l(c)}</div>
          <div style="font-size:0.875rem;color:#8A8993;margin-bottom:4px;">
            ${a?l(d)+" · Paused":r?l(d)+" · Running":"Stopped"}
          </div>
          ${r&&!a&&Date.now()-e.timers.current.startTime>7*36e5?s`<div style="color:#F5A623;font-size:0.75rem;margin-bottom:8px;">${v.alert} Approaching 8h limit</div>`:""}
          <div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">
            ${r?s`
              ${a?"":s`<button class="btn btn-ghost btn-sm" onclick="${i.pauseTimer}()" style="color:#F5A623;">Pause</button>`}
              ${a?s`<button class="btn btn-primary btn-sm" onclick="${i.resumeTimer}()">Resume</button>`:""}
              <button class="btn btn-ghost btn-sm" onclick="${i.stopTimer}()" style="color:#FF4A5A;">Stop</button>
            `:s`
              <button class="btn btn-primary btn-sm" onclick="${i.startTimer}('prep')">Prep</button>
              <button class="btn btn-primary btn-sm" onclick="${i.startTimer}('session')">Session</button>
              <button class="btn btn-primary btn-sm" onclick="${i.startTimer}('followup')">Follow-up</button>
            `}
          </div>
        </div>
      </div>

      <!-- Messages -->
      <div class="card">
        <div class="card-header">Messages</div>
        <div style="display:flex;flex-direction:column;gap:8px;max-height:240px;overflow-y:auto;min-height:120px;">
          ${t.map(p=>{const m=p.senderId===(e.hostId||n.user?.uid);return s`
              <div style="background:${m?"#1A1923":"rgba(112,71,235,0.08)"};padding:8px;border-radius:8px;font-size:0.875rem;">
                <strong>${m?"You":l(e.clientName||"Guest")}:</strong> ${l(p.text)}
              </div>
            `}).join("")}
          ${t.length===0?s`<div style="text-align:center;color:#8A8993;padding:16px;font-size:0.875rem;">No messages yet</div>`:""}
        </div>
        <div style="display:flex;gap:8px;margin-top:8px;">
          <input id="ws-msg-input" class="input" placeholder="Type message..." style="font-size:0.875rem;">
          <button class="btn btn-primary btn-sm" onclick="${i.sendMessage}()">Send</button>
        </div>
      </div>
    </div>
  `}function Po(n){const i=Math.floor(n/1e3),e=Math.floor(i/3600),o=Math.floor(i%3600/60),t=i%60;return[e,o,t].map(r=>String(r).padStart(2,"0")).join(":")}function Mo({router:n,eventBus:i}={}){const e=$({template({state:t,fn:r}){return Ro({state:t,fn:r})},state:{activeWorkspace:{},error:"",loading:!0,user:null,workspaceError:""},methods:{_taskKeydown(){event&&event.key==="Enter"&&e.addTask()},addTask(){const t=document.getElementById("ws-task-input");if(!t)return;const r=t.value.trim();if(!r)return;t.value="";const a={...e.getState().activeWorkspace},d={...a.tasks||{}},c="tsk_"+Math.random().toString(36).slice(2,8),p=new Date().toISOString();d[c]={tid:c,title:r,completed:!1,createdAt:p},a.tasks=d,a.updatedAt=p,e.render({activeWorkspace:a}),o(a)},deleteTask(t){const r={...e.getState().activeWorkspace},a={...r.tasks||{}};delete a[t],r.tasks=a,r.updatedAt=new Date().toISOString(),e.render({activeWorkspace:r}),o(r)},toggleTask(t){const r={...e.getState().activeWorkspace},a={...r.tasks||{}};a[t]&&(a[t]={...a[t],completed:!a[t].completed}),r.tasks=a,r.updatedAt=new Date().toISOString(),e.render({activeWorkspace:r}),o(r)},startTimer(t){const r={...e.getState().activeWorkspace};r.timers={...r.timers||{},current:{mode:t,startTime:Date.now(),running:!0}},r.updatedAt=new Date().toISOString(),e.render({activeWorkspace:r}),o(r)},pauseTimer(){const t={...e.getState().activeWorkspace},r=t.timers?.current;r&&(t.timers={...t.timers,current:{...r,paused:!0}}),e.render({activeWorkspace:t}),o(t)},resumeTimer(){const t={...e.getState().activeWorkspace},r=t.timers?.current;r&&(t.timers={...t.timers,current:{...r,paused:!1}}),e.render({activeWorkspace:t}),o(t)},stopTimer(){const t={...e.getState().activeWorkspace},r=t.timers?.current;if(r&&r.running){const a=Date.now(),d=a-(r.startTime||a),c=Math.round(d/6e4),p="tml_"+Math.random().toString(36).slice(2,8),m={...t.timers?.log||{}};m[p]={lid:p,mode:r.mode||"session",startTime:r.startTime,endTime:a,elapsedMin:c},t.timers={...t.timers,current:{running:!1,stoppedAt:a},log:m},t.updatedAt=new Date().toISOString()}e.render({activeWorkspace:t}),o(t)},sendMessage(){const t=document.getElementById("ws-msg-input");if(!t)return;const r=t.value.trim();if(!r)return;t.value="";const a=e.getState(),d={...a.activeWorkspace},c={...d.messages||{}},p="msg_"+Math.random().toString(36).slice(2,8),m=new Date().toISOString();c[p]={mid:p,senderId:a.user?.uid||"anonymous",text:r,createdAt:m},d.messages=c,d.updatedAt=m,e.render({activeWorkspace:d}),o(d)}}});function o(t){const r=t.wid;r&&pe(E(`/workspaces/${r}`),{tasks:t.tasks||{},messages:t.messages||{},timers:t.timers||{},updatedAt:t.updatedAt||new Date().toISOString()}).unwrap().catch(a=>console.error("[workspace-detail] persist error:",a))}return e.load=async function(){const t=e.getState(),r=t.currentParams?.id||t.activeWorkspace?.wid;if(!r){e.render({loading:!0});return}try{const[a,d]=await M(E(`/workspaces/${r}`)).unwrap();if(d)throw d;if(!a){e.render({loading:!0,workspaceError:"forbidden"});return}e.render({activeWorkspace:a,loading:!0,error:"",workspaceError:""})}catch(a){console.error("[workspace-detail] load error:",a),e.render({loading:!0,error:a.message||"Failed to load workspace"})}},e}function jo({rows:n=5,cols:i=5}={}){const e=$({template({state:o}){let t='<div class="table-wrap"><table class="data-table"><thead><tr>';for(let r=0;r<o.cols;r++)t+=s`<th><div class="skeleton" style="height:12px;width:${60+Math.random()*40}px;"></div></th>`;t+="</tr></thead><tbody>";for(let r=0;r<o.rows;r++){t+="<tr>";for(let a=0;a<o.cols;a++)t+=s`<td><div class="skeleton" style="height:14px;width:${80+Math.random()*80}px;"></div></td>`;t+="</tr>"}return t+="</tbody></table></div>",s`<div id="skeletontable-root">${t}</div>`},state:{rows:n,cols:i},methods:{setSize(o,t){e.render({rows:o,cols:t})}}});return e}function ze(n=5,i=5){return jo({rows:n,cols:i}).toString()}function Oo({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;"><div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div><div class="card-header" style="color:#FF4A5A;">Error loading time tracking</div><div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div><button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button></div>`;if(n.loading)return s`<div>${ze(5)}</div>`;const e=n.timeEntries||[],o=n.timeTotals||{prep:0,session:0,followup:0};return s`
    <h2 style="margin-bottom:16px;">Time Tracking</h2>

    <div class="stat-grid" style="margin-bottom:16px;">
      <div class="stat-card"><div class="stat-card-label">Prep</div><div class="stat-card-value">${X(o.prep)}</div></div>
      <div class="stat-card"><div class="stat-card-label">Session</div><div class="stat-card-value">${X(o.session)}</div></div>
      <div class="stat-card"><div class="stat-card-label">Follow-up</div><div class="stat-card-value">${X(o.followup)}</div></div>
      <div class="stat-card"><div class="stat-card-label">Total</div><div class="stat-card-value">${X(o.prep+o.session+o.followup)}</div></div>
    </div>

    <div class="card">
      <div class="card-header">Time Entries</div>
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Workspace</th><th>Mode</th><th>Start</th><th>End</th><th>Duration</th></tr></thead>
          <tbody>
            ${e.length===0?s`<tr><td colspan="5" style="text-align:center;color:#8A8993;padding:24px;">No time entries yet</td></tr>`:""}
            ${e.map(t=>s`
              <tr>
                <td>${l(t.workspaceName||t.wid||"—")}</td>
                <td>${_(t.mode==="prep"?"info":t.mode==="session"?"success":"warning",t.mode||"—")}</td>
                <td>${l(t.startTime?new Date(t.startTime).toLocaleString():"—")}</td>
                <td>${l(t.endTime?new Date(t.endTime).toLocaleString():"—")}</td>
                <td>${X(t.elapsedMin||0)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function X(n){if(!n||n===0)return"0m";if(n<60)return`${n}m`;const i=Math.floor(n/60),e=n%60;return e>0?`${i}h ${e}m`:`${i}h`}function Lo({router:n,eventBus:i}={}){return $({template({state:o,fn:t}){return Oo({state:o,fn:t})},state:{error:"",loading:!1,timeEntries:[],timeTotals:{}},methods:{}})}function No({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Failed to load compliance data</div>
      <div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div>
      <button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button>
    </div>`;if(n.loading)return s`<div style="text-align:center;padding:64px;">
      <div style="color:#8A8993;margin-bottom:16px;">${v.spinner}</div>
      <div style="color:#8A8993;font-size:0.875rem;">Loading compliance settings...</div>
    </div>`;const e=n.compliance||{},o=e.baaSigned,t=e.baaSignedDate,r=e.phiMasking!==!1,a=e.dataResidency||"us-central1",d=n.saving===!0;return s`
    <h2 style="margin-bottom:20px;">Compliance & Security</h2>
    ${n.saveError?s`<div class="card" style="border-left:3px solid #FF4A5A;padding:12px 16px;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
      <span style="color:#FF4A5A;">${v.alert}</span>
      <span style="color:#F4F3F6;font-size:0.875rem;">${l(n.saveError)}</span>
      <button class="btn btn-ghost btn-sm" style="margin-left:auto;color:#8A8993;" onclick="${i.dismissError}()">${v.x}</button>
    </div>`:""}
    <div style="display:flex;flex-direction:column;gap:16px;max-width:640px;">
      <div class="card">
        <div class="card-header">Business Associate Agreement (BAA)</div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          ${Y(o?"green":"red")}
          <span>${o?s`Signed — ${l(t||"N/A")}`:"Not signed"}</span>
        </div>
        <div style="display:flex;gap:8px;">
          ${o?s`
            <button class="btn btn-ghost btn-sm" onclick="${i.downloadBAA}()" ${d?"disabled":""}>Download BAA</button>
            <button class="btn btn-ghost btn-sm" onclick="${i.revokeBAA}()" style="color:#FF4A5A;" ${d?"disabled":""}>
              ${d?s`${v.spinner} Revoking...`:"Revoke"}
            </button>
          `:s`
            <button class="btn btn-primary btn-sm" onclick="${i.signBAA}()" ${d?"disabled":""}>
              ${d?s`${v.spinner} Signing...`:"Sign BAA"}
            </button>
          `}
        </div>
      </div>
      <div class="card">
        <div class="card-header">PHI Protection</div>
        <p style="font-size:0.875rem;color:#8A8993;margin-bottom:12px;">Protected Health Information is encrypted at rest (AES-256-GCM) and masked in notifications.</p>
        <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-weight:500;">
          <input type="checkbox" ${r?"checked":""} onchange="${i.togglePhiMasking}()" style="accent-color:#7047EB;" ${d?"disabled":""}>
          Mask patient identities in calendar notifications
        </label>
      </div>
      <div class="card">
        <div class="card-header">Data Residency</div>
        <select class="select" style="max-width:300px;" onchange="${i.setDataResidency}()" ${d?"disabled":""}>
          <option value="us-central1" ${a==="us-central1"?"selected":""}>United States (us-central1)</option>
          <option value="europe-west1" ${a==="europe-west1"?"selected":""}>European Union (europe-west1)</option>
          <option value="asia-southeast1" ${a==="asia-southeast1"?"selected":""}>Asia Pacific (asia-southeast1)</option>
        </select>
      </div>
      <div class="card">
        <div class="card-header">Data Retention</div>
        <p style="font-size:0.875rem;color:#8A8993;">Booking data is retained for 1 year by default. Audit logs are immutable and retained for 1 year.</p>
      </div>
    </div>
  `}function Wo({router:n,eventBus:i}={}){return $({template({state:e,fn:o}){return No({state:e,fn:o})},state:{loading:!1,error:"",compliance:{},saving:!1,saveError:""},methods:{setCompliance(e){ctrl.render({compliance:e,loading:!1})},setSaving(e){ctrl.render({saving:e})},setError(e){ctrl.render({error:e,loading:!1})}}})}function Go({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;"><div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div><div class="card-header" style="color:#FF4A5A;">Error loading webhooks</div><div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div><button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button></div>`;if(n.loading)return s`<div>${G(2)}</div>`;const e=n.webhooks||[],o=n.showAddWebhook;return s`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div><h2>Webhooks</h2><p style="color:#8A8993;font-size:0.875rem;">Receive real-time event notifications via HTTP POST</p></div>
      <button class="btn btn-primary btn-sm" onclick="${i.showAddWebhook}()">${v.plus} Add Webhook</button>
    </div>

    ${o?s`
      <div class="card fade-in" style="margin-bottom:16px;">
        <div class="card-header">Subscribe Webhook</div>
        <div style="max-width:480px;">
          <div style="margin-bottom:12px;"><label class="input-label">Webhook URL</label><input id="wh-url" class="input" placeholder="https://your-app.com/webhook"></div>
          <div style="margin-bottom:12px;">
            <label class="input-label">Events</label>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <label style="display:flex;align-items:center;gap:4px;font-size:0.875rem;cursor:pointer;"><input type="checkbox" value="invitee.created" checked style="accent-color:#7047EB;"> Booking Created</label>
              <label style="display:flex;align-items:center;gap:4px;font-size:0.875rem;cursor:pointer;"><input type="checkbox" value="invitee.canceled" checked style="accent-color:#7047EB;"> Booking Cancelled</label>
              <label style="display:flex;align-items:center;gap:4px;font-size:0.875rem;cursor:pointer;"><input type="checkbox" value="routing.submitted" style="accent-color:#7047EB;"> Routing Submitted</label>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary btn-sm" onclick="${i.subscribeWebhook}()">Subscribe</button>
            <button class="btn btn-ghost btn-sm" onclick="${i.hideAddWebhook}()">Cancel</button>
          </div>
        </div>
      </div>
    `:""}

    <div style="display:flex;flex-direction:column;gap:12px;">
      ${e.map(t=>s`
        <div class="card fade-in">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
            <div style="font-weight:600;word-break:break-all;">${l(t.url)}</div>
            ${Y(t.active?"green":"red")}
          </div>
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;">
            ${(t.events||[]).map(r=>_("info",r)).join("")}
          </div>
          <div style="font-size:0.75rem;color:#8A8993;margin-bottom:8px;">
            ${t.lastDelivery?"Last delivery: "+new Date(t.lastDelivery).toLocaleString():"No deliveries yet"} · ${t.deliveryCount||0} deliveries
            ${t.lastResponseCode?" · Status: "+t.lastResponseCode:""}
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-ghost btn-sm" onclick="${i.testWebhook}('${l(t.sid)}')" ${t._testing?"disabled":""}>${t._testing?s`${v.spinner} Testing...`:"Test"}</button>
            <button class="btn btn-ghost btn-sm" onclick="${i.unsubscribeWebhook}('${l(t.sid)}')" style="color:#FF4A5A;">Delete</button>
          </div>
        </div>
      `).join("")}
    </div>

    ${e.length===0?s`
      <div class="empty-state">
        <div style="font-size:48px;margin-bottom:16px;">${v.webhook}</div>
        <div class="empty-state-title">No webhooks</div>
        <div class="empty-state-desc">Subscribe to webhooks to receive real-time event notifications.</div>
        <button class="btn btn-primary btn-sm" onclick="${i.showAddWebhook}()">+ Add Webhook</button>
      </div>
    `:""}
  `}function Uo({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return Go({state:o,fn:t})},state:{error:"",loading:!0,showAddWebhook:!1,webhooks:[]},methods:{hideAddWebhook(){e.render({showAddWebhook:!1})},showAddWebhook(){e.render({showAddWebhook:!0})},subscribeWebhook(){const o=(document.getElementById("wh-url")?.value||"").trim();if(!o)return;const t=e.getState().user?.uid,r="wh_"+Math.random().toString(36).slice(2,8),a=new Date().toISOString(),d={sid:r,url:o,events:["invitee.created"],active:!0,createdAt:a,deliveryCount:0},c=[...e.getState().webhooks||[],d];e.render({webhooks:c,showAddWebhook:!1}),t&&_e(E(`/webhook_subscriptions/${t}/${r}`),d).unwrap().catch(p=>console.error("[webhooks] persist error:",p))},testWebhook(o){const t=(e.getState().webhooks||[]).map(r=>r.sid===o?{...r,_testing:!0}:r);e.render({webhooks:t}),setTimeout(()=>{const r=(e.getState().webhooks||[]).map(a=>a.sid===o?{...a,_testing:!1,lastDelivery:new Date().toISOString(),lastResponseCode:200,deliveryCount:(a.deliveryCount||0)+1}:a);e.render({webhooks:r})},1500)},unsubscribeWebhook(o){const t=e.getState().user?.uid,r=(e.getState().webhooks||[]).filter(a=>a.sid!==o);e.render({webhooks:r}),t&&Be(E(`/webhook_subscriptions/${t}/${o}`)).unwrap().catch(a=>console.error("[webhooks] remove error:",a))}}});return e.load=async function(){const o=e.getState().user?.uid;if(!o){e.render({loading:!0});return}try{const[t,r]=await M(E(`/webhook_subscriptions/${o}`)).unwrap();if(r)throw r;const a=t?Object.values(t).filter(d=>d&&typeof d=="object"):[];e.render({webhooks:a,loading:!0,error:""})}catch(t){console.error("[webhooks] load error:",t),e.render({loading:!0,error:t.message||"Failed to load webhooks"})}},e}function Ko({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;"><div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div><div class="card-header" style="color:#FF4A5A;">Error loading API keys</div><div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div><button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button></div>`;if(n.loading)return s`<div>${G(2)}</div>`;const e=n.apiKeys||[],o=n.showGenerateKey,t=n.revealedKey;return s`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div><h2>API Keys</h2><p style="color:#8A8993;font-size:0.875rem;">Manage API keys for programmatic access</p></div>
      <button class="btn btn-primary btn-sm" onclick="${i.showGenerateKey}()">${v.plus} Generate New Key</button>
    </div>

    ${t?s`
      <div class="card fade-in" style="margin-bottom:16px;border-color:#F5A623;background:rgba(245,166,35,0.05);">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
          <span style="color:#F5A623;font-weight:600;">${v.alert} New API Key Generated</span>
        </div>
        <p style="font-size:0.875rem;color:#8A8993;margin-bottom:8px;">Copy this key now. It will not be shown again.</p>
        <div style="display:flex;gap:8px;">
          <input class="input" value="${l(t)}" readonly style="font-family:monospace;font-size:0.75rem;">
          <button class="btn btn-ghost btn-sm" onclick="${i.copyKey}()">${v.copy}</button>
        </div>
        <button class="btn btn-ghost btn-sm" onclick="${i.dismissRevealedKey}()" style="margin-top:8px;">I've copied my key</button>
      </div>
    `:""}

    ${o?s`
      <div class="card fade-in" style="margin-bottom:16px;">
        <div class="card-header">Generate API Key</div>
        <div style="max-width:480px;">
          <div style="margin-bottom:12px;"><label class="input-label">Key Name</label><input id="ak-name" class="input" placeholder="e.g. Production"></div>
          <div style="margin-bottom:12px;">
            <label class="input-label">Scopes</label>
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
              <label style="display:flex;align-items:center;gap:4px;font-size:0.875rem;cursor:pointer;"><input type="checkbox" value="read:bookings" checked style="accent-color:#7047EB;"> Read Bookings</label>
              <label style="display:flex;align-items:center;gap:4px;font-size:0.875rem;cursor:pointer;"><input type="checkbox" value="write:bookings" style="accent-color:#7047EB;"> Write Bookings</label>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn btn-primary btn-sm" onclick="${i.generateKey}()">Generate</button>
            <button class="btn btn-ghost btn-sm" onclick="${i.hideGenerateKey}()">Cancel</button>
          </div>
        </div>
      </div>
    `:""}

    <div style="display:flex;flex-direction:column;gap:12px;">
      ${e.map(r=>s`
        <div class="card fade-in">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;">
            <span style="font-weight:600;">${l(r.name||"Unnamed")}</span>
            ${Y(r.active?"green":"red")}
          </div>
          <div style="font-size:0.875rem;color:#8A8993;font-family:monospace;">${l(r.prefix||"cal_live_")}...</div>
          <div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap;">
            ${(r.scopes||["read:bookings"]).map(a=>_("neutral",a)).join("")}
          </div>
          <div style="font-size:0.75rem;color:#8A8993;margin-top:4px;">
            Created ${r.createdAt?new Date(r.createdAt).toLocaleDateString():"—"} · Last used ${r.lastUsed?new Date(r.lastUsed).toLocaleDateString():"never"}
          </div>
          <button class="btn btn-ghost btn-sm" onclick="${i.confirmRevokeKey}('${l(r.kid)}')" style="color:#FF4A5A;margin-top:4px;">Revoke</button>
        </div>
      `).join("")}
    </div>

    ${e.length===0&&!o?s`
      <div class="empty-state">
        <div style="font-size:48px;margin-bottom:16px;">${v.key}</div>
        <div class="empty-state-title">No API keys</div>
        <div class="empty-state-desc">Generate an API key for programmatic access to your booking data.</div>
        <button class="btn btn-primary btn-sm" onclick="${i.showGenerateKey}()">+ Generate Key</button>
      </div>
    `:""}
  `}function Vo({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return Ko({state:o,fn:t})},state:{apiKeys:[],error:"",loading:!1,revealedKey:!1,showGenerateKey:!1},methods:{confirmRevokeKey(o){const t=(e.getState().apiKeys||[]).map(r=>r.kid===o?{...r,active:!1}:r);e.render({apiKeys:t})},copyKey(){const o=e.getState();o.revealedKey&&navigator.clipboard&&navigator.clipboard.writeText(o.revealedKey).catch(()=>{})},dismissRevealedKey(){e.render({revealedKey:!1})},generateKey(){const o=(document.getElementById("ak-name")?.value||"").trim();if(!o)return;const t="cal_live_"+Math.random().toString(36).slice(2,14),r=new Date().toISOString(),a={kid:t,name:o,prefix:t.slice(0,16),scopes:["read:bookings"],active:!0,createdAt:r},d=[...e.getState().apiKeys||[],a];e.render({apiKeys:d,showGenerateKey:!1,revealedKey:t})},hideGenerateKey(){e.render({showGenerateKey:!1})},showGenerateKey(){e.render({showGenerateKey:!0})}}});return e}function Ho({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;"><div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div><div class="card-header" style="color:#FF4A5A;">Error loading settings</div><div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div><button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button></div>`;if(n.loading)return s`<div style="text-align:center;padding:48px;color:#8A8993;">Loading settings...</div>`;const e=n.user||{},o=n.notificationPrefs||{};return s`
    <h2 style="margin-bottom:20px;">Settings</h2>

    <div style="display:flex;flex-direction:column;gap:16px;max-width:560px;">
      <!-- Profile -->
      <div class="card">
        <div class="card-header">Profile</div>
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div><label class="input-label">Display Name</label><input id="st-name" class="input" value="${l(e.displayName||"")}"></div>
          <div><label class="input-label">Email</label><input id="st-email" class="input" value="${l(e.email||"")}" disabled></div>
          <div><label class="input-label">Timezone</label><select id="st-tz" class="select">
            <option value="America/New_York" ${(e.timezone||"")==="America/New_York"?"selected":""}>America/New York (UTC-5)</option>
            <option value="America/Chicago" ${e.timezone==="America/Chicago"?"selected":""}>America/Chicago (UTC-6)</option>
            <option value="America/Los_Angeles" ${e.timezone==="America/Los_Angeles"?"selected":""}>America/Los Angeles (UTC-8)</option>
            <option value="Europe/London" ${e.timezone==="Europe/London"?"selected":""}>Europe/London (UTC+0)</option>
            <option value="Asia/Riyadh" ${e.timezone==="Asia/Riyadh"?"selected":""}>Asia/Riyadh (UTC+3)</option>
            <option value="Asia/Dubai" ${e.timezone==="Asia/Dubai"?"selected":""}>Asia/Dubai (UTC+4)</option>
          </select></div>
        </div>
      </div>

      <!-- Notifications -->
      <div class="card">
        <div class="card-header">Notifications</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" ${o.emailBookings!==!1?"checked":""} style="accent-color:#7047EB;"> Email for new bookings
          </label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" ${o.emailCancellations!==!1?"checked":""} style="accent-color:#7047EB;"> Email for cancellations
          </label>
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <input type="checkbox" ${o.smsReminders?"checked":""} style="accent-color:#7047EB;"> SMS reminders (24h before)
          </label>
        </div>
      </div>

      <button class="btn btn-primary" onclick="${i.saveSettings}()">${n.saving?"Saving...":"Save Changes"}</button>

      <div style="border-top:1px solid #262431;padding-top:16px;margin-top:8px;">
        <button class="btn btn-ghost" onclick="${i.deleteAccount}()" style="color:#FF4A5A;border-color:transparent;">Delete Account</button>
      </div>
    </div>
  `}function Qo({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return Ho({state:o,fn:t})},state:{error:"",loading:!1,notificationPrefs:{},saving:!1,user:null},methods:{saveSettings(){e.render({saving:!0});const o=document.getElementById("st-name")?.value||"",t=document.getElementById("st-tz")?.value||"",r={...e.getState().user,displayName:o,timezone:t};setTimeout(()=>e.render({saving:!1,user:r}),500)},deleteAccount(){confirm("Are you sure you want to delete your account? This cannot be undone.")&&V(async()=>{const{auth:o}=await import("./chunk-BnhNuwzA.js");return{auth:o}},[]).then(({auth:o})=>{}).catch(()=>{})}}});return e}function Yo({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading data</div>
      <div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div>
      <button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button>
    </div>`;if(n.loading)return s`<div>${G(4)}</div>`;const e=n.contacts||[],o=n.contactSearch||"";return s`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div><h2>Contacts</h2><p style="color:#8A8993;font-size:0.875rem;">${e.length} contact${e.length!==1?"s":""}</p></div>
      <button class="btn btn-primary btn-sm" onclick="${i.showCreateContact}()">+ Add Contact</button>
    </div>

    <div style="margin-bottom:16px;max-width:360px;">
      <div style="position:relative;">
        <input class="input" type="text" placeholder="Search contacts..." value="${l(o)}" oninput="${i.searchContacts}()" style="padding-left:36px;">
        <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);color:#8A8993;pointer-events:none;" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
      </div>
    </div>

    ${e.length===0?s`
      <div class="empty-state">
        <div class="empty-state-icon">👥</div>
        <div class="empty-state-title">No contacts</div>
        <div class="empty-state-desc">Contacts are created automatically when someone books with you, or you can add them manually.</div>
      </div>
    `:""}

    <div style="display:flex;flex-direction:column;gap:8px;">
      ${e.map(t=>s`
        <div class="card fade-in" style="display:flex;align-items:center;gap:16px;cursor:pointer;" onclick="${i.navigateTo}('/contacts/${l(t.cid)}')">
          <div class="sidebar-user-avatar" style="width:40px;height:40px;font-size:14px;">${l(qo(t.name))}</div>
          <div style="flex:1;min-width:0;">
            <div style="font-weight:600;">${l(t.name)}</div>
            <div style="font-size:0.875rem;color:#8A8993;">${l(t.email||"No email")}${t.company?" · "+l(t.company):""}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:0.875rem;">${t.totalBookings||0} bookings</div>
            ${t.lastBooking?s`<div style="font-size:0.75rem;color:#8A8993;">Last: ${l(new Date(t.lastBooking).toLocaleDateString())}</div>`:""}
          </div>
          ${(t.lists||[]).map(r=>_("neutral",r)).join("")}
        </div>
      `).join("")}
    </div>
  `}function qo(n){if(!n)return"?";const i=String(n).trim().split(/\s+/);return i.length===1?i[0].substring(0,2).toUpperCase():(i[0][0]+i[i.length-1][0]).toUpperCase()}function Jo({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return Yo({state:o,fn:t})},state:{contactSearch:"",contacts:[],error:"",loading:!0},methods:{searchContacts(){const t=document.querySelector('input[placeholder*="Search contacts"]')?.value||"";e.render({contactSearch:t})},showCreateContact(){e.render({showCreateContact:!0})}}});return e.load=async function(){const o=e.getState().user?.uid;if(!o){e.render({loading:!0});return}try{const[t,r]=await M(E("/bookings")).unwrap();if(r)throw r;const a=t?Object.values(t).filter(p=>p.hostId===o):[],d=new Map;for(const p of a){const m=p.inviteeId||p.formData?.email||"anonymous";d.has(m)||d.set(m,{cid:m,name:p.formData?.name||m,email:p.formData?.email||"",totalBookings:0,lastBooking:p.createdAt||""});const b=d.get(m);b.totalBookings++,p.createdAt>b.lastBooking&&(b.lastBooking=p.createdAt)}const c=[...d.values()].sort((p,m)=>m.lastBooking.localeCompare(p.lastBooking));e.render({contacts:c,loading:!0,error:""})}catch(t){console.error("[contacts] load error:",t),e.render({loading:!0,error:t.message||"Failed to load contacts"})}},e}function Xo({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading data</div>
      <div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div>
      <button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button>
    </div>`;if(n.loading)return s`<div style="text-align:center;padding:48px;color:#8A8993;">Loading contact...</div>`;const e=n.activeContact||{},o=n.contactNotes||[],t=n.contactBookings||[];return s`
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
      <button class="btn btn-ghost btn-sm" onclick="${i.navigateTo}('/contacts')">← Back</button>
      <div class="sidebar-user-avatar" style="width:48px;height:48px;font-size:18px;">${l(Zo(e.name))}</div>
      <div>
        <h2>${l(e.name||"Unknown")}</h2>
        <p style="color:#8A8993;font-size:0.875rem;">${l(e.email||"No email")}${e.company?" · "+l(e.company):""}</p>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
      <!-- Details -->
      <div class="card">
        <div class="card-header">Details</div>
        <div style="display:flex;flex-direction:column;gap:8px;">
          <div style="display:flex;justify-content:space-between;"><span style="color:#8A8993;">Name</span><span>${l(e.name||"—")}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:#8A8993;">Email</span><span>${l(e.email||"—")}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:#8A8993;">Phone</span><span>${l(e.phone||"—")}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:#8A8993;">Company</span><span>${l(e.company||"—")}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:#8A8993;">Total Bookings</span><span>${e.totalBookings||0}</span></div>
          <div style="display:flex;justify-content:space-between;"><span style="color:#8A8993;">No-Shows</span><span>${e.noShowCount||0}</span></div>
        </div>
        ${(e.lists||[]).length>0?s`<div style="margin-top:8px;display:flex;gap:4px;flex-wrap:wrap;">${e.lists.map(r=>_("info",r)).join("")}</div>`:""}
      </div>

      <!-- Notes -->
      <div class="card">
        <div class="card-header">Notes</div>
        <div style="display:flex;flex-direction:column;gap:8px;max-height:200px;overflow-y:auto;margin-bottom:8px;">
          ${o.map(r=>s`
            <div style="background:#1A1923;padding:8px;border-radius:8px;font-size:0.875rem;">
              <div style="color:#8A8993;font-size:0.75rem;margin-bottom:4px;">${l(r.createdAt?new Date(r.createdAt).toLocaleString():"")}</div>
              ${l(r.text)}
            </div>
          `).join("")}
          ${o.length===0?s`<div style="color:#8A8993;text-align:center;padding:16px;">No notes</div>`:""}
        </div>
        <div style="display:flex;gap:8px;">
          <input id="ct-note-input" class="input" placeholder="Add note..." style="font-size:0.875rem;">
          <button class="btn btn-primary btn-sm" onclick="${i.addNote}()">Add</button>
        </div>
      </div>

      <!-- Booking History -->
      <div class="card" style="grid-column:1/-1;">
        <div class="card-header">Booking History</div>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>Date</th><th>Event Type</th><th>Status</th></tr></thead>
            <tbody>
              ${t.length===0?s`<tr><td colspan="3" style="text-align:center;color:#8A8993;padding:16px;">No bookings yet</td></tr>`:""}
              ${t.map(r=>s`
                <tr>
                  <td>${l(r.date||"—")}</td>
                  <td>${l(r.eventTypeId||"—")}</td>
                  <td>${_(r.status==="confirmed"?"success":r.status==="cancelled"?"danger":"warning",r.status||"—")}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `}function Zo(n){if(!n)return"?";const i=String(n).trim().split(/\s+/);return i.length===1?i[0].substring(0,2).toUpperCase():(i[0][0]+i[i.length-1][0]).toUpperCase()}function en({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return Xo({state:o,fn:t})},state:{activeContact:{},contactBookings:[],contactNotes:[],error:"",loading:!1},methods:{addNote(){const o=document.getElementById("contact-note-input");if(!o)return;const t=o.value.trim();if(!t)return;o.value="";const a={nid:"nte_"+Math.random().toString(36).slice(2,6),text:t,createdAt:new Date().toISOString()},d={...e.getState().activeContact},c=[...d.notes||[],a];d.notes=c,e.render({activeContact:d,contactNotes:c})}}});return e}function tn({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading data</div>
      <div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div>
      <button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button>
    </div>`;if(n.loading)return s`<div>${G(3)}</div>`;const e=n.resources||[];return s`
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
      <div><h2>Resources</h2><p style="color:#8A8993;font-size:0.875rem;">Meeting rooms, equipment, shared spaces</p></div>
      <button class="btn btn-primary btn-sm" onclick="${i.showCreateResource}()">+ Add Resource</button>
    </div>

    ${e.length===0?s`
      <div class="empty-state">
        <div style="font-size:48px;margin-bottom:16px;">${v.calendar}</div>
        <div class="empty-state-title">No resources</div>
        <div class="empty-state-desc">Add meeting rooms, equipment, or shared spaces for booking.</div>
        <button class="btn btn-primary btn-sm" onclick="${i.showCreateResource}()">+ Add Resource</button>
      </div>
    `:""}

    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;">
      ${e.map(o=>s`
        <div class="card fade-in">
          <div style="display:flex;justify-content:space-between;align-items:start;margin-bottom:8px;">
            <div style="font-weight:600;">${l(o.name)}</div>
            ${_(o.type==="room"?"info":o.type==="equipment"?"warning":"neutral",o.type)}
          </div>
          ${o.capacity?s`<div style="font-size:0.875rem;color:#8A8993;margin-bottom:4px;">Capacity: ${o.capacity}</div>`:""}
          ${o.location?s`<div style="font-size:0.875rem;color:#8A8993;margin-bottom:4px;">${v.link} ${l(o.location)}</div>`:""}
          <div style="display:flex;align-items:center;gap:8px;margin-top:8px;">
            ${Y(o.active?"green":"red")}
            <span style="font-size:0.875rem;color:#8A8993;">${o.active?"Available":"Inactive"}</span>
            <span style="flex:1;"></span>
            <button class="btn btn-ghost btn-sm" onclick="${i.editResource}('${l(o.rid)}')">Edit</button>
            <button class="btn btn-ghost btn-sm" onclick="${i.deleteResource}('${l(o.rid)}')" style="color:#FF4A5A;">Delete</button>
          </div>
        </div>
      `).join("")}
    </div>
  `}function on({router:n,eventBus:i}={}){const e=$({template({state:o,fn:t}){return tn({state:o,fn:t})},state:{error:"",loading:!1,resources:[]},methods:{deleteResource(o){const t=(e.getState().resources||[]).filter(r=>r.rid!==o);e.render({resources:t})},editResource(o){},showCreateResource(){e.render({showCreateResource:!0})}}});return e}function nn({state:n,fn:i}){if(n.error&&!n.loading)return s`<div class="card" style="text-align:center;padding:48px;">
      <div style="color:#FF4A5A;margin-bottom:12px;">${v.alert}</div>
      <div class="card-header" style="color:#FF4A5A;">Error loading data</div>
      <div style="color:#8A8993;margin-bottom:16px;">${l(n.error)}</div>
      <button class="btn btn-primary" onclick="${i.retryRoute}()">Try Again</button>
    </div>`;if(n.loading)return s`<div>${ze(10)}</div>`;const e=n.auditEntries||[],o=n.auditFilters||{};return s`
    <h2 style="margin-bottom:16px;">Audit Log</h2>

    <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
      <input class="input" placeholder="Filter by user ID..." value="${l(o.userId||"")}" style="max-width:200px;">
      <select class="select" style="max-width:200px;">
        <option value="">All Actions</option>
        <option value="booking.created">Booking Created</option>
        <option value="booking.cancelled">Booking Cancelled</option>
        <option value="event_type.created">Event Type Created</option>
        <option value="event_type.deleted">Event Type Deleted</option>
        <option value="api_key.generated">API Key Generated</option>
        <option value="api_key.revoked">API Key Revoked</option>
        <option value="auth.signed_in">User Signed In</option>
        <option value="settings.updated">Settings Updated</option>
      </select>
      <input class="input" type="date" value="${l(o.from||"")}" style="max-width:160px;">
      <span style="color:#8A8993;align-self:center;">to</span>
      <input class="input" type="date" value="${l(o.to||"")}" style="max-width:160px;">
      <button class="btn btn-primary btn-sm">Filter</button>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table class="data-table">
          <thead><tr><th>Timestamp</th><th>Action</th><th>User</th><th>Target</th><th>Details</th></tr></thead>
          <tbody>
            ${e.length===0?s`<tr><td colspan="5" style="text-align:center;color:#8A8993;padding:24px;">No audit entries found</td></tr>`:""}
            ${e.map(t=>s`
              <tr>
                <td style="font-size:0.75rem;white-space:nowrap;">${l(t.iso||"—")}</td>
                <td>${_(rn(t.action),t.action||"—")}</td>
                <td style="font-family:monospace;font-size:0.75rem;">${l((t.userId||"").slice(0,12)+"...")}</td>
                <td style="font-family:monospace;font-size:0.75rem;">${l(t.target?t.target.slice(0,16)+"...":"—")}</td>
                <td style="font-size:0.75rem;color:#8A8993;">${l(sn(t))}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    </div>
  `}function rn(n){return n?n.startsWith("auth.")?"info":n.startsWith("booking.")?"success":n.startsWith("event_type.")?"warning":n.startsWith("api_key.")||n.startsWith("admin.")?"danger":"neutral":"neutral"}function sn(n){const i=[];return n.oldValue&&i.push(`old: ${JSON.stringify(n.oldValue).slice(0,40)}`),n.newValue&&i.push(`new: ${JSON.stringify(n.newValue).slice(0,40)}`),i.join(" → ")||"—"}function an({router:n,eventBus:i}={}){return $({template({state:o,fn:t}){return nn({state:o,fn:t})},state:{auditEntries:[],auditFilters:{},error:"",loading:!1},methods:{}})}const ln=window._firebase;let Ae=null,Re=null;function dn(){return Re}function cn(n){return n?{uid:n.uid,email:n.email||"",displayName:n.displayName||"",photoURL:n.photoURL||""}:null}function pn(n){return he[n]?he[n]:n.startsWith("/book/")?"Book a Meeting":n.startsWith("/workspaces/")?"Workspace":n.startsWith("/contacts/")?"Contact":"Calendly"}function ve(n){return!!(ut.includes(n)||n.startsWith(vt))}let C=null;function un(n,i,e){Pe();let o=Se[n];if(!o)for(const[r,a]of Object.entries(Se)){if(!r.includes(":"))continue;const d=r.split(":")[0];if(n.startsWith(d)&&P.match(n)){o=a;break}}if(!o)return C=null,null;C=o({router:P,eventBus:H});const t=j.getState();return C.render({user:t.user,currentParams:i,currentQuery:e}),typeof C.load=="function"&&C.load().catch(r=>{console.error("[shell] view load error:",r)}),C.register({navigateTo(r){P.go(r)},retryRoute(){P.go(n)},toggleSidebar(){j.render({sidebarOpen:!j.getState().sidebarOpen})},async signOut(){const{signOut:r}=await V(async()=>{const{signOut:a}=await import("./chunk-hFDNlS-5.js");return{signOut:a}},__vite__mapDeps([0,1]));await r().unwrap()},signIn(){V(async()=>{const{signInWithGoogle:r}=await import("./chunk-hFDNlS-5.js");return{signInWithGoogle:r}},__vite__mapDeps([0,1])).then(({signInWithGoogle:r})=>{r().unwrap().catch(a=>{console.error("[auth] sign-in error:",a)})})}}),C}function Pe(){if(C){try{C.destroy()}catch(n){console.error("[shell] view destroy error:",n)}C=null}}const Se={"/":Zt,"/login":Yt,"/calendar":no,"/event-types":ao,"/event-types/editor":vo,"/availability":bo,"/book/:hostId/:eventTypeId":$e,"/book/otl/:token":$e,"/routing-forms":_o,"/pools":Io,"/workspaces":zo,"/workspaces/:id":Mo,"/resources":on,"/contacts":Jo,"/contacts/:id":en,"/time-tracking":Lo,"/audit-log":an,"/compliance":Wo,"/webhooks":Uo,"/api-keys":Vo,"/settings":Qo},P=tt({routes:{"/":()=>s`<span id="route-dashboard"></span>`,"/login":()=>s`<span id="route-login"></span>`,"/calendar":()=>s`<span id="route-calendar"></span>`,"/event-types":()=>s`<span id="route-eventtypes"></span>`,"/event-types/editor":()=>s`<span id="route-editor"></span>`,"/availability":()=>s`<span id="route-availability"></span>`,"/book/:hostId/:eventTypeId":()=>s`<span id="route-book"></span>`,"/book/otl/:token":()=>s`<span id="route-book-otl"></span>`,"/routing-forms":()=>s`<span id="route-routingforms"></span>`,"/pools":()=>s`<span id="route-pools"></span>`,"/workspaces":()=>s`<span id="route-workspaces"></span>`,"/workspaces/:id":()=>s`<span id="route-workspace"></span>`,"/resources":()=>s`<span id="route-resources"></span>`,"/contacts":()=>s`<span id="route-contacts"></span>`,"/contacts/:id":()=>s`<span id="route-contact"></span>`,"/time-tracking":()=>s`<span id="route-timetracking"></span>`,"/audit-log":()=>s`<span id="route-auditlog"></span>`,"/compliance":()=>s`<span id="route-compliance"></span>`,"/webhooks":()=>s`<span id="route-webhooks"></span>`,"/api-keys":()=>s`<span id="route-apikeys"></span>`,"/settings":()=>s`<span id="route-settings"></span>`},initial:Ce,useHash:!0});P.guard("*",({to:n})=>{const i=dn(),e=ve(n);return!i&&!e?(P.go(de,{replace:!0}),!1):!0});function vn({state:n,fn:i}){n.isPublicRoute;const e=n._viewCtrl;let o="";e?o=e.toString():n.loading?o=s`<div style="text-align:center;padding:64px;color:#8A8993;">Loading...</div>`:o=s`<div class="empty-state"><div class="empty-state-title">404</div><div class="empty-state-desc">Page not found</div></div>`;const t={...n,contentHtml:o};return rt({state:t,fn:i})}const j=$({template:vn,state:{...pt},methods:{}});j.register({navigateTo(n){P.go(n)},toggleSidebar(){j.render({sidebarOpen:!j.getState().sidebarOpen})},async signOut(){const{signOut:n}=await V(async()=>{const{signOut:i}=await import("./chunk-hFDNlS-5.js");return{signOut:i}},__vite__mapDeps([0,1]));await n().unwrap()}});P.onChange(async({path:n,params:i,query:e})=>{j.render({sidebarOpen:!1}),H.nextGen();const o=un(n,i,e);H.emit(te.ROUTE_CHANGING,{path:n,params:i,query:e});const t=ve(n);j.render({route:n,currentParams:i,currentQuery:e,isPublicRoute:t,pageTitle:pn(n),loading:!1,error:null,_viewCtrl:o}),H.emit(te.ROUTE_CHANGED,{path:n,params:i,query:e})});function gn(n){Ae=n,ln.onAuthStateChanged(Ae,i=>{Re=i;const e=cn(i);i?(j.render({user:e,authLoading:!1,authError:null}),C&&(C.render({user:e}),typeof C.load=="function"&&C.load()),H.emit(te.AUTH_CHANGED,{user:e}),P.current===de&&P.go(Ce,{replace:!0})):(j.render({user:null,authLoading:!1,authError:null}),C&&(C.render({user:null}),typeof C.load=="function"&&C.load()),H.emit(te.AUTH_CHANGED,{user:null}),ve(P.current)||P.go(de,{replace:!0}))})}const Ee=document.getElementById("app");Ee&&Ee.replaceWith(j.element());Promise.resolve().then(async()=>{const{auth:n}=await V(async()=>{const{auth:i}=await import("./chunk-BnhNuwzA.js");return{auth:i}},[]);gn(n)});window.addEventListener("beforeunload",()=>{Pe();try{j.destroy()}catch{}});export{Q as A,fn as F,E as a,_e as b,Be as c,M as d,pe as e,xn as i,ne as w};
