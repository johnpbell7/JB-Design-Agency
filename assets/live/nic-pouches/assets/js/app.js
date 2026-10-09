/* Nic Pouches redesign — shared: header, footer, product card, quick-add popup, basket (drawer + live pricing), search, toast. */
(function(){
'use strict';
var D=window.NP_DATA, C=window.NP_CONTENT;
var P=D.products, BY={};
P.forEach(function(p){BY[p.h]=p;});
var BRANDS=D.brands||[], BRAND_BY_SLUG={}, BRAND_BY_VENDOR={};
BRANDS.forEach(function(b){BRAND_BY_SLUG[b.slug]=b;(b.vendors||[]).forEach(function(v){BRAND_BY_VENDOR[v]=b;});});
var I='assets/img/brand/';

/* ---------- clean image pack: 2x versions (John: "can these cans look higher res?") ----------
   every pack image (assets/img/pk|pkc/<name>.webp, 600px) gets a srcset with its .hi.webp (up to 1200px) and sizes set to
   its laid-out width, so 2x screens load the big file only where the image is shown large enough to need it. */
var HI=D.imgHi||{};
function hiImg(img){
  if(img.dataset.hi)return;var s=img.getAttribute('src')||'';var w=HI[s];if(!w)return;
  img.dataset.hi='1';
  var set=function(){var cw=img.getBoundingClientRect().width;img.sizes=Math.ceil(cw||Math.min(w[0],300))+'px';
    img.srcset=s+' '+w[0]+'w, '+s.replace(/\.webp$/,'.hi.webp')+' '+w[1]+'w';};
  if(img.isConnected&&img.getBoundingClientRect().width)set();else requestAnimationFrame(set);
}
function hiScan(root){if(root.tagName==='IMG')hiImg(root);else if(root.querySelectorAll)Array.prototype.forEach.call(root.querySelectorAll('img[src*="/img/pk"]'),hiImg);}
if(window.MutationObserver){new MutationObserver(function(ms){ms.forEach(function(m){
  if(m.type==='attributes'){m.target.removeAttribute('data-hi');m.target.removeAttribute('srcset');hiImg(m.target);}
  else Array.prototype.forEach.call(m.addedNodes,hiScan);});}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});}
document.addEventListener('DOMContentLoaded',function(){hiScan(document);});

/* ---------- helpers ---------- */
function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function fm(n){return '£'+(Math.round(n*100)/100).toFixed(2);}
function fmp(n){return n<1?Math.round(n*100)+'p':fm(n);}
function mgs(n){return (Math.round(n*10)/10).toString().replace(/\.0$/,'');}
function qs(k){return new URLSearchParams(location.search).get(k);}
var BANDS=C.bands, BAND={};
BANDS.forEach(function(b){BAND[b.key]=b;});

/* ---------- ONE icon family: Phosphor Icons (MIT, @phosphor-icons/core 2.1.1 — reference/icons-LICENSE.txt).
   Bold weight for UI; Fill weight for the offer badges. Paths inlined, no CDN. 256 grid, currentColor. ---------- */
function ic(inner,size){return '<svg class="ico" width="'+(size||20)+'" height="'+(size||20)+'" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">'+inner+'</svg>';}
var PATH={
"plus": "<path d=\"M228,128a12,12,0,0,1-12,12H140v76a12,12,0,0,1-24,0V140H40a12,12,0,0,1,0-24h76V40a12,12,0,0,1,24,0v76h76A12,12,0,0,1,228,128Z\"/>",
"minus": "<path d=\"M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128Z\"/>",
"check": "<path d=\"M232.49,80.49l-128,128a12,12,0,0,1-17,0l-56-56a12,12,0,1,1,17-17L96,183,215.51,63.51a12,12,0,0,1,17,17Z\"/>",
"close": "<path d=\"M208.49,191.51a12,12,0,0,1-17,17L128,145,64.49,208.49a12,12,0,0,1-17-17L111,128,47.51,64.49a12,12,0,0,1,17-17L128,111l63.51-63.52a12,12,0,0,1,17,17L145,128Z\"/>",
"chev": "<path d=\"M216.49,104.49l-80,80a12,12,0,0,1-17,0l-80-80a12,12,0,0,1,17-17L128,159l71.51-71.52a12,12,0,0,1,17,17Z\"/>",
"arrow": "<path d=\"M224.49,136.49l-72,72a12,12,0,0,1-17-17L187,140H40a12,12,0,0,1,0-24H187L135.51,64.48a12,12,0,0,1,17-17l72,72A12,12,0,0,1,224.49,136.49Z\"/>",
"left": "<path d=\"M168.49,199.51a12,12,0,0,1-17,17l-80-80a12,12,0,0,1,0-17l80-80a12,12,0,0,1,17,17L97,128Z\"/>",
"right": "<path d=\"M184.49,136.49l-80,80a12,12,0,0,1-17-17L159,128,87.51,56.49a12,12,0,1,1,17-17l80,80A12,12,0,0,1,184.49,136.49Z\"/>",
"search": "<path d=\"M232.49,215.51,185,168a92.12,92.12,0,1,0-17,17l47.53,47.54a12,12,0,0,0,17-17ZM44,112a68,68,0,1,1,68,68A68.07,68.07,0,0,1,44,112Z\"/>",
"user": "<path d=\"M234.38,210a123.36,123.36,0,0,0-60.78-53.23,76,76,0,1,0-91.2,0A123.36,123.36,0,0,0,21.62,210a12,12,0,1,0,20.77,12c18.12-31.32,50.12-50,85.61-50s67.49,18.69,85.61,50a12,12,0,0,0,20.77-12ZM76,96a52,52,0,1,1,52,52A52.06,52.06,0,0,1,76,96Z\"/>",
"bag": "<path d=\"M243.86,197.65l-14.25-120A20.06,20.06,0,0,0,209.67,60H179.83A52,52,0,0,0,76.17,60H46.33A20.06,20.06,0,0,0,26.39,77.65l-14.25,120A20,20,0,0,0,32.08,220H223.92a20,20,0,0,0,19.94-22.35ZM128,36a28,28,0,0,1,27.71,24H100.29A28,28,0,0,1,128,36ZM36.5,196,49.81,84H76v20a12,12,0,0,0,24,0V84h56v20a12,12,0,0,0,24,0V84h26.19L219.5,196Z\"/>",
"menu": "<path d=\"M228,128a12,12,0,0,1-12,12H40a12,12,0,0,1,0-24H216A12,12,0,0,1,228,128ZM40,76H216a12,12,0,0,0,0-24H40a12,12,0,0,0,0,24ZM216,180H40a12,12,0,0,0,0,24H216a12,12,0,0,0,0-24Z\"/>",
"filter": "<path d=\"M204,136a12,12,0,0,1-12,12H64a12,12,0,0,1,0-24H192A12,12,0,0,1,204,136Zm28-60H24a12,12,0,0,0,0,24H232a12,12,0,0,0,0-24Zm-80,96H104a12,12,0,0,0,0,24h48a12,12,0,0,0,0-24Z\"/>",
"points": "<path d=\"M188,86.11V84c0-14.62-10.83-27.55-30.51-36.4C140.87,40.12,119,36,96,36S51.13,40.12,34.51,47.6C14.83,56.45,4,69.38,4,84v40c0,14.62,10.83,27.55,30.51,36.4A131.67,131.67,0,0,0,68,169.88V172c0,14.62,10.83,27.55,30.51,36.4C115.13,215.88,137,220,160,220s44.87-4.12,61.49-11.6C241.17,199.55,252,186.62,252,172V132C252,109.86,226.71,92.08,188,86.11ZM228,132c0,7.75-21.77,22.48-61.81,23.88C180.33,147.4,188,136.3,188,124V110.44C213.88,115.15,228,125.48,228,132ZM107.37,147.63c-3.63.24-7.42.37-11.37.37-5.08,0-9.89-.22-14.43-.61a10.94,10.94,0,0,0-1.14-.09c-1.51-.14-3-.3-4.43-.48V130.93A187,187,0,0,0,96,132a187,187,0,0,0,20-1.07v15.89c-2.49.3-5.07.56-7.75.75C108,147.58,107.66,147.6,107.37,147.63ZM164,117.14V124c0,4.78-8.28,12.21-24,17.54v-15a115.32,115.32,0,0,0,17.49-6.13Q160.93,118.86,164,117.14ZM96,60c44,0,68,15.85,68,24s-24,24-68,24S28,92.15,28,84,52,60,96,60ZM28,124v-6.86q3.08,1.71,6.51,3.26A115.32,115.32,0,0,0,52,126.53v15C36.28,136.21,28,128.78,28,124Zm64,48v0c1.33,0,2.66,0,4,0q5.44,0,10.77-.32,4.45,1.57,9.23,2.86v15C100.28,184.21,92,176.78,92,172Zm48,22.82V178.94A186.45,186.45,0,0,0,160,180a187,187,0,0,0,20-1.07v15.89a170.08,170.08,0,0,1-40,0Zm64-5.28v-15a115.32,115.32,0,0,0,17.49-6.13q3.44-1.54,6.51-3.26V172C228,176.78,219.72,184.21,204,189.54Z\"/>",
"mix": "<path d=\"M240.49,175.51a12,12,0,0,1,0,17l-24,24a12,12,0,0,1-17-17L203,196h-2.09a76.17,76.17,0,0,1-61.85-31.83L97.38,105.78A52.1,52.1,0,0,0,55.06,84H32a12,12,0,0,1,0-24H55.06a76.17,76.17,0,0,1,61.85,31.83l41.71,58.39A52.1,52.1,0,0,0,200.94,172H203l-3.52-3.51a12,12,0,0,1,17-17Zm-95.62-72.62a12,12,0,0,0,16.93-1.13A52,52,0,0,1,200.94,84H203l-3.52,3.51a12,12,0,0,0,17,17l24-24a12,12,0,0,0,0-17l-24-24a12,12,0,0,0-17,17L203,60h-2.09a76,76,0,0,0-57.2,26A12,12,0,0,0,144.87,102.89Zm-33.74,50.22a12,12,0,0,0-16.93,1.13A52,52,0,0,1,55.06,172H32a12,12,0,0,0,0,24H55.06a76,76,0,0,0,57.2-26A12,12,0,0,0,111.13,153.11Z\"/>",
"deal": "<path d=\"M228.75,100.05c-3.52-3.67-7.15-7.46-8.34-10.33-1.06-2.56-1.14-7.83-1.21-12.47-.15-10-.34-22.44-9.18-31.27s-21.27-9-31.27-9.18c-4.64-.07-9.9-.15-12.47-1.21-2.87-1.19-6.66-4.82-10.33-8.34C148.87,20.46,140.05,12,128,12s-20.87,8.46-27.95,15.25c-3.67,3.52-7.46,7.15-10.33,8.34-2.56,1.06-7.83,1.14-12.47,1.21C67.25,37,54.81,37.14,46,46S37,67.25,36.8,77.25c-.07,4.64-.15,9.91-1.21,12.47-1.19,2.87-4.82,6.66-8.34,10.33C20.46,107.13,12,116,12,128S20.46,148.87,27.25,156c3.52,3.67,7.15,7.46,8.34,10.33,1.06,2.56,1.14,7.83,1.21,12.47.15,10,.34,22.44,9.18,31.27s21.27,9,31.27,9.18c4.64.07,9.9.15,12.47,1.21,2.87,1.19,6.66,4.82,10.33,8.34C107.13,235.54,116,244,128,244s20.87-8.46,27.95-15.25c3.67-3.52,7.46-7.15,10.33-8.34,2.56-1.06,7.83-1.14,12.47-1.21,10-.15,22.44-.34,31.27-9.18s9-21.27,9.18-31.27c.07-4.64.15-9.91,1.21-12.47,1.19-2.87,4.82-6.66,8.34-10.33C235.54,148.87,244,140.05,244,128S235.54,107.13,228.75,100.05Zm-17.32,39.29c-4.82,5-10.28,10.72-13.19,17.76-2.82,6.8-2.93,14.17-3,21.29-.08,5.36-.19,12.71-2.15,14.66s-9.3,2.07-14.66,2.15c-7.13.11-14.49.22-21.29,3-7,2.92-12.73,8.38-17.76,13.2C135.78,214.84,130.4,220,128,220s-7.78-5.16-11.34-8.57c-5-4.82-10.72-10.28-17.76-13.2-6.8-2.81-14.17-2.92-21.29-3-5.36-.08-12.71-.19-14.66-2.15s-2.07-9.3-2.15-14.66c-.11-7.13-.22-14.49-3-21.29-2.91-7-8.37-12.74-13.19-17.76C41.16,135.78,36,130.4,36,128s5.16-7.78,8.57-11.34c4.82-5,10.28-10.72,13.19-17.76,2.82-6.8,2.93-14.17,3-21.29C60.88,72.25,61,64.9,63,63s9.3-2.07,14.66-2.15c7.13-.11,14.49-.22,21.29-3,7-2.92,12.73-8.38,17.76-13.2C120.22,41.16,125.6,36,128,36s7.78,5.16,11.34,8.57c5,4.82,10.72,10.28,17.76,13.2,6.8,2.81,14.17,2.92,21.29,3,5.36.08,12.71.19,14.66,2.15s2.07,9.3,2.15,14.66c.11,7.13.22,14.49,3,21.29,2.91,7,8.37,12.74,13.19,17.76,3.41,3.56,8.57,8.94,8.57,11.34S214.84,135.78,211.43,139.34ZM80,96a16,16,0,1,1,16,16A16,16,0,0,1,80,96Zm96,64a16,16,0,1,1-16-16A16,16,0,0,1,176,160Zm.49-80.49a12,12,0,0,1,0,17l-80,80a12,12,0,0,1-17-17l80-80A12,12,0,0,1,176.49,79.51Z\"/>",
"truck": "<path d=\"M255.14,115.54l-14-35A19.89,19.89,0,0,0,222.58,68H196V64a12,12,0,0,0-12-12H32A20,20,0,0,0,12,72V184a20,20,0,0,0,20,20H46.06a36,36,0,0,0,67.88,0h44.12a36,36,0,0,0,67.88,0H236a20,20,0,0,0,20-20V120A21.7,21.7,0,0,0,255.14,115.54ZM196,92h23.88l6.4,16H196ZM80,204a12,12,0,1,1,12-12A12,12,0,0,1,80,204Zm92-41.92A36.32,36.32,0,0,0,158.06,180H113.94a36,36,0,0,0-67.88,0H36V140H172ZM172,116H36V76H172Zm20,88a12,12,0,1,1,12-12A12,12,0,0,1,192,204Zm40-24h-6.06A36.09,36.09,0,0,0,196,156.23V132h36Z\"/>",
"clock": "<path d=\"M128,20A108,108,0,1,0,236,128,108.12,108.12,0,0,0,128,20Zm0,192a84,84,0,1,1,84-84A84.09,84.09,0,0,1,128,212Zm68-84a12,12,0,0,1-12,12H128a12,12,0,0,1-12-12V72a12,12,0,0,1,24,0v44h44A12,12,0,0,1,196,128Z\"/>",
"bell": "<path d=\"M225.29,165.93C216.61,151,212,129.57,212,104a84,84,0,0,0-168,0c0,25.58-4.59,47-13.27,61.93A20.08,20.08,0,0,0,30.66,186,19.77,19.77,0,0,0,48,196H84.18a44,44,0,0,0,87.64,0H208a19.77,19.77,0,0,0,17.31-10A20.08,20.08,0,0,0,225.29,165.93ZM128,212a20,20,0,0,1-19.6-16h39.2A20,20,0,0,1,128,212ZM54.66,172C63.51,154,68,131.14,68,104a60,60,0,0,1,120,0c0,27.13,4.48,50,13.33,68Z\"/>",
"tag": "<path d=\"M246.15,133.18,146.83,33.86A19.85,19.85,0,0,0,132.69,28H40A12,12,0,0,0,28,40v92.69a19.85,19.85,0,0,0,5.86,14.14l99.32,99.32a20,20,0,0,0,28.28,0l84.69-84.69A20,20,0,0,0,246.15,133.18Zm-98.83,93.17L52,131V52h79l95.32,95.32ZM104,88A16,16,0,1,1,88,72,16,16,0,0,1,104,88Z\"/>",
"star": "<path d=\"M243,96a20.33,20.33,0,0,0-17.74-14l-56.59-4.57L146.83,24.62a20.36,20.36,0,0,0-37.66,0L87.35,77.44,30.76,82A20.45,20.45,0,0,0,19.1,117.88l43.18,37.24-13.2,55.7A20.37,20.37,0,0,0,79.57,233L128,203.19,176.43,233a20.39,20.39,0,0,0,30.49-22.15l-13.2-55.7,43.18-37.24A20.43,20.43,0,0,0,243,96ZM172.53,141.7a12,12,0,0,0-3.84,11.86L181.58,208l-47.29-29.08a12,12,0,0,0-12.58,0L74.42,208l12.89-54.4a12,12,0,0,0-3.84-11.86L41.2,105.24l55.4-4.47a12,12,0,0,0,10.13-7.38L128,41.89l21.27,51.5a12,12,0,0,0,10.13,7.38l55.4,4.47Z\"/>",
"whatsapp": "<path d=\"M187.3,159.06A36.09,36.09,0,0,1,152,188a84.09,84.09,0,0,1-84-84A36.09,36.09,0,0,1,96.94,68.7,12,12,0,0,1,110,75.1l11.48,23a12,12,0,0,1-.75,12l-8.52,12.78a44.56,44.56,0,0,0,20.91,20.91l12.78-8.52a12,12,0,0,1,12-.75l23,11.48A12,12,0,0,1,187.3,159.06ZM236,128A108,108,0,0,1,78.77,224.15L46.34,235A20,20,0,0,1,21,209.66l10.81-32.43A108,108,0,1,1,236,128Zm-24,0A84,84,0,1,0,55.27,170.06a12,12,0,0,1,1,9.81l-9.93,29.79,29.79-9.93a12.1,12.1,0,0,1,3.8-.62,12,12,0,0,1,6,1.62A84,84,0,0,0,212,128Z\"/>"
};
var PATH_FILL={
"points": "<path d=\"M184,89.57V84c0-25.08-37.83-44-88-44S8,58.92,8,84v40c0,20.89,26.25,37.49,64,42.46V172c0,25.08,37.83,44,88,44s88-18.92,88-44V132C248,111.3,222.58,94.68,184,89.57ZM56,146.87C36.41,141.4,24,132.39,24,124V109.93c8.16,5.78,19.09,10.44,32,13.57Zm80-23.37c12.91-3.13,23.84-7.79,32-13.57V124c0,8.39-12.41,17.4-32,22.87Zm-16,71.37C100.41,189.4,88,180.39,88,172v-4.17c2.63.1,5.29.17,8,.17,3.88,0,7.67-.13,11.39-.35A121.92,121.92,0,0,0,120,171.41Zm0-44.62A163,163,0,0,1,96,152a163,163,0,0,1-24-1.75V126.46A183.74,183.74,0,0,0,96,128a183.74,183.74,0,0,0,24-1.54Zm64,48a165.45,165.45,0,0,1-48,0V174.4a179.48,179.48,0,0,0,24,1.6,183.74,183.74,0,0,0,24-1.54ZM232,172c0,8.39-12.41,17.4-32,22.87V171.5c12.91-3.13,23.84-7.79,32-13.57Z\"/>",
"mix": "<path d=\"M237.66,178.34a8,8,0,0,1,0,11.32l-24,24A8,8,0,0,1,200,208V192a72.15,72.15,0,0,1-57.65-30.14l-41.72-58.4A56.1,56.1,0,0,0,55.06,80H32a8,8,0,0,1,0-16H55.06a72.12,72.12,0,0,1,58.59,30.15l41.72,58.4A56.08,56.08,0,0,0,200,176V160a8,8,0,0,1,13.66-5.66ZM143,107a8,8,0,0,0,11.16-1.86l1.2-1.67A56.08,56.08,0,0,1,200,80V96a8,8,0,0,0,13.66,5.66l24-24a8,8,0,0,0,0-11.32l-24-24A8,8,0,0,0,200,48V64a72.15,72.15,0,0,0-57.65,30.14l-1.2,1.67A8,8,0,0,0,143,107Zm-30,42a8,8,0,0,0-11.16,1.86l-1.2,1.67A56.1,56.1,0,0,1,55.06,176H32a8,8,0,0,0,0,16H55.06a72.12,72.12,0,0,0,58.59-30.15l1.2-1.67A8,8,0,0,0,113,149Z\"/>",
"deal": "<path d=\"M96,104a8,8,0,1,1,8-8A8,8,0,0,1,96,104Zm64,48a8,8,0,1,0,8,8A8,8,0,0,0,160,152Zm80-24c0,10.44-7.51,18.27-14.14,25.18-3.77,3.94-7.67,8-9.14,11.57-1.36,3.27-1.44,8.69-1.52,13.94-.15,9.76-.31,20.82-8,28.51s-18.75,7.85-28.51,8c-5.25.08-10.67.16-13.94,1.52-3.57,1.47-7.63,5.37-11.57,9.14C146.27,232.49,138.44,240,128,240s-18.27-7.51-25.18-14.14c-3.94-3.77-8-7.67-11.57-9.14-3.27-1.36-8.69-1.44-13.94-1.52-9.76-.15-20.82-.31-28.51-8s-7.85-18.75-8-28.51c-.08-5.25-.16-10.67-1.52-13.94-1.47-3.57-5.37-7.63-9.14-11.57C23.51,146.27,16,138.44,16,128s7.51-18.27,14.14-25.18c3.77-3.94,7.67-8,9.14-11.57,1.36-3.27,1.44-8.69,1.52-13.94.15-9.76.31-20.82,8-28.51s18.75-7.85,28.51-8c5.25-.08,10.67-.16,13.94-1.52,3.57-1.47,7.63-5.37,11.57-9.14C109.73,23.51,117.56,16,128,16s18.27,7.51,25.18,14.14c3.94,3.77,8,7.67,11.57,9.14,3.27,1.36,8.69,1.44,13.94,1.52,9.76.15,20.82.31,28.51,8s7.85,18.75,8,28.51c.08,5.25.16,10.67,1.52,13.94,1.47,3.57,5.37,7.63,9.14,11.57C232.49,109.73,240,117.56,240,128ZM96,120A24,24,0,1,0,72,96,24,24,0,0,0,96,120Zm77.66-26.34a8,8,0,0,0-11.32-11.32l-80,80a8,8,0,0,0,11.32,11.32ZM184,160a24,24,0,1,0-24,24A24,24,0,0,0,184,160Z\"/>"
};
Object.assign(PATH_FILL,{"clock": "<path d=\"M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm56,112H128a8,8,0,0,1-8-8V72a8,8,0,0,1,16,0v48h48a8,8,0,0,1,0,16Z\"/>", "truck": "<path d=\"M255.43,117l-14-35A15.93,15.93,0,0,0,226.58,72H192V64a8,8,0,0,0-8-8H32A16,16,0,0,0,16,72V184a16,16,0,0,0,16,16H49a32,32,0,0,0,62,0h50a32,32,0,0,0,62,0h17a16,16,0,0,0,16-16V120A8.13,8.13,0,0,0,255.43,117ZM80,208a16,16,0,1,1,16-16A16,16,0,0,1,80,208ZM32,136V72H176v64Zm160,72a16,16,0,1,1,16-16A16,16,0,0,1,192,208Zm0-96V88h34.58l9.6,24Z\"/>", "tag": "<path d=\"M243.31,136,144,36.69A15.86,15.86,0,0,0,132.69,32H40a8,8,0,0,0-8,8v92.69A15.86,15.86,0,0,0,36.69,144L136,243.31a16,16,0,0,0,22.63,0l84.68-84.68a16,16,0,0,0,0-22.63ZM84,96A12,12,0,1,1,96,84,12,12,0,0,1,84,96Z\"/>", "bell": "<path d=\"M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216Z\"/>"});
Object.assign(PATH_FILL,{"fire": "<path d=\"M143.38,17.85a8,8,0,0,0-12.63,3.41l-22,60.41L84.59,58.26a8,8,0,0,0-11.93.89C51,87.53,40,116.08,40,144a88,88,0,0,0,176,0C216,84.55,165.21,36,143.38,17.85Zm40.51,135.49a57.6,57.6,0,0,1-46.56,46.55A7.65,7.65,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68Z\"/>", "sparkle": "<path d=\"M208,144a15.78,15.78,0,0,1-10.42,14.94L146,178l-19,51.62a15.92,15.92,0,0,1-29.88,0L78,178l-51.62-19a15.92,15.92,0,0,1,0-29.88L78,110l19-51.62a15.92,15.92,0,0,1,29.88,0L146,110l51.62,19A15.78,15.78,0,0,1,208,144ZM152,48h16V64a8,8,0,0,0,16,0V48h16a8,8,0,0,0,0-16H184V16a8,8,0,0,0-16,0V32H152a8,8,0,0,0,0,16Zm88,32h-8V72a8,8,0,0,0-16,0v8h-8a8,8,0,0,0,0,16h8v8a8,8,0,0,0,16,0V96h8a8,8,0,0,0,0-16Z\"/>", "stack": "<path d=\"M220,169.09l-92,53.65L36,169.09A8,8,0,0,0,28,182.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,169.09Z\"/><path d=\"M220,121.09l-92,53.65L36,121.09A8,8,0,0,0,28,134.91l96,56a8,8,0,0,0,8.06,0l96-56A8,8,0,1,0,220,121.09Z\"/><path d=\"M28,86.91l96,56a8,8,0,0,0,8.06,0l96-56a8,8,0,0,0,0-13.82l-96-56a8,8,0,0,0-8.06,0l-96,56a8,8,0,0,0,0,13.82Z\"/>", "cards": "<path d=\"M200,88V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V88A16,16,0,0,1,40,72H184A16,16,0,0,1,200,88Zm16-48H64a8,8,0,0,0,0,16H216V176a8,8,0,0,0,16,0V56A16,16,0,0,0,216,40Z\"/>"});
var ICON={};
Object.keys(PATH).forEach(function(k){ICON[k]=ic(PATH[k]);});
ICON.plus16=ic(PATH.plus,16);ICON.minus16=ic(PATH.minus,16);ICON.x=ic(PATH.close,12);ICON.chev=ic(PATH.chev,14);ICON.arrow=ic(PATH.arrow,14);
ICON.left=ic(PATH.left,16);ICON.right=ic(PATH.right,16);ICON.star15=ic(PATH.star,15);
/* Round 8 phone header (John: "fix the menu layout on mobile to match current size"): thin glyphs to match the live
   site's outlined icons. Phosphor Regular geometry (MIT; 256 grid, 16-unit round stroke), drawn as strokes. */
function icr(inner,px){px=px||24;return '<svg class="ico-r" width="'+px+'" height="'+px+'" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+inner+'</svg>';}
var ICR={search:icr('<circle cx="112" cy="112" r="80"/><line x1="168.57" y1="168.57" x2="224" y2="224"/>'),
  user:icr('<circle cx="128" cy="128" r="96"/><circle cx="128" cy="120" r="40"/><path d="M63.8,199.37a72,72,0,0,1,128.4,0"/>'),
  bag:icr('<path d="M208.8,72H47.2a8,8,0,0,0-8,7.1l-14.2,128a8,8,0,0,0,8,8.9H223.2a8,8,0,0,0,8-8.9l-14.2-128A8,8,0,0,0,208.8,72Z"/><path d="M88,104V72a40,40,0,0,1,80,0v32"/>'),
  menu:icr('<line class="b1" x1="40" y1="64" x2="216" y2="64"/><line class="b2" x1="40" y1="128" x2="216" y2="128"/><line class="b3" x1="40" y1="192" x2="216" y2="192"/>')};
/* offer ideas in solid badges: points (blue), Mix & Match (live lime), deals (amber); Fill glyph at ~60% of the badge */
var BADGE={points:'blue',mix:'mm',deal:'amber',truck:'blue',clock:'blue',bell:'blue',tag:'blue'};
/* feedback 5: every informational icon in a group = the same solid brand-blue badge with a white Fill glyph */
function ib(name,px){px=px||20;return '<span class="ibx" style="width:'+px+'px;height:'+px+'px">'+ic(PATH_FILL[name]||PATH[name],Math.round(px*.6))+'</span>';}
/* Mix & Match mark, built like the NP mark: white 2px circle outline + bold white shuffle arrows */
var MIX_MARK='<svg class="ico" width="SZ" height="SZ" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="#fff" stroke-width="2"/><g transform="translate(6.6 6.6) scale(.0734)" fill="#fff">'+PATH.mix.replace(/fill="[^"]*"/g,'')+'</g></svg>';
/* savings + points as two different pills (feedback 5.7): green = money saved, blue = points earned */
function spPair(save,pts,dispId){return '<div class="sp-pair">'+(save>0.004?'<span class="sp sp--save" aria-label="You save '+fm(save)+'">'+ic(PATH_FILL.tag,14)+'<span class="sp__t"><span class="sp__l">You save</span><span class="sp__s">Save</span> '+fm(save)+'</span></span>':'')+(pts?'<span class="sp sp--pts" aria-label="Earn '+Math.round(pts)+' points">'+ic(PATH_FILL.points,14)+'<span class="sp__t"><span class="sp__l">Earn </span>'+Math.round(pts)+' pts</span></span>':'')+
  (dispId?'<span class="sp sp--disp" aria-label="Same day dispatch countdown">'+ic(PATH_FILL.clock,14)+'<span class="sp__t"><span class="sp__l">Dispatch </span><span class="cd" id="'+dispId+'" data-short="1"></span></span></span>':'')+'</div>';}
var NP_MARK='<svg class="ico" width="SZ" height="SZ" viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="14" fill="none" stroke="#fff" stroke-width="2"/><path fill="#fff" d="M7.4 21.6V10.4h2.7l3.2 5.6v-5.6h2.5v11.2h-2.5l-3.3-5.7v5.7z"/><path fill="#fff" fill-rule="evenodd" d="M16.9 21.6V10.4h4.1a3.7 3.7 0 0 1 0 7.4h-1.5v3.8zm2.6-9v3h1.3a1.5 1.5 0 0 0 0-3z"/></svg>';
var MIX_GLYPH='stack';          /* Mix & Match tile glyph (Phosphor Fill) */
function badge(name,size){if(name==='points'&&size!=='sm'){var z=size==='lg'?40:36;return '<span class="ibadge ibadge--blue ibadge--np">'+NP_MARK.replace(/SZ/g,z)+'</span>';}
  if(name==='mix'){var mz=size==='sm'?20:36;var mk=MIX_MARK.replace(/SZ/g,mz);if(size==='sm')mk=mk.replace(/#fff/g,'#181d27');return '<span class="ibadge ibadge--mm'+(size?' ibadge--'+size+' ibadge--mmsm':'')+'">'+mk+'</span>';}
var px=size==='sm'?18:size==='lg'?36:34;var g=PATH_FILL[name]||PATH[name];return '<span class="ibadge ibadge--'+(BADGE[name]||'ink')+(size?' ibadge--'+size:'')+'">'+ic(g,px)+'</span>';}

/* ---------- brands ---------- */
function logoBox(b,size){if(!b)return '';var src=b.logo||b.menuImage;return '<span class="lbox'+(size?' lbox--'+size:'')+(b.logoDark?' lbox--dark':'')+(b.logoAspect&&b.logoAspect<1.6?' lbox--square':'')+'"><img src="'+esc(src)+'" alt="'+esc(b.short)+' logo" loading="lazy"></span>';}
function brandOf(p){return BRAND_BY_VENDOR[p.brand]||null;}
function brandUrl(vendorOrSlug){var b=BRAND_BY_SLUG[vendorOrSlug]||BRAND_BY_VENDOR[vendorOrSlug];return b?'brand.html?b='+b.slug:(D.vendorColl&&D.vendorColl[vendorOrSlug])||'shop.html?brand='+encodeURIComponent(vendorOrSlug);}
function brandName(v){var b=BRAND_BY_VENDOR[v];return b?b.short:v;}

/* ---------- product helpers ---------- */
function variants(p){return p.v||[];}
function anyStock(p){return variants(p).some(function(v){return v.ok;});}
function firstOk(p){return variants(p).filter(function(v){return v.ok;})[0]||variants(p)[0];}
function findV(p,vid){return variants(p).filter(function(v){return v.id===vid;})[0]||firstOk(p);}
function bandLvl(b){return b&&BAND[b]?BAND[b].lvl:0;}
function range(p){
  var vs=variants(p).filter(function(v){return v.mg!=null;});
  var mg=vs.map(function(v){return v.mg;}).filter(function(x,i,a){return a.indexOf(x)===i;}).sort(function(a,b){return a-b;});
  var top=null,low=null;vs.forEach(function(v){if(v.band&&bandLvl(v.band)>bandLvl(top))top=v.band;if(v.band&&(!low||bandLvl(v.band)<bandLvl(low)))low=v.band;});
  return {mg:mg,top:top,low:low};
}
function meter(band,big){
  var l=bandLvl(band),h='<span class="meter'+(big?' meter--lg':'')+'" data-b="'+(band||'')+'" aria-hidden="true">';
  for(var i=1;i<=5;i++)h+='<i class="'+(i<=l?'on':'')+'"></i>';
  return h+'</span>';
}
function strengthText(p){
  var r=range(p);
  if(p.kind==='caffeine')return r.mg.length?mgs(r.mg[0])+'mg caffeine':'Caffeine';
  if(!r.mg.length)return '';
  if(r.mg.length<=3)return r.mg.map(mgs).join(' · ')+'mg';
  return mgs(r.mg[0])+'–'+mgs(r.mg[r.mg.length-1])+'mg';
}
function bandLabel(p){var r=range(p);if(!r.top)return '';return r.low&&r.low!==r.top?BAND[r.low].name+' to '+BAND[r.top].name:BAND[r.top].name;}
function basePrice(p,v){v=v||firstOk(p);return v?v.price:0;}
/* the live card line: the "Best value" pack (else the cheapest), "£x pp | Save £y" */
function bestTier(p){var t=p.tiers||[];var b=t.filter(function(x){return x.best;})[0];return b||t.reduce(function(a,x){return !a||x.p<a.p?x:a;},null);}
function tierSave(p,t,v){v=v||firstOk(p);if(!t||!v)return 0;if(p.kind==='bundle')return Math.max(0,((v.was||v.price)-t.p)*t.q);return Math.max(0,(v.price-t.p)*t.q);}
function perCan(p){var t=bestTier(p);return t?t.p:basePrice(p);}
function tagsFor(p,max){
  var t=[];
  if(!anyStock(p))t.push('<span class="tag tag--solid">Sold out</span>');
  /* the deal now sits in the amber pill under the title, so it isn't repeated on the image (feedback 4) */
  if(p.kind==='99p')t.push('<span class="tag tag--coral">99p</span>');
  if(p.isHot)t.push('<span class="tag tag--hot">Hot</span>');
  if(p.isNew)t.push('<span class="tag tag--new">New</span>');
  return t.slice(0,max||2).join('');
}
function url(p){return 'product.html?p='+encodeURIComponent(p.h);}

/* ---------- PRODUCT CARD v2 ----------
   image (mg-per-pouch badge top right, max 2 tags top left, + bottom right)
   brand · name · "Strength (mg)" chips (every strength, tappable) · price · "£x pp · Save £y" */
var cardSel={};
(function(){var d=(D.meta&&D.meta.railDefaults)||{};Object.keys(d).forEach(function(h){var p=BY[h];if(!p)return;var v=p.v.filter(function(x){return x.t===d[h]&&x.ok&&!x.imgFallback;})[0];if(v)cardSel[h]=v.id;});})();                                 /* card -> selected variant id (kept across re-renders) */
function selV(p){var id=cardSel[p.h];var v=id&&variants(p).filter(function(x){return x.id===id;})[0];return v||firstOk(p);}
/* the mg-per-pouch badge: a small white nicotine-pouch "pillow" (SVG), tiny strength dot inside */
/* the mg badge: a small white nicotine-pouch "pillow" (SVG), selected strength only, tiny band dot */
var POUCH='<svg class="pouch__shape" viewBox="0 0 48 26" preserveAspectRatio="none" aria-hidden="true"><path d="M7 1.8C15 .4 33 .4 41 1.8c4.2.8 5.8 3.6 5.8 11.2S45.2 23.4 41 24.2c-8 1.4-26 1.4-34 0C2.8 23.4 1.2 20.6 1.2 13S2.8 2.6 7 1.8z"/></svg>';
function mgBadge(p,v){
  if(!v||v.mg==null)return '';
  var lab=mgs(v.mg)+'mg'+(p.kind==='caffeine'?' caffeine':' nicotine');
  return '<span class="pouch" data-b="'+(v.band||'')+'" role="img" aria-label="'+lab+'" title="'+lab+'">'+POUCH+'<span class="pouch__t"><span class="pouch__l1"><b>'+mgs(v.mg)+'</b><small>mg</small></span><small class="pouch__l2">'+(p.kind==='caffeine'?'caffeine':'p/pouch')+'</small></span></span>';
}
/* products without a strength (snacks, sweets, some caffeine and strips): their own live option as chips */
function optVs(p){return variants(p).length>1&&variants(p).every(function(x){return x.mg==null;})?variants(p):[];}
function optChips(p,v,attr,cls){var vs=optVs(p);if(!vs.length)return '';
  return '<div class="pc__chips pc__chips--txt '+(cls||'')+'" role="radiogroup" aria-label="'+esc(p.opt||'Options')+'">'+vs.map(function(x){
    return '<button type="button" class="mgc mgc--txt'+(x.ok?'':' is-oos')+'" role="radio" aria-checked="'+(x.id===v.id)+'" '+attr+'="'+x.id+'"'+(x.ok?'':' aria-disabled="true"')+'>'+esc(x.t)+'</button>';}).join('')+'</div>';}
function chipsHTML(p,v){
  var vs=variants(p).filter(function(x){return x.mg!=null;});
  if(!vs.length){var oc=optChips(p,v,'data-cv','pc__chips--card');return oc?'<div class="pc__str"><span class="pc__strl">'+esc(p.opt||'Options')+'</span>'+oc+'</div>':'';}
  return '<div class="pc__str"><span class="pc__strl">'+(p.kind==='caffeine'?'Caffeine (mg)':'Strength (mg)')+'</span><div class="pc__chips pc__chips--card'+(vs.length>5?' pc__chips--many':'')+'" role="radiogroup" aria-label="Strength">'+
    vs.map(function(x){var on=x.id===v.id;return '<button type="button" class="mgc'+(x.ok?'':' is-oos')+'" role="radio" aria-checked="'+on+'" data-cv="'+x.id+'" data-b="'+(x.band||'')+'" aria-label="'+esc(x.t)+(x.ok?'':', out of stock')+'"'+(x.ok?'':' aria-disabled="true"')+'>'+mgs(x.mg)+'</button>';}).join('')+'</div></div>';
}
function cardHTML(p){
  /* feedback 6: one price row — the lowest per-can price is the headline ("from £1.99 pp", Save £x) */
  var ok=anyStock(p), v=selV(p), t=bestTier(p), price, line='';
  if(p.kind==='99p'){price='<span class="pp__main"><b>99p</b></span>';line='<span class="pc__deal">1 Per Order | Limited Stock</span>';}
  else if(p.kind==='bundle'){price='<span class="pp__main"><b>'+fm(basePrice(p,v))+'</b></span>';}
  else{
    var base=basePrice(p,v), low=t&&t.p<base-0.001?t.p:base, sv=tierSave(p,t,v);
    price='<span class="pp__main">'+(low<base-0.001?'<small>from</small>':'')+'<b>'+fm(low)+'</b>'+(low<base-0.001?'<small>pp</small>':'')+'</span>'+(sv>0.004?'<em class="pp__save">Save '+fm(sv)+'</em>':'');
  }
  return '<article class="pc'+(ok?'':' is-oos')+'" data-h="'+esc(p.h)+'">'+
    '<div class="pc__mediawrap"><a class="pc__media" href="'+url(p)+'" tabindex="-1" aria-hidden="true"><img src="'+esc((v&&v.img)||p.img)+'" alt="" loading="lazy" width="400" height="400"></a>'+
    '<span class="pc__tags">'+tagsFor(p,1)+'</span>'+mgBadge(p,v)+
    (ok?'<button class="pc__add" type="button" data-quick="'+esc(p.h)+'" aria-haspopup="dialog" aria-label="Choose a bundle of '+esc(p.title)+'">'+ICON.plus+'</button>':
       '<button class="pc__add pc__add--notify" type="button" data-quick="'+esc(p.h)+'" aria-haspopup="dialog" aria-label="Notify me when '+esc(p.title)+' is back in stock" title="Notify me">'+ic(PATH_FILL.bell,18)+'</button>')+'</div>'+
    '<div class="pc__body"><a class="pc__brand" href="'+brandUrl(p.brand)+'">'+esc(p.brand)+'</a>'+
    '<a class="pc__name" href="'+url(p)+'">'+esc(p.name)+'</a>'+chipsHTML(p,v)+
    (p.deal?'<span class="deal-pill pc__offer'+(ok?'':' is-muted')+'">'+ic(PATH.deal,13)+esc(p.deal)+'</span>':'')+
    '<div class="pc__price pc__price--row'+(ok?'':' is-muted')+'">'+price+(ok?line:'')+'</div>'+(ok?'':'<span class="pc__notify">'+ib('bell',16)+'Get notified when it’s back</span>')+'</div></article>';
}
function renderCards(el,list){el.innerHTML=list.map(cardHTML).join('');$$('.pc__media img',el).slice(0,7).forEach(function(i){i.loading='eager';});}
function refreshCard(h){$$('.pc[data-h="'+h+'"]').forEach(function(c){var t=document.createElement('div');t.innerHTML=cardHTML(BY[h]);c.replaceWith(t.firstElementChild);});}

document.addEventListener('click',function(e){
  var chip=e.target.closest('.pc [data-cv]');
  if(chip){e.preventDefault();var card=chip.closest('.pc'),p=BY[card.dataset.h],v=findV(p,+chip.dataset.cv);
    if(!v.ok){toast(v.t+' is out of stock');return;}
    cardSel[p.h]=v.id;refreshCard(p.h);var nc=$('.pc[data-h="'+p.h+'"] [data-cv="'+v.id+'"]');if(nc)nc.focus();return;}
  var b=e.target.closest('[data-quick]');
  if(b){e.preventDefault();var p2=BY[b.dataset.quick];openQuick(p2,selV(p2).id,b);return;}
  /* John: the whole card opens the product page. Links, buttons and chips keep their own job; a swipe or drag
     (pointer moved more than 10px since it went down) is not a click, so rails still scroll on phones */
  var pc=e.target.closest('.pc');
  if(pc&&!e.target.closest('a,button,input,select,label,[data-cv]')&&!cardDrag){
    var go=$('.pc__name',pc);if(!go)return;
    if(e.metaKey||e.ctrlKey||e.button===1)window.open(go.href,'_blank');else location.href=go.href;
  }
});
var cardDrag=false,cardX=0,cardY=0;
document.addEventListener('pointerdown',function(e){cardDrag=false;cardX=e.clientX;cardY=e.clientY;},true);
document.addEventListener('pointermove',function(e){if(Math.abs(e.clientX-cardX)>10||Math.abs(e.clientY-cardY)>10)cardDrag=true;},true);

/* ---------- QUICK-ADD POPUP (the live "Add to Cart" pop-up, redesigned) ---------- */
var Q=null, qReturn=null;
function packs(p){ /* the live "Select & save" / bundle offers, with what they cost for this strength */
  return (p.tiers||[]).map(function(t){return t;});
}
function qCalc(){
  var p=Q.p,v=findV(p,Q.v),t=Q.t!=null?p.tiers[Q.t]:null;
  if(p.kind==='99p')return {cans:1,total:v.price,save:0,pts:(p.tiers[0]||{}).pts||0,per:v.price};
  if(p.kind==='bundle'){var tb=t||p.tiers[0]||{q:1,p:v.price,pts:0};var n=tb.q*Q.n;return {cans:n,total:v.price*n,save:((v.was||v.price)-v.price)*n,pts:tb.pts/tb.q*n,per:v.price,unit:'bundle'};}
  if(!t)return {cans:Q.n,total:v.price*Q.n,save:0,pts:((p.tiers[0]||{}).pts||0)*Q.n,per:v.price};
  var cans=t.q*Q.n;return {cans:cans,total:t.p*cans,save:(v.price-t.p)*cans,pts:t.pts*Q.n,per:t.p};
}
function qHTML(){
  var p=Q.p,v=findV(p,Q.v),c=qCalc(),band=v.band?BAND[v.band]:null,tiers=packs(p),isB=p.kind==='bundle';
  var h='<div class="qa__head"><div class="qa__img"><img src="'+esc(v.img||p.img)+'" alt=""></div><div class="qa__id">'+
    '<a class="qa__brand" href="'+brandUrl(p.brand)+'">'+esc(p.brand)+'</a><h2 id="qaTitle">'+esc(p.name)+'</h2>'+
    '<div class="qa__meta">'+
      (p.pool==='mm'?'<span class="tag tag--mm">Mix &amp; Match</span>':p.pool==='pm'?'<span class="tag tag--sky">Premium Mix</span>':'')+(p.deal?'<span class="deal-pill">'+ic(PATH.deal,13)+esc(p.deal)+'</span>':'')+'</div>'+
    '<div class="qa__price"><b class="num">'+(p.kind==='99p'?'99p':fm(v.price))+'</b>'+(isB&&v.was?'<s class="num">'+fm(v.was)+'</s>':'')+
      '<span class="muted">'+(isB?'per bundle':p.kind==='99p'?'with any order':p.kind==='other'?'':'per can')+'</span>'+
      '</div>'+'<a class="link qa__more" href="'+url(p)+'"><span class="ql__t"><span class="ql__l">View full product</span><span class="ql__s">View</span> details</span>'+ICON.arrow+'</a></div>'+
    '<button class="icon-btn qa__close" type="button" data-qclose aria-label="Close">'+ICON.close+'</button></div>';
  if(p.contents&&p.contents.length){
    var short=p.contents.map(function(x){return x.replace(/^\d+\s*x\s*/i,'').replace(new RegExp(p.brand+'\\s*','ig'),'').replace(/\b(Silver|Gold)\s+Edition\b/ig,'').replace(/\d+(\.\d+)?\s*mg/ig,'').replace(/Nicotine Pouches/ig,'').replace(/\s+/g,' ').trim();});
    var total=p.contents.reduce(function(a,x){var m=x.match(/^(\d+)\s*x/i);return a+(m?+m[1]:1);},0);
    h+='<details class="qa__contents"><summary><b>'+total+' cans:</b> '+esc(short.join(', '))+' <span class="link">See contents</span></summary><ul>'+p.contents.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul></details>';
  }
  var vs=variants(p).filter(function(x){return x.mg!=null;});
  if(optVs(p).length)h+='<div class="qa__sec"><div class="qa__l"><b>'+esc(p.opt||'Options')+'</b><span>'+esc(v.t)+'</span></div>'+optChips(p,v,'data-qv','qa__chips')+'</div>';
  if(vs.length>1)h+='<div class="qa__sec"><div class="qa__l"><b>Strength (mg)</b><span>'+(v.mg!=null?mgs(v.mg)+'mg':esc(v.t))+(band?' · '+esc(band.name):'')+'</span></div><div class="pc__chips qa__chips" role="radiogroup" aria-label="Strength">'+
    vs.map(function(x){return '<button type="button" class="mgc'+(x.ok?'':' is-oos')+'" role="radio" aria-checked="'+(x.id===v.id)+'" data-qv="'+x.id+'" data-b="'+(x.band||'')+'"'+(x.ok?'':' aria-disabled="true"')+'>'+mgs(x.mg)+'</button>';}).join('')+'</div></div>';
  if(tiers.length>1){
    h+='<div class="qa__sec"><div class="qa__l"><b>'+(p.pool==='mm'?'Mix &amp; Match Bundle Offers':isB?'Bundle Offers':'Select &amp; save')+'</b></div><div class="qa__packs" role="radiogroup" aria-label="Bundle">'+
      tiers.map(function(t,i){var sv=tierSave(p,t,v);
        return '<button type="button" class="qpk'+(v.ok?'':' is-oos')+'" role="radio" aria-checked="'+(v.ok&&i===Q.t)+'" data-qt="'+i+'"'+(v.ok?'':' aria-disabled="true"')+'>'+(t.best?'<span class="bestv">Best value</span>':'')+
          '<span class="qpk__l"><b>'+t.q+' '+(isB?(t.q>1?'Bundles':'Bundle'):'Pack')+'</b><span class="qpk__pp num">'+fm(t.p)+'<span class="qpk__ppu"> pp</span></span></span>'+
          '<span class="qpk__meta">'+(sv>0.004?'<em>Save '+fm(sv)+'</em>':'<span class="qpk__none">No savings</span>')+'<span class="qpk__dot"> · </span><span class="ptsi">'+ic(PATH_FILL.points,12)+t.pts+' pts</span></span></button>';}).join('')+'</div></div>';
  }
  var ok=v.ok;
  if(!ok){
    h+='<form class="notify" data-notify><p class="notify__t">'+ib('bell',20)+'<b>Sold out</b> · '+esc(v.t&&v.t!=='Default Title'?v.t+' is':'This is')+' out of stock right now</p>'+
      '<div class="notify__row"><label class="sr" for="nfEmail">Email (optional)</label><input id="nfEmail" type="email" placeholder="Email address (optional)" autocomplete="email">'+
      '<button class="btn btn--ghost btn--block notify__btn" type="submit">'+ic(PATH_FILL.bell,18)+'Notify me when back in stock</button></div></form>'+
      '<div class="qa__dock">'+(p.nic===false?'':'<div class="qa__18bar"><span class="age-18 age-18--sm">18+</span><span>'+esc(C.pdp.warning)+'</span></div>')+'</div>';
    return h;
  }
  h+='<div class="qa__dock"><div class="qa__buy">'+(p.kind==='99p'?'':'<div class="qty qty--lg" role="group" aria-label="How many"><button type="button" data-qn="-1" aria-label="Fewer"'+(Q.n<=1?' disabled':'')+'>'+ICON.minus16+'</button><output class="num">'+Q.n+'</output><button type="button" data-qn="1" aria-label="More">'+ICON.plus16+'</button></div>')+
    '<button class="btn btn--lg" type="button" data-qadd'+(ok?'':' disabled')+'>'+(ok?(p.kind==='99p'?'Add for 99p':'<span>Add to basket · '+fm(c.total)+'</span>'):'Sold out')+'</button>'+
      '</div>'+(p.kind==='99p'?spPair(0,0,'qaCd'):spPair(c.save,c.pts,'qaCd'))+
    (p.nic===false?'':'<div class="qa__18bar"><span class="age-18 age-18--sm">18+</span><span>'+esc(C.pdp.warning)+'</span></div>')+'</div>';
  return h;
}
var cdTimer=null;
function drawQuick(keep){
  var box=$('#qaBody');box.innerHTML=qHTML();
  clearInterval(cdTimer);cdTimer=countdown($('#qaCd'));
  if(keep){var f=$(keep,box);if(f)f.focus();}
}
function openQuick(p,vid,from){
  var bi=(p.tiers||[]).findIndex(function(t){return t.best;});
  Q={p:p,v:vid,t:(p.tiers||[]).length>1?(bi>=0?bi:0):null,n:1};
  qReturn=from||null;
  drawQuick();
  document.body.classList.add('qa-open');$('#qa').setAttribute('aria-hidden','false');
  setTimeout(function(){var b=$('#qa [data-qadd]');if(b)b.focus();},60);
}
function closeQuick(){
  if(!document.body.classList.contains('qa-open'))return;
  document.body.classList.remove('qa-open');$('#qa').setAttribute('aria-hidden','true');clearInterval(cdTimer);
  if(Q){cardSel[Q.p.h]=Q.v;refreshCard(Q.p.h);var c=$('.pc[data-h="'+Q.p.h+'"] .pc__add');if(c)c.focus();else if(qReturn&&document.contains(qReturn))qReturn.focus();}
}
document.addEventListener('click',function(e){
  if(!Q||!document.body.classList.contains('qa-open'))return;
  var v=e.target.closest('[data-qv]'),t=e.target.closest('[data-qt]'),n=e.target.closest('[data-qn]'),a=e.target.closest('[data-qadd]');
  if(e.target.closest('[data-qclose]')||e.target.matches('.qa__scrim')){closeQuick();return;}
  if(v){var vv=findV(Q.p,+v.dataset.qv);if(!vv.ok){toast(vv.t+' is out of stock');return;}Q.v=vv.id;drawQuick('[data-qv="'+vv.id+'"]');}
  else if(t){if(t.getAttribute('aria-disabled')==='true')return;Q.t=+t.dataset.qt;drawQuick('[data-qt="'+Q.t+'"]');}
  else if(n){Q.n=Math.max(1,Math.min(20,Q.n+(+n.dataset.qn)));drawQuick('[data-qn="'+n.dataset.qn+'"]');}
  else if(a){var c=qCalc(),p=Q.p;add(p.h,Q.v,p.kind==='bundle'?c.cans:c.cans,{silent:true});closeQuick();openCart();}
});
function quickHTML(){return '<div class="qa" id="qa" aria-hidden="true"><div class="qa__scrim"></div><div class="qa__box" role="dialog" aria-modal="true" aria-labelledby="qaTitle"><span class="qa__grab" aria-hidden="true"></span><div id="qaBody"></div></div></div>';}

/* ---------- BASKET: store + pricing ---------- */
var KEY='np-redesign-basket-v1', mem=null;
function load(){try{var s=localStorage.getItem(KEY);return s?JSON.parse(s):[];}catch(e){return mem||[];}}
function save(c){mem=c;try{localStorage.setItem(KEY,JSON.stringify(c));}catch(e){} render();document.dispatchEvent(new CustomEvent('np:cart'));}
function add(h,vid,qty,opt){
  var p=BY[h]; if(!p)return;
  var c=load(), ex=c.filter(function(l){return l.h===h&&l.v===vid;})[0];
  if(p.kind==='99p'){
    if(ex){toast('99p pouches are limited to 1 per order');openCart();return;}
    qty=1;
  }
  if(ex)ex.q+=qty; else c.push({h:h,v:vid,q:qty});
  save(c);
  var bb=$('.bag-btn'); if(bb){bb.classList.remove('bump');void bb.offsetWidth;bb.classList.add('bump');}
  if(!(opt&&opt.silent))openCart();
}
function setQty(i,q){var c=load();if(!c[i])return;var p=BY[c[i].h];if(p&&p.kind==='99p')q=Math.min(q,1);if(q<=0)c.splice(i,1);else c[i].q=q;save(c);}
/* Pricing — the same as the live site (checked on nicpouches.com, 30 Sep 2026, see research-notes.md):
   each product's own "Select & save" tiers, chosen by how many cans of THAT product are in the basket
   (all its strengths count together; different products don't). Bundles: the bundle price, saving
   against the bundle's compare-at price. Points: the tier's points per can. Free delivery from £20. */
function price(){
  var c=load(), per={};
  c.forEach(function(l){var p=BY[l.h];if(p)per[l.h]=(per[l.h]||0)+l.q;});
  var lines=[],sub=0,total=0,pts=0,count=0;
  c.forEach(function(l,i){
    var p=BY[l.h]; if(!p)return;
    var v=findV(p,l.v), base=v.price, unit=base, was=base, tier=null, n=per[l.h];
    (p.tiers||[]).forEach(function(t){if(t.q<=n&&(!tier||t.q>tier.q))tier=t;});
    if(p.kind==='bundle'){was=v.was||base;}
    else if(p.kind!=='99p'&&tier){unit=tier.p;}
    var ptsEach=tier?tier.pts/tier.q:0;
    var line={i:i,p:p,v:v,q:l.q,unit:unit,base:base,total:unit*l.q,was:was*l.q,pts:Math.round(ptsEach*l.q),tier:tier};
    lines.push(line);sub+=line.was;total+=line.total;pts+=line.pts;count+=l.q;
  });
  var th=C.shipping.threshold, ship=lines.length?(total>=th?0:2.99):0;
  return {lines:lines,sub:sub,save:sub-total,goods:total,ship:ship,grand:total+ship,pts:pts,count:count,toFree:Math.max(0,th-total),th:th};
}
/* The live drawer's own wording and steps: Buy 5 → 7% · Buy 10 → 21% · Buy 20 → 26%.
   Live headlines: "Add 5 for 7% Off!" (empty), "Add 5 more for 26% Off!" (15 items), "26% Off Obtained!" */
var STEPS=[[5,7],[10,21],[20,26]];
function rewards(s){
  var n=s.count, next=STEPS.filter(function(x){return x[0]>n;})[0], got=STEPS.filter(function(x){return x[0]<=n;}).pop();
  var head=!next?got[1]+'% Off Obtained!':(n===0?'Add '+next[0]+' for '+next[1]+'% Off!':'Add '+(next[0]-n)+' more for '+next[1]+'% Off!');
  return {n:n,head:head,got:got,next:next};
}
function rewardsHTML(s,big){
  var r=rewards(s), free=s.toFree<=0&&s.count>0;
  var seg=STEPS.map(function(x,i){var from=i?STEPS[i-1][0]:0,pc=Math.max(0,Math.min(1,(r.n-from)/(x[0]-from)));
    return '<div class="rw__seg'+(r.n>=x[0]?' on':'')+'"><span class="rw__bar"><i style="width:'+(pc*100)+'%"></i></span><span class="rw__num">'+x[0]+'</span><span class="rw__lab">Buy '+x[0]+' → '+x[1]+'%</span></div>';}).join('');
  return '<section class="rw'+(big?' rw--big':'')+'" aria-label="Rewards"><div class="rw__stats">'+
    '<span class="rw__count" title="'+r.n+' items in your basket"><b class="num">'+r.n+'</b><small>items</small></span>'+
    '<span class="rws">'+ib('tag',20)+'Save <b class="num rws__save">'+fm(s.save)+'</b></span>'+
    '<span class="rws rws--pts">'+ib('points',20)+'<b class="num">'+s.pts+'</b> pts</span>'+
    '<span class="rws">'+ib('truck',20)+(free?'Free delivery':s.count?'<b class="num">'+fm(s.toFree)+'</b> to free delivery':'Free over £20')+'</span></div>'+
    '<p class="rw__head"><span class="tag tag--mm rw__mm">Mix &amp; Match</span>'+esc(r.head)+'</p><div class="rw__steps">'+seg+'</div></section>';
}
function promoHTML(){return '<a class="drpromo" href="collection-99p-nic-pouches.html" aria-label="'+esc(C.basketPromo.alt)+'"><img src="'+C.basketPromo.img+'" alt="'+esc(C.basketPromo.alt)+'" width="900" height="338"></a>';}
function lineHTML(L){
  var p=L.p, v=L.v, fixed=p.kind==='99p';
  var meta=(v.band?'<span class="tag band-tag" data-b="'+v.band+'">'+esc(v.t)+' · '+BAND[v.band].name+'</span>':(v.t&&v.t!=='Default Title'?'<span class="tag tag--line">'+esc(v.t)+'</span>':''))+
    (p.pool==='mm'?'<span class="tag tag--mm">Mix &amp; Match</span>':p.pool==='pm'?'<span class="tag tag--sky">Premium Mix</span>':p.kind==='bundle'?'<span class="tag tag--amber">Bundle'+(p.cans?' · '+p.cans+' cans':'')+'</span>':p.kind==='99p'?'<span class="tag tag--coral">99p add-on</span>':'')+
    (L.unit<L.base-0.001?'<span class="each">'+fm(L.unit)+' each'+(L.tier?' · '+L.tier.q+' Pack price':'')+'</span>':'');
  return '<li class="line"><a class="line__img" href="'+url(p)+'"><img src="'+esc(v.img||p.img)+'" alt=""></a><div>'+
    '<div class="line__top"><div><a class="line__brand" href="'+brandUrl(p.brand)+'">'+esc(p.brand)+'</a><br><a href="'+url(p)+'">'+esc(p.name)+'</a></div>'+
    '<div class="line__price num">'+fm(L.total)+(L.was>L.total+0.001?'<s>'+fm(L.was)+'</s>':'')+'</div></div>'+
    '<div class="line__meta">'+meta+'</div>'+
    '<div class="line__ctl">'+(fixed?'<span class="muted" style="font-size:12.5px">1 per order</span>':
      '<div class="qty" role="group" aria-label="Quantity"><button type="button" data-q="'+L.i+'" data-d="-1" aria-label="One fewer">'+ICON.minus16+'</button><output class="num">'+L.q+'</output><button type="button" data-q="'+L.i+'" data-d="1" aria-label="One more">'+ICON.plus16+'</button></div>')+
    '<button class="rm" type="button" data-rm="'+L.i+'">Remove</button></div></div></li>';
}
function upsellHTML(s){
  var has99=s.lines.some(function(l){return l.p.kind==='99p';});
  var u=BY['koldnic-frosty-peppermint']&&anyStock(BY['koldnic-frosty-peppermint'])?BY['koldnic-frosty-peppermint']:P.filter(function(p){return p.kind==='99p'&&anyStock(p);})[0];
  if(has99||!u||!s.count)return '';
  var v=firstOk(u);
  return '<div class="upsell"><img src="'+esc(u.img)+'" alt=""><div><b>Add '+esc(u.title)+' for 99p</b><small>1 Per Order | Limited Stock</small></div><button class="btn btn--sm" type="button" data-add99="'+esc(u.h)+'" data-v="'+v.id+'">Add</button></div>';
}
function summaryHTML(s){
  return '<div class="sum-row"><span class="muted">Subtotal</span><span class="num">'+fm(s.sub)+'</span></div>'+
    (s.save>0.004?'<div class="sum-row save"><span>Savings</span><span class="num">−'+fm(s.save)+'</span></div>':'')+
    '<div class="sum-row"><span class="muted">Delivery</span><span class="num">'+(!s.count?'—':s.ship?fm(s.ship):'Free')+'</span></div>'+
    '<div class="sum-row total"><span>Total</span><b class="num">'+fm(s.grand)+'</b></div>'+
    ((s.save>0.004||s.pts)?spPair(s.save,s.pts):'');
}
function render(){
  var s=price();
  $$('.bag-btn .count').forEach(function(el){el.textContent=s.count;el.dataset.n=s.count;});
  var dr=$('#drawer'); if(!dr)return;
  $('#drCount').textContent=s.count?'('+s.count+')':'';
  $('#drBody').innerHTML=promoHTML()+rewardsHTML(s)+
    (s.lines.length?'<ul class="lines">'+s.lines.map(lineHTML).join('')+'</ul>'+upsellHTML(s):
      '<div class="empty"><p><b style="color:var(--ink)">Your basket is empty</b></p><p style="margin:6px 0 16px">Buy 5 → 7% · Buy 10 → 21% · Buy 20 → 26%</p><a class="btn btn--sm" href="shop.html">Shop nicotine pouches</a></div>');
  /* compact footer: savings, points and delivery live in the rewards panel above */
  $('#drFoot').innerHTML='<div class="dft"><span>Total'+(s.ship?' <small class="muted">incl. £2.99 delivery</small>':'')+'</span><span><b class="num">'+fm(s.grand)+'</b>'+(s.save>0.004?'<small class="dft__save">You save '+fm(s.save)+'</small>':'')+'</span></div>'+
    '<button class="btn btn--block" type="button" data-checkout'+(s.count?'':' disabled')+'>Checkout</button>'+
    '<div class="dft__links"><a class="link" href="cart.html">View basket</a><span class="dft__18"><span class="age-18 age-18--xs">18+</span>Age verified at checkout</span></div>';
}
document.addEventListener('click',function(e){
  var q=e.target.closest('[data-q]'),r=e.target.closest('[data-rm]'),a=e.target.closest('[data-add99]'),co=e.target.closest('[data-checkout]');
  if(q){var c=load(),i=+q.dataset.q;if(c[i])setQty(i,c[i].q+(+q.dataset.d));}
  else if(r){setQty(+r.dataset.rm,0);}
  else if(a){add(a.dataset.add99,+a.dataset.v,1,{silent:true});toast('99p pouch added');}
  else if(co){toast('Prototype: checkout goes to the live Shopify checkout');}
});
function openCart(){closeMnav();document.body.classList.add('cart-open');var d=$('#drawer');if(d){d.setAttribute('aria-hidden','false');setTimeout(function(){var b=$('#drawer [data-close-cart]');if(b)b.focus();},50);}}
function closeCart(){document.body.classList.remove('cart-open','filters-open');var d=$('#drawer');if(d)d.setAttribute('aria-hidden','true');}

/* ---------- toast ---------- */
function toast(msg){var t=$('#toast');if(!t)return;t.textContent=msg;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show');},2400);}

/* ---------- header ---------- */
function stars(n){var s='';for(var i=1;i<=5;i++)s+='<i class="'+(n>=i?'':n>=i-.5?'half':'')+'"></i>';return s;}
var TRUST_IC=['truck','clock','tag'];
function headerHTML(){
  var trust='<div class="trust"><div class="wrap"><ul>'+C.trust.map(function(t,i){return '<li>'+ib(TRUST_IC[i],20)+esc(t.text)+'</li>';}).join('')+'</ul>'+
    '<a class="tp" href="https://uk.trustpilot.com/review/nicpouches.com" target="_blank" rel="noopener">Excellent <span class="tp-stars" aria-label="Trustpilot rating">'+stars(4.5)+'</span> Trustpilot</a></div></div>';
  /* Round 8 (John: "scroll through all logo cans in the menu", then "can it show a pagination scroller across"):
     every brand with a brand page, in the live Brands menu order, with the homepage strip's can, paged sideways:
     desktop 12 a page (4 x 3), phones 9 a page (3 x 3). The 12 brands the menu had keep their menu names; the rest
     use the live Brands menu name. initBrandPager() runs the paging. */
  var MENU_NAME={};C.brands.forEach(function(b){MENU_NAME[b.vendor.toLowerCase()]=b.name;});
  var mList=BRANDS.filter(function(b){return b.count&&b.stripCan;}).map(function(b){
    var nm=b.vendors.map(function(v){return MENU_NAME[String(v).toLowerCase()];}).filter(Boolean)[0]||b.menu||b.short;
    return {href:'brand.html?b='+b.slug,img:b.stripCan,name:nm,isNew:!!b.isNew};});
  if(!mList.length)mList=C.brands.map(function(b){return {href:brandUrl(b.vendor),img:b.img,name:b.name};});
  function brandPager(per,label){
    var pages=[],k;for(k=0;k<mList.length;k+=per)pages.push(mList.slice(k,k+per));
    return '<div class="bpg" data-bpg><div class="bpg__track" tabindex="0" role="region" aria-roledescription="carousel" aria-label="'+label+'">'+
      pages.map(function(pg,n){return '<div class="bpg__page" role="group" aria-roledescription="slide" aria-label="Page '+(n+1)+' of '+pages.length+'">'+
        pg.map(function(b){return '<a href="'+b.href+'"'+(b.isNew?' aria-label="'+esc(b.name)+', new"':'')+'><span class="mbcan"><img src="'+esc(b.img)+'" alt="" loading="lazy" width="46" height="46">'+(b.isNew?'<span class="tag tag--new mbnew">New</span>':'')+'</span><span class="mbname">'+esc(b.name)+'</span></a>';}).join('')+'</div>';}).join('')+
      '</div><div class="bpg__nav"><a class="link bpg__all" href="brands.html">All brands A–Z '+ICON.arrow+'</a>'+
      '<span class="bpg__dots">'+pages.map(function(pg,n){return '<button type="button" data-pg="'+n+'" aria-label="Brands page '+(n+1)+'"'+(n?'':' aria-current="true"')+'></button>';}).join('')+'</span>'+
      '<span class="bpg__arrows"><button type="button" data-pgdir="-1" aria-label="Previous brands" disabled>'+ICON.left+'</button><button type="button" data-pgdir="1" aria-label="More brands">'+ICON.right+'</button></span></div></div>';
  }
  var bands=BANDS.map(function(b){return '<a href="'+bandUrl(b.key)+'">'+meter(b.key)+'<span>'+esc(b.name)+'<small>'+esc(b.range)+'</small></span></a>';}).join('');
  var flav=C.flavours.map(function(f){return '<a class="mega__flav" href="'+flavUrl(f.key)+'"><img src="'+f.img+'" alt="">'+esc(f.name)+'</a>';}).join('');
  var types=C.types.map(function(t){return '<a href="'+t.href+'">'+esc(t.name)+'</a>';}).join('');
  var offers='<a href="page-nic-pouches-loyalty-points.html">'+badge('points','sm')+'Nic Points</a><a href="page-mix-match.html">'+badge('mix','sm')+'Mix &amp; Match</a><a href="collection-offers.html">'+badge('deal','sm')+'Deals &amp; bundles</a>';
  return trust+'<header class="hdr" id="hdr"><div class="wrap hdr__row">'+
    '<button class="icon-btn menu-btn" type="button" data-mnav aria-label="Open menu" aria-expanded="false" aria-controls="mnav">'+ICON.menu+ICR.menu+'</button>'+
    '<a class="hdr__logo" href="index.html" aria-label="Nic Pouches home"><img src="'+I+'logo.svg" alt="Nic Pouches" width="152" height="26"></a>'+
    '<nav class="nav" aria-label="Main"><span class="nav__mega" data-mega-wrap><a href="collection-nicotine-pouches.html" data-mega-link>Nicotine Pouches</a><button type="button" data-mega aria-expanded="false" aria-controls="mega" aria-label="Open the Nicotine Pouches menu">'+ICON.chev+'</button></span>'+
      '<a href="collection-99p-nic-pouches.html">99p Pouches</a><a href="collection-caffeine-pouches.html">Caffeine Pouches</a><a href="collection-best-sellers.html">Bestsellers</a>'+
      '<a class="pill-new" href="collection-new-products.html">New</a><a class="pill-deals" href="collection-offers.html">Deals</a></nav>'+
    '<div class="hdr__actions"><div class="search" id="search"><div class="search__bar"><label class="search__field">'+icr('<circle cx="112" cy="112" r="80"/><line x1="168.57" y1="168.57" x2="224" y2="224"/>',18)+'<span class="sr">Search</span><input type="search" placeholder="Search brands, flavours, strengths" autocomplete="off" id="searchInput" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="searchDrop" enterkeyhint="search"></label><button type="button" class="search__close" data-sclose aria-label="Close search">'+ICON.close+'</button></div><div class="search__drop" id="searchDrop"></div></div>'+
      '<button class="icon-btn msearch-btn" type="button" data-msearch aria-label="Search" aria-expanded="false">'+ICON.search+ICR.search+'</button>'+
      '<a class="icon-btn acct-btn" href="account-login.html" aria-label="Account">'+ICON.user+ICR.user+'</a>'+
      '<a class="points-btn" href="page-nic-pouches-loyalty-points.html">'+ic(PATH_FILL.points,17)+'<span>Access Nic Points</span></a>'+
      '<button class="bag-btn" type="button" data-open-cart aria-label="Open basket">'+ICON.bag+ICR.bag+'<span class="count num" data-n="0">0</span></button></div></div>'+
    '<div class="mega" id="mega"><div class="wrap mega__grid"><a class="mega__all" href="collection-nicotine-pouches.html">Shop all nicotine pouches '+ICON.arrow+'</a>'+
      '<div class="mega__bcol"><h4>Brands</h4>'+brandPager(12,'Brands')+'</div>'+
      '<div><h4>Strengths</h4><div class="mega__list">'+bands+'</div></div>'+
      '<div><h4>Flavours</h4><div class="mega__list">'+flav+'</div></div>'+
      '<div><h4>Type</h4><div class="mega__list">'+types+'</div><h4 style="margin-top:22px">Save</h4><div class="mega__list mega__offers">'+offers+'</div></div>'+
    '</div></div></header>'+
    '<div class="mnav" id="mnav" aria-hidden="true"><div class="mnav__scrim" data-mnav-close></div><div class="mnav__panel" role="dialog" aria-label="Menu" tabindex="-1">'+
      '<div class="mnav__top"><img src="'+I+'logo.svg" alt="Nic Pouches" style="height:22px"><button class="icon-btn" type="button" data-mnav-close aria-label="Close menu">'+ICON.close+'</button></div>'+
      '<form class="search__field" action="shop.html" style="margin:6px 0 10px">'+ICON.search+'<input type="search" name="q" placeholder="Search brands, flavours, strengths"></form>'+
      '<a class="mnav__all" href="collection-nicotine-pouches.html" style="display:flex;align-items:center;gap:6px;padding:10px 0;font-weight:700;color:var(--blue)">Shop all nicotine pouches '+ICON.arrow+'</a>'+
      '<details open><summary>Brands '+ICON.chev+'</summary><div class="mnav__bwrap">'+brandPager(12,'Brands, swipe for more')+'</div></details>'+
      '<details><summary>Strengths '+ICON.chev+'</summary><div class="mnav__sub">'+BANDS.map(function(b){return '<a href="'+bandUrl(b.key)+'">'+meter(b.key)+esc(b.name)+' <small class="muted">'+esc(b.range)+'</small></a>';}).join('')+'</div></details>'+
      '<details><summary>Flavours '+ICON.chev+'</summary><div class="mnav__sub">'+C.flavours.map(function(f){return '<a href="'+flavUrl(f.key)+'"><img src="'+f.img+'" alt="" style="width:28px;height:28px;border-radius:8px">'+esc(f.name)+'</a>';}).join('')+'</div></details>'+
      '<details><summary>Type '+ICON.chev+'</summary><div class="mnav__sub">'+C.types.map(function(t){return '<a href="'+t.href+'">'+esc(t.name)+'</a>';}).join('')+'</div></details>'+
      '<a class="mnav__link" href="collection-99p-nic-pouches.html">99p Pouches</a><a class="mnav__link" href="collection-caffeine-pouches.html">Caffeine Pouches</a><a class="mnav__link" href="collection-best-sellers.html">Bestsellers</a>'+
      '<a class="mnav__link" href="collection-new-products.html">New <span class="tag tag--mint">New in</span></a><a class="mnav__link" href="collection-offers.html">Deals <span class="tag tag--amber">Bundles</span></a>'+
      '<a class="mnav__link" href="page-nic-pouches-loyalty-points.html">Access Nic Points '+badge('points','sm')+'</a><a class="mnav__link" href="account-login.html">Login / Register</a>'+
    '</div></div><div class="sov" data-sclose aria-hidden="true"></div>';
}
function footerHTML(){
  var F=C.footer;
  return '<footer class="foot"><div class="wrap"><div class="foot__grid"><div><img class="foot__logo" src="'+I+'logo.svg" alt="Nic Pouches"><p>'+esc(F.blurb)+'</p>'+
    '<a class="wa" href="https://whatsapp.com/channel/0029VbC03ZVCBtx7LQkkDQ3j" target="_blank" rel="noopener">'+ic(PATH.whatsapp,20)+esc(F.whatsapp)+'</a>'+
    '<p style="margin-top:16px;font-size:13px">'+esc(F.news)+'</p><form class="news" data-news><label class="sr" for="nl">Email</label><input id="nl" type="email" required placeholder="Enter email for updates"><button class="btn btn--sm" type="submit" style="height:46px">Subscribe</button></form></div>'+
    F.cols.map(function(c){return '<div><h4>'+esc(c[0])+'</h4><ul>'+c[1].map(function(l){var h=l[1].replace(/^shop\.html\?brand=([^&]+)$/,function(m,v){return brandUrl(decodeURIComponent(v));});return '<li><a href="'+h+'">'+esc(l[0])+'</a></li>';}).join('')+'</ul></div>';}).join('')+
    '</div><div class="age"><span class="age-18">18+</span><span><b>'+esc(F.age)+'</b> '+esc(F.age2)+'</span></div>'+
    '<div class="foot__bot"><span>'+esc(F.office)+'<br>'+esc(F.copy)+'</span><span class="pay">'+F.pay.map(function(x){return '<span>'+esc(x)+'</span>';}).join('')+'</span></div>'+
    '<p class="foot__bot" style="margin-top:14px">Redesign prototype · products, prices and copy from nicpouches.com, '+esc(D.meta.rippedOn.slice(0,10))+' · checkout not connected</p></div></footer>';
}
function drawerHTML(){
  return '<div class="scrim" data-close-cart></div><aside class="drawer" id="drawer" aria-label="Basket" aria-hidden="true">'+
    '<div class="dr__head"><h2>Basket <span id="drCount"></span></h2><button class="icon-btn" type="button" data-close-cart aria-label="Close basket">'+ICON.close+'</button></div>'+
    '<div class="dr__body" id="drBody"></div><div class="dr__foot" id="drFoot"></div></aside><div class="toast" id="toast" role="status" aria-live="polite"></div>'+quickHTML();
}

/* search */
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');}
function searchP(q){
  q=norm(q).trim(); if(!q)return [];
  var words=q.split(/\s+/);
  return P.filter(function(p){var hay=norm(p.title+' '+p.brand+' '+(p.flavour||'')+' '+(p.flav||[]).join(' ')+' '+variants(p).map(function(v){return v.t;}).join(' '));
    return words.every(function(w){return hay.indexOf(w)>=0;});});
}
/* Round 8 search (John: "can it overlay with preselected based on your search"): opening search dims the page behind a
   scrim (click it or Esc to close; the page does not scroll underneath); on phones it is a full-screen sheet. Before
   typing, the panel is already filled: recent searches and recently viewed (this browser only, localStorage), or on a
   first visit popular searches and top sellers. As you type, results filter live and the top match is highlighted, so
   Enter opens it; up / down move the highlight; the last option is "See all results". Combobox + listbox roles with
   aria-activedescendant. */
var SKEY='np-recent-searches',VKEY='np-recent-viewed';
function lsGet(k){try{var v=JSON.parse(localStorage.getItem(k)||'[]');return Array.isArray(v)?v:[];}catch(e){return [];}}
function lsSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
function rememberSearch(q){q=String(q||'').trim();if(!q)return;var a=lsGet(SKEY).filter(function(x){return norm(x)!==norm(q);});a.unshift(q);lsSet(SKEY,a.slice(0,5));}
function rememberView(h){if(!h)return;var a=lsGet(VKEY).filter(function(x){return x!==h;});a.unshift(h);lsSet(VKEY,a.slice(0,8));}
function hiMatch(text,q){var t=String(text||''),n=norm(t),k=norm(q).trim(),i=k?n.indexOf(k):-1;
  return i<0?esc(t):esc(t.slice(0,i))+'<strong>'+esc(t.slice(i,i+k.length))+'</strong>'+esc(t.slice(i+k.length));}
function initSearch(){
  var box=$('#search'),inp=$('#searchInput'),drop=$('#searchDrop'),hdr=$('#hdr'),msb=$('[data-msearch]');if(!inp)return;
  var sel=0,isOpen=false;
  function prow(p,q,id){return '<a role="option" id="'+id+'" href="'+url(p)+'" data-sv="'+esc(q)+'"><img src="'+esc(p.img)+'" alt=""><span><b>'+hiMatch(p.title,q)+'</b><small>'+esc(strengthText(p))+' · '+(p.kind==='99p'?'99p':fm(basePrice(p)))+'</small></span></a>';}
  function chips(list,removable){return '<div class="search__chips">'+list.map(function(x){return '<span class="schip"><button type="button" class="schip__go" data-sq="'+esc(x)+'">'+esc(x)+'</button>'+(removable?'<button type="button" class="schip__x" data-sx="'+esc(x)+'" aria-label="Remove '+esc(x)+' from recent searches">'+ICON.close+'</button>':'')+'</span>';}).join('')+'</div>';}
  function head(t,extra){return '<div class="search__h"><span>'+t+'</span>'+(extra||'')+'</div>';}
  function draw(){
    var q=inp.value,qt=q.trim(),h='',n=0;
    if(!qt){
      var rs=lsGet(SKEY),rv=lsGet(VKEY).map(function(x){return BY[x];}).filter(Boolean).slice(0,4);
      if(rs.length||rv.length){
        if(rs.length)h+=head('Recent searches','<button type="button" class="search__clear" data-sclear>Clear</button>')+chips(rs,true);
        if(rv.length)h+=head('Recently viewed')+'<div role="listbox" id="searchList" aria-label="Recently viewed">'+rv.map(function(p){return prow(p,'','so'+(n++));}).join('')+'</div>';
      }else{
        /* first visit: popular searches from the Top Selling rail's brands (curated for the prototype, see job.json) */
        var top=((D.meta&&D.meta.railTop)||[]).map(function(x){return BY[x];}).filter(Boolean),seen={},pop=[];
        top.forEach(function(p){var b=brandOf(p),nm=b?b.short:p.brand;if(nm&&!seen[nm]){seen[nm]=1;pop.push(nm);}});
        h+=head('Popular searches')+chips(pop.slice(0,6),false)+head('Top sellers')+'<div role="listbox" id="searchList" aria-label="Top sellers">'+top.slice(0,4).map(function(p){return prow(p,'','so'+(n++));}).join('')+'</div>';
      }
    }else{
      var res=searchP(q).slice(0,6),bs=BRANDS.filter(function(b){return norm(b.name).indexOf(norm(qt))>=0;}).slice(0,2);
      h+='<div role="listbox" id="searchList" aria-label="Search results">'+
        bs.map(function(b){return '<a role="option" id="so'+(n++)+'" href="brand.html?b='+b.slug+'" data-sv="'+esc(qt)+'"><img src="'+esc(b.logo||b.menuImage)+'" alt=""><span><b>'+hiMatch(b.short,qt)+'</b><small>Brand page</small></span></a>';}).join('')+
        (res.length?res.map(function(p){return prow(p,qt,'so'+(n++));}).join(''):(bs.length?'':'<div class="search__empty">No pouches match “'+esc(q)+'”</div>'))+
        '<a role="option" id="so'+(n++)+'" class="search__all" href="search.html?q='+encodeURIComponent(q)+'" data-sv="'+esc(qt)+'">See all results '+ICON.arrow+'</a></div>';
    }
    drop.innerHTML=h;
    var opts=$$('[role="option"]',drop);
    if(sel>=opts.length)sel=opts.length-1;
    opts.forEach(function(o,i){o.classList.toggle('on',i===sel);o.setAttribute('aria-selected',i===sel);});
    if(opts[sel]){inp.setAttribute('aria-activedescendant',opts[sel].id);}else inp.removeAttribute('aria-activedescendant');
  }
  function open(){if(isOpen){draw();return;}isOpen=true;box.classList.add('open');document.body.classList.add('search-open');hdr.classList.add('searching');inp.setAttribute('aria-expanded','true');if(msb)msb.setAttribute('aria-expanded','true');sel=inp.value.trim()?0:-1;draw();}
  function close(){if(!isOpen)return;var back=box.contains(document.activeElement)&&msb&&getComputedStyle(msb).display!=='none';isOpen=false;box.classList.remove('open');document.body.classList.remove('search-open');hdr.classList.remove('searching');inp.setAttribute('aria-expanded','false');inp.removeAttribute('aria-activedescendant');if(msb)msb.setAttribute('aria-expanded','false');if(back)msb.focus({preventScroll:true});}
  inp.addEventListener('input',function(){sel=inp.value.trim()?0:-1;if(!isOpen)open();else draw();});
  inp.addEventListener('focus',open);
  inp.addEventListener('keydown',function(e){
    var opts=$$('[role="option"]',drop);
    if(e.key==='ArrowDown'){sel=Math.min(sel+1,opts.length-1);draw();e.preventDefault();}
    else if(e.key==='ArrowUp'){sel=Math.max(sel-1,inp.value.trim()?0:-1);draw();e.preventDefault();}
    else if(e.key==='Enter'){e.preventDefault();var a=opts[sel];rememberSearch(inp.value);
      if(a)location.href=a.getAttribute('href');else if(inp.value.trim())location.href='search.html?q='+encodeURIComponent(inp.value);}
    else if(e.key==='Escape'){close();}
  });
  drop.addEventListener('mousedown',function(e){if(e.target.closest('button'))e.preventDefault();});   /* keep focus in the field */
  drop.addEventListener('click',function(e){
    var go=e.target.closest('[data-sq]'),x=e.target.closest('[data-sx]'),cl=e.target.closest('[data-sclear]'),a=e.target.closest('a[data-sv]');
    if(go){inp.value=go.dataset.sq;sel=0;draw();inp.focus();}
    else if(x){lsSet(SKEY,lsGet(SKEY).filter(function(q){return q!==x.dataset.sx;}));draw();inp.focus();}
    else if(cl){lsSet(SKEY,[]);draw();inp.focus();}
    else if(a&&a.dataset.sv)rememberSearch(a.dataset.sv);
  });
  if(msb)msb.addEventListener('click',function(e){e.stopPropagation();if(isOpen){close();}else{open();setTimeout(function(){inp.focus();},30);}});
  $$('[data-sclose]').forEach(function(b){b.addEventListener('click',function(){close();inp.blur();});});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&isOpen){close();}});
  document.addEventListener('click',function(e){if(isOpen&&!box.contains(e.target)&&!(msb&&msb.contains(e.target)))close();});
  /* recently viewed: product pages remember what was opened */
  if(/product\.html$/.test(location.pathname)&&qs('p')&&BY[qs('p')])rememberView(qs('p'));
}

/* Round 8: the menu's Brands pager (desktop mega menu and phone menu). Pages snap sideways (CSS scroll-snap); the next
   page peeks in at the right, faded, and a left fade shows whenever there is a previous page. Dots and arrows go to a
   page; trackpad / touch swipe, mouse drag, arrow keys on the focused row and tabbing through the links all move it.
   No auto-advance; reduced motion jumps instead of gliding. */
function initBrandPager(root){
  var tr=root.querySelector('.bpg__track'),pages=[].slice.call(root.querySelectorAll('.bpg__page')),dots=[].slice.call(root.querySelectorAll('[data-pg]')),
      prev=root.querySelector('[data-pgdir="-1"]'),next=root.querySelector('[data-pgdir="1"]'),cur=0;
  var still=window.matchMedia('(prefers-reduced-motion: reduce)');
  function left(i){var p=pages[i];return Math.max(0,Math.min(tr.scrollWidth-tr.clientWidth,p.offsetLeft-(tr.clientWidth-p.offsetWidth)/2));}
  function go(i){i=Math.max(0,Math.min(pages.length-1,i));tr.scrollTo({left:left(i),behavior:still.matches?'auto':'smooth'});}
  function nearest(){var x=tr.scrollLeft,b=0,d=1e9;pages.forEach(function(p,i){var dd=Math.abs(left(i)-x);if(dd<d){d=dd;b=i;}});return b;}
  function upd(){var max=tr.scrollWidth-tr.clientWidth;cur=nearest();
    root.classList.toggle('has-prev',tr.scrollLeft>2);root.classList.toggle('has-next',tr.scrollLeft<max-2);
    dots.forEach(function(d,i){if(i===cur)d.setAttribute('aria-current','true');else d.removeAttribute('aria-current');});
    if(prev)prev.disabled=tr.scrollLeft<=2;if(next)next.disabled=tr.scrollLeft>=max-2;}
  tr.addEventListener('scroll',upd,{passive:true});
  root.addEventListener('click',function(e){var d=e.target.closest('[data-pg]'),a=e.target.closest('[data-pgdir]');
    if(d)go(+d.dataset.pg);else if(a)go(cur+(+a.dataset.pgdir));});
  tr.addEventListener('keydown',function(e){if(e.key==='ArrowRight'){go(cur+1);e.preventDefault();}else if(e.key==='ArrowLeft'){go(cur-1);e.preventDefault();}});
  tr.addEventListener('focusin',function(e){var p=e.target.closest('.bpg__page');if(p){var i=pages.indexOf(p);if(i!==cur)go(i);}});
  /* mouse drag (touch and trackpads scroll natively) */
  var x0=null,s0=0,moved=false;
  tr.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse'||e.button!==0)return;x0=e.clientX;s0=tr.scrollLeft;moved=false;});
  window.addEventListener('pointermove',function(e){if(x0===null)return;var d=e.clientX-x0;if(!moved&&Math.abs(d)>5){moved=true;root.classList.add('is-drag');}if(moved){tr.scrollLeft=s0-d;e.preventDefault();}});
  window.addEventListener('pointerup',function(e){if(x0===null)return;var d=e.clientX-x0;x0=null;
    if(moved){var i=nearest();if(Math.abs(d)>40&&i===cur)i=cur+(d<0?1:-1);root.classList.remove('is-drag');go(i);}
    setTimeout(function(){moved=false;},0);});
  tr.addEventListener('click',function(e){if(moved){e.preventDefault();e.stopPropagation();}},true);
  tr.addEventListener('dragstart',function(e){e.preventDefault();});
  window.addEventListener('resize',upd);
  [root.closest('.mega'),root.closest('.mnav'),root.closest('details')].forEach(function(h){if(h&&window.MutationObserver)new MutationObserver(upd).observe(h,{attributes:true,attributeFilter:['class','open']});});
  upd();
}
function initHeader(){
  var hdr=$('#hdr'),mb=$('[data-mega]'),mega=$('#mega'),timer;
  var byClick=false;
  function open(v){mega.classList.toggle('open',v);mb.setAttribute('aria-expanded',v);if(!v)byClick=false;}
  mb.addEventListener('click',function(){clearTimeout(timer);if(mega.classList.contains('open')&&byClick){open(false);}else{open(true);byClick=true;}});
  /* Round 7: the label is a link to the master Nicotine Pouches collection; hover or focus on it opens the menu, the chevron toggles it */
  var mw=$('[data-mega-wrap]')||mb,ml=$('[data-mega-link]');
  mw.addEventListener('mouseenter',function(){clearTimeout(timer);if(!mega.classList.contains('open')){open(true);byClick=false;}});
  if(ml)ml.addEventListener('focus',function(){clearTimeout(timer);if(!mega.classList.contains('open')){open(true);byClick=false;}});
  document.addEventListener('click',function(e){if(mega.classList.contains('open')&&!hdr.contains(e.target))open(false);});
  hdr.addEventListener('mouseleave',function(){timer=setTimeout(function(){open(false);},180);});
  mega.addEventListener('mouseenter',function(){clearTimeout(timer);});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'){open(false);closeQuick();closeCart();closeM();}});
  if(qs('mega'))open(true);   /* for screenshots */
  $$('[data-bpg]').forEach(initBrandPager);
  /* Round 8 (John: "menu on mobile should come in from the right", "menu burger should become X", "make it line up"):
     on phones the drawer slides in from the right under the header, which stays on top; the burger turns into an X in
     the same 44px button. Esc, the X, the scrim or a swipe right closes it; focus stays inside while open and goes back
     to the button after. Page scroll is locked without shifting anything (scrollbar width compensated). */
  var mn=$('#mnav'),mbtn=$('.menu-btn'),panel=mn&&$('.mnav__panel',mn),lastFocus=null;
  var phone=window.matchMedia('(max-width:767px)');
  function lock(on){var sb=window.innerWidth-document.documentElement.clientWidth;document.body.style.paddingRight=on&&sb>0?sb+'px':'';document.body.classList.toggle('mnav-open',on);}
  function openM(){if(!mn)return;closeCart();lastFocus=document.activeElement;
    if(phone.matches){var b=hdr.getBoundingClientRect().bottom;mn.style.setProperty('--mnav-top',Math.max(0,Math.round(b))+'px');}
    lock(true);mn.classList.add('open');mn.setAttribute('aria-hidden','false');
    if(mbtn){mbtn.setAttribute('aria-expanded','true');mbtn.setAttribute('aria-label','Close menu');}
    setTimeout(function(){if(panel)panel.focus({preventScroll:true});},30);}
  function closeM(){if(!mn||!mn.classList.contains('open'))return;mn.classList.remove('open');mn.setAttribute('aria-hidden','true');lock(false);
    if(mbtn){mbtn.setAttribute('aria-expanded','false');mbtn.setAttribute('aria-label','Open menu');}
    if(lastFocus&&mn.contains(lastFocus)||document.activeElement===document.body||mn.contains(document.activeElement)){if(mbtn&&getComputedStyle(mbtn).display!=='none')mbtn.focus({preventScroll:true});}}
  closeMnav=closeM;
  $$('[data-mnav]').forEach(function(b){b.addEventListener('click',function(){if(mn.classList.contains('open'))closeM();else openM();});});
  $$('[data-mnav-close]').forEach(function(b){b.addEventListener('click',closeM);});
  document.addEventListener('keydown',function(e){if(e.key!=='Tab'||!mn||!mn.classList.contains('open'))return;
    var f=[mbtn].concat($$('a[href],button,input,summary,[tabindex="0"]',panel)).filter(function(x){return x&&x.offsetParent!==null&&!x.disabled;});
    if(!f.length)return;var i=f.indexOf(document.activeElement);
    if(e.shiftKey&&(i<=0)){f[f.length-1].focus();e.preventDefault();}else if(!e.shiftKey&&(i===f.length-1||i<0)){f[0].focus();e.preventDefault();}});
  if(panel){var tx=null,ty=0;
    panel.addEventListener('touchstart',function(e){if(e.target.closest('.bpg__track'))return;tx=e.touches[0].clientX;ty=e.touches[0].clientY;},{passive:true});
    panel.addEventListener('touchend',function(e){if(tx===null)return;var t=e.changedTouches[0],dx=t.clientX-tx,dy=t.clientY-ty;tx=null;
      if(phone.matches&&dx>70&&Math.abs(dy)<50)closeM();},{passive:true});}
}
var closeMnav=function(){};
document.addEventListener('click',function(e){
  if(e.target.closest('[data-open-cart]')){openCart();}
  else if(e.target.closest('[data-close-cart]')){closeCart();}
  var pr=e.target.closest('[data-proto]');
  if(pr){e.preventDefault();toast(pr.dataset.proto+' is not part of the prototype');}
  var a=e.target.closest('a[href="#"]');
  if(a&&!pr){e.preventDefault();toast('Links to the live site’s guides and policy pages');}
});
document.addEventListener('submit',function(e){if(e.target.matches('[data-notify]')){e.preventDefault();toast('Thanks — we’ll let you know when it’s back (not connected in the prototype)');return;}if(e.target.matches('[data-news]')){e.preventDefault();toast('Thanks — newsletter sign-up is not connected in the prototype');}});

/* rails: a page at a time, arrows grey out at the ends, scroll-snap on touch */
function initRail(rail,nav){
  if(!rail||!nav)return;
  var prev=nav.querySelector('[data-dir="-1"]'),next=nav.querySelector('[data-dir="1"]');
  function upd(){prev.disabled=rail.scrollLeft<4;next.disabled=rail.scrollLeft+rail.clientWidth>=rail.scrollWidth-4;}
  nav.addEventListener('click',function(e){var b=e.target.closest('[data-dir]');if(!b)return;
    var card=rail.firstElementChild,step=card?card.getBoundingClientRect().width+parseFloat(getComputedStyle(rail).columnGap||16):rail.clientWidth;
    var per=Math.max(1,Math.floor((rail.clientWidth+2)/step));
    rail.scrollBy({left:(+b.dataset.dir)*per*step,behavior:'smooth'});});
  rail.addEventListener('scroll',function(){requestAnimationFrame(upd);});window.addEventListener('resize',upd);upd();setTimeout(upd,300);
}
function railNav(){return '<div class="rail-nav"><button type="button" data-dir="-1" aria-label="Previous">'+ICON.left+'</button><button type="button" data-dir="1" aria-label="Next">'+ICON.right+'</button></div>';}

/* countdown to the 6pm same-day dispatch cut-off (live product page) */
function countdown(el){
  if(!el)return null;
  function tick(){
    var n=new Date(),t=new Date(n);t.setHours(18,0,0,0);
    var day=n.getDay();
    var short=el.getAttribute('data-short');
    if(day===0||day===6||n>=t){if(short)el.innerHTML='<b>next working day</b>';else el.textContent='next working day';return;}
    var s=Math.floor((t-n)/1000),h=Math.floor(s/3600),m=Math.floor(s%3600/60),x=s%60;
    if(short){el.innerHTML='<span class="sp__l">in </span><b>'+(h<10?'0':'')+h+'h '+(m<10?'0':'')+m+'m</b>';return;}
    el.textContent=(h<10?'0':'')+h+'h '+(m<10?'0':'')+m+'m '+(x<10?'0':'')+x+'s';
  }
  tick();return setInterval(tick,1000);
}

/* boot */
function boot(){
  if(qs('shot'))document.documentElement.classList.add('no-anim');   /* for still screenshots */
  var h=$('#site-header');if(h)h.outerHTML=headerHTML();
  var f=$('#site-footer');if(f)f.outerHTML=footerHTML();
  document.body.insertAdjacentHTML('beforeend',drawerHTML());
  /* ?demo=basket|1|5|10|20 fills an empty basket; ?open=basket opens the drawer; ?quick=<handle> opens the popup (for reviews and screenshots) */
  var demo=qs('demo');
  if(demo&&demo!=='empty'&&(qs('shot')||!load().length)){
    var sets={basket:[['zyn-cool-mint',0,5],['zyn-cool-mint',3,5],['white-fox-mint',0,5]],'1':[['zyn-cool-mint',0,1]],'5':[['zyn-cool-mint',0,5]],'10':[['zyn-cool-mint',0,5],['white-fox-mint',0,5]],'20':[['zyn-cool-mint',0,10],['crispy-peppermint-10mg-nicotine-pouches-by-velo',1,10],['koldnic-frosty-peppermint',0,1]],many:[['zyn-cool-mint',0,5],['zyn-cool-mint',3,5],['white-fox-mint',0,5],['crispy-peppermint-10mg-nicotine-pouches-by-velo',1,2],['pablo-silver-edition-peppermint',0,1],['killa-cold-mint-16-5mg-bundle-20-pack',0,1],['fumi-mini-spearmint',0,1]]};
    var c=[];(sets[demo]||sets.basket).forEach(function(x){var p=BY[x[0]];if(p&&p.v[x[1]])c.push({h:p.h,v:p.v[x[1]].id,q:x[2]});});
    mem=c;try{localStorage.setItem(KEY,JSON.stringify(c));}catch(e){}
  }
  if(demo==='empty'){mem=[];try{localStorage.removeItem(KEY);}catch(e){}}
  initHeader();initSearch();render();initPromo();
  if(qs('open')==='basket')openCart();
  if(qs('shot'))setTimeout(function(){$$('img[loading="lazy"]').forEach(function(i){i.loading='eager';});},0);
  if(qs('dealopt')==='b')document.documentElement.classList.add('deal-b');   /* compare the coral text option */
  if(qs('quick')&&BY[qs('quick')])setTimeout(function(){openQuick(BY[qs('quick')],selV(BY[qs('quick')]).id);},50);
  window.addEventListener('storage',function(e){if(e.key===KEY)render();});
}
/* the 99p offer card: live puts it first in the Offers collection grid, linking to the 99p collection.
   Redrawn in our system (John: "you need to make a new clean version of this"): brand blue, amber ticker, 99p lockup, cans. */
function offer99HTML(){
  /* Round 7b: bold again (John: "i still wanted this to look like a bold stand out card, not like a normal card") -
     solid brand blue at card height, amber LATEST DEAL! pill, 99p / Nic Pouches lockup, three flat Koldnic pack cut-outs,
     white View deals pill, live "1 Per Order | Limited Stock" line, no ticker */
  var cans=(window.NP_DATA&&window.NP_DATA.offer99)||[];
  return '<a class="pc offer99" href="collection-99p-nic-pouches.html" aria-label="99p nic pouches: view deals">'+
    '<span class="offer99__top"><span class="offer99__pill">LATEST DEAL!</span><span class="offer99__pill offer99__pill--r">DON’T MISS OUT!</span></span>'+
    '<span class="offer99__lock"><b>99p</b><span>Nic Pouches</span></span>'+
    (cans.length?'<span class="offer99__cans" aria-hidden="true">'+cans.slice(0,3).map(function(u){return '<img src="'+esc(u)+'" alt="" loading="lazy">';}).join('')+'</span>':'')+
    '<span class="offer99__cta"><span class="offer99__btn">View deals '+ICON.arrow+'</span><small>1 Per Order | Limited Stock</small></span></a>';
}
/* first-order email pop-up. Live (popup-form.js): shows 12s after landing for visitors who are not signed in, once a day
   (cookie "First Order 25", 1 day); the button stays disabled until the consent box is ticked; the email is checked on
   submit. Here: the same timing and copy, a 1-day localStorage flag, nothing is sent anywhere. ?promo=1 always opens it,
   ?promo=success opens it on the success state (for review). */
var PROMO_KEY='np_first_order_popup';
function promoSeen(){try{var t=+localStorage.getItem(PROMO_KEY);return t&&Date.now()-t<864e5;}catch(e){return false;}}
function promoMark(){try{localStorage.setItem(PROMO_KEY,String(Date.now()));}catch(e){}}
function promoHTMLPop(){
  /* the live banner's three cans: a green VELO, a white Killa Exclusive, a Nordic Spirit Blueberry */
  var want={velo:'bright-spearmint',killa:'exclusive',"nordic-spirit":'Blueberry'};
  var cans=['velo','killa','nordic-spirit'].map(function(s){var b=BRAND_BY_SLUG[s];var c=(b&&b.cans||[]).concat(b&&b.stripCan?[b.stripCan]:[]).filter(function(u){return u.indexOf('/img/pkc/')>=0;});
    /* pack cut-outs only, never a raw photo; a missing one is logged */
    var pick=c.filter(function(u){return u.toLowerCase().indexOf(want[s].toLowerCase())>=0;})[0];if(!c.length&&window.console)console.warn('email pop-up: no pack cut-out for',s);return pick||c[0];}).filter(Boolean);
  return '<div class="fo" id="fo" hidden><div class="fo__scrim" data-fo-close></div>'+
    '<div class="fo__box" role="dialog" aria-modal="true" aria-labelledby="foT" aria-describedby="foS">'+
      '<button type="button" class="fo__x" data-fo-close aria-label="Close">'+ic(PATH.close,18)+'</button>'+
      '<div class="fo__panel"><div class="fo__ticket"><b>10% off</b><span>your first order</span></div>'+
        '<span class="fo__cans" aria-hidden="true">'+cans.map(function(u){return '<img src="'+esc(u)+'" alt="">';}).join('')+'</span></div>'+
      '<div class="fo__body"><div class="fo__form">'+
        '<h2 id="foT">Don’t miss out</h2><p class="fo__sub" id="foS">Your discount code will be emailed to you</p><p class="fo__small">One time offer and applicable to all new registered users</p>'+
        '<form data-fo-form novalidate><label class="sr" for="foEmail">Enter email for updates</label>'+
          '<input id="foEmail" type="email" name="email" placeholder="Enter your email!" autocomplete="email">'+
          '<span class="fo__err" hidden>Please use a valid email address.</span>'+
          '<label class="fo__consent"><input type="checkbox" id="foConsent"><span>I agree to receive marketing emails. Unsubscribe anytime.</span></label>'+
          '<button class="btn btn--block fo__btn" type="submit" disabled>Get your 10% Off now</button>'+
          '<p class="fo__proto">Prototype: nothing is sent.</p></form></div>'+
        '<div class="fo__done" hidden><span class="fo__tick">'+ic(PATH.check,28)+'</span><h2>You\'re in!</h2><p>Your 10% off code is headed to your email.</p></div>'+
      '</div></div></div>';
}
var foLast=null;
function openPromo(state){
  var fo=$('#fo');if(!fo)return;foLast=document.activeElement;fo.hidden=false;document.documentElement.classList.add('fo-open');
  if(state==='success'){$('.fo__form',fo).hidden=true;$('.fo__done',fo).hidden=false;}
  setTimeout(function(){var f=$('#foEmail',fo);if(f&&!qs('shot'))f.focus();},30);
}
function closePromo(){var fo=$('#fo');if(!fo||fo.hidden)return;fo.hidden=true;document.documentElement.classList.remove('fo-open');promoMark();if(foLast&&foLast.focus)foLast.focus();}
function initPromo(){
  document.body.insertAdjacentHTML('beforeend',promoHTMLPop());
  var fo=$('#fo'),form=$('[data-fo-form]',fo),em=$('#foEmail',fo),cb=$('#foConsent',fo),btn=$('.fo__btn',fo),err=$('.fo__err',fo);
  fo.addEventListener('click',function(e){if(e.target.closest('[data-fo-close]'))closePromo();});
  document.addEventListener('keydown',function(e){
    if(fo.hidden)return;
    if(e.key==='Escape'){closePromo();return;}
    if(e.key==='Tab'){var f=$$('button:not([disabled]),input,a[href]',fo).filter(function(x){return x.offsetParent!==null;});if(!f.length)return;
      var a=f[0],z=f[f.length-1];if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}}
  });
  cb.addEventListener('change',function(){btn.disabled=!cb.checked;});
  form.addEventListener('submit',function(e){e.preventDefault();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.value)){err.hidden=false;em.setAttribute('aria-invalid','true');em.focus();return;}
    err.hidden=true;em.removeAttribute('aria-invalid');$('.fo__form',fo).hidden=true;$('.fo__done',fo).hidden=false;promoMark();
    setTimeout(closePromo,4000);});
  var q=qs('promo');
  if(q)setTimeout(function(){openPromo(q);},q==='success'?0:50);
  else if(!qs('shot')&&!promoSeen())setTimeout(function(){if(!document.querySelector('.qa[aria-hidden="false"], body.cart-open'))openPromo();},12000);
}
/* full-site build: strength and flavour menus open their live collection pages; guides open their articles */
var BAND_COLL={low:'low-strength-nicotine-pouches',medium:'medium-strength-nicotine-pouches',high:'high-strength-nicotine-pouches',strong:'strong-strength-nicotine-pouches',extra:'extra-strong-strength-nicotine-pouches'};
function bandUrl(k){return BAND_COLL[k]?'collection-'+BAND_COLL[k]+'.html':'shop.html?strength='+k;}
function flavUrl(k){var f=(D.meta.flavours||[]).filter(function(x){return x.key===k;})[0];return f?'collection-'+f.collection+'.html':'shop.html?flavour='+k;}
function guideUrl(t){var a=(D.articles||[]).filter(function(x){return x.title===t;})[0];return a?'blog-'+a.handle+'.html':'blog.html';}
/* live <head>: page title, meta description and canonical, exactly as the live page has them (full-site migration) */
function setHead(o){if(!o)return;if(o.title)document.title=o.title;
  function meta(n,v){if(!v)return;var m=document.querySelector('meta[name="'+n+'"]');if(!m){m=document.createElement('meta');m.name=n;document.head.appendChild(m);}m.content=v;}
  meta('description',o.meta);
  if(o.canonical){var l=document.querySelector('link[rel=canonical]');if(!l){l=document.createElement('link');l.rel='canonical';document.head.appendChild(l);}l.href=o.canonical;}}
/* DEMO sign-in stub (Round 8): loads assets/js/demo-auth.js with this file's ?v= stamp. Remove this line and that file for the theme. */
(function(){if(window.NP_PRERENDER)return;var cs=document.currentScript,v=cs&&cs.src.indexOf('?')>0?cs.src.slice(cs.src.indexOf('?')):'';var d=document.createElement('script');d.src='assets/js/demo-auth.js'+v;document.head.appendChild(d);})();
window.NP={headerHTML:headerHTML,footerHTML:footerHTML,renderCart:render,bandUrl:bandUrl,flavUrl:flavUrl,guideUrl:guideUrl,setHead:setHead,offer99HTML:offer99HTML,notifyHTML:function(v){return '<form class="notify" data-notify><p class="notify__t">'+ib('bell',20)+'<b>Sold out</b> · '+esc(v&&v.t&&v.t!=='Default Title'?v.t+' is':'This is')+' out of stock right now</p><div class="notify__row"><label class="sr" for="nfEmail2">Email (optional)</label><input id="nfEmail2" type="email" placeholder="Email address (optional)" autocomplete="email"><button class="btn btn--ghost btn--block notify__btn" type="submit">'+ic(PATH_FILL.bell,18)+'Notify me when back in stock</button></div></form>';},P:P,BY:BY,C:C,BRANDS:BRANDS,BRAND_BY_SLUG:BRAND_BY_SLUG,BRAND_BY_VENDOR:BRAND_BY_VENDOR,brandUrl:brandUrl,brandOf:brandOf,brandName:brandName,
  $:$,$$:$$,esc:esc,fm:fm,fmp:fmp,mgs:mgs,qs:qs,ICON:ICON,ib:ib,spPair:spPair,PATH:PATH,PATH_FILL:PATH_FILL,ic:ic,badge:badge,BANDS:BANDS,BAND:BAND,
  cardHTML:cardHTML,optChips:optChips,optVs:optVs,mgBadge:mgBadge,logoBox:logoBox,renderCards:renderCards,range:range,meter:meter,strengthText:strengthText,bandLabel:bandLabel,
  anyStock:anyStock,firstOk:firstOk,findV:findV,basePrice:basePrice,perCan:perCan,bestTier:bestTier,tierSave:tierSave,tagsFor:tagsFor,url:url,
  add:add,load:load,price:price,setQty:setQty,rewardsHTML:rewardsHTML,promoHTML:promoHTML,lineHTML:lineHTML,summaryHTML:summaryHTML,upsellHTML:upsellHTML,
  openCart:openCart,closeCart:closeCart,openQuick:openQuick,toast:toast,initRail:initRail,railNav:railNav,countdown:countdown,searchP:searchP,norm:norm,stars:stars,boot:boot};
if(!window.NP_PRERENDER)boot();   /* tools/prerender_chrome.js renders the header and footer at build time with this same code */
})();
