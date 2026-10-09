(function(){
var N=window.NP, C=N.C, $=N.$, $$=N.$$, esc=N.esc, ICON=N.ICON, P=N.P;
var params=new URLSearchParams(location.search);
function list(k){var v=params.get(k);return v?v.split(',').filter(Boolean):[];}
var S={brand:list('brand'),strength:list('strength'),flavour:list('flavour'),offer:list('offer'),instock:params.get('instock')==='1',q:params.get('q')||'',sort:params.get('sort')||'',c:params.get('c')||''};
var PAGE=24, shown=PAGE;

var OFFERS=[['hot','Hot','hot'],['mm','Mix & Match','mm'],['pm','Premium Mix','sky'],['bundle','Bundles & deals','amber'],['99p','99p pouches','coral'],['new','New in','mint']];
var CTX={
  '':{title:'Nicotine Pouches',intro:C.collectionIntro,base:function(p){return p.kind!=='caffeine'&&p.kind!=='other';}},
  bestsellers:{title:'Bestsellers',intro:'Our best selling nic pouches, ranked.',base:function(p){return !!p.best;},sort:'best'},
  'new':{title:'New',intro:'',base:function(p){return p.isNew;},sort:'newfirst'},
  deals:{title:'Deals',intro:'',base:function(p){return p.kind==='bundle'||!!p.deal;}},
  caffeine:{title:'Caffeine Pouches',intro:'',base:function(p){return p.kind==='caffeine';}},
  toothpicks:{title:'Nicotine Toothpicks',intro:'',base:function(){return false;},empty:'Nicotine toothpicks are on the live site but not in this prototype.'},
  strips:{title:'Nicotine Strips',intro:'',base:function(){return false;},empty:'Nicotine strips are on the live site but not in this prototype.'}
};
var ctx=CTX[S.c]||CTX[''];
/* brand pages: brand.html?b=<slug> — the brand's own live collection, its own filters */
var BRAND=document.body.dataset.page==='brand'?N.BRAND_BY_SLUG[N.qs('b')]:null;
if(document.body.dataset.page==='brand'&&!BRAND){location.replace('brands.html');return;}
if(BRAND){var inB={};BRAND.products.forEach(function(h,i){inB[h]=i+1;});ctx={title:BRAND.name,intro:'',base:function(p){return !!inB[p.h];}};S.brand=[];S.c='';
  P.forEach(function(p){if(inB[p.h])p._border=inB[p.h];});}
/* collection pages: collection-<handle>.html carries its live collection (tools/build_pages.py) */
var COLL=window.NP_COLL||null;
if(COLL){var inC={};COLL.products.forEach(function(h,i){inC[h]=i+1;});ctx={title:COLL.title,intro:COLL.intro,base:function(p){return !!inC[p.h];}};S.c='';
  P.forEach(function(p){if(inC[p.h])p._border=inC[p.h];});}
if(!S.sort)S.sort=ctx.sort||'featured';

/* heading */
var title=ctx.title;
if(BRAND)title=BRAND.short;
if(COLL)title=COLL.title;
/* collections of products without a nicotine strength (snacks, caffeine) drop the strength strip and the pouch brand row */
if(COLL&&!P.some(function(p){return ctx.base(p)&&p.nic;})){['#f-strength','#brandrow'].forEach(function(q){var e=document.querySelector(q);if(e)e.style.display='none';});}
/* Round 7: every collection gets the brand-page (Killa-style) header — logo box when the live page has a logo, title,
   2-line description with Read more, and a flat row of up to 4 pack cut-outs from the collection's own in-stock products,
   one per flavour family where possible (John: "i want them all to be this type") */
if(COLL&&document.querySelector('.shop-head')){
  var cp=COLL.products.map(function(h){return N.BY?N.BY[h]:null;}).filter(Boolean);
  if(!cp.length)cp=P.filter(function(p){return inC[p.h];}).sort(function(a,b){return inC[a.h]-inC[b.h];});
  var okp=cp.filter(function(p){return p.img&&p.v.some(function(v){return v.ok;});});
  var pool=(okp.length?okp:cp.filter(function(p){return p.img;}));
  var singles=pool.filter(function(p){return p.kind!=='bundle'&&!/bundle|\bpack\b|-pack|\bmix\b|variety/i.test(p.title||'');});if(singles.length)pool=singles;
  /* one per brand first, then one per flavour family, then the rest, in the collection's own order */
  var cans=[],cut=function(p){return String(p.img).replace('/img/pk/','/img/pkc/');};
  [function(p){return p.brand;},function(p){return (p.flav&&p.flav[0])||p.h;},function(p){return p.h;}].forEach(function(key){
    var seen={};cans.forEach(function(c){pool.forEach(function(p){if(cut(p)===c)seen[key(p)]=1;});});
    pool.forEach(function(p){var c=cut(p),k=key(p);if(cans.length<4&&c.indexOf('/img/pkc/')>=0&&cans.indexOf(c)<0&&!seen[k]){seen[k]=1;cans.push(c);}});});
  /* a collection of bundles (no single cans) shows one pack bundle composite, a 5-can one first (John: "maybe on bundles") */
  var allBundles=pool.length>0&&pool.every(function(p){return p.kind==='bundle';});
  if(allBundles){var five=pool.filter(function(p){return p.cans===5&&cut(p).indexOf('/img/pkc/')>=0;});cans=five.length?[cut(five[0])]:cans.slice(0,1);}
  var intro=String(COLL.intro||'').replace(/<\/?p[^>]*>/g,' ').replace(/\s+/g,' ').trim();
  var hd=document.createElement('header');hd.className='bhead bhead--coll';hd.id='bhead';
  hd.innerHTML='<div><div class="bhead__id'+(COLL.logo?'':' bhead__id--nologo')+'">'+(COLL.logo?'<span class="lbox lbox--lg lbox--square"><img src="'+esc(COLL.logo)+'" alt="'+esc(COLL.title)+' logo"></span>':'')+
    '<div><h1 id="title">'+esc(COLL.title)+'</h1>'+(intro?'<p class="bhead__desc" id="bdesc">'+intro+'</p><button type="button" class="link bhead__more" data-bmore-desc hidden>Read more</button>':'')+'</div></div></div>'+
    (cans.length?'<span class="fan fan--row'+(allBundles?' fan--bundle':'')+'" aria-hidden="true">'+cans.map(function(u){return '<img src="'+esc(u)+'" alt="">';}).join('')+'</span>':'');
  var oldH=document.querySelector('.shop-head');oldH.parentNode.replaceChild(hd,oldH);
}
if(!S.c&&S.brand.length===1)title=brandName(S.brand[0])+' Nicotine Pouches';
if(!S.c&&S.offer.length===1&&S.offer[0]==='99p')title='99p Pouches';
if(S.q)title='Search: “'+S.q+'”';
if($('#title'))$('#title').textContent=title;
if($('#intro')&&!COLL){$('#intro').innerHTML=S.q||S.brand.length||S.offer.length?'':ctx.intro;if(!$('#intro').innerHTML)$('#intro').style.display='none';}
$('#crumbs').innerHTML='<a href="index.html">Home</a><span>/</span>'+(COLL?'<span aria-current="page">'+esc(COLL.title)+'</span>':BRAND?'<a href="shop.html">Nicotine Pouches</a><span>/</span><a href="brands.html">Brands</a><span>/</span><span aria-current="page">'+esc(BRAND.short)+'</span>':
  (S.c||S.brand.length||S.q?'<a href="shop.html">Nicotine Pouches</a><span>/</span><span aria-current="page">'+esc(title)+'</span>':'<span aria-current="page">Nicotine Pouches</span>'));
if(BRAND&&BRAND.seo)N.setHead(BRAND.seo);else if(!COLL)document.title=(BRAND?BRAND.name:title)+' | NicPouches';
if(BRAND){
  var B=BRAND,f=[];
  if(B.flavours)f.push(['Flavours',B.flavours]);
  if(B.mg)f.push(['Strengths',B.mg[0]===B.mg[1]?N.mgs(B.mg[0])+'mg':N.mgs(B.mg[0])+'–'+N.mgs(B.mg[1])+'mg']);
  if(B.from)f.push(['From',N.fm(B.from)+' per can']);
  $('#bhead').innerHTML='<div><div class="bhead__id">'+N.logoBox(B,'lg')+'<div><h1 id="title">'+esc(B.short)+'</h1>'+
    (B.desc?'<p class="bhead__desc" id="bdesc">'+B.desc+'</p><button type="button" class="link bhead__more" data-bmore-desc hidden>Read more</button>':'')+'</div></div></div>'+
    (B.cans&&B.cans.length?'<span class="fan fan--row" aria-hidden="true">'+B.cans.slice(0,4).map(function(u){return '<img src="'+esc(u)+'" alt="">';}).join('')+'</span>':'');
}else if($('#brandrow')){
  $('#brandrow').innerHTML=N.BRANDS.filter(function(b){return b.count;}).map(function(b){return '<a href="brand.html?b='+b.slug+'"><span class="lbox lbox--can"><img src="'+esc(b.stripCan||b.logo)+'" alt="" loading="lazy"></span>'+esc(b.short)+'</a>';}).join('')+'<a href="brands.html" style="justify-content:center;color:var(--blue)">All brands<br>A–Z</a>';
}

/* phones: the title sits beside the 2 cans when it fits in 2 lines, otherwise the cans go first and the title under them */
(function(){var hd=$('#bhead');if(!hd)return;function fit(){var h=hd.querySelector('h1');if(!h)return;hd.classList.remove('bhead--below');
  if(window.innerWidth<768){var lh=parseFloat(getComputedStyle(h).lineHeight)||29;if(h.scrollHeight>lh*2+3)hd.classList.add('bhead--below');}}
  fit();window.addEventListener('resize',fit);if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fit);})();
function brandName(v){return N.brandName(v);}
function bandsOf(p){return p.v.map(function(v){return v.band;}).filter(Boolean);}
function matches(p,skip){
  if(!ctx.base(p))return false;
  if(S.q&&N.searchP(S.q).indexOf(p)<0)return false;
  if(skip!=='brand'&&S.brand.length&&S.brand.indexOf(p.brand)<0)return false;
  if(skip!=='strength'&&S.strength.length&&!bandsOf(p).some(function(b){return S.strength.indexOf(b)>=0;}))return false;
  if(skip!=='flavour'&&S.flavour.length&&!(p.flav||[]).some(function(f){return S.flavour.indexOf(f)>=0;}))return false;
  if(skip!=='offer'&&S.offer.length&&!S.offer.every(function(o){return offerMatch(p,o);}))return false;
  if(skip!=='instock'&&S.instock&&!N.anyStock(p))return false;
  return true;
}
function offerMatch(p,o){return o==='mm'?p.pool==='mm':o==='pm'?p.pool==='pm':o==='bundle'?(p.kind==='bundle'||!!p.deal):o==='99p'?p.kind==='99p':o==='new'?!!p.isNew:o==='hot'?!!p.isHot:false;}
function minMg(p){var m=p.v.map(function(v){return v.mg;}).filter(function(x){return x!=null;});return m.length?Math.min.apply(null,m):0;}
function maxMg(p){var m=p.v.map(function(v){return v.mg;}).filter(function(x){return x!=null;});return m.length?Math.max.apply(null,m):0;}
function sortList(a){
  var f={featured:function(x,y){return BRAND||COLL?(x._border-y._border):x.order-y.order;},best:function(x,y){return (x.best||999)-(y.best||999)||x.order-y.order;},
    'price-asc':function(x,y){return N.basePrice(x)-N.basePrice(y);},'price-desc':function(x,y){return N.basePrice(y)-N.basePrice(x);},
    'str-asc':function(x,y){return minMg(x)-minMg(y);},'str-desc':function(x,y){return maxMg(y)-maxMg(x);},
    az:function(x,y){return x.title.localeCompare(y.title);},
    newfirst:function(x,y){var nf=(N.D&&N.D.meta&&N.D.meta.newFirst)||(window.NP_DATA&&NP_DATA.meta&&NP_DATA.meta.newFirst)||[],a=nf.indexOf(x.h),b=nf.indexOf(y.h);a=a<0?1e6:a;b=b<0?1e6:b;return a-b||x.order-y.order;}}[S.sort]||function(x,y){return x.order-y.order;};
  return a.slice().sort(function(x,y){var s=(N.anyStock(y)?1:0)-(N.anyStock(x)?1:0);return s||f(x,y);});
}

/* filter UI */
function opt(name,val,label,n,checked,extra){
  return '<label class="fopt" data-empty="'+(n?0:1)+'"><input type="checkbox" data-f="'+name+'" value="'+esc(val)+'"'+(checked?' checked':'')+'><span class="box"></span>'+(extra||'')+'<span>'+label+'</span><span class="n">'+n+'</span></label>';
}
function group(id,title,body,open){return '<details class="fgroup" id="'+id+'"'+(open?' open':'')+'><summary>'+title+' '+ICON.chev+'</summary>'+body+'</details>';}
var brandExpanded=false, brandQ='';
function drawFilters(){
  var base=P.filter(function(p){return ctx.base(p);});
  /* strength strip */
  $('#f-strength').innerHTML=N.BANDS.map(function(b){
    var n=P.filter(function(p){return matches(p,'strength')&&bandsOf(p).indexOf(b.key)>=0;}).length;
    return '<button type="button" class="bchip" data-b="'+b.key+'" data-strength="'+b.key+'" aria-pressed="'+(S.strength.indexOf(b.key)>=0)+'">'+N.meter(b.key)+esc(b.name)+' <small>'+esc(b.range.replace(' per pouch',''))+'</small></button>';
  }).join('');
  /* brands */
  var brands={};base.forEach(function(p){brands[p.brand]=0;});
  P.forEach(function(p){if(matches(p,'brand'))brands[p.brand]=(brands[p.brand]||0)+1;});
  var total={};base.forEach(function(p){total[p.brand]=(total[p.brand]||0)+1;});
  var names=Object.keys(brands).sort(function(a,b){return (S.brand.indexOf(b)>=0)-(S.brand.indexOf(a)>=0)||total[b]-total[a]||a.localeCompare(b);});
  var vis=names.filter(function(b){return !brandQ||N.norm(b).indexOf(N.norm(brandQ))>=0;});
  var lim=brandExpanded||brandQ?vis:vis.slice(0,8);
  var bBody=(names.length>8?'<input class="fsearch" type="search" placeholder="Search brands" value="'+esc(brandQ)+'" data-bq>':'')+
    lim.map(function(b){var bo=N.BRAND_BY_VENDOR[b];return opt('brand',b,esc(bo?bo.short:b),brands[b],S.brand.indexOf(b)>=0,bo&&bo.logo?'<img class="blogo" src="'+esc(bo.logo)+'" alt="">':'');}).join('')+
    (!brandQ&&vis.length>8?'<button type="button" class="fmore" data-bmore>'+(brandExpanded?'Show fewer':'Show all '+vis.length+' brands')+'</button>':'');
  /* flavours */
  var fBody=C.flavours.map(function(f){var n=P.filter(function(p){return matches(p,'flavour')&&(p.flav||[]).indexOf(f.key)>=0;}).length;
    return opt('flavour',f.key,esc(f.name),n,S.flavour.indexOf(f.key)>=0,'<img src="'+f.img+'" alt="">');}).join('');
  var oBody=OFFERS.map(function(o){var n=P.filter(function(p){return matches(p,'offer')&&offerMatch(p,o[0]);}).length;
    return opt('offer',o[0],'<span class="tag tag--'+o[2]+'">'+esc(o[1])+'</span>',n,S.offer.indexOf(o[0])>=0);}).join('');
  var inStock=P.filter(function(p){return matches(p,'instock')&&N.anyStock(p);}).length;
  var sBody=opt('instock','1','In stock only',inStock,S.instock);
  var html=
    (BRAND?'':group('f-brand','Brand',bBody,true))+group('f-flavour','Flavour',fBody,true)+group('f-offer','Offers',oBody,true)+group('f-stock','Availability',sBody,false);
  var keep=$('.fsearch')&&document.activeElement===$('.fsearch');
  var opened={};$$('#fgroups details').forEach(function(d){opened[d.id]=d.open;});
  $('#fgroups').innerHTML=html;
  $$('#fgroups details').forEach(function(d){if(d.id in opened)d.open=opened[d.id];});
  if(keep){var fs=$('.fsearch');fs.focus();fs.setSelectionRange(fs.value.length,fs.value.length);}
}
function activeChips(){
  var c=[];
  S.strength.forEach(function(k){c.push(['strength',k,N.BAND[k].name,'band-tag" data-b="'+k]);});
  S.brand.forEach(function(k){c.push(['brand',k,brandName(k),'tag--blue']);});
  S.flavour.forEach(function(k){var f=C.flavours.filter(function(x){return x.key===k;})[0];c.push(['flavour',k,f?f.name:k,'tag--sky']);});
  S.offer.forEach(function(k){var o=OFFERS.filter(function(x){return x[0]===k;})[0];c.push(['offer',k,o?o[1]:k,'tag--'+(o?o[2]:'mint')]);});
  if(S.instock)c.push(['instock','1','In stock','tag--line']);
  if(S.q)c.push(['q',S.q,'“'+S.q+'”','tag--line']);
  $('#active').innerHTML=c.map(function(x){return '<button type="button" class="tag '+x[3]+'" data-unset="'+x[0]+'" data-val="'+esc(x[1])+'" aria-label="Remove filter '+esc(x[2])+'">'+esc(x[2])+' '+ICON.x+'</button>';}).join('')+(c.length>1?'<button type="button" class="clear" data-clear>Clear all</button>':'');
  var n=S.strength.length+S.brand.length+S.flavour.length+S.offer.length+(S.instock?1:0);
  $('[data-open-filters]').innerHTML=ICON.filter+' Filter'+(n?' ('+n+')':'');
}
function draw(){
  var res=sortList(P.filter(function(p){return matches(p);}));
  $('#count').innerHTML='<b>'+res.length+'</b> product'+(res.length===1?'':'s');
  $('#showN').textContent='Show '+res.length+' result'+(res.length===1?'':'s');
  if(!res.length){
    $('#grid').innerHTML='<div class="noresults"><h3>'+(ctx.empty?esc(title):'No pouches match')+'</h3><p>'+esc(ctx.empty||'Try a different strength or brand, or clear your filters.')+'</p><a class="btn btn--sm" href="shop.html">Shop all nicotine pouches</a></div>';
    $('#more').innerHTML='';
  }else{
    N.renderCards($('#grid'),res.slice(0,shown));
    if(S.c==='deals'||(COLL&&COLL.offerCard))$('#grid').insertAdjacentHTML('afterbegin',N.offer99HTML());   /* live: first tile of the Offers grid */
    $('#more').innerHTML='<small>Showing '+Math.min(shown,res.length)+' of '+res.length+'</small><div class="track track--blue"><i style="width:'+(Math.min(shown,res.length)/res.length*100)+'%"></i></div>'+(shown<res.length?'<button class="btn btn--ghost" type="button" data-more>Show more</button>':'');
  }
  drawFilters();activeChips();
  $('#sort').value=S.sort;
  var u=new URLSearchParams();
  if(S.c)u.set('c',S.c);
  ['brand','strength','flavour','offer'].forEach(function(k){if(S[k].length)u.set(k,S[k].join(','));});
  if(S.instock)u.set('instock','1');if(S.q)u.set('q',S.q);if(S.sort!==(ctx.sort||'featured'))u.set('sort',S.sort);
  if(BRAND){u.set('b',BRAND.slug);history.replaceState(null,'','brand.html?'+u.toString());}
  else if(!COLL)history.replaceState(null,'','shop.html'+(u.toString()?'?'+u.toString():''));
}
function toggle(arr,v){var i=arr.indexOf(v);if(i>=0)arr.splice(i,1);else arr.push(v);}
document.addEventListener('change',function(e){
  var t=e.target;
  if(t.matches('[data-f]')){var f=t.dataset.f;if(f==='instock')S.instock=t.checked;else toggle(S[f],t.value);shown=PAGE;draw();}
  if(t.id==='sort'){S.sort=t.value;draw();}
});
document.addEventListener('input',function(e){if(e.target.matches('[data-bq]')){brandQ=e.target.value;drawFilters();}});
document.addEventListener('click',function(e){
  var b=e.target.closest('[data-strength]');if(b){toggle(S.strength,b.dataset.strength);shown=PAGE;draw();return;}
  var u=e.target.closest('[data-unset]');if(u){var k=u.dataset.unset;if(k==='instock')S.instock=false;else if(k==='q')S.q='';else toggle(S[k],u.dataset.val);draw();return;}
  if(e.target.closest('[data-clear]')){S.brand=[];S.strength=[];S.flavour=[];S.offer=[];S.instock=false;S.q='';draw();return;}
  if(e.target.closest('[data-more]')){shown+=PAGE;draw();return;}
  if(e.target.closest('[data-bmore]')){brandExpanded=!brandExpanded;drawFilters();return;}
  if(e.target.closest('[data-open-filters]')){document.body.classList.add('filters-open');return;}
  if(e.target.closest('[data-close-filters]')){document.body.classList.remove('filters-open');return;}
});
$('[data-close-filters].icon-btn').innerHTML=ICON.close;
if(params.get('focus')==='search'){var si=$('#searchInput');setTimeout(function(){var m=document.querySelector('.mnav');if(window.innerWidth<1024&&m){m.classList.add('open');var f=m.querySelector('input[name=q]');if(f)f.focus();}else if(si)si.focus();},100);}
if(location.hash){setTimeout(function(){var el=document.querySelector(location.hash);if(el){if(el.tagName==='DETAILS')el.open=true;el.scrollIntoView({block:'start'});}},60);}
var bd=$('#bdesc'),bm=$('[data-bmore-desc]');
if(bd&&bm){requestAnimationFrame(function(){if(bd.scrollHeight>bd.clientHeight+2)bm.hidden=false;});bm.addEventListener('click',function(){var o=bd.classList.toggle('open');bm.textContent=o?'Read less':'Read more';});}
if($('#intro'))$('#intro').addEventListener('click',function(e){if(!e.target.closest('a'))this.classList.toggle('open');});
draw();
/* feedback 6.4: the brand's full editorial content from its live collection page, under the products */
var OWNER=BRAND||COLL;
if(OWNER&&OWNER.content&&!OWNER.content.hidden){(function(){
  var c=OWNER.content, main=document.querySelector('.shop'), sec=document.createElement('section');
  sec.className='bcontent';sec.setAttribute('aria-label','About '+(BRAND?BRAND.short:COLL.title));
  var tmp=document.createElement('div');tmp.innerHTML=c.body||'';
  /* an in-body FAQ block (an h2 mentioning FAQ / frequently asked, then h3 + answer) becomes an accordion */
  var kids=Array.prototype.slice.call(tmp.childNodes),out=[],inFaq=false,cur=null;
  kids.forEach(function(n){
    var tag=n.nodeName;
    if(tag==='H2'){inFaq=/faq|frequently asked/i.test(n.textContent);cur=null;out.push(n.outerHTML);return;}
    if(inFaq&&tag==='H3'){cur={q:n.textContent,a:''};out.push(cur);return;}
    if(inFaq&&cur&&n.nodeType===1){cur.a+=n.outerHTML;return;}
    out.push(n.nodeType===1?n.outerHTML:(n.textContent.trim()?'<p>'+esc(n.textContent)+'</p>':''));
  });
  var faqOpen=true;
  /* live page order: featured content, the FAQ section, then the long body */
  function acc(q,a){var h='<details class="bfaq"'+(faqOpen?' open':'')+'><summary><span>'+esc(q)+'</span><span class="bfaq__pm">'+N.ic(N.PATH.plus,16)+'</span></summary><div class="bfaq__a">'+a+'</div></details>';faqOpen=false;return h;}
  var faqs=(c.faqs||[]).length?'<h2>'+esc(c.faqTitle||('FAQs'))+'</h2>'+c.faqs.map(function(f){return acc(f.q,f.a);}).join(''):'';
  var body=out.map(function(x){return typeof x==='string'?x:acc(x.q,x.a);}).join('');
  body=body.replace(/<table>/g,'<div class="btable"><table>').replace(/<\/table>/g,'</table></div>');
  sec.innerHTML='<div class="bcontent__inner" id="bcIn">'+(c.featured||'')+faqs+body+'</div><div class="bcontent__fade"></div><button class="btn btn--ghost btn--sm bcontent__more" type="button" aria-expanded="false" aria-controls="bcIn">Read more</button>';
  main.parentNode.insertBefore(sec,main.nextSibling);
  var more=sec.querySelector('.bcontent__more');
  function fits(){if(sec.querySelector('.bcontent__inner').scrollHeight<=440){sec.classList.add('is-short');}}
  fits();
  if(N.qs('bc')==='open'){sec.classList.add('is-open');more.textContent='Read less';more.setAttribute('aria-expanded','true');}   /* for screenshots */
  if(N.qs('bc'))setTimeout(function(){sec.scrollIntoView({block:'start'});},50);
  more.addEventListener('click',function(){var o=sec.classList.toggle('is-open');more.setAttribute('aria-expanded',o);more.textContent=o?'Read less':'Read more';if(!o)sec.scrollIntoView({block:'start'});});
})();}
})();
