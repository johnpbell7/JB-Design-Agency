/* pages.js — behaviour for the generated pages (tools/build_pages.py): blog, content pages, collections, policies.
   Product grids and rails in those pages list live product handles in data-cards and are drawn with our product card. */
(function(){
var N=window.NP; if(!N)return;
var $=N.$, $$=N.$$;

/* product cards named by the live page */
$$('[data-cards]').forEach(function(el){
  var list=el.dataset.cards.split(',').map(function(h){return N.BY[h];}).filter(Boolean);
  if(!list.length){var s=el.closest('section');if(s)s.hidden=true;return;}
  N.renderCards(el,list);
  var navSlot=document.querySelector('[data-railnav="'+el.id+'"]');
  if(navSlot&&el.classList.contains('rail')){navSlot.outerHTML=N.railNav().replace('rail-nav','rail-nav" id="'+el.id+'Nav');N.initRail(el,document.getElementById(el.id+'Nav'));}
});

/* marks drawn from the site's own badge set */
$$('[data-mixmark]').forEach(function(e){e.innerHTML=N.badge('mix','lg');});
$$('[data-npmark]').forEach(function(e){e.innerHTML=N.badge('points','lg');});
$$('[data-check]').forEach(function(e){e.innerHTML=N.ib('check',24);});

/* Mix & Match: the live pack tiers of a live Mix & Match product, as the worked example */
$$('[data-tiers]').forEach(function(el){
  var p=N.BY[el.dataset.tiers];if(!p||!p.tiers||!p.tiers.length){el.hidden=true;return;}
  var v=N.firstOk(p)||p.v[0];
  el.innerHTML='<div class="mmtiers__head"><span class="tag tag--mm">Mix &amp; Match</span><span>Pack prices on <a href="product.html?p='+p.h+'">'+N.esc(p.title)+'</a></span></div>'+
    '<div class="mmtiers__row">'+p.tiers.map(function(t){var sv=N.tierSave(p,t,v);
      return '<div class="mmtier'+(t.best?' is-best':'')+'">'+(t.best?'<span class="bestv">Best value</span>':'')+'<b>'+t.q+' Pack</b><span class="num">'+N.fm(t.p)+' pp</span>'+
        '<em>'+(sv>0.004?'Save '+N.fm(sv):'No savings')+'</em><small>'+N.ic(N.PATH_FILL.points,12)+t.pts+' pts</small></div>';}).join('')+'</div>';
});

/* blog index: first 12, then load more */
$$('[data-more]').forEach(function(g){
  var n=+g.dataset.more, items=Array.prototype.slice.call(g.children), btn=$('[data-loadmore]');
  function show(){items.forEach(function(it,i){it.hidden=i>=n;});if(btn)btn.parentNode.hidden=n>=items.length;}
  if(N.qs('shot')==='all')n=items.length;
  show();
  if(btn)btn.addEventListener('click',function(){n+=12;show();});
});

/* article cards (search, 404) */
var D=window.NP_DATA||{};
function acard(a){return '<a class="acard" href="blog-'+a.handle+'.html">'+(a.image?'<span class="acard__img"><img src="'+N.esc(a.image)+'" alt="" loading="lazy"></span>':'')+
  '<span class="acard__body"><span class="acard__tag">'+N.esc(a.tag||'News')+'</span><b>'+N.esc(a.title)+'</b><span class="acard__ex">'+N.esc(a.excerpt||'')+'</span><time>'+N.esc(a.date||'')+'</time></span></a>';}
$$('[data-guides]').forEach(function(el){el.innerHTML=(D.articles||[]).slice(0,+el.dataset.guides).map(acard).join('');});
$$('[data-brands]').forEach(function(el){el.innerHTML=el.dataset.brands.split(',').map(function(s){var b=N.BRAND_BY_SLUG[s];return b?'<a href="brand.html?b='+b.slug+'">'+N.logoBox(b,'lg')+'<span>'+N.esc(b.short)+'</span></a>':'';}).join('');});
$$('[data-bestsellers]').forEach(function(el){
  var list=N.P.filter(function(p){return p.best&&N.anyStock(p);}).sort(function(a,b){return a.best-b.best;}).slice(0,+el.dataset.bestsellers);
  N.renderCards(el,list);var slot=document.querySelector('[data-railnav="'+el.id+'"]');
  if(slot){slot.outerHTML=N.railNav().replace('rail-nav','rail-nav" id="'+el.id+'Nav');N.initRail(el,document.getElementById(el.id+'Nav'));}
});

/* site search: products (the shop's own search), articles and pages */
if(document.body.classList.contains('pg--search')){(function(){
  var q=(N.qs('q')||'').trim(), inp=$('#sQ'); if(inp)inp.value=q;
  if(!q){$('#sCount').textContent='Search the whole site: products, brands, articles and pages.';return;}
  $('#sTitle').textContent='Search: “'+q+'”';
  var ps=N.searchP(q), words=N.norm(q).split(' ').filter(Boolean);
  function hit(t){t=N.norm(t||'');return words.every(function(w){return t.indexOf(w)>=0;});}
  var arts=(D.articles||[]).filter(function(a){return hit(a.title+' '+a.excerpt);});
  var pgs=(D.cpages||[]).filter(function(x){return hit(x.title+' '+x.meta);});
  $('#sCount').innerHTML='<b>'+ps.length+'</b> product'+(ps.length===1?'':'s')+' · <b>'+arts.length+'</b> article'+(arts.length===1?'':'s')+' · <b>'+pgs.length+'</b> page'+(pgs.length===1?'':'s');
  if(ps.length){$('#sProducts').hidden=false;N.renderCards($('#sGrid'),ps.slice(0,24));$('#sAllP').href='shop.html?q='+encodeURIComponent(q);$('#sAllP').textContent='See all '+ps.length+' in the shop';}
  if(arts.length){$('#sArticles').hidden=false;$('#sArts').innerHTML=arts.map(acard).join('');}
  if(pgs.length){$('#sPages').hidden=false;$('#sPageList').innerHTML=pgs.map(function(x){return '<li><a href="'+x.file+'"><b>'+N.esc(x.title)+'</b><span>'+N.esc(x.meta)+'</span></a></li>';}).join('');}
  if(!ps.length&&!arts.length&&!pgs.length)$('#sNone').hidden=false;
})();}

/* article contents list: highlight the section in view */
var toc=$('.art__toc');
if(toc&&'IntersectionObserver' in window){
  var links={};$$('a',toc).forEach(function(a){links[a.getAttribute('href').slice(1)]=a;});
  var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){$$('a',toc).forEach(function(a){a.classList.remove('on');});var l=links[e.target.id];if(l)l.classList.add('on');}});},{rootMargin:'-20% 0px -70% 0px'});
  $$('.art__body h2[id]').forEach(function(h){io.observe(h);});
  if(matchMedia('(max-width:1023px)').matches){var d=$('details',toc);if(d)d.open=false;}
}

/* look-only forms (contact, account): never sent anywhere */
$$('form[data-proto-form]').forEach(function(f){
  f.addEventListener('submit',function(e){e.preventDefault();var m=f.querySelector('.form-done');if(m){m.hidden=false;}N.toast('Prototype: this form is not wired up');});
});
})();
