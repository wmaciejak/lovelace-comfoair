function e(e,t,i,s){var n,r=arguments.length,o=r<3?t:null===s?s=Object.getOwnPropertyDescriptor(t,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)o=Reflect.decorate(e,t,i,s);else for(var a=e.length-1;a>=0;a--)(n=e[a])&&(o=(r<3?n(o):r>3?n(t,i,o):n(t,i))||o);return r>3&&o&&Object.defineProperty(t,i,o),o}"function"==typeof SuppressedError&&SuppressedError;
/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const t=globalThis,i=t.ShadowRoot&&(void 0===t.ShadyCSS||t.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),n=new WeakMap;class r{constructor(e,t,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=e,this.t=t}get styleSheet(){let e=this.o;const t=this.t;if(i&&void 0===e){const i=void 0!==t&&1===t.length;i&&(e=n.get(t)),void 0===e&&((this.o=e=new CSSStyleSheet).replaceSync(this.cssText),i&&n.set(t,e))}return e}toString(){return this.cssText}}const o=(e,...t)=>{const i=1===e.length?e[0]:t.reduce((t,i,s)=>t+(e=>{if(!0===e._$cssResult$)return e.cssText;if("number"==typeof e)return e;throw Error("Value passed to 'css' function must be a 'css' function result: "+e+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+e[s+1],e[0]);return new r(i,e,s)},a=i?e=>e:e=>e instanceof CSSStyleSheet?(e=>{let t="";for(const i of e.cssRules)t+=i.cssText;return(e=>new r("string"==typeof e?e:e+"",void 0,s))(t)})(e):e,{is:l,defineProperty:c,getOwnPropertyDescriptor:d,getOwnPropertyNames:p,getOwnPropertySymbols:u,getPrototypeOf:h}=Object,m=globalThis,f=m.trustedTypes,_=f?f.emptyScript:"",g=m.reactiveElementPolyfillSupport,y=(e,t)=>e,b={toAttribute(e,t){switch(t){case Boolean:e=e?_:null;break;case Object:case Array:e=null==e?e:JSON.stringify(e)}return e},fromAttribute(e,t){let i=e;switch(t){case Boolean:i=null!==e;break;case Number:i=null===e?null:Number(e);break;case Object:case Array:try{i=JSON.parse(e)}catch(e){i=null}}return i}},v=(e,t)=>!l(e,t),$={attribute:!0,type:String,converter:b,reflect:!1,useDefault:!1,hasChanged:v};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;class w extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??=[]).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,t=$){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(e)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(e,t),!t.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(e,i,t);void 0!==s&&c(this.prototype,e,s)}}static getPropertyDescriptor(e,t,i){const{get:s,set:n}=d(this.prototype,e)??{get(){return this[t]},set(e){this[t]=e}};return{get:s,set(t){const r=s?.call(this);n?.call(this,t),this.requestUpdate(e,r,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??$}static _$Ei(){if(this.hasOwnProperty(y("elementProperties")))return;const e=h(this);e.finalize(),void 0!==e.l&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(y("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(y("properties"))){const e=this.properties,t=[...p(e),...u(e)];for(const i of t)this.createProperty(i,e[i])}const e=this[Symbol.metadata];if(null!==e){const t=litPropertyMetadata.get(e);if(void 0!==t)for(const[e,i]of t)this.elementProperties.set(e,i)}this._$Eh=new Map;for(const[e,t]of this.elementProperties){const i=this._$Eu(e,t);void 0!==i&&this._$Eh.set(i,e)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const t=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const e of i)t.unshift(a(e))}else void 0!==e&&t.push(a(e));return t}static _$Eu(e,t){const i=t.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof e?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(e=>this.enableUpdating=e),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(e=>e(this))}addController(e){(this._$EO??=new Set).add(e),void 0!==this.renderRoot&&this.isConnected&&e.hostConnected?.()}removeController(e){this._$EO?.delete(e)}_$E_(){const e=new Map,t=this.constructor.elementProperties;for(const i of t.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((e,s)=>{if(i)e.adoptedStyleSheets=s.map(e=>e instanceof CSSStyleSheet?e:e.styleSheet);else for(const i of s){const s=document.createElement("style"),n=t.litNonce;void 0!==n&&s.setAttribute("nonce",n),s.textContent=i.cssText,e.appendChild(s)}})(e,this.constructor.elementStyles),e}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(e=>e.hostConnected?.())}enableUpdating(e){}disconnectedCallback(){this._$EO?.forEach(e=>e.hostDisconnected?.())}attributeChangedCallback(e,t,i){this._$AK(e,i)}_$ET(e,t){const i=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,i);if(void 0!==s&&!0===i.reflect){const n=(void 0!==i.converter?.toAttribute?i.converter:b).toAttribute(t,i.type);this._$Em=e,null==n?this.removeAttribute(s):this.setAttribute(s,n),this._$Em=null}}_$AK(e,t){const i=this.constructor,s=i._$Eh.get(e);if(void 0!==s&&this._$Em!==s){const e=i.getPropertyOptions(s),n="function"==typeof e.converter?{fromAttribute:e.converter}:void 0!==e.converter?.fromAttribute?e.converter:b;this._$Em=s;const r=n.fromAttribute(t,e.type);this[s]=r??this._$Ej?.get(s)??r,this._$Em=null}}requestUpdate(e,t,i,s=!1,n){if(void 0!==e){const r=this.constructor;if(!1===s&&(n=this[e]),i??=r.getPropertyOptions(e),!((i.hasChanged??v)(n,t)||i.useDefault&&i.reflect&&n===this._$Ej?.get(e)&&!this.hasAttribute(r._$Eu(e,i))))return;this.C(e,t,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(e,t,{useDefault:i,reflect:s,wrapped:n},r){i&&!(this._$Ej??=new Map).has(e)&&(this._$Ej.set(e,r??t??this[e]),!0!==n||void 0!==r)||(this._$AL.has(e)||(this.hasUpdated||i||(t=void 0),this._$AL.set(e,t)),!0===s&&this._$Em!==e&&(this._$Eq??=new Set).add(e))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(e){Promise.reject(e)}const e=this.scheduleUpdate();return null!=e&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[e,t]of this._$Ep)this[e]=t;this._$Ep=void 0}const e=this.constructor.elementProperties;if(e.size>0)for(const[t,i]of e){const{wrapped:e}=i,s=this[t];!0!==e||this._$AL.has(t)||void 0===s||this.C(t,void 0,i,s)}}let e=!1;const t=this._$AL;try{e=this.shouldUpdate(t),e?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(t){throw e=!1,this._$EM(),t}e&&this._$AE(t)}willUpdate(e){}_$AE(e){this._$EO?.forEach(e=>e.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Eq&&=this._$Eq.forEach(e=>this._$ET(e,this[e])),this._$EM()}updated(e){}firstUpdated(e){}}w.elementStyles=[],w.shadowRootOptions={mode:"open"},w[y("elementProperties")]=new Map,w[y("finalized")]=new Map,g?.({ReactiveElement:w}),(m.reactiveElementVersions??=[]).push("2.1.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const x=globalThis,A=e=>e,S=x.trustedTypes,k=S?S.createPolicy("lit-html",{createHTML:e=>e}):void 0,C="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,z="?"+E,N=`<${z}>`,M=document,O=()=>M.createComment(""),P=e=>null===e||"object"!=typeof e&&"function"!=typeof e,T=Array.isArray,U="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,F=/-->/g,j=/>/g,H=RegExp(`>|${U}(?:([^\\s"'>=/]+)(${U}*=${U}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),B=/'/g,L=/"/g,W=/^(?:script|style|textarea|title)$/i,D=e=>(t,...i)=>({_$litType$:e,strings:t,values:i}),I=D(1),V=D(2),Z=Symbol.for("lit-noChange"),q=Symbol.for("lit-nothing"),G=new WeakMap,K=M.createTreeWalker(M,129);function Q(e,t){if(!T(e)||!e.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==k?k.createHTML(t):t}const J=(e,t)=>{const i=e.length-1,s=[];let n,r=2===t?"<svg>":3===t?"<math>":"",o=R;for(let t=0;t<i;t++){const i=e[t];let a,l,c=-1,d=0;for(;d<i.length&&(o.lastIndex=d,l=o.exec(i),null!==l);)d=o.lastIndex,o===R?"!--"===l[1]?o=F:void 0!==l[1]?o=j:void 0!==l[2]?(W.test(l[2])&&(n=RegExp("</"+l[2],"g")),o=H):void 0!==l[3]&&(o=H):o===H?">"===l[0]?(o=n??R,c=-1):void 0===l[1]?c=-2:(c=o.lastIndex-l[2].length,a=l[1],o=void 0===l[3]?H:'"'===l[3]?L:B):o===L||o===B?o=H:o===F||o===j?o=R:(o=H,n=void 0);const p=o===H&&e[t+1].startsWith("/>")?" ":"";r+=o===R?i+N:c>=0?(s.push(a),i.slice(0,c)+C+i.slice(c)+E+p):i+E+(-2===c?t:p)}return[Q(e,r+(e[i]||"<?>")+(2===t?"</svg>":3===t?"</math>":"")),s]};class Y{constructor({strings:e,_$litType$:t},i){let s;this.parts=[];let n=0,r=0;const o=e.length-1,a=this.parts,[l,c]=J(e,t);if(this.el=Y.createElement(l,i),K.currentNode=this.el.content,2===t||3===t){const e=this.el.content.firstChild;e.replaceWith(...e.childNodes)}for(;null!==(s=K.nextNode())&&a.length<o;){if(1===s.nodeType){if(s.hasAttributes())for(const e of s.getAttributeNames())if(e.endsWith(C)){const t=c[r++],i=s.getAttribute(e).split(E),o=/([.?@])?(.*)/.exec(t);a.push({type:1,index:n,name:o[2],strings:i,ctor:"."===o[1]?se:"?"===o[1]?ne:"@"===o[1]?re:ie}),s.removeAttribute(e)}else e.startsWith(E)&&(a.push({type:6,index:n}),s.removeAttribute(e));if(W.test(s.tagName)){const e=s.textContent.split(E),t=e.length-1;if(t>0){s.textContent=S?S.emptyScript:"";for(let i=0;i<t;i++)s.append(e[i],O()),K.nextNode(),a.push({type:2,index:++n});s.append(e[t],O())}}}else if(8===s.nodeType)if(s.data===z)a.push({type:2,index:n});else{let e=-1;for(;-1!==(e=s.data.indexOf(E,e+1));)a.push({type:7,index:n}),e+=E.length-1}n++}}static createElement(e,t){const i=M.createElement("template");return i.innerHTML=e,i}}function X(e,t,i=e,s){if(t===Z)return t;let n=void 0!==s?i._$Co?.[s]:i._$Cl;const r=P(t)?void 0:t._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(e),n._$AT(e,i,s)),void 0!==s?(i._$Co??=[])[s]=n:i._$Cl=n),void 0!==n&&(t=X(e,n._$AS(e,t.values),n,s)),t}class ee{constructor(e,t){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:t},parts:i}=this._$AD,s=(e?.creationScope??M).importNode(t,!0);K.currentNode=s;let n=K.nextNode(),r=0,o=0,a=i[0];for(;void 0!==a;){if(r===a.index){let t;2===a.type?t=new te(n,n.nextSibling,this,e):1===a.type?t=new a.ctor(n,a.name,a.strings,this,e):6===a.type&&(t=new oe(n,this,e)),this._$AV.push(t),a=i[++o]}r!==a?.index&&(n=K.nextNode(),r++)}return K.currentNode=M,s}p(e){let t=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(e,i,t),t+=i.strings.length-2):i._$AI(e[t])),t++}}class te{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(e,t,i,s){this.type=2,this._$AH=q,this._$AN=void 0,this._$AA=e,this._$AB=t,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let e=this._$AA.parentNode;const t=this._$AM;return void 0!==t&&11===e?.nodeType&&(e=t.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,t=this){e=X(this,e,t),P(e)?e===q||null==e||""===e?(this._$AH!==q&&this._$AR(),this._$AH=q):e!==this._$AH&&e!==Z&&this._(e):void 0!==e._$litType$?this.$(e):void 0!==e.nodeType?this.T(e):(e=>T(e)||"function"==typeof e?.[Symbol.iterator])(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==q&&P(this._$AH)?this._$AA.nextSibling.data=e:this.T(M.createTextNode(e)),this._$AH=e}$(e){const{values:t,_$litType$:i}=e,s="number"==typeof i?this._$AC(e):(void 0===i.el&&(i.el=Y.createElement(Q(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(t);else{const e=new ee(s,this),i=e.u(this.options);e.p(t),this.T(i),this._$AH=e}}_$AC(e){let t=G.get(e.strings);return void 0===t&&G.set(e.strings,t=new Y(e)),t}k(e){T(this._$AH)||(this._$AH=[],this._$AR());const t=this._$AH;let i,s=0;for(const n of e)s===t.length?t.push(i=new te(this.O(O()),this.O(O()),this,this.options)):i=t[s],i._$AI(n),s++;s<t.length&&(this._$AR(i&&i._$AB.nextSibling,s),t.length=s)}_$AR(e=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);e!==this._$AB;){const t=A(e).nextSibling;A(e).remove(),e=t}}setConnected(e){void 0===this._$AM&&(this._$Cv=e,this._$AP?.(e))}}class ie{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,t,i,s,n){this.type=1,this._$AH=q,this._$AN=void 0,this.element=e,this.name=t,this._$AM=s,this.options=n,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=q}_$AI(e,t=this,i,s){const n=this.strings;let r=!1;if(void 0===n)e=X(this,e,t,0),r=!P(e)||e!==this._$AH&&e!==Z,r&&(this._$AH=e);else{const s=e;let o,a;for(e=n[0],o=0;o<n.length-1;o++)a=X(this,s[i+o],t,o),a===Z&&(a=this._$AH[o]),r||=!P(a)||a!==this._$AH[o],a===q?e=q:e!==q&&(e+=(a??"")+n[o+1]),this._$AH[o]=a}r&&!s&&this.j(e)}j(e){e===q?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class se extends ie{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===q?void 0:e}}class ne extends ie{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==q)}}class re extends ie{constructor(e,t,i,s,n){super(e,t,i,s,n),this.type=5}_$AI(e,t=this){if((e=X(this,e,t,0)??q)===Z)return;const i=this._$AH,s=e===q&&i!==q||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,n=e!==q&&(i===q||s);s&&this.element.removeEventListener(this.name,this,i),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,e):this._$AH.handleEvent(e)}}class oe{constructor(e,t,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=t,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){X(this,e)}}const ae=x.litHtmlPolyfillSupport;ae?.(Y,te),(x.litHtmlVersions??=[]).push("3.3.3");const le=globalThis;
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */class ce extends w{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const e=super.createRenderRoot();return this.renderOptions.renderBefore??=e.firstChild,e}update(e){const t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(e),this._$Do=((e,t,i)=>{const s=i?.renderBefore??t;let n=s._$litPart$;if(void 0===n){const e=i?.renderBefore??null;s._$litPart$=n=new te(t.insertBefore(O(),e),e,void 0,i??{})}return n._$AI(e),n})(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Z}}ce._$litElement$=!0,ce.finalized=!0,le.litElementHydrateSupport?.({LitElement:ce});const de=le.litElementPolyfillSupport;de?.({LitElement:ce}),(le.litElementVersions??=[]).push("4.2.2");
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */
const pe=e=>(t,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(e,t)}):customElements.define(e,t)},ue={attribute:!0,type:String,converter:b,reflect:!1,hasChanged:v},he=(e=ue,t,i)=>{const{kind:s,metadata:n}=i;let r=globalThis.litPropertyMetadata.get(n);if(void 0===r&&globalThis.litPropertyMetadata.set(n,r=new Map),"setter"===s&&((e=Object.create(e)).wrapped=!0),r.set(i.name,e),"accessor"===s){const{name:s}=i;return{set(i){const n=t.get.call(this);t.set.call(this,i),this.requestUpdate(s,n,e,!0,i)},init(t){return void 0!==t&&this.C(s,void 0,e,t),t}}}if("setter"===s){const{name:s}=i;return function(i){const n=this[s];t.call(this,i),this.requestUpdate(s,n,e,!0,i)}}throw Error("Unsupported decorator location: "+s)};
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function me(e){return(t,i)=>"object"==typeof i?he(e,t,i):((e,t,i)=>{const s=t.hasOwnProperty(i);return t.constructor.createProperty(i,e),s?Object.getOwnPropertyDescriptor(t,i):void 0})(e,t,i)}
/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function fe(e){return me({...e,state:!0,attribute:!1})}var _e,ge;!function(e){e.language="language",e.system="system",e.comma_decimal="comma_decimal",e.decimal_comma="decimal_comma",e.space_comma="space_comma",e.none="none"}(_e||(_e={})),function(e){e.language="language",e.system="system",e.am_pm="12",e.twenty_four="24"}(ge||(ge={}));var ye=function(e,t,i,s){s=s||{},i=null==i?{}:i;var n=new Event(t,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:Boolean(s.cancelable),composed:void 0===s.composed||s.composed});return n.detail=i,e.dispatchEvent(n),n};const be={nl:{controls:"Bediening",show_controls:"Extra bediening tonen",airflow_control:"Luchtrichting",operating_mode_control:"Bedrijfsmodus",boost_control:"Boost",boost_duration:"Boostduur",filter_reset:"Filterteller resetten",filter_interval:"Filterinterval",airflow_both:"Toevoer en afvoer",airflow_supply:"Alleen toevoer",airflow_extract:"Alleen afvoer",mode_auto:"Automatisch",mode_manual:"Handmatig",boost_start:"Boost starten",boost_stop:"Boost stoppen",confirm_filter_reset:"Filterteller na reiniging of vervanging resetten?",confirm:"Bevestigen",cancel:"Annuleren",apply:"Toepassen",unavailable:"Niet beschikbaar",updating:"Bijwerken…",update_failed:"De instelling kon niet worden gewijzigd. Controleer de verbinding en probeer opnieuw.",invalid_config:"Ongeldige configuratie",no_entity:"Geen climate-entiteit ingesteld",detected:"entiteiten gevonden",advanced:"Geavanceerd / handmatig toewijzen",title:"Woonhuisventilatie",history:"Geschiedenis tonen",colder:"Kouder",warmer:"Warmer",recovery:"Terugwinning",outdoor:"Buitenlucht",extract:"Retourlucht",exhaust:"Afvoerlucht",supply:"Toevoerlucht",fan:"Ventilator",off:"Uit",filter:"Filter",replace:"Vervangen",ok:"OK",bypass:"Bypass",open:"Open",closed:"Dicht",preheat:"Voorverwarming",active:"Actief",summer:"Zomer",winter:"Winter",entity:"CA350/550 climate-entiteit (verplicht)",animation:"Animatie",animation_speed_source:"Snelheidsbron",animation_speed:"Vaste snelheid (%)",color_scale:"Kleurenschaal",temp_min:"Vaste schaal - min (°C)",temp_max:"Vaste schaal - max (°C)",show_legend:"Temperatuurschaal tonen",name:"Naam (optioneel)",tempSensor1:"Buitentemperatuur",tempSensor2:"Afvoertemperatuur",tempSensor3:"Retourtemperatuur",tempSensor4:"Toevoertemperatuur",filterstatus:"Filterstatus",bypass_valve:"Bypassklep",summer_mode:"Zomermodus",preheat_field:"Voorverwarmingsregister",fan_speed_supply:"Toevoerventilatorsnelheid",fan_speed_exhaust:"Afvoerventilatorsnelheid",return_air_level:"Retourluchtstand",supply_air_level:"Toevoerluchtstand",animated:"Geanimeerd (luchtstromen + ventilatoren)",static:"Statisch",level:"Op basis van luchtdebiet (toevoer/retour %)",auto_scale:"Auto (huidige waarden)",fixed_scale:"Vast (handmatig bereik)",low:"Stand 1",medium:"Stand 2",high:"Stand 3",language:"Taal",auto:"Automatisch (Home Assistant)"},nb:{invalid_config:"Ikke gyldig konfigurasjon",no_entity:"Ingen climate-enhet valgt",detected:"enheter funnet",advanced:"Avansert / manuell tilordning"},de:{controls:"Steuerung",show_controls:"Erweiterte Steuerung anzeigen",airflow_control:"Luftrichtung",operating_mode_control:"Betriebsmodus",boost_control:"Stoßlüftung",boost_duration:"Dauer der Stoßlüftung",filter_reset:"Filterzähler zurücksetzen",filter_interval:"Filterintervall",airflow_both:"Zu- und Abluft",airflow_supply:"Nur Zuluft",airflow_extract:"Nur Abluft",mode_auto:"Automatisch",mode_manual:"Manuell",boost_start:"Stoßlüftung starten",boost_stop:"Stoßlüftung stoppen",confirm_filter_reset:"Filterzähler nach dem Reinigen oder Wechseln zurücksetzen?",confirm:"Bestätigen",cancel:"Abbrechen",apply:"Übernehmen",unavailable:"Nicht verfügbar",updating:"Wird aktualisiert…",update_failed:"Die Einstellung konnte nicht geändert werden. Verbindung prüfen und erneut versuchen.",invalid_config:"Ungültige Konfiguration",no_entity:"Keine climate-Entity ausgewählt",detected:"Entities erkannt",advanced:"Erweitert / manuelle Zuordnung",title:"Wohnraumlüftung",history:"Verlauf anzeigen",colder:"kälter",warmer:"wärmer",recovery:"Rückgewinnung",outdoor:"Außenluft",extract:"Abluft",exhaust:"Fortluft",supply:"Zuluft",fan:"Lüfter",off:"Aus",low:"Stufe 1",medium:"Stufe 2",high:"Stufe 3",filter:"Filter",replace:"Wechseln",ok:"OK",bypass:"Bypass",open:"Offen",closed:"Zu",preheat:"Vorheizen",active:"Aktiv",summer:"Sommer",winter:"Winter",entity:"CA350/550 Climate-Entity (Pflicht)",animation:"Animation",animation_speed_source:"Tempo-Quelle",animation_speed:"Festes Tempo (%)",color_scale:"Farbskala",temp_min:"Feste Skala – Min (°C)",temp_max:"Feste Skala – Max (°C)",show_legend:"Temperaturskala einblenden",name:"Name (optional)",tempSensor1:"Außentemperatur",tempSensor2:"Fortlufttemperatur",tempSensor3:"Rücklufttemperatur",tempSensor4:"Zulufttemperatur",filterstatus:"Filterstatus",bypass_valve:"Bypass-Ventil",summer_mode:"Sommermodus",preheat_field:"Vorheizregister",fan_speed_supply:"Lüfterdrehzahl Zuluft",fan_speed_exhaust:"Lüfterdrehzahl Fortluft",return_air_level:"Rückluft-Stufe",supply_air_level:"Zuluft-Stufe",animated:"Animiert (Luftströme + Lüfter)",static:"Statisch",level:"Nach Luftmenge (Supply/Return %)",auto_scale:"Auto (aktuelle Werte)",fixed_scale:"Fest (manueller Bereich)",language:"Sprache",auto:"Automatisch (Home Assistant)"},en:{controls:"Controls",show_controls:"Show extended controls",airflow_control:"Airflow direction",operating_mode_control:"Operating mode",boost_control:"Boost",boost_duration:"Boost duration",filter_reset:"Reset filter counter",filter_interval:"Filter interval",airflow_both:"Supply and extract",airflow_supply:"Supply only",airflow_extract:"Extract only",mode_auto:"Automatic",mode_manual:"Manual",boost_start:"Start boost",boost_stop:"Stop boost",confirm_filter_reset:"Reset the filter counter after replacing or cleaning the filters?",confirm:"Confirm",cancel:"Cancel",apply:"Apply",unavailable:"Unavailable",updating:"Updating…",update_failed:"Could not update the control. Check the connection and try again.",invalid_config:"Invalid configuration",no_entity:"No climate entity selected",detected:"entities detected",advanced:"Advanced / manual mapping",title:"Home ventilation",history:"Show history",colder:"Decrease temperature",warmer:"Increase temperature",recovery:"Heat recovery",outdoor:"Outdoor air",extract:"Extract air",exhaust:"Exhaust air",supply:"Supply air",fan:"Fan",off:"Off",low:"Speed 1",medium:"Speed 2",high:"Speed 3",filter:"Filter",replace:"Replace",ok:"OK",bypass:"Bypass",open:"Open",closed:"Closed",preheat:"Preheater",active:"Active",summer:"Summer",winter:"Winter",entity:"CA350/550 climate entity (required)",animation:"Animation",animation_speed_source:"Animation speed source",animation_speed:"Fixed speed (%)",color_scale:"Color scale",temp_min:"Fixed scale – minimum (°C)",temp_max:"Fixed scale – maximum (°C)",show_legend:"Show temperature scale",name:"Name (optional)",tempSensor1:"Outdoor temperature",tempSensor2:"Exhaust temperature",tempSensor3:"Extract temperature",tempSensor4:"Supply temperature",filterstatus:"Filter status",bypass_valve:"Bypass valve",summer_mode:"Summer mode",preheat_field:"Preheater",fan_speed_supply:"Supply fan speed",fan_speed_exhaust:"Exhaust fan speed",return_air_level:"Extract fan level",supply_air_level:"Supply fan level",animated:"Animated (airflow + fans)",static:"Static",level:"By airflow (supply/extract %)",auto_scale:"Auto (current values)",fixed_scale:"Fixed (manual range)",language:"Language",auto:"Automatic (Home Assistant)"},pl:{controls:"Sterowanie",show_controls:"Pokaż dodatkowe sterowanie",airflow_control:"Kierunek wentylacji",operating_mode_control:"Tryb pracy",boost_control:"Przewietrzanie",boost_duration:"Czas przewietrzania",filter_reset:"Zeruj licznik filtra",filter_interval:"Interwał wymiany filtra",airflow_both:"Nawiew i wywiew",airflow_supply:"Tylko nawiew",airflow_extract:"Tylko wywiew",mode_auto:"Automatyczny",mode_manual:"Ręczny",boost_start:"Włącz przewietrzanie",boost_stop:"Zatrzymaj przewietrzanie",confirm_filter_reset:"Wyzerować licznik po wymianie lub czyszczeniu filtrów?",confirm:"Potwierdź",cancel:"Anuluj",apply:"Zastosuj",unavailable:"Niedostępne",updating:"Zapisywanie…",update_failed:"Nie udało się zmienić ustawienia. Sprawdź połączenie i spróbuj ponownie.",invalid_config:"Nieprawidłowa konfiguracja",no_entity:"Nie wybrano encji climate",detected:"wykrytych encji",advanced:"Zaawansowane / ręczne przypisanie",title:"Wentylacja domu",history:"Pokaż historię",colder:"Obniż temperaturę",warmer:"Podnieś temperaturę",recovery:"Odzysk ciepła",outdoor:"Czerpnia",extract:"Wyciąg",exhaust:"Wyrzutnia",supply:"Nawiew",fan:"Wentylator",off:"Wyłączony",low:"Bieg 1",medium:"Bieg 2",high:"Bieg 3",filter:"Filtr",replace:"Wymień",ok:"OK",bypass:"Bypass",open:"Otwarty",closed:"Zamknięty",preheat:"Nagrzewnica wstępna",active:"Aktywna",summer:"Lato",winter:"Zima",entity:"Encja climate CA350/550 (wymagana)",animation:"Animacja",animation_speed_source:"Źródło prędkości animacji",animation_speed:"Stała prędkość (%)",color_scale:"Skala kolorów",temp_min:"Stała skala – minimum (°C)",temp_max:"Stała skala – maksimum (°C)",show_legend:"Pokaż skalę temperatur",name:"Nazwa (opcjonalna)",tempSensor1:"Temperatura czerpni",tempSensor2:"Temperatura wyrzutni",tempSensor3:"Temperatura wyciągu",tempSensor4:"Temperatura nawiewu",filterstatus:"Stan filtra",bypass_valve:"Zawór bypassu",summer_mode:"Tryb letni",preheat_field:"Nagrzewnica wstępna",fan_speed_supply:"Obroty wentylatora nawiewu",fan_speed_exhaust:"Obroty wentylatora wywiewu",return_air_level:"Wysterowanie wyciągu",supply_air_level:"Wysterowanie nawiewu",animated:"Animowane (przepływy i wentylatory)",static:"Statyczne",level:"Według przepływu (nawiew/wyciąg %)",auto_scale:"Automatyczna (bieżące wartości)",fixed_scale:"Stała (ręczny zakres)",language:"Język",auto:"Automatyczny (Home Assistant)"}};function ve(e,t){const i=((e&&"auto"!==e?e:t)||"en").replace(/["']/g,"").replace(/_/g,"-").split("-")[0].toLowerCase();return be[i]?i:"en"}function $e(e,t){return be[ve(t)][e]??be.en[e]??e}function we(e,t){const i=(e??"off").toLowerCase();return["off","low","medium","high"].includes(i)?$e(i,t):e??"off"}const xe=[{key:"airflow_control",kind:"select",domains:["select","input_select"],keywords:["fancontrol","fan_control","airflow"]},{key:"operating_mode_control",kind:"select",domains:["select","input_select"],keywords:["operating_mode","operation_mode","auto_manual"]},{key:"boost_duration",kind:"number",domains:["number","input_number"],keywords:["boost_duration","boost_time"]},{key:"boost_control",kind:"switch",domains:["switch","input_boolean"],keywords:["boost"]},{key:"filter_interval",kind:"number",domains:["number","input_number"],keywords:["filter_weeks","filter_interval"]},{key:"filter_reset",kind:"button",domains:["button","input_button"],keywords:["reset_filter","filter_reset"]}];function Ae(e,t,i){const s=t[i],n=xe.find(e=>e.key===i);if(!1!==t.show_controls&&s&&n.domains.includes(s.split(".")[0]))return e.states[s]}function Se(e,t){return!(!e||"unavailable"===e.state)&&("filter_reset"===t||!(!e.state||"unknown"===e.state)&&("boost_control"!==t||["on","off"].includes(e.state)))}function ke(e){const t=e.attributes.options;return Array.isArray(t)?t.filter(e=>"string"==typeof e):[]}function Ce(e,t,i,s){const n=Ae(e,t,i);if(!Se(n,i))return;const r=t[i],o=r.split(".")[0],a=xe.find(e=>e.key===i).kind;if("select"===a){if("string"!=typeof s||!ke(n).includes(s))return;return{domain:o,service:"select_option",data:{entity_id:r,option:s}}}if("switch"===a){if("boolean"!=typeof s)return;return{domain:o,service:s?"turn_on":"turn_off",data:{entity_id:r}}}if("button"===a)return{domain:o,service:"press",data:{entity_id:r}};if("string"!=typeof s&&"number"!=typeof s||""===String(s).trim())return;const l=Number(s),{min:c,max:d,step:p}=n.attributes;if("number"!=typeof c||"number"!=typeof d||"number"!=typeof p||!Number.isFinite(c)||!Number.isFinite(d)||!Number.isFinite(p)||p<=0||!Number.isFinite(l)||l<c||l>d)return;const u=(l-c)/p;return Math.abs(u-Math.round(u))>1e-6?void 0:{domain:o,service:"set_value",data:{entity_id:r,value:l}}}function Ee(e,t){const i=e.entities?.[t]?.device_id;if(!i)return{};const s=Object.keys(e.states).filter(t=>e.entities?.[t]?.device_id===i),n={};for(const t of xe){const i=s.filter(i=>{if(!t.domains.includes(i.split(".")[0]))return!1;const s=`${i} ${String(e.states[i].attributes.friendly_name??"")}`.toLowerCase().replace(/[ -]+/g,"_");return t.keywords.some(e=>s.includes(e))});1===i.length&&(n[t.key]=i[0])}return n}const ze="mqttcomfoair-card",Ne="mqttcomfoair-card-editor",Me=[{mode:"off",icon:"mdi:fan-off"},{mode:"low",icon:"mdi:fan-speed-1"},{mode:"medium",icon:"mdi:fan-speed-2"},{mode:"high",icon:"mdi:fan-speed-3"}],Oe=["entity","tempSensor1","tempSensor2","tempSensor3","tempSensor4","filterstatus","bypass_valve","summer_mode","preheat","fan_speed_supply","fan_speed_exhaust","return_air_level","supply_air_level",...xe.map(e=>e.key)];function Pe(e,t){if(e&&t)return e.states?e.states[t]:void 0}function Te(e,t){const i=Pe(e,t);return i&&"unavailable"!==i.state&&"unknown"!==i.state&&""!==i.state?i.state:"—"}const Ue={comma_decimal:"en-US",decimal_comma:"de",space_comma:"fr",quote_decimal:"de-CH",none:"en-US"};function Re(e,t){const i=Pe(e,t);if(!i)return;const s=parseFloat(i.state);return Number.isNaN(s)?void 0:s}const Fe=(e,t,i)=>e+(t-e)*i,je=[[.6,.16,252],[.72,.13,215],[.8,.14,155],[.82,.16,95],[.66,.19,45],[.5,.205,28]];function He(e){const t=je,i=(e=>Math.min(1,Math.max(0,e)))(e),s=i*(t.length-1),n=Math.min(t.length-2,Math.floor(s)),r=s-n,o=Fe(t[n][0],t[n+1][0],r),a=Fe(t[n][1],t[n+1][1],r),l=Fe(t[n][2],t[n+1][2],r);return`oklch(${o.toFixed(3)} ${a.toFixed(3)} ${l.toFixed(1)})`}function Be(e,t,i,s="de"){const n="on"===t;switch(e){case"fan":{const e=(i??"off").toLowerCase();return{icon:"mdi:fan",label:$e("fan",s),sub:we(e,s),active:"off"!==e,color:"#03a9f4"}}case"filter":return{icon:"mdi:air-filter",label:$e("filter",s),sub:$e(n?"replace":"ok",s),active:n,color:"#f5a623"};case"bypass":return{icon:"mdi:valve",label:$e("bypass",s),sub:$e(n?"open":"closed",s),active:n,color:"#36c46b"};case"preheat":return{icon:"mdi:radiator",label:$e("preheat",s),sub:$e(n?"active":"off",s),active:n,color:"#ff7043"};case"season":return n?{icon:"mdi:weather-sunny",label:$e("summer",s),sub:"",active:!0,color:"#ffb300"}:{icon:"mdi:snowflake",label:$e("winter",s),sub:"",active:!0,color:"#4fc3f7"}}}const Le=e=>"temperature"===e.attributes?.device_class,We=e=>"rpm"===e.attributes?.unit_of_measurement,De=e=>"%"===e.attributes?.unit_of_measurement,Ie=()=>!0,Ve=[{field:"tempSensor1",domain:"sensor",predicate:Le,keywords:["outside","outdoor","außen","aussen"]},{field:"tempSensor2",domain:"sensor",predicate:Le,keywords:["exhaust","fortluft","abluft"]},{field:"tempSensor3",domain:"sensor",predicate:Le,keywords:["return","extract","rückluft","rueckluft"]},{field:"tempSensor4",domain:"sensor",predicate:Le,keywords:["supply","zuluft"]},{field:"filterstatus",domain:"binary_sensor",predicate:Ie,keywords:["filter"]},{field:"bypass_valve",domain:"binary_sensor",predicate:Ie,keywords:["bypass"]},{field:"summer_mode",domain:"binary_sensor",predicate:Ie,keywords:["summer","sommer"]},{field:"preheat",domain:"binary_sensor",predicate:Ie,keywords:["preheat","preheating","vorheiz"]},{field:"fan_speed_supply",domain:"sensor",predicate:We,keywords:["supply","zuluft"]},{field:"fan_speed_exhaust",domain:"sensor",predicate:We,keywords:["exhaust","fortluft","abluft"]},{field:"return_air_level",domain:"sensor",predicate:De,keywords:["return","extract","rückluft","rueckluft"]},{field:"supply_air_level",domain:"sensor",predicate:De,keywords:["supply","zuluft"]}];function Ze(e,t){if(!e||!t)return{};let i=[];const s=e.entities?.[t]?.device_id??void 0;if(s&&e.entities&&(i=Object.keys(e.entities).filter(t=>e.entities[t].device_id===s)),0===i.length){const s=function(e){const t=e.split(".")[1]??"";return t.replace(/_climate$/,"")||t}(t);i=Object.keys(e.states).filter(e=>e.startsWith(`sensor.${s}_`)||e.startsWith(`binary_sensor.${s}_`))}const n={};for(const t of Ve){const s=i.filter(i=>{if(!i.startsWith(`${t.domain}.`))return!1;const s=e.states[i];if(!s||!t.predicate(s))return!1;const n=`${i} ${String(s.attributes?.friendly_name??"")}`.toLowerCase();return t.keywords.some(e=>n.includes(e))});if(s.length){const e=s.reduce((e,t)=>t.length<e.length?t:e);n[t.field]=e}}return{...n,...Ee(e,t)}}const qe=[{name:"name",selector:{text:{}}},{name:"tempSensor1",selector:{entity:{domain:"sensor",device_class:"temperature"}}},{name:"tempSensor2",selector:{entity:{domain:"sensor",device_class:"temperature"}}},{name:"tempSensor3",selector:{entity:{domain:"sensor",device_class:"temperature"}}},{name:"tempSensor4",selector:{entity:{domain:"sensor",device_class:"temperature"}}},{name:"filterstatus",selector:{entity:{domain:"binary_sensor"}}},{name:"bypass_valve",selector:{entity:{domain:"binary_sensor"}}},{name:"summer_mode",selector:{entity:{domain:"binary_sensor"}}},{name:"preheat",selector:{entity:{domain:"binary_sensor"}}},{name:"fan_speed_supply",selector:{entity:{domain:"sensor"}}},{name:"fan_speed_exhaust",selector:{entity:{domain:"sensor"}}},{name:"return_air_level",selector:{entity:{domain:"sensor"}}},{name:"supply_air_level",selector:{entity:{domain:"sensor"}}}],Ge=[{name:"show_controls",selector:{boolean:{}}},...xe.map(e=>({name:e.key,selector:{entity:{domain:[...e.domains]}}}))];let Ke=class extends ce{constructor(){super(...arguments),this._detectedCount=0,this._label=e=>$e("preheat"===e.name?"preheat_field":e.name,ve(this._config.language,this.hass?.language))}setConfig(e){this._config={show_controls:!0,...e}}_mainSchema(){const e=this._config,t=t=>$e(t,ve(e.language,this.hass?.language)),i=[{name:"language",selector:{select:{options:["auto","en","pl","de","nl"].map(e=>({value:e,label:"auto"===e?t("auto"):{en:"English",pl:"Polski",de:"Deutsch",nl:"Nederlands"}[e]||e}))}}},{name:"entity",required:!0,selector:{entity:{domain:"climate"}}},{name:"animation",selector:{select:{options:[{value:"animated",label:t("animated")},{value:"static",label:t("static")}]}}}];return"animated"===e.animation&&(i.push({name:"animation_speed_source",selector:{select:{options:[{value:"fixed",label:t("animation_speed")},{value:"level",label:t("level")}]}}}),"level"!==e.animation_speed_source&&i.push({name:"animation_speed",selector:{number:{min:10,max:200,step:10,unit_of_measurement:"%",mode:"slider"}}})),i.push({name:"color_scale",selector:{select:{options:[{value:"auto",label:t("auto_scale")},{value:"fixed",label:t("fixed_scale")}]}}}),"fixed"===e.color_scale&&i.push({name:"temp_min",selector:{number:{min:-30,max:20,step:1,unit_of_measurement:"°C",mode:"box"}}},{name:"temp_max",selector:{number:{min:0,max:50,step:1,unit_of_measurement:"°C",mode:"box"}}}),i.push({name:"show_legend",selector:{boolean:{}}}),i}render(){return this.hass&&this._config?I`
      <div class="editor">
        <ha-form
          .hass=${this.hass}
          .data=${this._config}
          .schema=${this._mainSchema()}
          .computeLabel=${this._label}
          @value-changed=${this._mainChanged}
        ></ha-form>
        ${this._detectedCount>0?I`<div class="hint">✓ ${this._detectedCount} ${$e("detected",ve(this._config.language,this.hass.language))}</div>`:""}
        <ha-expansion-panel outlined>
          <span slot="header">${$e("controls",ve(this._config.language,this.hass.language))}</span>
          <ha-form .hass=${this.hass} .data=${this._config} .schema=${Ge}
            .computeLabel=${this._label} @value-changed=${this._advancedChanged}></ha-form>
        </ha-expansion-panel>
        <ha-expansion-panel outlined>
          <span slot="header">${$e("advanced",ve(this._config.language,this.hass.language))}</span>
          <ha-form
            .hass=${this.hass}
            .data=${this._config}
            .schema=${qe}
            .computeLabel=${this._label}
            @value-changed=${this._advancedChanged}
          ></ha-form>
        </ha-expansion-panel>
      </div>
    `:I``}_mainChanged(e){e.stopPropagation();const t=e.detail.value,i=t.entity??"",s=!!i&&i!==this._config.entity;let n={...this._config,...t};if(s){const e=n;for(const t of Oe)"entity"!==t&&delete e[t];const t=Ze(this.hass,i);n={...n,...t},this._detectedCount=Object.keys(t).length}this._emit(n)}_advancedChanged(e){e.stopPropagation(),this._emit({...this._config,...e.detail.value})}_emit(e){this._config=e,ye(this,"config-changed",{config:e})}static get styles(){return o`
      .hint { color: var(--success-color, #43a047); padding: 4px 0 8px; font-size: 0.9em; }
      ha-form { display: block; }
      ha-expansion-panel { margin-top: 8px; }
    `}};e([me({attribute:!1})],Ke.prototype,"hass",void 0),e([fe()],Ke.prototype,"_config",void 0),e([fe()],Ke.prototype,"_detectedCount",void 0),Ke=e([pe(Ne)],Ke);let Qe=class extends ce{constructor(){super(...arguments),this.language="en",this._error=!1,this._confirmReset=!1,this._drafts={}}willUpdate(e){e.has("config")&&(this._drafts={},this._confirmReset=!1,this._error=!1)}_t(e){return $e(e,this.language)}async _perform(e,t){if(this._busy||"filter_reset"===e&&!this._confirmReset)return;const i=Ce(this.hass,this.config,e,t);if(i){this._busy=e,this._error=!1;try{await this.hass.callService(i.domain,i.service,i.data);const t={...this._drafts};delete t[e],this._drafts=t}catch{this._error=!0}finally{this._busy=void 0,this._confirmReset=!1}}}render(){if(!this.hass||!this.config||!1===this.config.show_controls)return I``;const e=xe.filter(e=>this.config[e.key]);return e.length?I`<section aria-label=${this._t("controls")}>
      <h3>${this._t("controls")}</h3>
      ${e.map(e=>{const{key:t,kind:i}=e,s=Ae(this.hass,this.config,t),n=Se(s,t),r=!!this._busy||!n,o=this._t(t);if("select"===i){const e=s?ke(s):[];return I`<div class="row">
            <label for=${t}>${o}</label>
            <select id=${t} .value=${s?.state??""} ?disabled=${r||!e.length}
              @change=${e=>{this._perform(t,e.target.value)}}>
              ${n?"":I`<option>${this._t("unavailable")}</option>`}
              ${e.map(e=>I`<option .value=${e} ?selected=${e===s?.state}>${function(e,t){const i={both:"airflow_both",in:"airflow_supply",supply:"airflow_supply",supply_only:"airflow_supply",out:"airflow_extract",extract:"airflow_extract",exhaust:"airflow_extract",extract_only:"airflow_extract",auto:"mode_auto",automatic:"mode_auto",manual:"mode_manual",off:"off"}[e.toLowerCase()];return i?$e(i,t):e}(e,this.language)}</option>`)}
            </select>
          </div>`}if("number"===i){const e=this._drafts[t]??s?.state??"",i=!!Ce(this.hass,this.config,t,e);return I`<form class="row" @submit=${i=>{i.preventDefault(),this._perform(t,e)}}>
            <label for=${t}>${o}${n?"":I` · ${this._t("unavailable")}`}</label>
            <div class="number">
              <input id=${t} type="number" .value=${e} min=${String(s?.attributes.min??"")}
                max=${String(s?.attributes.max??"")} step=${String(s?.attributes.step??"")}
                ?disabled=${r} @input=${e=>{this._drafts={...this._drafts,[t]:e.target.value}}}>
              <span>${String(s?.attributes.unit_of_measurement??"")}</span>
              <button type="submit" data-apply=${t} ?disabled=${r||!i}>${this._t("apply")}</button>
            </div>
          </form>`}return"switch"===i?I`<div class="row">
          <span>${o} · ${n?this._t("on"===s?.state?"active":"off"):this._t("unavailable")}</span>
          <button data-control=${t} ?disabled=${r}
            @click=${()=>{this._perform(t,"on"!==s?.state)}}>
            ${this._t("on"===s?.state?"boost_stop":"boost_start")}
          </button>
        </div>`:I`<div class="row">
          <span>${o}${n?"":I` · ${this._t("unavailable")}`}</span>
          ${this._confirmReset?I`<div class="confirmation" role="group" aria-label=${this._t("confirm_filter_reset")}>
            <span>${this._t("confirm_filter_reset")}</span>
            <div class="buttons">
              <button data-confirm-reset ?disabled=${r} @click=${()=>{this._perform(t)}}>${this._t("confirm")}</button>
              <button data-cancel-reset ?disabled=${!!this._busy} @click=${()=>{this._confirmReset=!1}}>${this._t("cancel")}</button>
            </div>
          </div>`:I`<button data-control=${t} ?disabled=${r} @click=${()=>{this._confirmReset=!0}}>${o}</button>`}
        </div>`})}
      ${this._busy?I`<span role="status">${this._t("updating")}</span>`:""}
      ${this._error?I`<span class="error" role="alert">${this._t("update_failed")}</span>`:""}
    </section>`:I``}};Qe.styles=o`
    :host { display: block; }
    section { border-top: 1px solid var(--divider-color); margin-top: 12px; padding-top: 12px; }
    h3 { font-size: 14px; margin: 0 0 10px; }
    .row { display: grid; gap: 6px; margin: 0 0 12px; font-size: 13px; }
    select, input, button { box-sizing: border-box; min-height: 36px; font: inherit; color: var(--primary-text-color);
      background: var(--card-background-color, transparent); border: 1px solid var(--divider-color); border-radius: 8px; padding: 6px 9px; }
    select { width: 100%; }
    input { width: 100%; min-width: 0; }
    button { cursor: pointer; }
    button:hover { border-color: var(--primary-color); }
    :disabled { opacity: 0.5; cursor: default; }
    .number { display: grid; grid-template-columns: minmax(60px, 1fr) auto auto; align-items: center; gap: 8px; }
    .confirmation { display: grid; gap: 8px; }
    .buttons { display: flex; flex-wrap: wrap; gap: 8px; }
    .error { color: var(--error-color, #db4437); }
  `,e([me({attribute:!1})],Qe.prototype,"hass",void 0),e([me({attribute:!1})],Qe.prototype,"config",void 0),e([me()],Qe.prototype,"language",void 0),e([fe()],Qe.prototype,"_busy",void 0),e([fe()],Qe.prototype,"_error",void 0),e([fe()],Qe.prototype,"_confirmReset",void 0),e([fe()],Qe.prototype,"_drafts",void 0),Qe=e([pe("mqttcomfoair-controls")],Qe),console.info("%c MQTT-COMFOAIR-CARD %c 0.18.0 ","color:orange;font-weight:bold;background:black","color:white;font-weight:bold;background:dimgray"),window.customCards=window.customCards||[],window.customCards.push({type:ze,name:"MQTT Comfoair Card",preview:!1,description:"Control a CA350/550 ventilation unit (hacomfoairmqtt) via MQTT."});const Je="M6,19 H120 L320,113 H434",Ye="M434,19 H320 L120,113 H6";let Xe=class extends ce{static async getConfigElement(){return document.createElement(Ne)}static getStubConfig(e){if(!e)return{entity:""};const t=Object.keys(e.states).find(e=>e.startsWith("climate.")&&/comfo|ca\d{3}|wtw/i.test(e));return t?{entity:t,animation:"static",animation_speed_source:"fixed",animation_speed:50,color_scale:"auto",temp_min:-10,temp_max:30,...Ze(e,t)}:{entity:""}}setConfig(e){if(!e)throw new Error($e("invalid_config",this.hass?.language));this._config=e}getCardSize(){return 5+2*xe.filter(e=>!1!==this._config?.show_controls&&this._config?.[e.key]).length}shouldUpdate(e){if(e.has("_config"))return!0;const t=e.get("hass");if(!t||!this._config||t.language!==this.hass.language||t.locale!==this.hass.locale)return!0;const i=this._config,s=Oe.map(e=>i[e]).filter(e=>!!e);return s.some(e=>t.states[e]!==this.hass.states[e])}render(){if(!this.hass||!this._config)return I``;const e=this._config,t=ve(e.language,this.hass.language),i=e=>$e(e,t),s=this.hass,n=Pe(s,e.entity);if(!n)return I`<ha-card>
        <hui-warning>${i("no_entity")}: ${e.entity||"—"}</hui-warning>
      </ha-card>`;const r=n.attributes.fan_mode,o=r?.toLowerCase(),a=n.attributes.temperature,l="animated"===e.animation,c="fixed"===e.color_scale?"fixed":"auto",d=!!o&&"off"!==o,p=Re(s,e.tempSensor1),u=Re(s,e.tempSensor2),h=Re(s,e.tempSensor3),m=Re(s,e.tempSensor4),f=function(e,t="auto",i=-10,s=30){if("fixed"===t)return[i,s];const n=e.filter(e=>null!=e&&!Number.isNaN(e));if(0===n.length)return[i,s];let r=Math.min(...n),o=Math.max(...n);if(o-r<4){const e=(o+r)/2;r=e-2,o=e+2}const a=.12*(o-r);return[r-a,o+a]}([p,u,h,m],c,Number.isFinite(Number(e.temp_min))?Number(e.temp_min):-10,Number.isFinite(Number(e.temp_max))?Number(e.temp_max):30),[_,g,y,b]=[p,u,h,m].map(e=>function(e,t){if(null==e||Number.isNaN(e))return"var(--disabled-text-color, #888)";const[i,s]=t;return He((e-i)/(s-i||1))}(e,f));let v=1,$=1;if(l){const t="level"===e.animation_speed_source?"level":"fixed";v=et(s,e,t,e.supply_air_level),$=et(s,e,t,e.return_air_level)}const w=(3/v).toFixed(1),x=(3/$).toFixed(1),A=Pe(s,e.bypass_valve)?.state,S="on"===A?null:function(e,t,i){if(null==e||null==t||null==i)return null;const s=t-e;if(s<=.5)return null;const n=(i-e)/s;return n<=0?null:Math.round(100*Math.min(1,n))}(p,h,m),k=[Be("fan",void 0,r,t),Be("filter",Pe(s,e.filterstatus)?.state,void 0,t),Be("bypass",A,void 0,t),Be("preheat",Pe(s,e.preheat)?.state,void 0,t),Be("season",Pe(s,e.summer_mode)?.state,void 0,t)],C=function(e,t){const i=e?.number_format;let s;if(i&&i in Ue)s=Ue[i];else if("system"!==i&&(s=e?.language??t,void 0===s))return",";try{return new Intl.NumberFormat(s).formatToParts(1.5).find(e=>"decimal"===e.type)?.value??","}catch{return","}}(this.hass.locale,this.hass.language),E=e=>{return i=C,/^[-+]?\d*\.\d+$/.test(t=e)?t.replace(".",i):t;var t,i},z=(e,t)=>I`<div class="tempbadge ${t?"clickable":""}" style=${`--fg:${e};--bd:color-mix(in srgb, ${e} 45%, transparent);--bg:color-mix(in srgb, ${e} 14%, transparent)`} @click=${()=>this._moreInfo(t)} title=${t?i("history"):""}><span class="v">${E(Te(s,t))}</span><span class="u">°C</span></div>`,N=(e,t)=>{const i=Re(s,e)??0,n=l&&d&&i>0;return I`<div class="subt ${e?"clickable":""}" @click=${()=>this._moreInfo(e)}>
        <ha-icon class=${n?"spinico spin":"spinico"} style=${n?`animation-duration:${(1.6/t).toFixed(2)}s`:""} icon="mdi:fan"></ha-icon>
        <span>${E(Te(s,e))}</span>&nbsp;rpm
      </div>`},M=e=>I`<div class="subt ${e?"clickable":""}" @click=${()=>this._moreInfo(e)}>
        <ha-icon icon="mdi:gauge"></ha-icon><span>${E(Te(s,e))}</span>&nbsp;%
      </div>`,O=(e,t,i=!1)=>I`<div class="lbl ${i?"rev":""}"><ha-icon icon=${e}></ha-icon>${t}</div>`,P=I`
      <div class="hub corehub">
        <div class="setpc">
          <button @click=${()=>this._stepTemp(-1)} aria-label=${i("colder")}>−</button>
          <div class="val">${null!=a?E(String(a)):"—"}<small>°C</small></div>
          <button @click=${()=>this._stepTemp(1)} aria-label=${i("warmer")}>+</button>
        </div>
        <div class="fanrow">
          ${Me.map(e=>I`<button
              class=${function(e,t){return!!e&&e.toLowerCase()===t.toLowerCase()}(r,e.mode)?"on":""}
              title=${we(e.mode,t)} aria-label=${we(e.mode,t)}
              @click=${()=>this._setFan(e.mode)}
            ><ha-icon icon=${e.icon}></ha-icon></button>`)}
        </div>
      </div>`;return I`
      <ha-card class=${l?"animated":""}>
        <div class="hd">
          <div class="ic"><ha-icon icon="mdi:hvac"></ha-icon></div>
          <div>
            <div class="ttl">${e.name||i("title")}</div>
            <div class="st"><span class="dot ${d?"live":""}"></span><span>${o?we(r,t):"—"}</span></div>
          </div>
          <div class="grow"></div>
          <div class="recov">
            ${null!=S?I`<b>${S}%</b><span>${i("recovery")}</span>`:""}
          </div>
        </div>

        <div class="lanes">
          <div class="trow top">
            <div class="tcell l">${N(e.fan_speed_supply,v)}${z(_,e.tempSensor1)}${O("mdi:tree-outline",i("outdoor"))}</div>
            <div></div>
            <div class="tcell r">${M(e.return_air_level)}${z(y,e.tempSensor3)}${O("mdi:home-thermometer-outline",i("extract"),!0)}</div>
          </div>

          <div class="flowband">
            <svg class="airsvg" viewBox="0 0 440 132" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
              <defs>
                <linearGradient id="gSupply" x1="6" y1="19" x2="434" y2="113" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color=${_}></stop><stop offset="100%" stop-color=${b}></stop>
                </linearGradient>
                <linearGradient id="gExhaust" x1="434" y1="19" x2="6" y2="113" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color=${y}></stop><stop offset="100%" stop-color=${g}></stop>
                </linearGradient>
                <filter id="soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="4.5"></feGaussianBlur></filter>
              </defs>
              <path class="airrib" d=${Je} stroke="url(#gSupply)"></path>
              <path class="airrib" d=${Ye} stroke="url(#gExhaust)"></path>
              <polygon class="airarrow" points="86,11 86,27 102,19"></polygon>
              <polygon class="airarrow" points="354,11 354,27 338,19"></polygon>
              <polygon class="airarrow" points="102,105 102,121 86,113"></polygon>
              <polygon class="airarrow" points="338,105 338,121 354,113"></polygon>
              ${l&&d?this._flowGroup(w,x):""}
            </svg>
            ${P}
          </div>

          <div class="trow bot">
            <div class="tcell l">${O("mdi:export",i("exhaust"))}${z(g,e.tempSensor2)}${N(e.fan_speed_exhaust,$)}</div>
            <div></div>
            <div class="tcell r">${O("mdi:import",i("supply"),!0)}${z(b,e.tempSensor4)}${M(e.supply_air_level)}</div>
          </div>
        </div>

        ${e.show_legend?I`<div class="legend">
          <span class="mn">${Math.round(f[0])}°C</span>
          <div class="bar" style="background:linear-gradient(90deg, ${He(0)}, ${He(.25)}, ${He(.5)}, ${He(.75)}, ${He(1)})"></div>
          <span class="mx">${Math.round(f[1])}°C</span>
        </div>`:""}

        <div class="status">
          ${k.map(e=>I`<div class="chip ${e.active?"on":""}" style="--c:${e.color}">
              <ha-icon icon=${e.icon}></ha-icon>
              <span class="nm">${e.label}</span>
              ${e.sub?I`<span class="vs">${e.sub}</span>`:""}
            </div>`)}
        </div>
        <mqttcomfoair-controls .hass=${this.hass} .config=${e} .language=${t}></mqttcomfoair-controls>
      </ha-card>
    `}_flowGroup(e,t){const i=(Number(e)/2).toFixed(1),s=(Number(t)/2).toFixed(1);return V`<g class="flow-hi" filter="url(#soft)">
      <circle r="11" fill="#fff"><animateMotion path=${Je} dur="${e}s" begin="0s" repeatCount="indefinite"></animateMotion></circle>
      <circle r="11" fill="#fff"><animateMotion path=${Je} dur="${e}s" begin="-${i}s" repeatCount="indefinite"></animateMotion></circle>
      <circle r="11" fill="#fff"><animateMotion path=${Ye} dur="${t}s" begin="0s" repeatCount="indefinite"></animateMotion></circle>
      <circle r="11" fill="#fff"><animateMotion path=${Ye} dur="${t}s" begin="-${s}s" repeatCount="indefinite"></animateMotion></circle>
    </g>`}_moreInfo(e){e&&ye(this,"hass-more-info",{entityId:e})}_setFan(e){this._config.entity&&this.hass.callService("climate","set_fan_mode",{entity_id:this._config.entity,fan_mode:e})}_stepTemp(e){const t=Pe(this.hass,this._config.entity),i=Number(t?.attributes.temperature);if(!Number.isFinite(i))return;const s=Number(t.attributes.target_temp_step),n=Number.isFinite(s)&&s>0?s:.5,r=Number(t.attributes.min_temp),o=Number(t.attributes.max_temp),a=function(e,t,i,s,n){const r=Math.round(10*(e+n*t))/10;return Math.min(s,Math.max(i,r))}(i,n,Number.isFinite(r)?r:-1/0,Number.isFinite(o)?o:1/0,e);this.hass.callService("climate","set_temperature",{entity_id:this._config.entity,temperature:a})}static get styles(){return o`
      ha-card {
        padding: 14px 16px 12px;
        --arrow: rgba(255, 255, 255, 0.92);
      }
      .hd { display: flex; align-items: center; gap: 11px; padding: 2px 2px 12px; }
      .hd .ic {
        width: 34px; height: 34px; border-radius: 10px; flex: none;
        display: flex; align-items: center; justify-content: center;
        background: rgba(var(--rgb-primary-color, 3, 169, 244), 0.14);
        color: var(--primary-color);
      }
      .hd .ttl { font-size: 15.5px; font-weight: 600; letter-spacing: -0.01em; }
      .hd .st { font-size: 12px; color: var(--secondary-text-color); margin-top: 1px; display: flex; align-items: center; gap: 6px; }
      .hd .dot { width: 7px; height: 7px; border-radius: 50%; background: var(--disabled-text-color, #777); }
      .hd .dot.live { background: #36c46b; }
      .hd .grow { flex: 1; }
      .hd .recov { text-align: right; line-height: 1.05; min-height: 30px; }
      .hd .recov b { font-size: 16px; font-weight: 700; letter-spacing: -0.02em; }
      .hd .recov span { display: block; font-size: 10px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--secondary-text-color); margin-top: 1px; }

      .tempbadge {
        display: inline-flex; align-items: baseline; justify-content: center; gap: 1px;
        width: 88px; padding: 3px 4px; border-radius: 10px; line-height: 1;
        font-variant-numeric: tabular-nums;
        background: var(--bg); color: var(--fg); border: 1px solid var(--bd);
        box-shadow: 0 2px 10px -4px rgba(0, 0, 0, 0.5);
        transition: background 0.5s, color 0.5s, border-color 0.5s;
      }
      .tempbadge .v { font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
      .tempbadge .u { font-size: 12px; font-weight: 600; opacity: 0.7; }
      .lbl { font-size: 9.5px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--secondary-text-color); font-weight: 600; display: flex; align-items: center; gap: 5px; }
      .lbl.rev { flex-direction: row-reverse; }
      .lbl ha-icon { --mdc-icon-size: 14px; }
      .subt { font-size: 11px; color: var(--secondary-text-color); display: flex; align-items: center; gap: 4px; font-variant-numeric: tabular-nums; }
      .subt ha-icon { --mdc-icon-size: 15px; opacity: 0.85; }
      .clickable { cursor: pointer; }
      .tempbadge.clickable:hover { filter: brightness(1.08); }
      .subt.clickable:hover { color: var(--primary-text-color); }

      .corehub {
        background: var(--card-background-color);
        border: 1px solid var(--divider-color); border-radius: 15px; padding: 6px 9px;
        box-shadow: 0 6px 22px -6px rgba(0, 0, 0, 0.55);
        display: flex; flex-direction: column; align-items: center; gap: 5px;
      }
      .setpc { display: flex; align-items: center; gap: 6px; }
      .setpc button {
        width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--divider-color);
        background: transparent; color: var(--primary-text-color); font-size: 15px; cursor: pointer;
        display: flex; align-items: center; justify-content: center; transition: 0.15s;
      }
      .setpc button:hover { border-color: var(--primary-color); color: var(--primary-color); }
      .setpc .val { min-width: 56px; text-align: center; font-size: 17px; font-weight: 700; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; }
      .setpc .val small { font-size: 11px; font-weight: 600; color: var(--secondary-text-color); }
      .fanrow { display: flex; gap: 2px; background: rgba(127, 127, 127, 0.14); border-radius: 11px; padding: 3px; }
      .fanrow button {
        width: 32px; height: 26px; border: 0; background: transparent; border-radius: 8px;
        color: var(--secondary-text-color); cursor: pointer; transition: 0.15s;
        display: flex; align-items: center; justify-content: center;
      }
      .fanrow button:hover { color: var(--primary-text-color); }
      .fanrow button.on { background: var(--primary-color); color: #fff; box-shadow: 0 2px 8px -2px var(--primary-color); }
      .fanrow ha-icon { --mdc-icon-size: 18px; }

      .lanes { display: flex; flex-direction: column; gap: 3px; --hub-w: 188px; }
      .trow { display: grid; grid-template-columns: 1fr var(--hub-w) 1fr; gap: 10px; padding: 0 6px; }
      .trow.top { align-items: end; }
      .trow.bot { align-items: start; }
      .tcell { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
      .tcell.l { align-items: flex-start; }
      .tcell.r { align-items: flex-end; text-align: right; }

      .flowband { position: relative; width: 100%; aspect-ratio: 440 / 132; }
      .airsvg { position: absolute; inset: 0; width: 100%; height: 100%; }
      .airrib { fill: none; stroke-width: 38; stroke-linejoin: round; stroke-linecap: round; }
      .airarrow { fill: var(--arrow); filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.28)); }
      .flow-hi { opacity: 0.5; }
      .hub { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); z-index: 4; }

      .spinico.spin { animation-name: spin; animation-timing-function: linear; animation-iteration-count: infinite; transform-origin: center; }
      @keyframes spin { to { transform: rotate(360deg); } }

      .legend { display: flex; align-items: center; gap: 9px; padding: 8px 4px 2px; }
      .legend .bar { flex: 1; height: 7px; border-radius: 4px; }
      .legend .mn, .legend .mx { font-size: 11px; color: var(--secondary-text-color); font-variant-numeric: tabular-nums; font-weight: 600; min-width: 44px; }
      .legend .mx { text-align: right; }

      .status { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--divider-color); }
      .chip { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 7px 2px 4px; border-radius: 11px; color: var(--secondary-text-color); transition: 0.25s; }
      .chip ha-icon { --mdc-icon-size: 23px; transition: 0.25s; }
      .chip .nm { font-size: 10.5px; font-weight: 600; }
      .chip .vs { font-size: 9px; letter-spacing: 0.04em; text-transform: uppercase; color: var(--secondary-text-color); opacity: 0.65; }
      .chip.on { color: var(--c); background: color-mix(in srgb, var(--c) 12%, transparent); }
      .chip.on .vs { color: var(--c); opacity: 0.9; }
      .chip.on ha-icon { filter: drop-shadow(0 0 7px var(--c)); }
    `}};function et(e,t,i,s){return function(e,t,i){if("level"===e){const e=null==i||Number.isNaN(i)?50:i;return Math.min(2.5,Math.max(.2,e/50))}const s=null==t||Number.isNaN(t)?50:t;return Math.min(2,Math.max(.1,s/100))}(i,t.animation_speed,Re(e,s))}e([me({attribute:!1})],Xe.prototype,"hass",void 0),e([fe()],Xe.prototype,"_config",void 0),Xe=e([pe(ze)],Xe);export{Xe as MqttComfoairCard};
