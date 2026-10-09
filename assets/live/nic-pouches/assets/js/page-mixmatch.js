/* page-mixmatch.js — the Mix & Match page only (tools/build_pages.py build_mixmatch).
   Step 1 shows two real product cards (NP.cardHTML). Steps 2 and 3 show the real quick-add pop-up and basket
   drawer: the page itself in a 390px phone screen (iframe ?mmshot=pop|basket), where it shows only the site
   header and that component. All three are aria-hidden and inert; each has a text alternative beside it. */
(function(){
var N=window.NP;if(!N)return;
var $=N.$,$$=N.$$;
var shot=(/[?&]mmshot=(pop|basket)\b/.exec(location.search)||[])[1];

if(shot==='pop'){
  var el=$('[data-mmpop]'),p=el&&N.BY[el.dataset.mmpop];
  if(p){
    N.openQuick(p,N.firstOk(p).id);
    var i=(p.tiers||[]).map(function(t){return t.q;}).indexOf(+el.dataset.qq);
    var b=$('#qa [data-qt="'+i+'"]');if(b)b.click();
  }
  return;
}
if(shot==='basket'){
  N.openCart();
  var pr=$('#drawer .drpromo');if(pr)pr.remove();
  /* the live "x% Off Obtained!" headline for the step the basket has reached */
  var on=$$('#drawer .rw__seg.on .rw__lab').pop(),hd=$('#drawer .rw__head'),m=on&&/(\d+)%/.exec(on.textContent);
  if(m&&hd&&hd.lastChild&&hd.lastChild.nodeType===3)hd.lastChild.textContent=m[1]+'% Off Obtained!';
  return;
}

$$('[data-mmic]').forEach(function(e){e.outerHTML=N.ic(N.PATH_FILL[e.dataset.mmic],14);});
$$('[data-mmcards]').forEach(function(el){
  el.innerHTML=el.dataset.mmcards.split(',').map(function(h){
    var p=N.BY[h];if(!p)return '';
    var tag=p.pool==='pm'?'<span class="tag tag--sky">Premium Mix</span>':'<span class="tag tag--mm">Mix &amp; Match</span>';
    return N.cardHTML(p).replace('<span class="pc__tags">','<span class="pc__tags">'+tag);
  }).join('');
});
$$('iframe[data-mmsrc]').forEach(function(f){f.src=f.dataset.mmsrc;});
})();
