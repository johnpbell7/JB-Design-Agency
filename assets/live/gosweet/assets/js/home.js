/* GoSweet redesign — homepage (round 1 + art-director spec, review/round1-home/SPEC.md).
   Content from the live homepage (data/home.json, tools/rip_site.py). */
(function(){
'use strict';
function run(){
var G=window.GS,D=window.GS_DATA,H=D.home,$=G.$,$$=G.$$,ic=G.ic,esc=G.esc,BY=G.BY;
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
function firstSentence(t){var m=String(t||'').match(/^.*?[.!?\u2600-\u27bf\ufe0f](\s|$)/);return (m?m[0]:t||'').trim();}

/* ---- hero: the live posters shown whole beside their words; crossfade, 6s autoplay shown by the dot ---- */
var slides=(H.banners||[]).filter(function(b){return b.img;});
var vp=$('[data-hero]'),hero=vp&&vp.closest('.hero');
if(vp&&slides.length){
  vp.innerHTML='<div class="hero__track">'+slides.map(function(b,i){var tag=i?'h2':'h1';
    return '<article class="slide'+(i?'':' is-on')+'" role="group" aria-roledescription="slide" aria-label="'+(i+1)+' of '+slides.length+'"'+(i?' aria-hidden="true"':'')+'>'+
      '<div class="slide__pic"><img src="'+esc(b.img)+'" alt="'+esc(b.alt||b.heading||'')+'" width="1254" height="1254"'+(i?' loading="lazy"':' fetchpriority="high"')+'></div>'+
      '<div class="slide__txt">'+(b.eyebrow?'<span class="slide__eyebrow">'+esc(b.eyebrow)+'</span>':'')+
      '<'+tag+' class="slide__h">'+(b.headingHtml||esc(b.heading))+'</'+tag+'>'+
      (b.text?'<p class="slide__body">'+esc(firstSentence(b.text))+'</p>':'')+
      (b.cta?'<a class="btn slide__cta" href="'+esc(G.link(b.cta.href))+'"'+(i?' tabindex="-1"':'')+'>'+esc(b.cta.label)+ic('arrow-right',18)+'</a>':'')+
      '</div></article>';}).join('')+'</div>'+
    (slides.length>1?'<div class="hero__ctrl"><button class="hero__arr" type="button" aria-label="Previous slide" data-hp>'+ic('caret-left',16)+'</button>'+
      '<div class="hero__dots">'+slides.map(function(b,i){return '<button class="hero__dot'+(i?'':' is-on')+'" type="button" aria-label="Show slide '+(i+1)+'" aria-current="'+(!i)+'" data-hd="'+i+'"></button>';}).join('')+'</div>'+
      '<button class="hero__arr" type="button" aria-label="Next slide" data-hn>'+ic('caret-right',16)+'</button></div>':''); // no play/pause button (John, 5 Oct: "remove play"); slides pause on hover, focus and touch
  var cur=0,stopped=reduce||slides.length<2;
  function go(n,manual){cur=(n+slides.length)%slides.length;
    $$('.slide',vp).forEach(function(s,i){var on=i===cur;s.classList.toggle('is-on',on);s.setAttribute('aria-hidden',on?'false':'true');$$('a',s).forEach(function(a){a.tabIndex=on?0:-1;});});
    $$('.hero__dot',vp).forEach(function(d,i){d.classList.toggle('is-on',i===cur);d.setAttribute('aria-current',i===cur);});
    if(manual)stop();else restart();}
  function restart(){if(stopped)return;hero.classList.remove('is-playing');void vp.offsetWidth;hero.classList.add('is-playing');}
  function stop(){stopped=true;hero.classList.remove('is-playing');var pp=$('[data-pp]',vp);if(pp){pp.innerHTML=ic('play',14,true);pp.setAttribute('aria-label','Play slides');}}
  vp.addEventListener('animationend',function(e){if(e.animationName==='fill'&&!stopped)go(cur+1);});
  vp.addEventListener('click',function(e){
    if(e.target.closest('[data-hp]'))go(cur-1,true);else if(e.target.closest('[data-hn]'))go(cur+1,true);
    else if(e.target.closest('[data-pp]')){if(stopped){stopped=false;var pp=$('[data-pp]',vp);pp.innerHTML=ic('pause',14,true);pp.setAttribute('aria-label','Pause slides');restart();}else stop();}
    else{var d=e.target.closest('[data-hd]');if(d)go(+d.getAttribute('data-hd'),true);}});
  ['mouseenter','focusin','touchstart'].forEach(function(ev){vp.addEventListener(ev,function(){hero.classList.add('is-paused');},{passive:true});});
  ['mouseleave','focusout'].forEach(function(ev){vp.addEventListener(ev,function(){hero.classList.remove('is-paused');});});
  document.addEventListener('visibilitychange',function(){hero.classList.toggle('is-paused',document.hidden);});
  var x0=null;vp.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;},{passive:true});
  vp.addEventListener('touchend',function(e){if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>50)go(cur+(dx<0?1:-1),true);x0=null;},{passive:true});
  var s0=G.qs('slide');if(s0){stopped=true;go(+s0-1,true);}else{go(0);}
  if(!reduce)setTimeout(function(){hero.classList.add('is-ready');},50);
}

/* ---- the Shades by Niko photo beside the carousel (1200px and up) and inline below that ---- */
var pr=H.promo||{},side=$('[data-hero-side]');
var prHead=pr.headingHtml||'Shades <em>By Niko</em>';
var prBody=firstSentence((pr.text||'').replace(/^Shades By Niko\s*/,'').replace(/\s*Shop Now$/,''));
if(side&&pr.img){side.innerHTML='<img src="'+esc(pr.img)+'" alt="Shades by Niko sweets" loading="eager"><div class="hero__side-txt"><h2>'+prHead+'</h2><span class="link">Shop Now'+ic('arrow-right',16)+'</span></div>';}
var ip=$('[data-promo]');
if(ip&&pr.img)ip.innerHTML='<a class="ipromo" href="collection.html?c=shades-by-niko"><div class="ipromo__txt"><h2>'+prHead+'</h2><p>'+esc(prBody)+'</p><span class="btn">Shop Now'+ic('arrow-right',18)+'</span></div><div class="ipromo__pic"><img src="'+esc(pr.img)+'" alt="" loading="lazy"></div></a>';

/* (the trust strip under the hero was removed, John 5 Oct 2026: "remove this from gosweet desktop"; it was already hidden on phones,
   where the header USP strip carries the same facts) */

/* ---- Why shop with GoSweet: the live homepage block, brought back (John, 5 Oct: "still need to feature this"). Live wording,
   except card 3: live says "Free fast delivery on all orders", which contradicts the £20 rule shown everywhere else, so it
   uses the live "Free UK delivery over £20" (flagged in job.json NEW COPY). Icon colours as live: green, blue, purple, gold. ---- */
var WHY=[['package','g','Buy in bulk and save a fortune','Stock up on your favourites and enjoy bigger savings.'],
  ['thumbs-up','b','Hand selected best products','Carefully chosen top-quality sweets from trusted brands.'],
  ['truck','p','Free UK delivery over £20','Quick, reliable shipping at no extra cost.'],
  ['sparkle','y','The best way to buy your sweets','Simple, affordable, and hassle-free every time.']];
var wy=$('[data-why]');
if(wy)wy.innerHTML=WHY.map(function(w){return '<li class="why__c why__c--'+w[1]+'"><span class="why__ic">'+ic(w[0],28,true)+'</span><h3>'+esc(w[2])+'</h3><p>'+esc(w[3])+'</p></li>';}).join('');

/* ---- Pick a craving: the live tile products, cut out, popping out of a lilac disc (lead, 5 Oct; John: "dont like these" plinths) ---- */
var tiles=((H.cravings||{}).tiles||[]).filter(function(t){return t.label&&t.img;});
var cr=$('[data-crav]');
if(cr)cr.innerHTML=tiles.map(function(t){return '<a class="crav__t" href="'+esc(G.link(t.href,t.label))+'"><span class="crav__disc" aria-hidden="true"><img src="'+esc(t.img)+'" alt="" loading="lazy"></span><span class="crav__lbl">'+esc(t.label)+'</span></a>';}).join('');

/* ---- rails ---- */
function rail(key,handles){var el=$('[data-rail="'+key+'"]');if(!el)return;
  el.innerHTML=handles.map(function(h){return BY[h];}).filter(Boolean).map(function(p){return G.card(p);}).join('');}
rail('best',(H.bestsellers||{}).handles||[]);
rail('deals',(H.hottestDeals||{}).handles||[]);

/* ---- featured brands: the live featured eight, as their own logo tiles (same tiles as the menu) ---- */
var br=$('[data-brands]');
if(br)br.innerHTML=(H.featuredBrands||[]).map(function(b){var h=(b.href||'').split('/').pop();var bb=D.brands.filter(function(x){return x.h===h;})[0];
  return '<a href="'+esc(G.colUrl(h))+'" aria-label="'+esc(bb?bb.name:h)+'"><img src="'+esc(bb&&bb.logo||b.img)+'" alt="" loading="lazy"></a>';}).join('');
var bc=$('[data-brands-count]');if(bc)bc.innerHTML='Shop all '+G.brandCount()+' brands'+ic('arrow-right',16);

/* ---- rewards: live loyalty facts; the tiers as membership cards ---- */
var rw=$('[data-rewards]');
if(rw)rw.innerHTML='<div class="rew"><div><h2>Your sweet rewards</h2><p>Earn 1 point for every £1 you spend. The more you shop, the better the perks get.</p>'+
  '<div class="rew__acts"><a class="btn" href="loyalty.html#join">Create an account</a><a class="link" href="loyalty.html">How it works'+ic('arrow-right',16)+'</a></div></div>'+
  G.wallet()+'</div>';
}
if(window.GS)run();else document.addEventListener('gs:ready',run);
})();
