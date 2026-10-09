(function(){
var N=window.NP, C=N.C, $=N.$, esc=N.esc, ICON=N.ICON;
var meta=window.NP_DATA.meta;

/* hero: the live four tiles, same order */
$('#hero').innerHTML=C.banners.map(function(b,i){
  return '<a class="hero__tile" href="'+b.href+'" aria-label="'+esc(b.alt)+'"><img src="'+b.img+'" alt="'+esc(b.alt)+'"'+(i?' loading="lazy"':'')+' width="900" height="900">'+(b.label?'<span class="hero__label">'+esc(b.label)+'</span>':'')+'</a>';
}).join('');
var track=$('#hero'),dots=$('#heroDots');
dots.innerHTML=C.banners.map(function(b,i){return '<button type="button" aria-label="Show offer '+(i+1)+'" data-i="'+i+'"></button>';}).join('');
function cur(){var w=track.firstElementChild.getBoundingClientRect().width+10;return Math.round(track.scrollLeft/w);}
function mark(){var c=cur();Array.prototype.forEach.call(dots.children,function(d,i){d.setAttribute('aria-current',i===c);});}
track.addEventListener('scroll',function(){requestAnimationFrame(mark);});mark();
dots.addEventListener('click',function(e){var d=e.target.closest('[data-i]');if(!d)return;var t=track.children[+d.dataset.i];track.scrollTo({left:t.offsetLeft-track.offsetLeft-parseFloat(getComputedStyle(track).paddingLeft||0),behavior:'smooth'});});

/* brand strip + promo tiles (live) */
/* brand strip: a slow, seamless loop of every brand with a brand page (live Brands menu order).
   Desktop: CSS transform on a duplicated track (~35px/s), paused on hover / keyboard focus.
   Phones (Round 8): the same continuous loop on a real scroller (see below); touching it hands over to native scroll.
   Reduced motion: a static scrollable row with arrows. Both ends feathered with a mask. */
(function(){
  var el=$('#brands'), list=N.BRANDS.filter(function(b){return b.count;}), timer=null, onResize=null;
  /* feedback 6.2: a can per brand (the live strip's packs), in the white box */
  function item(b,dup){return '<a href="brand.html?b='+b.slug+'"'+(dup?' tabindex="-1"':'')+'><span class="lbox lbox--can"><img src="'+esc(b.stripCan||b.logo)+'" alt="'+esc(b.short)+'" loading="lazy"></span>'+esc(b.short)+'</a>';}
  var set=list.map(function(b){return item(b);}).join(''), dupSet=list.map(function(b){return item(b,1);}).join('');
  var mqReduce=window.matchMedia('(prefers-reduced-motion: reduce)'), mqPhone=window.matchMedia('(max-width:767px)');
  function build(){
    clearInterval(timer); if(onResize)window.removeEventListener('resize',onResize);
    el.className='brands bm';
    if(mqReduce.matches){
      el.classList.add('bm--static');
      el.innerHTML='<div class="bm__scroller" id="bmScroll">'+set+'</div>'+N.railNav().replace('rail-nav','rail-nav bm__nav" id="bmNav');
      N.initRail($('#bmScroll'),$('#bmNav'));return;
    }
    if(mqPhone.matches){
      /* Round 8 (John: "can this scroll animate like on desktop and then when you touch one it stops the animation and you
         can scroll normal"): a real overflow-x scroller holding three copies of the brands, moved with requestAnimationFrame
         at ~35px/s and wrapped seamlessly by one set's width. The first touch / pointer / wheel / focus stops it exactly
         where it is and native scrolling (momentum, both ways, no snapping) takes over from that scrollLeft; a tap still
         opens the brand, a drag doesn't. It restarts after 6s with no interaction, only while the strip is on screen;
         paused when off screen or the tab is hidden. Reduced motion never gets here (static row above). */
      el.classList.add('bm--auto');
      el.innerHTML='<div class="bm__scroller" id="bmScroll">'+set+dupSet+dupSet+'</div>';
      var sc=$('#bmScroll'),n=list.length,setW=0,pos=0,running=true,visible=true,last=0,lastTouch=0,raf=0,SPEED=35,IDLE=6000;
      function measure(){var k=sc.children;if(k.length>n){setW=k[n].offsetLeft-k[0].offsetLeft;}}
      function norm(){if(!setW)return;while(pos>=2*setW)pos-=setW;while(pos<setW)pos+=setW;}
      function frame(t){raf=0;
        if(!running){if(Date.now()-lastTouch>IDLE&&visible&&!document.hidden){running=true;pos=sc.scrollLeft;norm();last=0;}else{raf=requestAnimationFrame(frame);return;}}
        if(visible&&!document.hidden&&setW){var dt=last?Math.min(64,t-last):16;pos+=SPEED*dt/1000;norm();sc.scrollLeft=pos;}
        last=t;raf=requestAnimationFrame(frame);}
      function stop(){running=false;lastTouch=Date.now();pos=sc.scrollLeft;}
      ['touchstart','pointerdown','wheel','focusin','keydown'].forEach(function(ev){sc.addEventListener(ev,stop,{passive:true});});
      sc.addEventListener('scroll',function(){if(!running)lastTouch=Date.now();},{passive:true});   /* momentum counts as interaction */
      if(window.IntersectionObserver)new IntersectionObserver(function(es){visible=es[0].isIntersecting;},{threshold:0}).observe(sc);
      onResize=function(){measure();if(running){pos=Math.max(pos,setW);norm();sc.scrollLeft=pos;}};
      window.addEventListener('resize',onResize);
      requestAnimationFrame(function(){measure();pos=setW;sc.scrollLeft=pos;raf=requestAnimationFrame(frame);});
      sc.querySelectorAll('img').forEach(function(im){if(!im.complete)im.addEventListener('load',measure,{once:true});});
      return;
    }
    el.classList.add('bm--loop');
    el.innerHTML='<div class="bm__track"><div class="bm__set">'+set+'</div><div class="bm__set" aria-hidden="true">'+dupSet+'</div></div>';
    onResize=function(){var s=el.querySelector('.bm__set');if(s)el.querySelector('.bm__track').style.animationDuration=(s.getBoundingClientRect().width/35)+'s';};
    onResize();window.addEventListener('resize',onResize);
  }
  build();
  [mqReduce,mqPhone].forEach(function(m){(m.addEventListener?m.addEventListener('change',build):m.addListener(build));});
})();
$('#promos').innerHTML=C.promos.map(function(p){return '<a class="promo promo--'+p.tone+'" href="'+p.href+'">'+N.badge(p.icon)+'<span><b>'+esc(p.title)+'</b><span>'+esc(p.text)+'</span></span></a>';}).join('');

/* product rails: the live homepage's Top Selling and Hottest Deals, in live order */
function pick(list){return list.map(function(h){return N.BY[h];}).filter(Boolean);}
N.renderCards($('#railTop'),pick(meta.railTop||meta.homeTop));
N.renderCards($('#railDeals'),pick(meta.railDeals||meta.homeDeals));
$('#topNav').outerHTML=N.railNav().replace('rail-nav','rail-nav" id="topNav');
$('#dealNav').outerHTML=N.railNav().replace('rail-nav','rail-nav" id="dealNav');
N.initRail($('#railTop'),$('#topNav'));N.initRail($('#railDeals'),$('#dealNav'));

/* shop by strength: the live bands, one colour each */
$('#finder').innerHTML=N.BANDS.map(function(b){
  return '<a class="fband" data-b="'+b.key+'" href="'+N.bandUrl(b.key)+'">'+N.meter(b.key,true)+'<span><b>'+esc(b.name)+'</b><small>'+esc(b.who)+'</small></span><em>'+esc(b.range)+'</em><span class="bar"><i style="width:'+(b.lvl*20)+'%"></i></span></a>';
}).join('');

/* featured brands: our own brand tiles (logo, live headline, facts, the brand's own cans); John: no ripped banners */
function facts(b){var f=[];if(b.flavours)f.push('<span class="f-fl">'+b.flavours+' flavour'+(b.flavours>1?'s':'')+'</span>');if(b.mg)f.push('<span class="f-mg">'+(b.mg[0]===b.mg[1]?N.mgs(b.mg[0])+'mg':N.mgs(b.mg[0])+'–'+N.mgs(b.mg[1])+'mg')+'</span>');if(b.from)f.push('<span class="f-fr">from '+N.fm(b.from)+'</span>');return f.join('<i class="f-dot"> · </i>');}
function nbh(t){return esc(t).replace(/(\w)-(\w)/g,'$1&#8209;$2');}
function shopL(name){return '<span class="link tile__shop"><span class="tile__sl">Shop '+esc(name)+'</span><span class="tile__sn">Shop now</span> '+ICON.arrow+'</span>';}
function fan(b){return '<span class="fan" aria-hidden="true">'+(b.cans||[]).slice(0,3).map(function(u){return '<img src="'+esc(u)+'" alt="">';}).join('')+'</span>';}
var F=C.featured, SB=N.BRAND_BY_SLUG[F.spotSlug];
$('#featured').innerHTML=(SB?'<a class="btile spot" href="brand.html?b='+SB.slug+'"><span class="spot__id"><span class="tag tag--coral">'+esc(F.spot.tag)+'</span>'+N.logoBox(SB)+'</span><span class="spot__eye">Brand spotlight</span><h3><span class="spot__tf">'+esc(F.spot.title)+'</span><span class="spot__ts">'+esc(F.spot.title.split(/\s[-–]\s/).pop())+'</span></h3><p>'+nbh(F.spot.text)+'</p>'+shopL(SB.short).replace('link tile__shop','link tile__shop spot__shop')+fan(SB)+'</a>':'')+
  F.tiles.map(function(t){var b=N.BRAND_BY_SLUG[t.slug];if(!b)return '';return '<a class="btile btile--'+t.tone+'" href="brand.html?b='+b.slug+'"><span class="btile__txt">'+N.logoBox(b)+'<b>'+esc(t.title)+'</b><small>'+facts(b)+'</small>'+shopL(b.short)+'</span>'+fan(b)+'</a>';}).join('');

/* flavours (live illustrations) */
$('#flavours').innerHTML=C.flavours.map(function(f){return '<a class="flav" href="'+N.flavUrl(f.key)+'"><img src="'+f.img+'" alt="" loading="lazy"><b>'+esc(f.name)+'</b></a>';}).join('');

/* loyalty (live copy) */
var L=C.loyalty;
$('#loyal').innerHTML='<div><span class="eyebrow">'+esc(L.eyebrow)+'</span><h2 id="h-loyal">'+esc(L.title)+'</h2><a class="btn" href="page-nic-pouches-loyalty-points.html">'+esc(L.cta)+'</a></div><img src="'+L.img+'" alt="" loading="lazy">';

/* guides (live) */
$('#guides').innerHTML=C.guides.map(function(g){return '<a class="guide" href="'+N.guideUrl(g.title)+'"><img src="'+g.img+'" alt="" loading="lazy"><span class="tag tag--sky">'+esc(g.tag)+'</span><b>'+esc(g.title)+'</b><p>'+esc(g.text)+'</p><time>'+esc(g.date)+'</time></a>';}).join('');

/* SEO + FAQ (live copy) */
function acc(items,openFirst){return items.map(function(x,i){return '<details'+(openFirst===i?' open':'')+'><summary>'+esc(x[0])+'<span class="pm">'+ICON.plus16+'</span></summary><div class="ans">'+x[1]+'</div></details>';}).join('');}
$('#seo').innerHTML='<h2>'+esc(C.seoTitle)+'</h2><p>'+esc(C.seoIntro)+'</p>'+acc(C.seo,1);
$('#faq').innerHTML='<h2>'+esc(C.faqTitle)+'</h2>'+acc(C.faq,0);
})();

/* feedback 6.3: Featured Brands as a swipe carousel on phones, with position dots */
(function(){
  var fe=document.getElementById('featured'); if(!fe)return;
  var n=fe.children.length, dots=document.createElement('div'); dots.className='feat__dots'; dots.setAttribute('aria-hidden','true');
  dots.innerHTML=Array.apply(null,{length:n}).map(function(_,i){return '<i'+(i?'':' class="on"')+'></i>';}).join('');
  fe.parentNode.insertBefore(dots,fe.nextSibling);
  function upd(){var w=fe.firstElementChild.getBoundingClientRect().width+12;var k=Math.round(fe.scrollLeft/w);Array.prototype.forEach.call(dots.children,function(d,i){d.className=i===k?'on':'';});}
  var fq=location.search.match(/[?&]feat=(\d)/); /* screenshot helper: open the carousel on tile N */
  if(fq)setTimeout(function(){var t=fe.children[+fq[1]];if(t){fe.style.scrollSnapType='none';fe.scrollLeft=t.offsetLeft-fe.firstElementChild.offsetLeft;upd();}},50);
  fe.addEventListener('scroll',function(){requestAnimationFrame(upd);});
})();
