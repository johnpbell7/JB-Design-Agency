/* GoSweet redesign — shared: header + mega menu, phone menu, search, footer, product card, basket (drawer + state),
   quick-add pop-up, toast, links from live URLs to prototype pages */
(function(){
'use strict';
var D=window.GS_DATA, IC=window.GS_ICONS||{};
var P=D.products, BY={};P.forEach(function(p){BY[p.h]=p;});
var COL={};D.collections.forEach(function(c){COL[c.h]=c;});
var BRAND={};D.brands.forEach(function(b){BRAND[b.name]=b;});

/* ---------- live rules (gosweet.co.uk, checked 2 Oct 2026; see research/live-rules.md) ---------- */
var RULES={
  freeDelivery:20,          // "Free UK delivery over £20" (USP bar, product page); shipping policy: England & Wales
  pointsPerPound:1,         // "Earn 1 point for every £1 you spend." (loyalty page)
  cutoff:'6:30pm',          // "Order by 6:30pm for same-day dispatch" (live USP bar). Product page Delivery panel + shipping policy say 8:30pm: flagged to John.
  bulkUpTo:'30%',           // "Bulk discounts save up to 30%" (USP bar)
  minSave:5                 // DECISION: a "Save x%" badge and was-price show from a 5% saving (live shows "Sale" even at 0.1%, e.g. B!G £9.99 vs £10.00)
};
window.GS_RULES=RULES;

/* ---------- helpers ---------- */
function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function fm(n){return '£'+(Math.round(n*100)/100).toFixed(2);}
function qs(k){return new URLSearchParams(location.search).get(k);}
function ic(name,size,fill){var k=name+(fill?'-fill':'-regular');var inner=IC[k]||IC[name+'-bold']||''; // regular weight for UI icons (John, 5 Oct: "this is all too thick")
  return '<svg class="ico" width="'+(size||20)+'" height="'+(size||20)+'" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">'+inner+'</svg>';}
/* per-piece prices are truncated to the penny, as the live site does (Red Bull 24 x £29.99 shows £1.24, not £1.25) */
function trunc(n){return Math.floor(n*100+1e-6)/100;}
function perPiece(p){return p.pcs&&p.pcs>1?trunc(p.p/p.pcs):null;}
function wasPiece(p){return p.pcs&&p.pcs>1&&p.w?trunc(p.w/p.pcs):null;}
function savePct(p){return p.w&&p.w>p.p?Math.round((1-p.p/p.w)*100):0;}
function packName(p){if(!p.pcs||p.pcs<=1)return 'Single';return 'Box of '+p.pcs;}
function img(p,lg){if(p.img&&p.img.length)return p.img[0]+(lg?'-lg':'')+'.webp';return (p.cdn&&p.cdn[0])||'assets/img/placeholder.svg';}
function imgs(p,lg){if(p.img&&p.img.length)return p.img.map(function(s){return s+(lg?'-lg':'')+'.webp';});return p.cdn||[];}
function points(n){return Math.floor(n*RULES.pointsPerPound);}
function ptsLabel(n){var x=points(n);return x+(x===1?' point':' points');}
var TINT={candy:['--t-candy','--i-candy'],citrus:['--t-citrus','--i-citrus'],herbal:['--t-herbal','--i-herbal'],mint:['--t-mint','--i-mint'],
  fruit:['--t-fruit','--i-fruit'],beverage:['--t-beverage','--i-beverage'],exotic:['--t-exotic','--i-exotic']};
function tintVars(t){var v=TINT[t]||TINT.fruit;return '--tint:var('+v[0]+');--tic:var('+v[1]+')';}

/* ---------- live URL -> prototype page ---------- */
function link(u,label){
  if(!u)return '#';
  var out0=link0(u);
  if(label&&/^collection\.html\?/.test(out0)&&/[?&](brand|type)=/.test(out0))out0+='&t='+encodeURIComponent(label);
  return out0;
}
function link0(u){
  u=String(u).replace(/^https?:\/\/(www\.)?gosweet\.co\.uk/,'');
  if(u===''||u==='/')return 'index.html';
  var q=u.indexOf('?'),path=q<0?u:u.slice(0,q),sp=new URLSearchParams(q<0?'':u.slice(q+1));
  var m;
  if((m=path.match(/^\/products\/([^\/]+)/)))return 'product.html?p='+m[1];
  if(path==='/collections'||path==='/collections/')return 'brands.html';
  if((m=path.match(/^\/collections\/([^\/]+)/))){
    var out=new URLSearchParams();out.set('c',m[1]);
    sp.getAll('filter.p.vendor').forEach(function(v){out.append('brand',v);});
    sp.getAll('filter.p.product_type').forEach(function(v){out.append('type',v);});
    return 'collection.html?'+out.toString();
  }
  if(path.indexOf('/pages/loyalty')===0)return 'loyalty.html';
  if(path==='/cart')return 'cart.html';
  if(path==='/account'||path.indexOf('/customer_authentication')===0)return 'loyalty-account.html?signin=1';
  if(path==='/search')return 'search.html?'+(sp.get('q')?'q='+encodeURIComponent(sp.get('q')):'');
  if((m=path.match(/^\/blogs\/news\/?([^\/]*)/)))return m[1]?'blog.html?a='+m[1]:'blog.html'; // the blog (blog.html)
  if(path.indexOf('/pages/')===0||path.indexOf('/policies/')===0||path.indexOf('/blogs/')===0)return 'page.html?u='+encodeURIComponent(path);
  return 'page.html?u='+encodeURIComponent(path);
}
function colUrl(h){return 'collection.html?c='+encodeURIComponent(h);}
function brandUrl(name){var b=BRAND[name];return b&&b.h?colUrl(b.h):'collection.html?c=all&brand='+encodeURIComponent(name);}

/* ---------- basket state ---------- */
var CART=[];
function loadCart(){try{CART=JSON.parse(localStorage.getItem('gs_cart')||'[]').filter(function(l){return BY[l.h];});}catch(e){CART=[];}}
function saveCart(){try{localStorage.setItem('gs_cart',JSON.stringify(CART));}catch(e){}renderCount();renderDrawer();syncCards();document.dispatchEvent(new CustomEvent('gs:cart'));}
function cartTotals(){var t={n:0,sub:0,was:0};CART.forEach(function(l){var p=BY[l.h];t.n+=l.q;t.sub+=p.p*l.q;t.was+=(realSave(p)&&p.w?p.w:p.p)*l.q;});
  t.sub=Math.round(t.sub*100)/100;t.save=Math.round((t.was-t.sub)*100)/100;t.pts=points(t.sub);t.left=Math.max(0,Math.round((RULES.freeDelivery-t.sub)*100)/100);return t;}
function addToCart(h,q){q=q||1;var l=CART.filter(function(x){return x.h===h;})[0];if(l)l.q+=q;else CART.push({h:h,q:q});saveCart();bump();}
function setQty(h,q){CART=CART.map(function(l){if(l.h===h)l.q=q;return l;}).filter(function(l){return l.q>0;});saveCart();}
function demoBasket(kind){ // review states: ?demo=empty|1|under|over|many
  var picks={'1':[['cadbury-twirl-chocolate-bars-48g',1]],'under':[['shades-by-niko-straight-up-strawberry',2],['milka-chocolate-oreo-single',3]],
    'over':[['cadbury-twirl-chocolate-bars-48g',1],['shades-by-niko-straight-up-strawberry',3],['gatorade-zero-355ml-orange',1]],
    'many':[['cadbury-twirl-chocolate-bars-48g',1],['gatorade-zero-355ml-orange',2],['shades-by-niko-tropical-blast',1],['mars-chocolate-bar-51g-box',1],['milka-chocolate-oreo-single',4],['a-w-root-beer-355ml',1]]};
  if(kind==='empty'){CART=[];}else if(picks[kind]){CART=picks[kind].filter(function(x){return BY[x[0]];}).map(function(x){return {h:x[0],q:x[1]};});}
  saveCart();
}
window.GS={P:P,BY:BY,COL:COL,BRAND:BRAND,RULES:RULES,ic:ic,fm:fm,esc:esc,qs:qs,link:link,colUrl:colUrl,brandUrl:brandUrl,img:img,imgs:imgs,
  ptsLabel:ptsLabel,cleanName:cleanName,brandCount:function(){return brandCount();},perPiece:perPiece,wasPiece:wasPiece,savePct:savePct,realSave:realSave,diet:diet,bestBox:bestBox,packName:packName,points:points,tintVars:tintVars,card:card,
  add:function(h,q,el){addToCart(h,q);celebrate(el,h,q);},cart:function(){return CART;},totals:cartTotals,setQty:setQty,openDrawer:openDrawer,quick:openQuick,$:$,$$:$$};

/* ---------- product card: ONE function and ONE stylesheet (card.css), so the design can be swapped in one place ---------- */
function stars(p){ // used on the product page only (most live products have no reviews)
  if(!p.rc)return '';
  return '<span class="stars" aria-label="Rated '+p.r.toFixed(1)+' out of 5 from '+p.rc+' review'+(p.rc>1?'s':'')+'">'+ic('star',14,true)+p.r.toFixed(1)+' <small>('+p.rc+(p.rc>1?' reviews':' review')+')</small></span>';
}
function metaLine(p){var pp=perPiece(p);return esc(packName(p))+(pp?' · '+fm(pp)+' each':'');}
function bestBox(p){return (p.sib||[]).map(function(h){return BY[h];}).filter(function(x){return x&&x.pcs>1&&x.ok;}).sort(function(a,b){return perPiece(a)-perPiece(b);})[0];}
function realSave(p){var sv=savePct(p);return sv>=RULES.minSave?sv:0;}
function diet(p){var d=[];if(p.vg)d.push('Vegan');if(p.hl)d.push('Halal');if(p.sf)d.push('Sugar free');return d;}
function inCartQty(h){var l=CART.filter(function(x){return x.h===h;})[0];return l?l.q:0;}
/* card E "Clear sticker" (card-concepts/js/card-e.js, adapted to the real basket): status pill, Save sticker, diet chips,
   rating only with reviews, brand, cleaned name, PACK SIZE | PER PIECE (PER KG for 1kg bags; singles link to their box),
   price + was (real saving only), Add -> stepper. */
function cleanName(t,b,halal){ // from card-e.js: name without the brand, "Box"/"Single" or a Halal word the chip says; size last
  var s=String(t||'').replace(/\s+/g,' ').trim(),lo=s.toLowerCase();
  var vs=[b,String(b).replace(/ and /g,' & '),String(b).replace(/ & /g,' and ')].sort(function(x,y){return y.length-x.length;});
  for(var i=0;i<vs.length;i++){var k=vs[i]?lo.indexOf(vs[i].toLowerCase()+' '):-1;if(k>-1&&k<=12){s=s.slice(k+vs[i].length).replace(/^[\s\-–:]+/,'');break;}}
  s=s.replace(/\s+(box|single)$/i,'');
  if(halal)s=s.replace(/\s*\(?\bhalal\b\)?/ig,' ');
  s=s.replace(/\s+/g,' ').trim();
  var lead=s.match(/^(\([^)]+\))\s+/);if(lead)s=s.slice(lead[0].length)+' '+lead[1];
  var m=s.match(/\b(\d+(?:\.\d+)?)\s?(kg|g|ml|cl|l|oz)\b(\s?x\s?\d+)?/i);
  if(m&&s.length>m[0].length){var size=m[1]+m[2].toLowerCase()+(m[3]?' x '+m[3].replace(/\D/g,''):'');
    s=(s.slice(0,m.index)+' '+s.slice(m.index+m[0].length)).replace(/\s+/g,' ').trim();
    var tail=s.match(/\s(\([^)]+\))$/);s=tail?s.slice(0,-tail[0].length)+' '+size+tail[0]:s+' '+size;}
  s=s.replace(/\(\s*\)/g,'').replace(/\s+/g,' ').trim(); // e.g. "16oz (473ml)": the size move can leave empty brackets
  return s||t;
}
function card(p){
  var sv=realSave(p),q=inCartQty(p.h),dt=[],sale=sv>0;
  if(p.vg)dt.push(['Vegan','leaf']);if(p.halal)dt.push(['Halal','check']);if(p.sf)dt.push(['Sugar free','check']);
  var st=!p.ok?['out','Sold out']:(p.best?['best','Bestseller']:null);
  var pack=p.pcs>1?'Box of '+p.pcs:(p.kg?'1kg bag':'Single');
  var u;
  if(p.pcs>1)u={l:'Per piece',v:fm(perPiece(p)),w:sale&&p.w?fm(wasPiece(p)):''};
  else if(p.kg)u={l:'Per kg',v:fm(p.p),w:sale&&p.w?fm(p.w):''};
  else{var bx=bestBox(p);u=bx?{l:'Box of '+bx.pcs,v:fm(perPiece(bx)),href:'product.html?p='+bx.h}:{l:'Per piece',v:fm(p.p),w:sale&&p.w?fm(p.w):''};}
  var right=u.href?'<span class="es__vrow"><a href="'+esc(u.href)+'"><span class="es__value">'+u.v+'</span><span class="es__each">each</span></a></span>'
    :'<span class="es__vrow"><span class="es__value'+(u.w?' es__value--sale':'')+'">'+u.v+'</span>'+(u.w?'<s class="es__cmp"><span class="sr">was </span>'+u.w+'</s>':'')+'</span>';
  var src=img(p); // the photo on its pinky-purple tile (product-images-tile), no cut-outs
  var act=p.ok?'<button type="button" class="es__add" data-add="'+esc(p.h)+'" aria-label="Buy '+esc(p.t)+' now: add to basket">Buy now</button>'+
      '<div class="es__qty" role="group" aria-label="Quantity in basket"><button type="button" class="es__step" data-dec="'+esc(p.h)+'" aria-label="One fewer">'+ic('minus',17)+'</button>'+
      '<output class="es__n" aria-live="polite">'+(q||1)+'</output><button type="button" class="es__step" data-inc="'+esc(p.h)+'" aria-label="One more">'+ic('plus',17)+'</button></div>'
    :'<button type="button" class="es__notify" data-notify aria-pressed="false">'+ic('bell',16)+'<span>Notify me</span></button>';
  return '<article class="es'+(p.ok?'':' is-out')+(q?' is-added':'')+(sale?' is-sale':'')+'" data-h="'+esc(p.h)+'">'+
    '<div class="es__stage"><span class="es__tile">'+
      '<img class="es__img" src="'+esc(src)+'" alt="'+esc(p.alt||p.t)+'" width="480" height="480" loading="lazy" decoding="async"></span>'+
      (p.ok&&sv?'<span class="es__save"><small>Save</small>'+sv+'%</span>':'')+
      (st?'<span class="es__status es__status--'+st[0]+'">'+st[1]+'</span>':'')+
      // diet chips and the rating share the bottom-left row, so the quick-view button can sit in the bottom-right corner
      (dt.length||p.rc>0?'<span class="es__diet">'+dt.map(function(d){return '<span class="es__chip">'+ic(d[1],11)+d[0]+'</span>';}).join('')+
        (p.rc>0?'<span class="es__rating" aria-label="Rated '+p.r.toFixed(1)+' out of 5 from '+p.rc+' review'+(p.rc>1?'s':'')+'">'+ic('star',13,true)+p.r.toFixed(1)+' <small>('+p.rc+')</small></span>':'')+'</span>':'')+
      (p.ok?'<button class="es__quick" type="button" data-quick="'+esc(p.h)+'" aria-label="Quick view '+esc(p.t)+'"><svg class="ico" width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">'+(IC['eye-light']||IC['eye-regular'])+'</svg></button>':'')+
    '</div>'+
    '<div class="es__words"><p class="es__brand">'+esc(p.b)+'</p><h3 class="es__name"><a href="product.html?p='+esc(p.h)+'">'+esc(cleanName(p.t,p.b,p.hl))+'</a></h3></div>'+
    '<div class="es__info"><div class="es__cell"><span class="es__label">Pack size</span><span class="es__value">'+esc(pack)+'</span></div><span class="es__divider" aria-hidden="true"></span>'+
      '<div class="es__cell es__cell--right"><span class="es__label">'+esc(u.l)+'</span>'+right+'</div></div>'+
    '<div class="es__buy"><p class="es__price"><strong>'+fm(p.p)+'</strong>'+(sale&&p.w?'<s><span class="sr">was </span>'+fm(p.w)+'</s>':'')+'</p><div class="es__act">'+act+'</div></div>'+
  '</article>';
}
function syncCards(){$$('.es[data-h]').forEach(function(c){var h=c.getAttribute('data-h'),q=inCartQty(h);c.classList.toggle('is-added',q>0);var n=$('.es__n',c);if(n&&q)n.textContent=q;});}
window.GS.metaLine=metaLine;window.GS.stars=stars;
/* the reward tiers as membership cards in a wallet stack (homepage and loyalty page share it; live tier facts, research/loyalty.md) */
window.GS.wallet=function(){
  return '<ul class="fan" aria-label="Reward tiers">'+[['club','Club','2%','0 – 299 pts'],['gold','Gold','4%','300 – 1199 pts'],['black','Black','8%','1200+ pts']].map(function(t){
    return '<li class="wcard wcard--'+t[0]+'"><span class="wcard__top"><span><b class="wcard__tier">'+t[1]+'</b><span class="wcard__pct"><strong>'+t[2]+'</strong> credit back</span></span>'+
      '<span class="wcard__brand">Go Sweet<br>Rewards</span></span><span class="wcard__chip" aria-hidden="true"></span><span class="wcard__pts">'+ic('coins',16)+t[3]+'</span></li>';}).join('')+'</ul>';
};

/* ---------- header ---------- */
/* ---------- the menu: research/menu-audit.md section 5 (data/menu-new.json). 8 items, brand logo tiles in every drop-down ---------- */
var M2=D.menu2||[];
var SPECIAL={dietary:'collection.html?c=all&diet=vegan&diet=halal&diet=sf&t=Dietary',boxes:'collection.html?c=all&pack=box&t=Bulk%20boxes',savings:'collection.html?c=all&save=1&sort=save&t=Biggest%20savings'};
function mlink(href,label){return SPECIAL[href]||(href==='/collections'?'brands.html':link(href,label));}
function resolveList(url){ // the products a prototype collection link shows (for the menu tiles' pictures)
  var q=new URLSearchParams(url.split('?')[1]||'');var c=q.get('c')||'all';var list=c==='all'||!COL[c]?P:COL[c].p.map(function(h){return BY[h];}).filter(Boolean);
  var br=q.getAll('brand'),ty=q.getAll('type'),dt=q.getAll('diet'),pk=q.get('pack'),sv=q.get('save')==='1';
  list=list.filter(function(p){return (!sv||realSave(p)>0)&&(!br.length||br.indexOf(p.b)>=0)&&(!ty.length||ty.indexOf(p.ty)>=0)&&(!pk||(pk==='box'?p.pcs>1:!(p.pcs>1)))&&
    (!dt.length||dt.some(function(d){return (d==='vegan'&&p.vg)||(d==='halal'&&p.hl)||(d==='sf'&&p.sf);}));});
  if(q.get('sort')==='save')list=list.slice().sort(function(a,b){return realSave(b)-realSave(a);});
  return list;
}
function resolveCount(url){ // how many products a prototype collection link shows (for the menu)
  var q=new URLSearchParams(url.split('?')[1]||'');var c=q.get('c')||'all';var list=c==='all'||!COL[c]?P:COL[c].p.map(function(h){return BY[h];}).filter(Boolean);
  var br=q.getAll('brand'),ty=q.getAll('type'),dt=q.getAll('diet'),pk=q.get('pack'),sv=q.get('save')==='1';
  return list.filter(function(p){return (!sv||realSave(p)>0)&&(!br.length||br.indexOf(p.b)>=0)&&(!ty.length||ty.indexOf(p.ty)>=0)&&(!pk||(pk==='box'?p.pcs>1:!(p.pcs>1)))&&
    (!dt.length||dt.some(function(d){return (d==='vegan'&&p.vg)||(d==='halal'&&p.hl)||(d==='sf'&&p.sf);}));}).length;
}
function brandTile(h){var b=D.brands.filter(function(x){return x.h===h;})[0];if(!b||!b.logo)return '';
  return '<a class="logo-tile" href="'+esc(colUrl(h))+'"><span class="logo-tile__img"><img src="'+esc(b.logo)+'" alt="" loading="lazy"></span>'+esc(b.name)+'</a>';}
function brandCount(){return D.brands.filter(function(b){return b.h&&b.n>0;}).length;}
function popularBrands(n){return D.brands.filter(function(b){return b.h&&b.logo&&b.n>=5;}).sort(function(a,b){return b.n-a.n;}).slice(0,n);}
function tileImg(lbl){var t=((D.home.cravings||{}).tiles||[]).filter(function(x){return x.label===lbl;})[0];return t&&t.img;}
var MEGA_FEAT={Sweets:tileImg('Sweets'),Chocolate:tileImg('Chocolates'),Drinks:tileImg('Drinks'),Snacks:tileImg('Crisps'),American:(D.colPages['american-sweets']||{}).hero||null};
var CAT_IC={Sweets:'gs-candy',Chocolate:'gs-chocolate',Drinks:'gs-soda',Snacks:'popcorn',American:'star',Brands:'storefront',Dietary:'leaf',Deals:'seal-percent'};
var DIET_IC={Vegan:'leaf',Halal:'check',['Sugar Free']:'drop'},DEAL_IC={Sale:'seal-percent',Bestsellers:'crown','Bulk boxes':'package','Biggest savings':'tag'};
function megaHtml(m){
  var all='<a class="link mega__all" href="'+esc(mlink(m.href,m.label))+'">Shop all '+esc(m.label)+ic('arrow-right',16)+'</a>';
  if(m.brandsPanel){ // every brand with products, as logo tiles A–Z, with a letter row to jump (John, 5 Oct: "the menu needs to show all brands?")
    var az=D.brands.filter(function(b){return b.h&&b.n;}).sort(function(a,b){return a.name.localeCompare(b.name);});
    var letters=[];az.forEach(function(b){var L=/[a-z]/i.test(b.name[0])?b.name[0].toUpperCase():'#';if(letters.indexOf(L)<0)letters.push(L);});
    var lastL='';
    return '<div class="mega mega--brands" role="region" aria-label="Brands"><div class="wrap"><div class="mega__head"><span class="h2">All '+az.length+' brands</span>'+
      '<nav class="mega__letters" aria-label="Show brands by letter"><button type="button" class="is-on" data-bletter="">All</button>'+letters.map(function(L){return '<button type="button" data-bletter="'+L+'">'+L+'</button>';}).join('')+'</nav>'+
      '<a class="link" href="brands.html">Brands A–Z page'+ic('arrow-right',16)+'</a></div>'+
      '<div class="mega__allbrands">'+az.map(function(b){var L=/[a-z]/i.test(b.name[0])?b.name[0].toUpperCase():'#';var id=L!==lastL?' id="mb-'+(L==='#'?'0':L)+'"':'';lastL=L;
        return '<a class="btile" data-l="'+L+'"'+id+' href="'+esc(colUrl(b.h))+'"><span class="btile__img">'+(b.logo?'<img src="'+esc(b.logo)+'" alt="" loading="lazy">':'<b aria-hidden="true">'+esc(b.name[0])+'</b>')+'</span><span class="btile__n">'+esc(b.name)+'</span></a>';}).join('')+
      '</div></div></div>';
  }
  if(m.diet||m.deals){
    if(m.deals)return '<div class="mega mega--small" role="region" aria-label="'+esc(m.label)+'"><div class="wrap"><div class="mega__tiles">'+dealTiles()+'</div></div></div>';
    var icm=DIET_IC;
    // bold tiles, each with the top product of that set cut out and popping out of the corner (John, 5 Oct: "can these look more exciting")
    return '<div class="mega mega--small" role="region" aria-label="'+esc(m.label)+'"><div class="wrap"><div class="mega__tiles">'+(m.types||[]).map(function(t,k){var u=mlink(t[1],t[0]);
      var top=resolveList(u).filter(function(p){return p.ok&&p.img&&p.img.length;})[0];
      return '<a class="mtile mtile--'+(m.deals?'d':'v')+(k+1)+'" href="'+esc(u)+'"><span class="mtile__ic">'+ic(icm[t[0]]||'tag',20,true)+'</span><span class="mtile__txt"><b>'+esc(t[0])+'</b>'+
        (t[1]==='boxes'?'<small>Boxes of your favourites</small>':'<small>'+resolveCount(u)+' products</small>')+'<em>Shop now'+ic('arrow-right',14)+'</em></span>'+
        (top?'<img class="mtile__img" src="'+esc(img(top))+'" alt="" loading="lazy">':'')+'</a>';}).join('')+'</div></div></div>';
  }
  // every brand in the category, grouped by type the way the live menu groups them (John, 5 Oct: "need to be able to feature
  // everybrand in the menu"); the "Shop all" picture tile is gone (John: "do we need this?")
  var live=(D.menu||[]).filter(function(x){return x.label===m.label;})[0];
  var groups=live&&live.columns&&live.columns.length?live.columns.map(function(c){return {t:c.title,href:c.href,b:(c.links||[]).map(function(l){return {label:l.label,href:l.href};})};}):null;
  if(groups&&groups.every(function(g){return !g.b.length;}))groups=[{t:'Brands',b:groups.map(function(g){return {label:g.t,href:g.href};})}]; // e.g. American: live lists brands as titles
  if(!groups){ // no live grouping (e.g. American): every brand with products in this category, A–Z
    var seen={};resolveList(mlink(m.href,m.label)).forEach(function(p){seen[p.b]=1;});
    groups=[{t:'Brands',b:D.brands.filter(function(b){return b.h&&seen[b.name];}).sort(function(a,b){return a.name.localeCompare(b.name);}).map(function(b){return {label:b.name,href:'/collections/'+b.h};})}];
  }
  function brow(l){var h=String(l.href||'').split('?')[0].split('/').pop(),b=D.brands.filter(function(x){return x.h===h;})[0];
    var lg=(b&&b.logo)||(D.logoByName||{})[String(l.label).toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]/g,'')];
    return '<li><a href="'+esc(link(l.href,l.label))+'"><span class="mb__logo">'+(lg?'<img src="'+esc(lg)+'" alt="" loading="lazy">':'<b>'+esc(l.label[0])+'</b>')+'</span>'+esc(l.label)+'</a></li>';}
  return '<div class="mega" role="region" aria-label="'+esc(m.label)+'"><div class="wrap"><div class="mega__in mega__in--groups"><div>'+
    '<ul class="mega__types">'+(m.types||[]).map(function(t){var u=mlink(t[1],t[0]);return '<li><a href="'+esc(u)+'"><span>'+esc(t[0])+'</span><small>'+resolveCount(u)+'</small></a></li>';}).join('')+'</ul>'+all+'</div>'+
    '<div class="mega__groups'+(groups.length===1?' mega__groups--one':'')+'">'+groups.map(function(g){return '<div class="mgroup"><h4 class="mega__h">'+esc(g.t)+'</h4><ul class="mgroup__list">'+g.b.map(brow).join('')+'</ul></div>';}).join('')+'</div>'+
    '</div></div></div>';
}
function tilesHtml(m,icm){return (m.types||[]).map(function(t,k){var u=mlink(t[1],t[0]);
    var top=resolveList(u).filter(function(p){return p.ok&&p.img&&p.img.length;})[0];
    return '<a class="mtile mtile--'+(m.deals?'d':'v')+(k+1)+'" href="'+esc(u)+'"><span class="mtile__ic">'+ic(icm[t[0]]||'tag',20,true)+'</span><span class="mtile__txt"><b>'+esc(t[0])+'</b>'+
      (t[1]==='boxes'?'<small>Boxes of your favourites</small>':'<small>'+resolveCount(u)+' products</small>')+'<em>Shop now'+ic('arrow-right',14)+'</em></span>'+
      (top?'<img class="mtile__img" src="'+esc(img(top))+'" alt="" loading="lazy">':'')+'</a>';}).join('');}
function dealTiles(){var m=M2.filter(function(x){return x.deals;})[0];return m?tilesHtml(m,DEAL_IC):'';}
/* ---------- first-visit sign-up pop-up: the live "10% off your first order" offer, wording word for word (research/live-rules.md).
   Shows once, 4s after a first visit (not for signed-in members); ?promo=1 forces it for review. PROTOTYPE: nothing is sent; on
   the live store it posts to the Klaviyo list "New Signup Form 10% Off". The code is in this script, as it is in the live page
   source (worth moving server-side on the real build). ---------- */
var SIGNUP_KEY='gs_signup_seen';
function signupShell(){
  return '<div class="signup" id="signup" aria-hidden="true"><div class="signup__scrim" data-signup-close></div>'+
    '<div class="signup__box" role="dialog" aria-modal="true" aria-labelledby="signup-t">'+
      '<button class="signup__x" type="button" aria-label="Close" data-signup-close>'+ic('x',20)+'</button>'+
      '<img class="signup__img" src="assets/img/popup-10-off.webp" alt="10% off your first order" width="1200" height="400">'+
      '<div class="signup__body" data-signup-form>'+
        '<h2 id="signup-t">Sweeten your first order🍬</h2><p class="signup__lead">Flat 10% off on your first order</p><p class="signup__small">One time offer and applicable to all new registered users</p>'+
        '<form class="signup__form" novalidate data-signup>'+
          '<label class="sr" for="su-e">Email</label><input id="su-e" type="email" autocomplete="email" placeholder="Enter email for updates" required>'+
          '<p class="signup__err" data-su-err="e" hidden>Please use a valid email address.</p>'+
          '<label class="sr" for="su-p">Phone</label><input id="su-p" type="tel" autocomplete="tel" placeholder="Enter phone number for SMS">'+
          '<p class="signup__err" data-su-err="p" hidden>Please enter a valid phone number, including country code.</p>'+
          '<p class="signup__consent">By signing up you agree to receive marketing emails from Gosweet. Unsubscribe in one click, anytime.</p>'+
          '<button class="btn btn--block" type="submit">Get your discount code</button></form></div>'+
      '<div class="signup__body signup__done" data-signup-done hidden><h2>You\'re in!</h2><p class="signup__lead">Use this code at checkout when placing your first order.</p>'+
        '<button class="signup__code" type="button" data-signup-copy><b>NEW10</b><span>Tap to copy</span></button></div>'+
    '</div></div>';
}
function openSignup(){var m=$('#signup');if(!m||m.classList.contains('is-open'))return;m.classList.add('is-open');m.setAttribute('aria-hidden','false');
  try{localStorage.setItem(SIGNUP_KEY,'1');}catch(e){}setTimeout(function(){var i=$('#su-e');if(i)i.focus({preventScroll:true});},250);}
function closeSignup(){var m=$('#signup');if(!m)return;m.classList.remove('is-open');m.setAttribute('aria-hidden','true');}
function initSignup(){
  var seen=false;try{seen=localStorage.getItem(SIGNUP_KEY)==='1';}catch(e){}
  if(qs('promo')==='1')setTimeout(openSignup,300);
  else if(!seen&&!isSigned()&&!/checkout|signin/.test(location.search))setTimeout(openSignup,4000);
  document.addEventListener('click',function(e){
    if(e.target.closest('[data-signup-close]')){closeSignup();return;}
    var c=e.target.closest('[data-signup-copy]');if(c){try{navigator.clipboard.writeText('NEW10');}catch(err){}c.querySelector('span').textContent='Copied';}
  });
  document.addEventListener('submit',function(e){var f=e.target.closest('[data-signup]');if(!f)return;e.preventDefault();
    var em=$('#su-e').value.trim(),ph=$('#su-p').value.trim(),okE=/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em),okP=!ph||/^\+?[0-9 ()-]{10,}$/.test(ph);
    $('[data-su-err="e"]').hidden=okE;$('[data-su-err="p"]').hidden=okP;if(!okE||!okP)return;
    $('[data-signup-form]').hidden=true;$('[data-signup-done]').hidden=false;});
}
function header(){
  var t=cartTotals(),signed=isSigned();
  var nav=M2.map(function(m,i){
    return '<li class="nav__item" data-i="'+i+'"><a class="nav__top'+(m.deals?' nav__top--sale':'')+'" href="'+esc(mlink(m.href,m.label))+'" aria-expanded="false">'+esc(m.label)+ic('caret-down',12)+'</a>'+megaHtml(m)+'</li>';
  }).join('');
  var pts=signed&&window.GS_MEMBER?window.GS_MEMBER.points+' pts':'Rewards';
  return '<div class="topbar" role="region" aria-label="Offers"><div class="wrap">'+usps()+'</div></div>'+
  '<header class="hdr" id="hdr"><div class="wrap"><div class="hdr__row">'+
    '<a class="hdr__logo" href="index.html" aria-label="GoSweet home"><img src="assets/img/logo.png" alt="GoSweet" width="168" height="31"></a>'+
    // header actions as live (John, 5 Oct: "i prefer this is cleaner"): Loyalty Points pill, account, search, basket; search opens the overlay
    '<div class="hdr__acts">'+
      '<a class="hdr__pts" href="'+(signed?'loyalty-account.html':'loyalty.html')+'">'+ic('coins',18)+'<span>'+(signed&&window.GS_MEMBER?esc(pts):'Loyalty Points')+'</span></a>'+
      '<a class="hdr__btn hdr__acct" href="loyalty-account.html'+(signed?'':'?signin=1')+'" aria-label="'+(signed?'Your account':'Log in')+'">'+ic('user-circle',25)+'</a>'+
      '<button class="hdr__btn hdr__msearch" type="button" aria-label="Search" data-search-open>'+ic('magnifying-glass',23)+'</button>'+
      '<a class="hdr__btn hdr__bag" href="cart.html" data-open-drawer aria-label="Basket">'+ic('handbag',24)+'<span class="hdr__count" data-n="'+t.n+'">'+t.n+'</span></a>'+
      '<button class="hdr__btn hdr__burger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="mnav" data-mnav-open><span class="hdr__burger-open">'+ic('list',24)+'</span><span class="hdr__burger-x">'+ic('x',24)+'</span></button>'+
    '</div></div></div>'+
    '<nav class="nav" aria-label="Shop"><div class="wrap"><ul class="nav__list">'+nav+'<li class="nav__item nav__item--hw"><a class="nav__top nav__top--hw" href="halloween.html">Halloween</a></li></ul></div></nav>'+
  '</header>'+uspStrip()+'<div class="mega-scrim" aria-hidden="true"></div>';
}
// the USP messages (live wording). Desktop: fixed in the top bar with the Trustpilot score on the right. Phones: the top bar shows
// the Trustpilot score and the messages scroll in a strip under the header (John, 5 Oct: Trustpilot "where the scrolling usps are
// and on mobile this goes under the nav … above the hero"). Trustpilot: "Excellent", TrustScore 4.3, 30 reviews (checked 5 Oct 2026).
var USPS=[['truck','<b>Free UK delivery</b> over £20'],['clock','Order by '+esc(RULES.cutoff)+' for <b>same-day dispatch</b>'],['package','<b>Bulk discounts</b> save up to 30%'],['coins','<b>Earn 1 point</b> for every £1 you spend']];
function uspItems(){return USPS.map(function(x){return '<span class="topbar__msg">'+ic(x[0],16)+'<span>'+x[1]+'</span></span>';}).join('');}
function trustpilot(){
  var star='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.7l7.1-.6z" fill="#fff"/></svg>';
  return '<a class="tp" href="https://uk.trustpilot.com/review/gosweet.co.uk" rel="noopener" title="TrustScore 4.3 out of 5 from 30 reviews on Trustpilot"><b>Excellent</b>'+
    '<span class="tp__stars" aria-label="4.3 out of 5 stars">'+[1,1,1,1,0].map(function(f){return '<i class="tp__s'+(f?'':' tp__s--half')+'">'+star+'</i>';}).join('')+'</span>'+
    '<span class="tp__logo"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.7l7.1-.6z" fill="#00b67a"/></svg>Trustpilot</span></a>';
}
function usps(){return '<div class="topbar__usps">'+uspItems()+'</div>'+trustpilot();}
function uspStrip(){ // phones only: the scrolling strip under the header
  return '<div class="ustrip" aria-hidden="true"><div class="topbar__track"><div class="topbar__set">'+uspItems()+'</div><div class="topbar__set">'+uspItems()+'</div></div></div>';
}
function mnav(){
  var signed=isSigned();
  return '<div class="mnav" id="mnav" aria-hidden="true"><div class="mnav__scrim" data-mnav-close></div><div class="mnav__panel" role="dialog" aria-modal="true" aria-label="Menu">'+
    '<div class="mnav__body">'+
    // phone menu, lead 5 Oct (John: "can the menu look better?"): two bold quick tiles, then categories with a product picture each
    // a swipe row: the four Deals tiles (as in the desktop Deals menu) then Rewards (John, 5 Oct: "can the cards in the mobile menu scroll")
    '<div class="mquick">'+dealTiles()+'<a class="mtile mtile--rew" href="'+(signed?'loyalty-account.html':'loyalty.html')+'"><span class="mtile__ic">'+ic('coins',20,true)+'</span><span class="mtile__txt"><b>Rewards</b><small>'+(signed&&window.GS_MEMBER?window.GS_MEMBER.points+' points':'1 point per £1')+'</small><em>See perks'+ic('arrow-right',14)+'</em></span>'+
      '<span class="mtile__card" aria-hidden="true"><i></i><b>Gold</b></span></a></div>'+ // a mini Gold membership card where the others have a product (John: "need somthing here a card?")
    '<div class="mnav__brands"><div class="mnav__brands-h"><b>Top brands</b><a href="brands.html">See all</a></div><div class="mnav__brands-row">'+(D.home.featuredBrands||[]).map(function(fb){return brandTile((fb.href||'').split('/').pop());}).join('')+'</div></div>'+
    M2.map(function(m){
      if(m.brandsPanel)return '<details class="macc"><summary><a class="macc__go" href="brands.html"><span class="macc__th" aria-hidden="true">'+ic('storefront',22,true)+'</span>Brands</a><span class="macc__tog" aria-hidden="true">'+ic('caret-down',20)+'</span></summary><div class="macc__in"><a class="link macc__all" href="brands.html">All brands A–Z'+ic('arrow-right',15)+'</a><div class="macc__logos macc__logos--row">'+popularBrands(12).map(function(b){return brandTile(b.h);}).join('')+'</div></div></details>';
      // phone menu rows: one centred icon per category, no product photos (John, 5 Oct: "these should all be icons, and be centered")
      // the icon + name go to the category page; the rest of the row and the arrow open the list (John, 5 Oct: "i cant click on the main category")
      return '<details class="macc"><summary'+(m.deals?' class="macc--sale"':'')+'><a class="macc__go" href="'+esc(mlink(m.href,m.label))+'"><span class="macc__th" aria-hidden="true">'+ic(CAT_IC[m.label]||'storefront',22,true)+'</span>'+esc(m.label)+'</a><span class="macc__tog" aria-hidden="true">'+ic('caret-down',20)+'</span></summary><div class="macc__in">'+
        // Deals: square coloured tiles laid out like the brand logo tiles (John, 5 Oct: "should have square versions of these so they
        // match the drop downs with brands"). Dietary: the same squares in the desktop Dietary tiles' colours, with the product count
        // (John, 5 Oct: "dietary requirements need to be in blocks like the ones we made in deals"); the other categories keep their chips
        (m.deals||m.diet?'<div class="macc__logos'+(m.diet?' macc__logos--diet':'')+'">'+(m.types||[]).map(function(t,k){var u=mlink(t[1],t[0]);
            var top=resolveList(u).filter(function(x){return x.ok&&x.img&&x.img.length;})[0];
            return '<a class="logo-tile dsq" href="'+esc(u)+'"><span class="logo-tile__img dsq__img dsq--'+(m.deals?'d':'v')+(k+1)+'"><span class="dsq__ic">'+ic((m.deals?DEAL_IC:DIET_IC)[t[0]]||'tag',16,true)+'</span>'+
              (top?'<img src="'+esc(img(top))+'" alt="" loading="lazy">':'')+'</span>'+(m.diet?'<span class="dsq__lbl">'+esc(t[0])+'<small>'+resolveCount(u)+' products</small></span>':esc(t[0]))+'</a>';}).join('')+'</div>'
          :'<ul class="macc__types">'+(m.types||[]).map(function(t){var u=mlink(t[1],t[0]);return '<li><a href="'+esc(u)+'">'+esc(t[0])+(t[1]==='boxes'?'':'<small>'+resolveCount(u)+'</small>')+'</a></li>';}).join('')+'</ul>')+
        (m.diet||m.deals?'':'<a class="btn btn--sm macc__all" href="'+esc(mlink(m.href,m.label))+'">Shop all '+esc(m.label)+ic('arrow-right',15)+'</a>')+
        ((m.brands||[]).length?'<div class="macc__logos macc__logos--row">'+m.brands.map(brandTile).join('')+'</div>':'')+
        '</div></details>';
    }).join('')+
    '<a class="mnav__link mnav__link--hw" href="halloween.html">'+ic('ghost',22,true)+'Halloween deals</a>'+
    '<a class="mnav__link" href="page.html?u=%2Fpages%2Fcontact">'+ic('envelope-simple',22,true)+'Help</a>'+
    '</div><div class="mnav__foot">'+(signed?'<a class="btn btn--ghost" href="loyalty-account.html">Your account</a><a class="btn" href="cart.html">Basket</a>':'<a class="btn btn--ghost" href="loyalty-account.html?signin=1">Login</a><a class="btn" href="loyalty.html#join">Join us</a>')+'</div></div></div>';
}

function footer(){
  return '<footer class="ftr"><div class="wrap"><div class="ftr__top">'+
    '<div class="ftr__brand"><a class="ftr__logo" href="index.html"><img src="assets/img/logo-footer.svg" alt="GoSweet"></a><p class="ftr__about">The UK\'s online sweet shop for the brands you actually want. American imports, chocolate, sweets and drinks. Over 600 products and 40+ brands, hand-packed and shipped from Birmingham.</p>'+
      '<form class="ftr__news" onsubmit="return false"><label class="sr" for="fe">Email</label><input id="fe" type="email" placeholder="Enter email for updates"><button class="btn btn--gold btn--sm" type="submit">Sign up</button></form>'+
      '<div class="ftr__social"><a href="https://www.trustpilot.com/review/gosweet.co.uk" rel="noopener">'+ic('star',15,true)+'Trustpilot</a><a href="https://www.google.com/preferences/source?q=gosweet.co.uk" rel="noopener">'+ic('plus',15)+'Add us on Google</a></div></div>'+
    '<div><h4>Shop</h4><ul><li><a href="brands.html">Sweets by Brand</a></li><li><a href="'+colUrl('chocolate')+'">Chocolate</a></li><li><a href="'+colUrl('gummies-and-jellies')+'">Gummies and jellies</a></li><li><a href="'+colUrl('popcorn')+'">Popcorn</a></li><li><a href="'+colUrl('vegan-sweets')+'">Vegan</a></li></ul></div>'+
    '<div><h4>Go Sweet</h4><ul><li><a href="loyalty.html">Loyalty Points</a></li><li><a href="blog.html">Latest News</a></li><li><a href="page.html?u=%2Fpages%2Fcontact">Contact</a></li></ul></div>'+
    '<div><h4>Policy</h4><ul><li><a href="page.html?u=%2Fpages%2Frefund-policy">Refund Policy</a></li><li><a href="page.html?u=%2Fpages%2Fprivacy-policy">Privacy Policy</a></li><li><a href="page.html?u=%2Fpages%2Fterms-of-service">Terms of Service</a></li><li><a href="page.html?u=%2Fpages%2Fshipping-policy">Shipping Policy</a></li></ul></div>'+
    '</div><div class="ftr__legal"><p>Registered Office: Vape Supplier Ltd (t/a gosweet.co.uk), 33 Bennetts Hill, Birmingham, West Midlands, England, B2 5SN - Registered in England Vape Supplier Ltd UK Company Registration Number: 10873335, VAT Number: GB272938666</p><p>© 2026 GoSweet - All Rights Reserved</p></div></div></footer>';
}

/* ---------- basket drawer ---------- */
function drawerShell(){
  return '<div class="drawer" id="drawer" aria-hidden="true"><div class="drawer__scrim" data-drawer-close></div>'+
    '<aside class="drawer__panel" role="dialog" aria-modal="true" aria-labelledby="dh" tabindex="-1">'+
    '<div class="drawer__head"><h2 id="dh">Your basket <span class="n" data-dn>0</span></h2><button class="xbtn" type="button" aria-label="Close basket" data-drawer-close>'+ic('x',22)+'</button></div>'+
    '<div data-ship></div><div class="drawer__body" data-dbody></div><div class="drawer__foot" data-dfoot></div></aside></div>';
}
function shipBar(t){
  var pct=Math.min(100,t.sub/RULES.freeDelivery*100);
  var done=t.left<=0;
  return '<div class="ship'+(done?' is-done':'')+'" role="status"><div class="ship__txt">'+ic(done?'check':'truck',18)+
    (done?'<span>You\'ve unlocked <b>FREE UK delivery</b></span>':'<span>Spend <b>'+fm(t.left)+'</b> more for <b>FREE UK delivery</b></span>')+
    '</div><div class="ship__bar" aria-hidden="true"><span class="ship__fill" style="width:'+pct.toFixed(1)+'%"></span></div></div>';
}
function lineHtml(l,big){
  var p=BY[l.h],pp=perPiece(p);
  return '<div class="line" data-h="'+esc(p.h)+'"><a class="line__img" href="product.html?p='+esc(p.h)+'"><img src="'+esc(img(p))+'" alt=""></a><div>'+
    '<div class="line__brand">'+esc(p.b)+'</div><a class="line__t" href="product.html?p='+esc(p.h)+'">'+esc(p.n)+'</a>'+
    '<div class="line__sub">'+metaLine(p)+'</div>'+
    '<div class="line__row"><div class="qty" role="group" aria-label="Quantity"><button type="button" data-q="-1" aria-label="One fewer">'+ic('minus',14)+'</button><span aria-live="polite">'+l.q+'</span><button type="button" data-q="1" aria-label="One more">'+ic('plus',14)+'</button></div>'+
    '<div class="line__price"><b>'+fm(p.p*l.q)+'</b>'+(realSave(p)&&p.w?'<s>'+fm(p.w*l.q)+'</s>':'')+'</div></div>'+
    '<button class="line__rm" type="button" data-rm>Remove</button></div></div>';
}
function upsell(){
  var inCart={};CART.forEach(function(l){inCart[l.h]=1;});
  var t=cartTotals();
  // small singles that help towards free delivery: in stock, cheapest first among bestseller/rated singles
  var list=P.filter(function(p){return p.ok&&!inCart[p.h]&&p.pcs===1&&p.img.length;}).sort(function(a,b){return (b.best-a.best)||(b.rc-a.rc)||(a.p-b.p);}).slice(0,8);
  if(!list.length)return '';
  return '<div class="upsell"><h4>'+(t.left>0?'Top up to free delivery':'Add a little extra')+'</h4><div class="upsell__row">'+list.map(function(p){
    return '<div class="mini"><img src="'+esc(img(p))+'" alt="" loading="lazy"><b>'+esc(p.b)+'</b><span>'+esc(p.n)+'</span><div class="mini__row"><strong>'+fm(p.p)+'</strong><button class="mini__add" type="button" data-add="'+esc(p.h)+'" aria-label="Add '+esc(p.t)+'">'+ic('plus',16)+'</button></div></div>';}).join('')+'</div></div>';
}
function renderDrawer(){
  var d=$('#drawer');if(!d)return;
  var t=cartTotals();
  $('[data-dn]',d).textContent=t.n;
  $('[data-ship]',d).innerHTML=CART.length?shipBar(t):'';
  if(!CART.length){
    $('[data-dbody]',d).innerHTML='<div class="drawer__empty">'+jar()+'<h3>Your basket is empty.</h3><p>Looks like you haven\'t added any sweets yet — let\'s fix that.</p><a class="btn" href="collection.html?c=all">Start shopping</a></div>'+upsell();
    $('[data-dfoot]',d).innerHTML='';return;
  }
  $('[data-dbody]',d).innerHTML=CART.map(function(l){return lineHtml(l);}).join('')+upsell();
  $('[data-dfoot]',d).innerHTML=
    (t.save>0?'<div class="sumrow sumrow--save"><span>You\'re saving</span><span>'+fm(t.save)+'</span></div>':'')+
    '<div class="sumrow sumrow--pts"><span>'+ic('coins',16,true)+' Points you\'ll earn</span><span>'+t.pts+' pts</span></div>'+
    '<div class="sumrow sumrow--total"><span>Subtotal</span><b>'+fm(t.sub)+'</b></div>'+
    '<p class="drawer__note">Taxes and shipping calculated at checkout.</p>'+
    '<div class="drawer__btns"><a class="btn btn--block" href="cart.html?checkout=1">'+ic('lock-simple',17)+'Checkout</a><a class="btn btn--ghost btn--block" href="cart.html">View full basket</a></div>';
}
function jar(){
  return '<svg class="jar" viewBox="0 0 120 120" aria-hidden="true"><rect x="28" y="22" width="64" height="12" rx="5" fill="#5c2a9d"/><path d="M32 34h56v8c8 6 12 14 12 24v30a14 14 0 0 1-14 14H34a14 14 0 0 1-14-14V66c0-10 4-18 12-24z" fill="#faf6ff" stroke="#dcd2ea" stroke-width="2.5"/>'+
    '<circle cx="60" cy="88" r="5" fill="#e73e80"/></svg>';
}
var lastFocus=null;
function openDrawer(){var d=$('#drawer');lastFocus=document.activeElement;renderDrawer();d.classList.add('is-open');d.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';setTimeout(function(){$('.drawer__panel',d).focus();},60);}
function closeDrawer(){var d=$('#drawer');d.classList.remove('is-open');d.setAttribute('aria-hidden','true');document.body.style.overflow='';if(lastFocus)lastFocus.focus();}
function renderCount(){var t=cartTotals();$$('.hdr__count').forEach(function(c){c.textContent=t.n;c.setAttribute('data-n',t.n);});}
function bump(){$$('.hdr__count').forEach(function(c){c.classList.remove('bump');void c.offsetWidth;c.classList.add('bump');});}

/* little moment of delight: a sprinkle burst from the button, then a toast with the free-delivery nudge */
function celebrate(el,h,q){
  if(el&&el.getBoundingClientRect&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
    var r=el.getBoundingClientRect(),b=document.createElement('div');b.className='burst';b.style.left=(r.left+r.width/2)+'px';b.style.top=(r.top+r.height/2)+'px';
    var cs=['#5c2a9d','#e73e80','#ffd23f','#b79be0'];
    for(var i=0;i<14;i++){var s=document.createElement('i');var a=Math.PI*2*i/14+Math.random()*.4,d=36+Math.random()*28;
      s.style.setProperty('--c',cs[i%cs.length]);s.style.setProperty('--x',Math.cos(a)*d+'px');s.style.setProperty('--y',Math.sin(a)*d-10+'px');b.appendChild(s);}
    document.body.appendChild(b);setTimeout(function(){b.remove();},700);
  }
  toast(h,q);
}
var tt=null;
function toast(h,q){
  var p=BY[h],t=cartTotals(),el=$('#toast');
  el.innerHTML='<img src="'+esc(img(p))+'" alt=""><div><b>Added to basket</b><span>'+(t.left>0?fm(t.left)+' away from free UK delivery':'Free UK delivery unlocked')+'</span></div><button class="btn btn--sm" type="button" data-open-drawer>View basket</button>';
  el.classList.add('is-on');clearTimeout(tt);tt=setTimeout(function(){el.classList.remove('is-on');},3200);
}

/* ---------- quick-add pop-up ---------- */
function optHtml(p,cur){
  var pp=perPiece(p),sv=realSave(p);
  return '<a class="opt'+(p.h===cur?' is-on':'')+(p.ok?'':' is-out')+'" href="product.html?p='+esc(p.h)+'" data-opt="'+esc(p.h)+'" role="radio" aria-checked="'+(p.h===cur)+'">'+
    (p.pcs>1&&sv?'<span class="opt__flag">Save '+sv+'%</span>':'')+
    '<span class="opt__radio"></span><span><span class="opt__name">'+esc(packName(p))+'</span><span class="opt__sub">'+(pp?'<b>'+fm(pp)+'</b> each'+(p.ok?'':' · Sold out'):(p.ok?'One piece':'Sold out'))+'</span></span>'+
    '<span class="opt__price"><strong>'+fm(p.p)+'</strong>'+(sv&&p.w?'<s>'+fm(p.w)+'</s>':'')+'</span></a>';
}
function packFamily(p){var f=[p].concat((p.sib||[]).map(function(h){return BY[h];}).filter(Boolean));return f.sort(function(a,b){return (a.pcs||1)-(b.pcs||1);});}
window.GS.optHtml=optHtml;window.GS.packFamily=packFamily;
var qaCur=null,qaQty=1;
function openQuick(h){
  var p=BY[h];if(!p)return;qaCur=h;qaQty=1;
  var qa=$('#qa');lastFocus=document.activeElement;
  var fam=packFamily(p);
  $('.qa__box',qa).innerHTML='<button class="xbtn qa__x" type="button" aria-label="Close" data-qa-close>'+ic('x',22)+'</button>'+
    '<div class="qa__media"><img src="'+esc(img(p,true))+'" alt="'+esc(p.alt)+'"></div>'+
    '<div class="qa__info"><a class="qa__brand" href="'+esc(brandUrl(p.b))+'">'+esc(p.b)+'</a><h2 class="qa__title" id="qat">'+esc(p.n)+'</h2>'+
    (p.rc?stars(p):'')+
    (fam.length>1?'<div class="opts" role="radiogroup" aria-label="Pack size"><span class="opts__lbl">Choose your pack</span>'+fam.map(function(x){return optHtml(x,h);}).join('')+'</div>':
      '<div class="opts"><span class="opts__lbl">Pack size</span>'+optHtml(p,h)+'</div>')+
    '<div class="buyrow"><div class="qty" role="group" aria-label="Quantity"><button type="button" data-qq="-1" aria-label="One fewer">'+ic('minus',16)+'</button><input type="number" min="1" value="1" aria-label="Quantity" data-qv><button type="button" data-qq="1" aria-label="One more">'+ic('plus',16)+'</button></div>'+
    '<button class="btn" type="button" data-qa-add'+(p.ok?'':' disabled')+'>'+ic('handbag',18)+(p.ok?'Add to basket<span class="btn__tot"> · <span data-qa-tot>'+fm(p.p)+'</span></span>':'Sold out')+'</button></div>'+
    '<div class="facts"><div class="fact"><span class="fi">'+ic('coins',18)+'</span><span>Earn <b data-qa-pts>'+ptsLabel(p.p)+'</b> with this item</span></div>'+
    '<div class="fact"><span class="fi">'+ic('truck',18)+'</span><span>Free UK delivery over £20 · Order by '+RULES.cutoff+' for same-day dispatch</span></div></div>'+
    '<a class="qa__more" href="product.html?p='+esc(p.h)+'">See full details '+ic('arrow-right',14)+'</a></div>';
  qa.classList.add('is-open');qa.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  setTimeout(function(){var b=$('[data-qa-add]',qa);(b&&!b.disabled?b:$('.qa__x',qa)).focus();},80);
}
function qaUpdate(){var qa=$('#qa'),p=BY[qaCur];var v=$('[data-qv]',qa);if(v)v.value=qaQty;var t=$('[data-qa-tot]',qa);if(t)t.textContent=fm(p.p*qaQty);var pt=$('[data-qa-pts]',qa);if(pt)pt.textContent=ptsLabel(p.p*qaQty);}
function closeQuick(){var qa=$('#qa');qa.classList.remove('is-open');qa.setAttribute('aria-hidden','true');document.body.style.overflow='';if(lastFocus)lastFocus.focus();}

/* ---------- search ---------- */
var POPULAR=['Pick & Mix','Chocolate','Gummy Bears','Sour Sweets','Retro Sweets']; // live "Popular Search Terms"
function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9& ]+/g,' ').replace(/\s+/g,' ').trim();}
function search(q,limit){
  q=norm(q);if(!q)return [];
  var words=q.split(' ');
  var res=P.map(function(p){var hay=norm(p.t+' '+p.b+' '+p.ty);var s=0;
    for(var i=0;i<words.length;i++){var w=words[i];if(hay.indexOf(w)<0){
      var w2=w.replace(/ies$/,'y').replace(/s$/,'');if(hay.indexOf(w2)<0)return null;s+=1;}else s+=2;}
    if(norm(p.b).indexOf(q)===0)s+=4;if(norm(p.t).indexOf(q)===0)s+=3;if(p.ok)s+=2;if(p.best)s+=1;return {p:p,s:s};}).filter(Boolean);
  res.sort(function(a,b){return b.s-a.s||a.p.o-b.p.o;});
  return limit?res.slice(0,limit):res;
}
window.GS.search=search;window.GS.norm=norm;
function hl(text,q){var t=esc(text);norm(q).split(' ').filter(function(w){return w.length>1;}).forEach(function(w){t=t.replace(new RegExp('('+w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')','ig'),'<mark>$1</mark>');});return t;}
function srchShell(){
  return '<div class="srch" id="srch" aria-hidden="true"><div class="srch__scrim" data-srch-close></div><div class="srch__panel" role="dialog" aria-modal="true" aria-label="Search"><div class="wrap">'+
    '<form class="srch__bar" action="search.html" role="search"><label class="srch__field">'+ic('magnifying-glass',22)+'<span class="sr">Search</span><input name="q" type="search" autocomplete="off" placeholder="Search sweets, drinks, brands…" data-srch-in>'+
    '<button class="srch__clear" type="button" aria-label="Clear" data-srch-clear hidden>'+ic('x',16)+'</button></label><button class="xbtn" type="button" aria-label="Close search" data-srch-close>'+ic('x',24)+'</button></form>'+
    '<div class="srch__body" data-srch-body></div></div></div></div>';
}
function srchRender(q){
  var body=$('[data-srch-body]');var clear=$('[data-srch-clear]');if(clear)clear.hidden=!q;
  if(!q){
    var top=(D.home.bestsellers&&D.home.bestsellers.handles||[]).map(function(h){return BY[h];}).filter(Boolean).slice(0,6);
    body.innerHTML='<div class="srch__grid"><div><h4>Popular searches</h4><div class="srch__terms">'+POPULAR.map(function(t){return '<a class="chip" href="search.html?q='+encodeURIComponent(t)+'">'+esc(t)+'</a>';}).join('')+'</div>'+
      '<h4 style="margin-top:22px">Shop by category</h4><ul class="srch__list">'+M2.filter(function(m){return m.types&&!m.diet&&!m.deals;}).map(function(m){return '<li><a href="'+esc(mlink(m.href,m.label))+'">'+ic('caret-right',14)+esc(m.label)+'</a></li>';}).join('')+'</ul></div>'+
      '<div><h4>This week\'s bestsellers</h4><div class="srch__prods">'+top.map(function(p){return sprod(p,'');}).join('')+'</div></div></div>';
    return;
  }
  var r=search(q,9),nq=norm(q);
  var brands=D.brands.filter(function(b){return norm(b.name).indexOf(nq)>=0;}).slice(0,5);
  var cols=D.collections.filter(function(c){return c.n&&norm(c.t).indexOf(nq)>=0&&!BRAND[c.t];}).slice(0,4);
  body.innerHTML='<div class="srch__grid"><div>'+
    (brands.length?'<h4>Brands</h4><ul class="srch__list">'+brands.map(function(b){return '<li><a href="'+esc(brandUrl(b.name))+'">'+(b.logo?'<img src="'+esc(b.logo)+'" alt="">':ic('storefront',16))+hl(b.name,q)+' <small style="color:var(--muted)">('+b.n+')</small></a></li>';}).join('')+'</ul>':'')+
    (cols.length?'<h4 style="margin-top:18px">Collections</h4><ul class="srch__list">'+cols.map(function(c){return '<li><a href="'+esc(colUrl(c.h))+'">'+ic('caret-right',14)+hl(c.t,q)+'</a></li>';}).join('')+'</ul>':'')+
    (!brands.length&&!cols.length?'<h4>Popular searches</h4><div class="srch__terms">'+POPULAR.map(function(t){return '<a class="chip" href="search.html?q='+encodeURIComponent(t)+'">'+esc(t)+'</a>';}).join('')+'</div>':'')+
    '</div><div><h4>Products</h4>'+(r.length?'<div class="srch__prods">'+r.map(function(x,i){return sprod(x.p,q,i===0);}).join('')+'</div><a class="btn btn--ghost srch__all" href="search.html?q='+encodeURIComponent(q)+'">See all '+search(q).length+' results'+ic('arrow-right',16)+'</a>':
      '<p class="srch__empty">No results for “'+esc(q)+'”. Try a different keyword.</p>')+'</div></div>';
}
function sprod(p,q,active){return '<a class="sprod'+(active?' is-active':'')+'" href="product.html?p='+esc(p.h)+'"><img src="'+esc(img(p))+'" alt="" loading="lazy"><span><b>'+esc(p.b)+'</b><span>'+(q?hl(p.n,q):esc(p.n))+'</span><i>'+fm(p.p)+'</i></span></a>';}
function openSearch(prefill){var s=$('#srch');lastFocus=document.activeElement;s.classList.add('is-open');s.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  var i=$('[data-srch-in]',s);i.value=prefill||'';srchRender(i.value);setTimeout(function(){i.focus();},40);}
function closeSearch(){var s=$('#srch');s.classList.remove('is-open');s.setAttribute('aria-hidden','true');document.body.style.overflow='';if(lastFocus&&lastFocus.blur)lastFocus.blur();}

/* ---------- demo sign-in (no credentials: a flag for the prototype) ---------- */
/* DEMO member shown when signed in: name, orders and points are made up for the prototype (job.json demoOnly).
   Points = 1 per £1 of each order, rounded down; tier from the live thresholds (Club 0–299, Gold 300–1199, Black 1200+). */
(function(){var orders=[{no:'#GS10482',date:'18 Sep 2026',total:64.97},{no:'#GS10217',date:'29 Aug 2026',total:53.48},{no:'#GS09931',date:'2 Aug 2026',total:61.85}];
  var pts=orders.reduce(function(t,o){return t+Math.floor(o.total);},0);
  window.GS_MEMBER={name:'John Bell',first:'John',points:pts,tier:pts>=1200?'Black':pts>=300?'Gold':'Club',orders:orders,expires:'18 Sep 2027'};})();
function isSigned(){try{return localStorage.getItem('gs_demo_signed_in')==='1';}catch(e){return false;}}
window.GS.isSigned=isSigned;

/* ---------- mount ---------- */
function trap(container,e){
  if(e.key!=='Tab')return;var f=$$('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])',container).filter(function(x){return x.offsetParent!==null;});
  if(!f.length)return;var a=f[0],z=f[f.length-1];
  if(e.shiftKey&&document.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&document.activeElement===z){e.preventDefault();a.focus();}
}
function mount(){
  loadCart();
  if(qs('signin')==='1'){try{localStorage.setItem('gs_demo_signed_in','1');}catch(e){}}
  var h=$('#site-header');if(h)h.outerHTML=header()+mnav();
  var f=$('#site-footer');if(f)f.outerHTML=footer();
  document.body.insertAdjacentHTML('beforeend',drawerShell()+srchShell()+'<div class="qa" id="qa" aria-hidden="true"><div class="qa__scrim" data-qa-close></div><div class="qa__box" role="dialog" aria-modal="true" aria-labelledby="qat"></div></div><div class="toast" id="toast" role="status" aria-live="polite"></div>'+signupShell());
  if(isSigned())document.documentElement.classList.add('signed');
  initSignup();
  renderDrawer();
  // top bar scrolls by itself (CSS animation, topbar__track); paused on hover and for reduced motion
  $$('[data-ic]').forEach(function(el){el.outerHTML=ic(el.getAttribute('data-ic'),16);});
  // rail arrows
  $$('[data-rail-prev],[data-rail-next]').forEach(function(btn){var k=btn.getAttribute('data-rail-prev')||btn.getAttribute('data-rail-next');var nx=btn.hasAttribute('data-rail-next');
    btn.innerHTML=ic(nx?'caret-right':'caret-left',18);
    btn.addEventListener('click',function(){var r=$('[data-rail="'+k+'"]');if(r)r.scrollBy({left:(nx?1:-1)*r.clientWidth*.9,behavior:'smooth'});});});
  // mega menu: hover with intent, click/keyboard toggles
  var timer=null,openItem=null;
  function openMega(li){if(openItem===li)return;closeMega();openItem=li;li.classList.add('is-open');$('.nav__top',li).setAttribute('aria-expanded','true');document.body.classList.add('mega-open');}
  function closeMega(){if(!openItem)return;openItem.classList.remove('is-open');$('.nav__top',openItem).setAttribute('aria-expanded','false');openItem=null;document.body.classList.remove('mega-open');}
  $$('.nav__item').forEach(function(li){
    if(!$('.mega',li))return;
    li.addEventListener('mouseenter',function(){clearTimeout(timer);timer=setTimeout(function(){openMega(li);},openItem?0:140);});
    li.addEventListener('mouseleave',function(){clearTimeout(timer);timer=setTimeout(closeMega,180);});
    var top=$('.nav__top',li);
    top.addEventListener('keydown',function(e){if(e.key==='ArrowDown'||e.key===' '){e.preventDefault();openMega(li);var a=$('.mega a',li);if(a)a.focus();}});
    li.addEventListener('focusout',function(e){if(!li.contains(e.relatedTarget)){if(openItem===li)closeMega();}});
  });
  var scrim=$('.mega-scrim');if(scrim)scrim.addEventListener('mouseenter',closeMega);
  // Brands menu letter row: a letter shows only the brands starting with it; All shows every brand
  document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-bletter]');if(!b)return;e.preventDefault();
    var L=b.getAttribute('data-bletter'),mega=b.closest('.mega');if(!mega)return;
    $$('[data-bletter]',mega).forEach(function(x){x.classList.toggle('is-on',x===b);x.setAttribute('aria-pressed',x===b?'true':'false');});
    $$('.btile[data-l]',mega).forEach(function(t){t.hidden=!!L&&t.getAttribute('data-l')!==L;});
    var box=$('.mega__allbrands',mega);if(box)box.scrollTop=0;});
  if(qs('mega')){var mi=$$('.nav__item')[parseInt(qs('mega'),10)||0];if(mi)openMega(mi);}

  document.addEventListener('click',function(e){
    var t=e.target;
    var add=t.closest('[data-add]');if(add){e.preventDefault();var ah=add.getAttribute('data-add');
      var wc=add.closest('.es');if(wc){wc.classList.add('is-pop');setTimeout(function(){wc.classList.remove('is-pop');},450);}
      window.GS.add(ah,1,add);if(wc){var inc=$('[data-inc]',wc);if(inc)try{inc.focus({preventScroll:true});}catch(x){}}return;}
    var nt=t.closest('[data-notify]');if(nt){var on=nt.getAttribute('aria-pressed')!=='true';nt.setAttribute('aria-pressed',on);var ns=$('span',nt);if(ns)ns.textContent=on?'Notified':'Notify me';return;}
    var inc2=t.closest('[data-inc]');if(inc2){e.preventDefault();var ih=inc2.getAttribute('data-inc');setQty(ih,inCartQty(ih)+1);bump();return;}
    var dec=t.closest('[data-dec]');if(dec){e.preventDefault();var dh=dec.getAttribute('data-dec');var nq=inCartQty(dh)-1;setQty(dh,nq);
      if(nq<1){var dc=dec.closest('.es');var ab=dc&&$('[data-add]',dc);if(ab)ab.focus();}return;}
    var qv=t.closest('[data-quick]');if(qv){e.preventDefault();openQuick(qv.getAttribute('data-quick'));return;}
    if(t.closest('[data-open-drawer]')){e.preventDefault();closeQuick&&$('#qa').classList.contains('is-open')&&closeQuick();$('#toast').classList.remove('is-on');openDrawer();return;}
    if(t.closest('[data-drawer-close]')){closeDrawer();return;}
    if(t.closest('[data-qa-close]')){closeQuick();return;}
    if(t.closest('[data-srch-close]')){closeSearch();return;}
    if(t.closest('[data-srch-clear]')){var i=$('[data-srch-in]');i.value='';srchRender('');i.focus();return;}
    // phone menu: slides out under the header; the burger becomes an X and closes it again (John, 5 Oct)
    if(t.closest('[data-mnav-open]')){var m=$('#mnav'),bt=$('[data-mnav-open]');
      if(m.classList.contains('is-open')){m.classList.remove('is-open');m.setAttribute('aria-hidden','true');bt.setAttribute('aria-expanded','false');bt.setAttribute('aria-label','Menu');document.body.style.overflow='';return;}
      var hb=$('#hdr').getBoundingClientRect().bottom;m.style.setProperty('--mnav-top',Math.max(0,hb)+'px');
      m.classList.add('is-open');m.setAttribute('aria-hidden','false');bt.setAttribute('aria-expanded','true');bt.setAttribute('aria-label','Close menu');document.body.style.overflow='hidden';return;}
    if(t.closest('[data-mnav-close]')){var m2=$('#mnav'),bt2=$('[data-mnav-open]');m2.classList.remove('is-open');m2.setAttribute('aria-hidden','true');bt2.setAttribute('aria-expanded','false');bt2.setAttribute('aria-label','Menu');document.body.style.overflow='';return;}
    var so=t.closest('[data-search-open]');if(so&&so.tagName!=='INPUT'){e.preventDefault();openSearch('');return;}
    var opt=t.closest('#qa [data-opt]');if(opt){e.preventDefault();openQuick(opt.getAttribute('data-opt'));return;}
    var qq=t.closest('[data-qq]');if(qq){qaQty=Math.max(1,qaQty+parseInt(qq.getAttribute('data-qq'),10));qaUpdate();return;}
    var qadd=t.closest('[data-qa-add]');if(qadd){addToCart(qaCur,qaQty);closeQuick();celebrate(null,qaCur,qaQty);return;}
    var line=t.closest('#drawer .line');
    if(line){var hh=line.getAttribute('data-h');var l=CART.filter(function(x){return x.h===hh;})[0];
      var qb=t.closest('[data-q]');if(qb&&l){setQty(hh,l.q+parseInt(qb.getAttribute('data-q'),10));return;}
      if(t.closest('[data-rm]')){setQty(hh,0);return;}}
  });
  document.addEventListener('focusin',function(e){var t=e.target;if(t.matches&&t.matches('input[data-search-open]')){t.blur();openSearch(t.value);}});
  document.addEventListener('input',function(e){if(e.target.matches('[data-srch-in]'))srchRender(e.target.value.trim());if(e.target.matches('[data-qv]')){qaQty=Math.max(1,parseInt(e.target.value,10)||1);qaUpdate();}});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'){if($('#signup.is-open'))closeSignup();else if($('#qa.is-open'))closeQuick();else if($('#drawer.is-open'))closeDrawer();else if($('#srch.is-open'))closeSearch();else if($('#mnav.is-open')){$('[data-mnav-open]').click();$('[data-mnav-open]').focus();}else closeMega();}
    if($('#drawer.is-open'))trap($('#drawer .drawer__panel'),e);
    if($('#qa.is-open'))trap($('#qa .qa__box'),e);
    if($('#mnav.is-open'))trap($('#mnav .mnav__panel'),e);
    if($('#srch.is-open')){trap($('#srch .srch__panel'),e);
      if(e.key==='ArrowDown'||e.key==='ArrowUp'){var items=$$('#srch .sprod');if(!items.length)return;e.preventDefault();var i=items.findIndex(function(x){return x.classList.contains('is-active');});
        items.forEach(function(x){x.classList.remove('is-active');});i=e.key==='ArrowDown'?Math.min(items.length-1,i+1):Math.max(0,i-1);items[i].classList.add('is-active');items[i].scrollIntoView({block:'nearest'});}
      if(e.key==='Enter'&&e.target.matches('[data-srch-in]')){var act=$('#srch .sprod.is-active');if(act&&e.target.value.trim()){e.preventDefault();location.href=act.getAttribute('href');}}}
  });
  // review states
  var demo=qs('demo');if(demo)demoBasket(demo);
  if(qs('open')==='basket')openDrawer();
  if(qs('quick'))openQuick(qs('quick'));
  if(qs('search')!==null&&qs('search')!==undefined)openSearch(qs('search'));
  // swipe right to close the drawers on phones
  ['#drawer .drawer__panel','#mnav .mnav__panel'].forEach(function(sel){var el=$(sel);if(!el)return;var x0=null;
    el.addEventListener('touchstart',function(e){x0=e.target.closest('.mquick,.mnav__brands-row,.macc__types,.macc__logos--row')?null:e.touches[0].clientX;},{passive:true}); // a swipe inside a sideways row scrolls it, it doesn't close the menu
    el.addEventListener('touchend',function(e){if(x0!==null&&e.changedTouches[0].clientX-x0>90){if(sel[1]==='d')closeDrawer();else $('[data-mnav-close]').click();}x0=null;},{passive:true});});
  document.dispatchEvent(new CustomEvent('gs:ready'));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
