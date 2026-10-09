(function(){
var N=window.NP, C=N.C, $=N.$, $$=N.$$, esc=N.esc, fm=N.fm, ICON=N.ICON;
var p=N.BY[N.qs('p')]||N.BY['zyn-cool-mint'];
var FLAV_TONE={mint:'mint',herbal:'mint',fruit:'coral',exotic:'coral',sweet:'coral',citrus:'amber',beverage:'amber'};
var ok=N.anyStock(p);
var st={v:(N.firstOk(p)||p.v[0]).id, t:0, n:1, img:0};
var tiers=(p.kind==='single'||p.kind==='caffeine'||p.kind==='bundle')&&p.tiers.length>1?p.tiers:null;
if(tiers){var bi=tiers.findIndex(function(t){return t.best;});st.t=bi>=0?bi:tiers.length-1;}
function V(){return p.v.filter(function(v){return v.id===st.v;})[0];}

if(p.seo)N.setHead(p.seo);else document.title=p.title+' Nicotine Pouches | NicPouches';
$('#crumbs').innerHTML='<a href="index.html">Home</a><span>/</span>'+(p.kind==='other'?'':'<a href="'+(p.kind==='caffeine'?'collection-caffeine-pouches.html':'shop.html')+'">'+(p.kind==='caffeine'?'Caffeine Pouches':'Nicotine Pouches')+'</a><span>/</span>')+'<a href="'+N.brandUrl(p.brand)+'">'+esc(p.brand)+'</a><span>/</span><span aria-current="page">'+esc(p.title)+'</span>';

/* gallery; live image alt text by file name (tools/rip_product_content.py) */
function altOf(src){var n=String(src||'').split('/').pop().split('?')[0];return (p.alts&&p.alts[n])||p.title;}
var imgs=p.imgs.length?p.imgs:[p.img];
(function(){var vi=V()&&V().img?imgs.indexOf(V().img):-1;if(vi>=0)st.img=vi;})();
function drawGallery(){
  $('#stageImg').src=imgs[st.img]||p.img; $('#stageImg').alt=altOf(imgs[st.img]||p.img);
  $('#thumbs').innerHTML=imgs.length>1?imgs.map(function(src,i){return '<button type="button" aria-label="Image '+(i+1)+'" aria-current="'+(i===st.img)+'" data-img="'+i+'"><img src="'+esc(src)+'" alt="'+esc(altOf(src))+'"></button>';}).join(''):'';
}
$('#stageTags').innerHTML=N.tagsFor(p,3);
$('#thumbs').addEventListener('click',function(e){var b=e.target.closest('[data-img]');if(b){st.img=+b.dataset.img;drawGallery();}});

/* numbers for the current choice */
function calc(){
  var v=V(), base=v.price;
  if(p.kind==='99p')return {per:base,was:null,cans:1,total:base,save:0,pts:(p.tiers[0]||{}).pts||0,label:'1 can'};
  if(p.kind==='bundle'){var tb=tiers?tiers[st.t]:(p.tiers[0]||{q:1,p:base,pts:0});var nb=tb.q*st.n;return {per:base,was:v.was||null,cans:nb,bundles:nb,total:base*nb,save:((v.was||base)-base)*nb,pts:Math.round(tb.pts/tb.q*nb),label:nb+' bundle'+(nb>1?'s':'')};}
  if(tiers){var t=tiers[st.t],cans=t.q*st.n;return {per:t.p,was:t.p<base-0.001?base:null,cans:cans,total:t.p*cans,save:(base-t.p)*cans,pts:t.pts*st.n,label:cans+' can'+(cans>1?'s':'')};}
  var pts=(p.tiers[0]||{}).pts||0;
  return {per:base,was:null,cans:st.n,total:base*st.n,save:0,pts:pts*st.n,label:st.n+' can'+(st.n>1?'s':'')};
}
function starsHTML(r){var s='';for(var i=1;i<=5;i++)s+=r>=i-.25?'★':'<span class="off">★</span>';return '<i aria-hidden="true">'+s+'</i>';}

function drawInfo(){
  var v=V(), c=calc(), band=v.band?N.BAND[v.band]:null;
  var h='<div><div class="info__top"><a class="brandlink" href="'+N.brandUrl(p.brand)+'">'+esc(p.brand)+'</a>'+
    (p.reviews?'<a class="stars" href="#reviews">'+starsHTML(p.rating)+' '+p.rating.toFixed(1)+' · '+p.reviews+' review'+(p.reviews>1?'s':'')+'</a>':'')+'</div>'+
    '<h1>'+esc(p.title)+'</h1>'+
    '<div class="tagrow">'+(p.pool==='mm'?'<span class="tag tag--mm">Mix &amp; Match</span>':p.pool==='pm'?'<span class="tag tag--sky">Premium Mix</span>':'')+
      (p.deal?'<span class="deal-pill">'+N.ic(N.PATH.deal,13)+esc(p.deal)+'</span>':'')+(p.isNew?'<span class="tag tag--mint">New</span>':'')+
      (p.flav||[]).map(function(k){var f=C.flavours.filter(function(x){return x.key===k;})[0];return f?'<span class="tag tag--'+(FLAV_TONE[k]||'sky')+'">'+esc(f.name)+'</span>':'';}).join('')+
      (p.flavour?'<span class="tag tag--line">'+esc(p.flavour)+'</span>':'')+'</div></div>';
  /* price */
  if(p.kind==='99p')h+='<div class="pricebox"><span class="big num">99p</span><span class="per">with any order · 1 Per Order | Limited Stock</span></div>';
  else if(p.kind==='bundle')h+='<div class="pricebox"><span class="big num">'+fm(v.price)+'</span><span class="per">per bundle'+(p.cans?' · '+p.cans+' cans · '+fm(v.price/p.cans)+' each':'')+'</span></div>';
  else h+='<div class="pricebox"><span class="big num">'+fm(c.per)+'</span><span class="per">'+(p.kind==='other'?'':'per can')+'</span>'+(c.was?'<s class="num">'+fm(c.was)+'</s>':'')+'</div>';
  /* strength */
  if(p.kind!=='caffeine'&&p.v.length&&v.mg!=null){
    h+='<div><div class="field-l"><b>Strength (mg)</b><span>'+(v.mg!=null?N.mgs(v.mg)+'mg':esc(v.t))+(band?' · '+esc(band.name):'')+'</span></div>'+
      '<div class="pc__chips pdp__chips'+(p.v.filter(function(x){return x.mg!=null;}).length===1?' pdp__chips--one':'')+'" role="radiogroup" aria-label="Strength">'+p.v.filter(function(x){return x.mg!=null;}).map(function(x){
        return '<button type="button" class="mgc'+(x.ok?'':' is-oos')+'" role="radio" data-v="'+x.id+'" data-b="'+(x.band||'')+'" aria-checked="'+(x.id===st.v)+'"'+(x.ok?'':' aria-disabled="true" aria-label="'+esc(x.t)+', out of stock"')+'>'+N.mgs(x.mg)+'</button>';}).join('')+'</div>'+
      (band?'<div class="band-note" data-b="'+band.key+'">'+N.meter(band.key,true)+'<span><b>'+esc(band.name)+'</b> · '+esc(band.who)+' · '+esc(band.range.replace(' per pouch',''))+'</span></div>':'')+'</div>';
  }else if(N.optVs(p).length){
    h+='<div><div class="field-l"><b>'+esc(p.opt||'Options')+'</b><span>'+esc(v.t)+'</span></div>'+N.optChips(p,v,'data-v','pdp__chips')+'</div>';
  }else if(p.kind==='caffeine'&&v.mg!=null){
    h+='<div><div class="field-l"><b>Caffeine</b><span>'+esc(v.t)+'</span></div></div>';
  }
  /* bundle contents */
  if(p.contents.length)h+='<div><div class="field-l"><b>What\'s inside</b><span>'+(p.cans?p.cans+' cans':'')+'</span></div><ul class="contents" style="list-style:none;margin:0;padding:0">'+p.contents.map(function(x){return '<li><span class="dot" data-b="'+(v.band||'medium')+'" style="width:8px;height:8px;border-radius:50%;display:inline-block"></span>'+esc(x)+'</li>';}).join('')+'</ul></div>';
  /* packs: the live "Select & save" tiers */
  if(tiers){
    h+='<div><div class="field-l"><b>'+(p.pool==='mm'?'Mix &amp; Match Bundle Offers':p.kind==='bundle'?'Bundle Offers':'Select &amp; save')+'</b>'+'</div><div class="packs" role="radiogroup" aria-label="Pack size">'+
      tiers.map(function(t,i){var save=N.tierSave(p,t,v),isB=p.kind==='bundle';
        return '<button type="button" class="pack" role="radio" data-t="'+i+'" aria-checked="'+(i===st.t)+'">'+(t.best?'<span class="bestv">Best value</span>':'')+'<span class="radio"></span>'+
          '<span class="pack__q"><b>'+t.q+(isB?(t.q>1?' Bundles':' Bundle'):' Pack')+'</b><small class="num">'+fm(t.p)+' pp'+(isB&&v.was?'<s>'+fm(v.was)+'</s>':t.p<v.price-0.001?'<s>'+fm(v.price)+'</s>':'')+' · <span class="ptsi">'+N.ic(N.PATH_FILL.points,12)+'Earn '+t.pts+' pts</span></small></span>'+
          '<span class="pack__r"><b class="num">'+fm(isB?t.p*t.q:t.p*t.q)+'</b><span class="pack__tags">'+(save>0.004?'<span class="tag tag--mint">Save '+fm(save)+'</span>':'<span class="tag">No savings</span>')+'</span></span></button>';}).join('')+'</div>'+
      (p.pool==='mm'&&p.v.length>1?'<p class="mm-note">'+N.badge('mix','sm')+'<span>Mix &amp; Match strengths: every strength of '+esc(p.title)+' counts towards the pack price.</span></p>':'')+'</div>';
  }
  /* buy */
  if(p.kind==='99p'){
    h+='<div class="buy"><button class="btn btn--lg" type="button" data-buy'+(ok?'':' disabled')+'>'+(ok?'Add for 99p':'Sold out')+'</button></div>'+(ok?N.spPair(0,0,'cd'):'');
  }else{
    if(!(ok&&V().ok))h+=N.notifyHTML(V());
    else h+='<div class="buy"><div class="qty qty--lg" role="group" aria-label="'+(tiers?'Number of packs':'Quantity')+'"><button type="button" data-n="-1" aria-label="Fewer"'+(st.n<=1?' disabled':'')+'>'+ICON.minus+'</button><output class="num">'+st.n+'</output><button type="button" data-n="1" aria-label="More">'+ICON.plus16+'</button></div>'+
      '<button class="btn btn--lg" type="button" data-buy'+(ok&&V().ok?'':' disabled')+'>'+(ok&&V().ok?'<span>Add<span class="long"> to basket</span> · '+fm(c.total)+'</span>':'Sold out')+'</button></div>'+
      N.spPair(c.save,c.pts,'cd');
  }
  h+='<div class="perks"><div class="perk">'+N.badge('truck','sm')+'<span>'+esc(C.pdp.freeDelivery)+'</span></div>'+
     '<div class="perk">'+N.badge('points','sm')+'<span><b>Save with Nic Points</b> · Up to 8% savings on nic pouches for life.</span></div></div>'+
     (p.nic===false?'':'<div class="warn18 warn18--bar"><span>18+</span>'+esc(C.pdp.warning)+'</div>');
  $('#info').innerHTML=h;
  $('#stageMg').innerHTML=N.mgBadge(p,v);
  N.countdown($('#cd'));
  $('#sbPrice').textContent=p.kind==='99p'?'99p':fm(c.total);
  $('#sbMeta').textContent=(v.band?v.t+' · ':'')+c.label+(tiers?' · '+fm(c.per)+' each':'');
  $('#sbAdd').textContent=ok&&V().ok?(p.kind==='99p'?'Add for 99p':'Add to basket'):'Sold out';
  $('#sbAdd').disabled=!(ok&&V().ok);
}
$('#info').addEventListener('click',function(e){
  var s=e.target.closest('[data-v]'),t=e.target.closest('[data-t]'),n=e.target.closest('[data-n]'),b=e.target.closest('[data-buy]');
  if(s){if(s.getAttribute('aria-disabled')==='true'){N.toast(s.querySelector('b').textContent+' is out of stock');return;}st.v=+s.dataset.v;var vi=V().img?imgs.indexOf(V().img):-1;if(vi>=0)st.img=vi;drawGallery();}
  else if(t)st.t=+t.dataset.t;
  else if(n)st.n=Math.max(1,Math.min(20,st.n+(+n.dataset.n)));
  else if(b){buy();return;}
  else return;
  drawInfo();
});
/* radio groups: arrow keys */
$('#info').addEventListener('keydown',function(e){
  var r=e.target.closest('[role=radio]');if(!r||['ArrowRight','ArrowDown','ArrowLeft','ArrowUp'].indexOf(e.key)<0)return;
  var g=$$('[role=radio]',r.parentNode),i=g.indexOf(r),d=(e.key==='ArrowRight'||e.key==='ArrowDown')?1:-1,nx=g[(i+d+g.length)%g.length];
  e.preventDefault();nx.click();var sel=nx.dataset.v?'[data-v="'+nx.dataset.v+'"]':'[data-t="'+nx.dataset.t+'"]';var f=$('#info '+sel);if(f)f.focus();
});
function buy(){var c=calc();N.add(p.h,st.v,c.cans);}
$('#sbAdd').addEventListener('click',buy);
drawGallery();drawInfo();

/* sticky bar shows once the main button scrolls away */
var io=new IntersectionObserver(function(en){$('#stickyBuy').classList.toggle('show',!en[0].isIntersecting&&en[0].boundingClientRect.top<0);});
io.observe($('#info'));

/* key facts */
var r=N.range(p);
$('#facts').innerHTML=[
  p.kind==='other'?null:['Flavour',p.flavour||((p.flav||[]).map(function(k){var f=C.flavours.filter(function(x){return x.key===k;})[0];return f?f.name:k;}).join(', ')||'—')],
  p.kind==='other'?null:[p.kind==='caffeine'?'Caffeine':'Strength',N.strengthText(p)+(r.top&&p.kind!=='caffeine'?' · '+N.bandLabel(p):'')],
  ['Brand',p.brand],
  ['Type',p.kind==='other'?(p.type||'—'):p.kind==='bundle'?'Bundle'+(p.cans?' · '+p.cans+' cans':''):p.kind==='caffeine'?'Caffeine pouches':'Nicotine pouches']
].filter(Boolean).map(function(f){return '<div class="fact"><small>'+esc(f[0])+'</small><b>'+esc(f[1])+'</b></div>';}).join('');

/* the live product panels, in live order (Description, Delivery Information, Why are our prices so low? …), exactly as live.
   Desktop: tabs over a readable column with Read more for long bodies. Phones: one accordion per panel, the first open. */
var PANELS=(window.NP_DATA&&window.NP_DATA.panels)||{};
var TABS=(p.panels&&p.panels.length?p.panels.map(function(x){return [x.t,x.h!=null?x.h:(PANELS[x.k]||'')];}):[
  ['Description',p.desc||'<p>'+esc(p.title)+'</p>'],
  ['Delivery Information','<div class="drows">'+C.pdp.delivery.map(function(d){return '<div class="drow"><span>'+esc(d[0])+'</span>'+(d[1]?'<b>'+esc(d[1])+'</b>':'')+'</div>';}).join('')+'</div>'],
  ['Why are our prices so low?','<p>'+esc(C.pdp.whyLow.intro)+'</p><ul>'+C.pdp.whyLow.points.map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul><p>'+esc(C.pdp.whyLow.outro)+'</p>']
]).filter(function(t){return t[1]&&t[1].replace(/<[^>]+>/g,'').trim();});
function wrapTables(h){return h.replace(/<table>/g,'<div class="btable"><table>').replace(/<\/table>/g,'</table></div>');}
var tab=0;
function drawTabs(){
  $('#tabs').innerHTML=TABS.map(function(t,i){return '<button type="button" role="tab" aria-selected="'+(i===tab)+'" data-tab="'+i+'">'+esc(t[0])+'</button>';}).join('');
  $('#tabpanel').innerHTML='<div class="pbody"><div class="pbody__inner bcontent__inner">'+wrapTables(TABS[tab][1])+'</div><div class="bcontent__fade" aria-hidden="true"></div><button type="button" class="btn btn--ghost btn--sm bcontent__more" data-pmore>Read more</button></div>';
  var pb=$('#tabpanel .pbody'),inner=pb.querySelector('.pbody__inner');
  if(inner.scrollHeight<=460||N.qs('pc')==='open')pb.classList.add(inner.scrollHeight<=460?'is-short':'is-open');
  if(N.qs('pc')==='open')pb.querySelector('[data-pmore]').textContent='Read less';
}
$('#tabs').addEventListener('click',function(e){var b=e.target.closest('[data-tab]');if(b){tab=+b.dataset.tab;drawTabs();}});
$('#tabpanel').addEventListener('click',function(e){var b=e.target.closest('[data-pmore]');if(!b)return;var pb=b.parentNode,o=pb.classList.toggle('is-open');b.textContent=o?'Read less':'Read more';if(!o)pb.scrollIntoView({block:'nearest'});});
drawTabs();
$('#tabpanel').insertAdjacentHTML('afterend','<div class="pacc">'+TABS.map(function(t,i){return '<details class="bfaq pacc__i"'+(i===0||N.qs('pc')==='open'?' open':'')+'><summary>'+esc(t[0])+'<span class="bfaq__pm" aria-hidden="true">'+ICON.plus16+'</span></summary><div class="bfaq__a bcontent__inner is-flat">'+wrapTables(t[1])+'</div></details>';}).join('')+'</div>');

$('#howto').innerHTML=C.pdp.howto.map(function(s){return '<li><img src="'+s.img+'" alt="" loading="lazy"><b>'+esc(s.step)+'</b><span>'+esc(s.text)+'</span></li>';}).join('');

/* reviews (Judge.me data on the live product page) */
if(p.reviews){
  $('#revs').innerHTML='<div class="rsum"><span class="score">'+p.rating.toFixed(1)+'</span><span class="stars">'+starsHTML(p.rating)+'</span><span class="muted" style="font-size:13.5px">Based on '+p.reviews+' review'+(p.reviews>1?'s':'')+'</span><button class="btn btn--ghost btn--sm" type="button" data-proto="Writing a review" style="margin-top:8px">Write a review</button></div>'+
    '<div class="rlist">'+p.revs.map(function(x){return '<article class="rev"><span class="stars">'+starsHTML(x.rating)+'</span><b>'+esc(x.title)+'</b><p>'+esc(x.body)+'</p><small>'+esc(x.author)+(x.date?' · '+esc(x.date.split('-').reverse().join('/')):'')+'</small></article>';}).join('')+'</div>';
}else{
  $('#revs').innerHTML='<div class="rsum"><span class="muted">No reviews yet</span><button class="btn btn--ghost btn--sm" type="button" data-proto="Writing a review">Be the first to write a review</button></div>';
}

/* similar: same brand first, then the same strength band */
/* the live "Similar Nicotine Pouches" list first, as live orders it; topped up by brand, then strength band */
var sim=(p.similar||[]).map(function(h){return N.BY[h];}).filter(function(x){return x&&x!==p;});
N.P.forEach(function(x){if(sim.length<8&&x!==p&&sim.indexOf(x)<0&&x.brand===p.brand&&N.anyStock(x)&&x.kind!=='bundle')sim.push(x);});
N.P.forEach(function(x){if(sim.length<8&&x!==p&&sim.indexOf(x)<0&&x.kind===p.kind&&N.range(x).top===r.top&&N.anyStock(x))sim.push(x);});
N.renderCards($('#railSim'),sim.slice(0,8));
$('#simNav').outerHTML=N.railNav().replace('rail-nav','rail-nav" id="simNav');
N.initRail($('#railSim'),$('#simNav'));

$('#guides').innerHTML=C.guides.map(function(g){return '<a class="guide" href="'+N.guideUrl(g.title)+'"><img src="'+g.img+'" alt="" loading="lazy"><span class="tag tag--sky">'+esc(g.tag)+'</span><b>'+esc(g.title)+'</b><p>'+esc(g.text)+'</p><time>'+esc(g.date)+'</time></a>';}).join('');
})();
