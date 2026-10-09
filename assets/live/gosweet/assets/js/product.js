/* GoSweet redesign — product page. product.html?p=<live handle>
   Everything shown is the live product's own data (products.json, the live card, the live Delivery panel), except
   "Earn x points" which is a proposal (1 point per £1, the live loyalty rate, rounded down). */
(function(){
'use strict';
function run(){
var G=window.GS,D=window.GS_DATA,DESC=window.GS_DESC||{},$=G.$,$$=G.$$,ic=G.ic,esc=G.esc,fm=G.fm,BY=G.BY;
var root=$('[data-product]');if(!root)return;
var h,p,fam,shelf,imgs,sv,pp,wp,dt,energy,box,qty=1,io=null;
function render(nh){
h=nh;p=BY[h];
if(!p){location.replace('404.html?from='+encodeURIComponent(location.pathname+location.search));return false;}
document.title=p.t+' | GoSweet';
try{var rv=JSON.parse(localStorage.getItem('gs_recent')||'[]').filter(function(x){return x!==h;});rv.unshift(h);localStorage.setItem('gs_recent',JSON.stringify(rv.slice(0,12)));}catch(e){}

/* the live product page's Delivery panel, word for word (same on every product, research/live-rules.md) */
var DELIVERY='<p><strong>England &amp; Wales Shipping:</strong></p><ul><li>Same-Day Dispatch: Order by 8:30pm (Mon–Fri)</li></ul>'+
  '<p>Orders £20+ (Mon-Fri):<br>- £2.99 Evri Next Working Day<br>- FREE Evri 48–72hr Tracked</p>'+
  '<p>Orders under £20 (Mon-Fri): £2.99 Evri Next Working Day (Tracked) Delivery</p><ul><li>Weekends: Order by 2pm on Saturday for Monday delivery.</li></ul>'+
  '<p><strong>Northern Ireland &amp; Scotland Shipping:</strong></p><p>£2.99 Evri (Tracked) Delivery</p>';

fam=G.packFamily(p);
shelf=(function(){var m=(D.menu||[]).filter(function(x){return x.label!=='Sale';});
  var map={'drinks':'Drinks','sweets':'Sweets','gummies':'Gummies & Jellies','chocolate':'Chocolate','snacks':'Snacks'};var lab=map[p.sh];var it=m.filter(function(x){return x.label===lab;})[0];
  return it?{label:it.label,href:G.link(it.href,it.label)}:null;})();
imgs=G.imgs(p,true);if(!imgs.length)imgs=['assets/img/placeholder.svg'];
sv=G.realSave(p);pp=G.perPiece(p);wp=sv?G.wasPiece(p):null;dt=G.diet(p);
energy=/^(Monster|Red Bull|Sneak Energy)$/.test(p.b)||/energy/i.test(p.t);
box=fam.filter(function(x){return x.pcs>1&&x.h!==p.h;}).sort(function(a,b){return (G.perPiece(a)||9)-(G.perPiece(b)||9);})[0];

function crumbs(){return '<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>'+ic('caret-right',12)+
  (shelf?'<a href="'+esc(shelf.href)+'">'+esc(shelf.label)+'</a>'+ic('caret-right',12):'')+
  '<a href="'+esc(G.brandUrl(p.b))+'">'+esc(p.b)+'</a>'+ic('caret-right',12)+'<span aria-current="page">'+esc(p.n)+'</span></nav>';}

function gallery(){
  return '<div class="pdp__gal"><div class="gal" data-gal>'+
    '<div class="gal__main">'+(p.ok&&sv?'<span class="gal__save"><small>Save</small>'+sv+'%</span>':'')+(!p.ok?'<span class="gal__status gal__status--out">Sold out</span>':(p.best?'<span class="gal__status">Bestseller</span>':''))+
    '<img src="'+esc(imgs[0])+'" alt="'+esc(p.alt)+'" data-gal-main width="1000" height="1000"></div>'+
    (imgs.length>1?'<div class="gal__thumbs" role="tablist" aria-label="Product images">'+imgs.map(function(s,i){return '<button class="gal__th'+(i?'':' is-on')+'" type="button" role="tab" aria-selected="'+(!i)+'" aria-label="Image '+(i+1)+'" data-gal-i="'+i+'"><img src="'+esc(s.replace('-lg.webp','.webp'))+'" alt=""></button>';}).join('')+'</div>':'')+
  '</div></div>';
}
function buyBox(){
  var pts=G.points(p.p);
  return '<div class="pdp__info">'+
    '<div class="pdp__top"><a class="pdp__brand" href="'+esc(G.brandUrl(p.b))+'">'+esc(p.b)+'</a>'+(dt.length?'<span class="pdp__diet">'+dt.map(function(d){return '<span>'+ic(d==='Vegan'?'leaf':'check',14)+d+'</span>';}).join('')+'</span>':'')+'</div>'+
    '<h1 class="pdp__title">'+esc(p.t)+'</h1>'+
    (p.rc?'<a class="pdp__rating" href="#reviews">'+G.stars(p)+'</a>':'')+
    '<div class="pdp__price'+(sv?' is-sale':'')+'"><span class="pdp__now">'+fm(p.p)+'</span>'+(sv&&p.w?'<s><span class="sr">was </span>'+fm(p.w)+'</s>':'')+(sv?'<span class="pdp__save">Save '+sv+'%</span>':'')+'</div>'+
    '<p class="pdp__each">'+esc(G.packName(p))+(pp?' · <b>'+fm(pp)+' each</b>'+(wp?' <s>'+fm(wp)+'</s>':''):'')+'</p>'+
    (fam.length>1?'<div class="opts" role="radiogroup" aria-label="Pack size"><span class="opts__lbl">Choose your pack</span>'+fam.map(function(x){return G.optHtml(x,p.h);}).join('')+'</div>':'')+
    (p.ok?'<div class="buyrow"><div class="qty" role="group" aria-label="Quantity"><button type="button" data-pq="-1" aria-label="One fewer">'+ic('minus',16)+'</button><input type="number" min="1" value="1" aria-label="Quantity" data-pv><button type="button" data-pq="1" aria-label="One more">'+ic('plus',16)+'</button></div>'+
      '<button class="btn" type="button" data-padd>'+ic('handbag',19)+'Add to basket<span class="btn__tot"> · <span data-ptot>'+fm(p.p)+'</span></span></button></div>'
      :'<div class="buyrow"><button class="btn" type="button" disabled>Sold out</button></div><p class="pdp__oos">This one is out of stock right now.</p>')+
    '<ul class="pdp__facts">'+
      '<li>'+ic('truck',20)+'<span>Free delivery on orders over £20</span></li>'+
      '<li>'+ic('clock',20)+'<span>Order by '+G.RULES.cutoff+' for same-day dispatch</span></li>'+
      '<li>'+ic('coins',20)+'<span>Earn <b data-ppts>'+G.ptsLabel(p.p)+'</b> with this order · <a href="loyalty.html">Go Sweet Rewards</a></span></li>'+
    '</ul>'+
    (box&&box.ok?'<a class="pdp__bulk" href="product.html?p='+esc(box.h)+'"><span class="pdp__bulk-ic">'+ic('package',22)+'</span><span><b>Get it cheaper in bulk '+fm(G.perPiece(box))+' each</b><span>Box of '+box.pcs+' for '+(box.w?'<s>'+fm(box.w)+'</s> ':'')+fm(box.p)+'</span></span><span class="pdp__bulk-go">View box'+ic('arrow-right',16)+'</span></a>':'')+
    '<div class="acc">'+
      (energy?'<p class="pdp__warn">'+ic('lightning',18)+'<span><b>High caffeine.</b> Not recommended for children, pregnant women, or people sensitive to caffeine.</span></p>':'')+
      '<details class="acc__i" open><summary>Description'+ic('caret-down',16)+'</summary><div class="acc__b rte" data-desc></div></details>'+
      '<details class="acc__i"><summary>Delivery'+ic('caret-down',16)+'</summary><div class="acc__b rte">'+DELIVERY+'</div></details>'+
    '</div>'+
  '</div>';
}
function related(){
  // "More products you'll love": the same brand first, topped up with the same type from other brands so the rail always
  // fills its 5 across and scrolls (John, 5 Oct: "should always be 5"); the second rail never repeats the first
  var rank=function(a,b){return (b.best-a.best)||(b.rc-a.rc)||(a.o-b.o);};
  var same=G.P.filter(function(x){return x.b===p.b&&x.h!==p.h&&fam.indexOf(x)<0&&x.ok;}).slice(0,10);
  if(same.length<10)same=same.concat(G.P.filter(function(x){return x.ty===p.ty&&x.b!==p.b&&x.ok&&x.img.length&&fam.indexOf(x)<0;}).sort(rank).slice(0,10-same.length));
  if(same.length<10)same=same.concat(G.P.filter(function(x){return x.sh===p.sh&&x.ok&&x.img.length&&x.h!==p.h&&fam.indexOf(x)<0&&same.indexOf(x)<0;}).sort(rank).slice(0,10-same.length));
  var like=G.P.filter(function(x){return x.ty===p.ty&&x.b!==p.b&&x.ok&&x.img.length&&same.indexOf(x)<0;}).sort(rank).slice(0,10);
  if(like.length<5)like=[];   // a short second rail would leave gaps; the first rail already covers the type
  var out='';
  if(same.length)out+='<section class="sec" aria-labelledby="r1"><div class="wrap"><div class="sec__head"><h2 id="r1">More products you\'ll love</h2><a class="link" href="'+esc(G.brandUrl(p.b))+'">Shop all '+esc(p.b)+ic('arrow-right',16)+'</a></div><div class="rail">'+same.map(function(x){return G.card(x);}).join('')+'</div></div></section>';
  if(like.length)out+='<section class="sec" aria-labelledby="r2"><div class="wrap"><div class="sec__head"><h2 id="r2">More '+esc(p.ty.toLowerCase())+'</h2>'+(shelf?'<a class="link" href="'+esc(shelf.href)+'">Shop all '+esc(shelf.label)+ic('arrow-right',16)+'</a>':'')+'</div><div class="rail">'+like.map(function(x){return G.card(x);}).join('')+'</div></div></section>';
  return out;
}
root.innerHTML='<div class="wrap">'+crumbs()+'<div class="pdp">'+gallery()+buyBox()+'</div></div>'+related()+
  (p.ok?'<div class="pbar" data-pbar aria-hidden="true"><div class="pbar__in"><img src="'+esc(G.img(p))+'" alt=""><div class="pbar__t"><b>'+esc(p.n)+'</b><span>'+fm(p.p)+(p.w?' <s>'+fm(p.w)+'</s>':'')+'</span></div><button class="btn" type="button" data-padd tabindex="-1">'+ic('handbag',18)+'Add</button></div></div>':'');

/* description: the live body_html; its links point at prototype pages */
var dsc=$('[data-desc]',root);
if(dsc){dsc.innerHTML=DESC[h]||'<p>'+esc(p.t)+'</p>';$$('a[href]',dsc).forEach(function(a){a.setAttribute('href',G.link(a.getAttribute('href')));});}

/* sticky add bar on phones once the buy button scrolls away */
var bar=$('[data-pbar]',root),main=$('.pdp .buyrow .btn',root);
if(io)io.disconnect();
if(bar&&main&&'IntersectionObserver' in window){io=new IntersectionObserver(function(en){var off=!en[0].isIntersecting&&en[0].boundingClientRect.top<0;bar.classList.toggle('is-on',off);bar.setAttribute('aria-hidden',!off);
  $$('button',bar).forEach(function(b){b.tabIndex=off?0:-1;});}).observe(main);}
qty=1;
return true;
}
/* gallery */
root.addEventListener('click',function(e){var b=e.target.closest('[data-gal-i]');if(!b)return;var i=+b.getAttribute('data-gal-i');$('[data-gal-main]',root).src=imgs[i];
  $$('.gal__th',root).forEach(function(t,j){t.classList.toggle('is-on',j===i);t.setAttribute('aria-selected',j===i);});});

/* quantity + add */
function upd(){var v=$('[data-pv]',root);if(v)v.value=qty;var t=$('[data-ptot]',root);if(t)t.textContent=fm(p.p*qty);var pt=$('[data-ppts]',root);if(pt)pt.textContent=G.ptsLabel(p.p*qty);}
root.addEventListener('click',function(e){
  var q=e.target.closest('[data-pq]');if(q){qty=Math.max(1,qty+parseInt(q.getAttribute('data-pq'),10));upd();return;}
  var a=e.target.closest('[data-padd]');if(a){G.add(p.h,qty,a);return;}
});
root.addEventListener('input',function(e){if(e.target.matches('[data-pv]')){qty=Math.max(1,parseInt(e.target.value,10)||1);upd();}});


/* pack choice (Single / Box) and the "cheaper in bulk" box link switch the product in place: no page reload, the scroll
   position stays, the URL updates (back/forward work). John, 5 Oct: "can it switch between single and multiples smoother" */
function swap(nh,push){
  if(!BY[nh]||nh===h)return;
  var pdp=$('.pdp',root);if(pdp)pdp.classList.add('is-swapping');
  var y=window.scrollY;
  setTimeout(function(){
    if(!render(nh))return;
    if(push)history.pushState({p:nh},'','product.html?p='+encodeURIComponent(nh));
    window.scrollTo(0,y);
    var n=$('.pdp',root);if(n){n.classList.add('is-swapping');requestAnimationFrame(function(){requestAnimationFrame(function(){n.classList.remove('is-swapping');});});}
  },120);
}
root.addEventListener('click',function(e){
  var o=e.target.closest('.opts [data-opt], .pdp__bulk');if(!o||e.metaKey||e.ctrlKey||e.shiftKey)return;
  var nh=o.getAttribute('data-opt')||(o.getAttribute('href')||'').split('p=')[1];
  if(nh&&BY[decodeURIComponent(nh)]){e.preventDefault();swap(decodeURIComponent(nh),true);}
});
window.addEventListener('popstate',function(){var nh=G.qs('p');if(nh&&nh!==h)swap(nh,false);});
render(G.qs('p'));
}
if(window.GS)run();else document.addEventListener('gs:ready',run);
})();
