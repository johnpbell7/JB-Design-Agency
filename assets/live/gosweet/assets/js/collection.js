/* GoSweet redesign — collection / category / brand page with filters and sort.
   collection.html?c=<live collection handle>[&brand=…][&type=…][&pack=single|box][&stock=1][&price=…][&halal=1][&sort=…][&t=<title>]
   Products and their order come from the live collection (data/collections.json); the intro, hero image and long
   description from the live collection page (data/collection-pages.json, tools/rip_site.py). */
(function(){
'use strict';
function run(){
var G=window.GS,D=window.GS_DATA,INFO=window.GS_COLINFO||{},$=G.$,$$=G.$$,ic=G.ic,esc=G.esc,fm=G.fm,BY=G.BY;
var root=$('[data-collection]');if(!root)return;
var sp=new URLSearchParams(location.search);
var ch=sp.get('c')||'all';
var col=G.COL[ch];
var info=(D.colPages||{})[ch]||{};
var brandOf=D.brands.filter(function(b){return b.h===ch;})[0];
var isSearch=/search\.html$/.test(location.pathname),sq=(sp.get('q')||'').trim();
if(isSearch){ch='search';col=null;info={};brandOf=null;}
var base=isSearch?(sq?G.search(sq).map(function(x){return x.p;}):[]):(ch==='all'||!col?G.P.slice():col.p.map(function(h){return BY[h];}).filter(Boolean));
var title=isSearch?(sq?'Results for “'+sq+'”':'Search'):(sp.get('t')||(col?col.t:'All products'));
if(ch==='all'&&!sp.get('t')&&sp.getAll('brand').length===1)title=sp.get('brand');
document.title=title+' | GoSweet';

/* ---------- filter model ---------- */
var PRICE=[['u10','Under £10',0,10],['10-20','£10 to £20',10,20],['20-30','£20 to £30',20,30],['o30','£30 and over',30,1e9]];
var state={brand:sp.getAll('brand'),type:sp.getAll('type'),pack:sp.getAll('pack'),price:sp.getAll('price'),diet:sp.getAll('diet'),stock:sp.get('stock')==='1',save:sp.get('save')==='1',sort:sp.get('sort')||'featured'};
var GROUPS=[
  {k:'stock',label:'Availability',bool:true,opts:[['1','In stock only',function(p){return p.ok;}]]},
  {k:'save',label:'Offers',bool:true,opts:[['1','Save 5% or more',function(p){return G.realSave(p)>0;}]]},
  {k:'pack',label:'Pack size',opts:[['box','Boxes (multi-packs)',function(p){return p.pcs>1;}],['single','Singles',function(p){return !(p.pcs>1);}]]},
  {k:'price',label:'Price',opts:PRICE.map(function(r){return [r[0],r[1],function(p){return p.p>=r[2]&&p.p<r[3];}];})},
  {k:'diet',label:'Dietary',opts:[['vegan','Vegan',function(p){return p.vg;}],['halal','Halal',function(p){return p.hl;}],['sf','Sugar free',function(p){return p.sf;}]]},
  {k:'type',label:'Type',dyn:function(p){return p.ty;}},
  {k:'brand',label:'Brand',dyn:function(p){return p.b;}}
];
function active(g){return g.bool?(state[g.k]?['1']:[]):state[g.k];}
function match(p,skip){
  for(var i=0;i<GROUPS.length;i++){var g=GROUPS[i];if(g.k===skip)continue;var a=active(g);if(!a.length)continue;
    if(g.dyn){if(a.indexOf(g.dyn(p))<0)return false;}
    else{var ok=false;for(var j=0;j<g.opts.length;j++){if(a.indexOf(g.opts[j][0])>=0&&g.opts[j][2](p)){ok=true;break;}}if(!ok)return false;}}
  return true;
}
var SORTS=[['featured',isSearch?'Best match':'Featured'],['best','Best selling'],['price-asc','Price, low to high'],['price-desc','Price, high to low'],['each-asc','Price per piece, low to high'],['save','Biggest saving'],['az','Alphabetically, A-Z'],['za','Alphabetically, Z-A'],['new','Date, new to old'],['old','Date, old to new']];
function sorted(list){
  var s=state.sort,l=list.slice();
  var each=function(p){return G.perPiece(p)||p.p;};
  var by={featured:null,best:function(a,b){return (b.best-a.best)||(b.rc-a.rc)||(a.o-b.o);},'price-asc':function(a,b){return a.p-b.p;},'price-desc':function(a,b){return b.p-a.p;},
    'each-asc':function(a,b){return each(a)-each(b);},save:function(a,b){return G.savePct(b)-G.savePct(a);},az:function(a,b){return a.t.localeCompare(b.t);},za:function(a,b){return b.t.localeCompare(a.t);},
    'new':function(a,b){return (b.pub||'').localeCompare(a.pub||'');},old:function(a,b){return (a.pub||'').localeCompare(b.pub||'');}}[s];
  if(by)l.sort(by);
  // sold-out products sink to the end in every sort (they stay findable)
  l.sort(function(a,b){return (b.ok?1:0)-(a.ok?1:0);});
  return l;
}
function facet(g){
  var rows=[];
  if(g.dyn){var cnt={};base.forEach(function(p){if(match(p,g.k)){var v=g.dyn(p);if(v)cnt[v]=(cnt[v]||0)+1;}});
    var all={};base.forEach(function(p){var v=g.dyn(p);if(v)all[v]=1;});
    Object.keys(all).sort(function(a,b){return a.localeCompare(b);}).forEach(function(v){rows.push([v,v,cnt[v]||0]);});}
  else g.opts.forEach(function(o){var n=base.filter(function(p){return match(p,g.k)&&o[2](p);}).length;rows.push([o[0],o[1],n]);});
  return rows;
}

/* ---------- page shell ---------- */
var logo=brandOf&&brandOf.logo;
var heroImg=info.hero||null;
var intro=info.intro||'';
var isBrand=!!brandOf;
var crumbs='<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>'+ic('caret-right',12)+(isSearch?'<span aria-current="page">Search</span></nav>':'')+(isSearch?'':isBrand?'<a href="brands.html">Brands</a>'+ic('caret-right',12):'<a href="collection.html?c=all">Shop</a>'+ic('caret-right',12))+'<span aria-current="page">'+(isSearch?'':esc(title)+'</span></nav>');
var brandStrip='';
if(!isBrand&&!isSearch){
  var bc={};base.forEach(function(p){bc[p.b]=(bc[p.b]||0)+1;});
  var bl=D.brands.filter(function(b){return bc[b.name]&&b.logo&&b.h;}).sort(function(a,b){return bc[b.name]-bc[a.name];}).slice(0,14);
  if(bl.length>=3)brandStrip='<div class="cbrands" aria-label="Brands in '+esc(title)+'"><span class="cbrands__lbl">Top brands here</span><div class="cbrands__row" data-scroll-x>'+bl.map(function(b){
    return '<a class="cbrand" href="'+esc(G.colUrl(b.h))+'"><span><img src="'+esc(b.logo)+'" alt="" loading="lazy"></span>'+esc(b.name)+'</a>';}).join('')+'</div></div>';
}
var shead=isSearch?'<form class="shead__form" action="search.html" role="search"><label class="sr" for="sq2">Search</label>'+ic('magnifying-glass',20)+'<input id="sq2" name="q" type="search" value="'+esc(sq)+'" placeholder="Search sweets, drinks, brands…"><button class="btn btn--sm" type="submit">Search</button></form>':'';
root.innerHTML='<div class="wrap">'+crumbs+
  '<header class="chead'+(isBrand?' chead--brand':'')+(isSearch?' chead--search':'')+'"><div class="chead__txt"><h1>'+esc(title)+'</h1>'+(intro?'<p class="chead__intro">'+esc(intro)+'</p>':'')+shead+
  '<p class="chead__count" data-count></p></div>'+
  ((isBrand&&logo)?'<div class="chead__logo"><img src="'+esc(logo)+'" alt="'+esc(title)+' logo"></div>':(heroImg?'<div class="chead__pic"><img src="'+esc(heroImg)+'" alt=""></div>':''))+'</header>'+
  brandStrip+
  '<div class="shop">'+
    '<aside class="filters" id="filters" aria-label="Filters"><div class="filters__head"><h2>Filter</h2><button class="xbtn" type="button" data-f-close aria-label="Close filters">'+ic('x',22)+'</button></div><div class="filters__body" data-fbody></div>'+
      '<div class="filters__foot"><button class="btn btn--ghost" type="button" data-f-clear>Clear all</button><button class="btn" type="button" data-f-close data-f-show>Show products</button></div></aside>'+
    '<div class="shop__main"><div class="tbar"><button class="tbar__f" type="button" data-f-open>'+ic('sliders-horizontal',18)+'Filter<span class="tbar__n" data-fn></span></button>'+
      '<div class="tbar__chips" data-chips></div>'+
      '<label class="tbar__sort"><span>Sort</span><select data-sort>'+SORTS.map(function(s){return '<option value="'+s[0]+'"'+(s[0]===state.sort?' selected':'')+'>'+s[1]+'</option>';}).join('')+'</select>'+ic('caret-down',14)+'</label></div>'+
      '<div class="grid" data-grid></div><div class="more" data-more></div></div>'+
  '</div></div>'+
  ((INFO[ch]||'')?'<section class="sec"><div class="wrap"><div class="cdesc" data-cdesc><div class="cdesc__in rte">'+INFO[ch]+'</div><button class="btn btn--ghost cdesc__btn" type="button" data-cdesc-btn aria-expanded="false">Read more'+ic('caret-down',14)+'</button></div></div></section>':'')+
  '<div class="fscrim" data-f-close></div>';

/* live links inside the long description point at prototype pages */
$$('.rte a[href]',root).forEach(function(a){a.setAttribute('href',G.link(a.getAttribute('href'),a.textContent.trim()));});
var cd=$('[data-cdesc]',root);
if(cd){var btn=$('[data-cdesc-btn]',cd);btn.addEventListener('click',function(){var o=cd.classList.toggle('is-open');btn.setAttribute('aria-expanded',o);btn.innerHTML=(o?'Show less':'Read more')+ic(o?'caret-up':'caret-down',14);});}

/* ---------- render ---------- */
var shown=24;
function renderFilters(){
  $('[data-fbody]',root).innerHTML=GROUPS.map(function(g){
    var rows=facet(g);if(!rows.length)return '';
    if(!g.dyn){rows=rows.filter(function(r){return r[2]||active(g).indexOf(r[0])>=0;});if(!rows.length)return '';}
    if(g.k==='type'&&rows.length<2&&!state.type.length)return '';
    if(g.k==='brand'&&rows.length<2&&!state.brand.length)return '';
    var a=active(g),many=rows.length>8;
    return '<details class="fg" '+(g.k==='brand'||g.k==='pack'||g.k==='stock'||g.k==='diet'||a.length?'open':'')+'><summary>'+esc(g.label)+(a.length?' <span class="fg__n">'+a.length+'</span>':'')+ic('caret-down',14)+'</summary><div class="fg__in">'+
      (g.k==='brand'&&many?'<label class="fg__find">'+ic('magnifying-glass',16)+'<span class="sr">Find a brand</span><input type="search" placeholder="Find a brand" data-bfind></label>':'')+
      '<ul class="fg__list'+(many?' fg__list--many':'')+'">'+rows.map(function(r){var on=a.indexOf(r[0])>=0;
        return '<li data-name="'+esc(r[1].toLowerCase())+'"><label class="cbx'+(r[2]||on?'':' is-zero')+'"><input type="checkbox" data-g="'+g.k+'" value="'+esc(r[0])+'"'+(on?' checked':'')+(r[2]||on?'':' disabled')+'><span class="cbx__box">'+ic('check',12)+'</span><span class="cbx__lbl">'+esc(r[1])+'</span><span class="cbx__n">'+r[2]+'</span></label></li>';}).join('')+'</ul></div></details>';
  }).join('');
}
function chipsHtml(){
  var c=[];
  GROUPS.forEach(function(g){active(g).forEach(function(v){var lab=g.dyn?v:(g.opts.filter(function(o){return o[0]===v;})[0]||[0,v])[1];
    c.push('<button class="fchip" type="button" data-rm-g="'+g.k+'" data-rm-v="'+esc(v)+'">'+esc(lab)+ic('x',13)+'</button>');});});
  if(c.length>1)c.push('<button class="fchip fchip--clear" type="button" data-f-clear>Clear all</button>');
  return c.join('');
}
function render(keepShown){
  var list=sorted(base.filter(function(p){return match(p);}));
  if(!keepShown)shown=24;
  var n=list.length;
  $('[data-count]',root).textContent=n+(n===1?' product':' products');
  $('[data-chips]',root).innerHTML=chipsHtml();
  var fcount=GROUPS.reduce(function(t,g){return t+active(g).length;},0);
  $('[data-fn]',root).textContent=fcount?fcount:'';
  var sh=$('[data-f-show]',root);if(sh)sh.textContent='Show '+n+(n===1?' product':' products');
  var grid=$('[data-grid]',root);
  if(!n&&isSearch&&!base.length){grid.innerHTML='<div class="noresults"><h2>'+(sq?'No results for “'+esc(sq)+'”':'What are you craving?')+'</h2><p>'+(sq?'Try a different keyword, or one of these:':'Try one of these:')+'</p><div class="noresults__terms">'+['Pick & Mix','Chocolate','Gummy Bears','Sour Sweets','Retro Sweets'].map(function(t){return '<a class="chip" href="search.html?q='+encodeURIComponent(t)+'">'+esc(t)+'</a>';}).join('')+'</div></div>';$('[data-more]',root).innerHTML='';return;}
  if(!n&&!isSearch&&!base.length){grid.innerHTML='<div class="noresults"><h2>Nothing in here right now</h2><p>This collection is empty on the live site at the moment.</p><a class="btn" href="collection.html?c=all">Shop all products</a></div>';$('[data-more]',root).innerHTML='';return;}
  if(!n){grid.innerHTML='<div class="noresults"><h2>No products match those filters</h2><p>Try removing a filter.</p><button class="btn" type="button" data-f-clear>Clear all filters</button></div>';$('[data-more]',root).innerHTML='';return;}
  grid.innerHTML=list.slice(0,shown).map(function(p){return G.card(p);}).join('');
  $('[data-more]',root).innerHTML=n>shown?'<p>Showing '+Math.min(shown,n)+' of '+n+'</p><div class="more__bar"><span style="width:'+(shown/n*100).toFixed(1)+'%"></span></div><button class="btn btn--ghost" type="button" data-loadmore>Load more products</button>':(n>24?'<p>Showing all '+n+'</p>':'');
}
function syncUrl(){
  var u=new URLSearchParams();if(isSearch)u.set('q',sq);else u.set('c',ch);if(sp.get('t'))u.set('t',sp.get('t'));
  ['brand','type','pack','price','diet'].forEach(function(k){state[k].forEach(function(v){u.append(k,v);});});
  if(state.stock)u.set('stock','1');if(state.save)u.set('save','1');if(state.sort!=='featured')u.set('sort',state.sort);
  history.replaceState(null,'',(isSearch?'search.html?':'collection.html?')+u.toString());
}
function update(){renderFilters();render();syncUrl();}
renderFilters();render();

root.addEventListener('change',function(e){
  var t=e.target;
  if(t.matches('[data-g]')){var k=t.getAttribute('data-g'),g=GROUPS.filter(function(x){return x.k===k;})[0];
    if(g.bool)state[k]=t.checked;else{var a=state[k];var i=a.indexOf(t.value);if(t.checked&&i<0)a.push(t.value);if(!t.checked&&i>=0)a.splice(i,1);}
    update();}
  if(t.matches('[data-sort]')){state.sort=t.value;render();syncUrl();}
});
root.addEventListener('input',function(e){if(e.target.matches('[data-bfind]')){var q=e.target.value.trim().toLowerCase();
  $$('.fg__list li',e.target.closest('.fg')).forEach(function(li){li.hidden=q&&li.getAttribute('data-name').indexOf(q)<0;});}});
root.addEventListener('click',function(e){
  var t=e.target;
  var rm=t.closest('[data-rm-g]');if(rm){var k=rm.getAttribute('data-rm-g'),v=rm.getAttribute('data-rm-v');var g=GROUPS.filter(function(x){return x.k===k;})[0];
    if(g.bool)state[k]=false;else state[k]=state[k].filter(function(x){return x!==v;});update();return;}
  if(t.closest('[data-f-clear]')){['brand','type','pack','price','diet'].forEach(function(k){state[k]=[];});state.stock=false;state.save=false;update();return;}
  if(t.closest('[data-loadmore]')){shown+=24;render(true);return;}
  if(t.closest('[data-f-open]')){document.body.classList.add('f-open');document.body.style.overflow='hidden';setTimeout(function(){var x=$('.filters .xbtn',root);if(x)x.focus();},50);return;}
  if(t.closest('[data-f-close]')){document.body.classList.remove('f-open');document.body.style.overflow='';return;}
});
document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.body.classList.contains('f-open')){document.body.classList.remove('f-open');document.body.style.overflow='';}});
if(G.qs('filters')==='open')document.body.classList.add('f-open');
}
if(window.GS)run();else document.addEventListener('gs:ready',run);
})();
