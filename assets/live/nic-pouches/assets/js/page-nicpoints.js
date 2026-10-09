/* page-nicpoints.js — Nic Points page only (redesign v2): the step icons, from the site's own Phosphor set (app.js). */
(function(){
var N=window.NP; if(!N)return;
N.$$('[data-npicon]').forEach(function(e){var n=e.dataset.npicon;e.innerHTML=N.ic(N.PATH[n]||N.PATH_FILL[n],24);});
})();
/* Round 8: on phones the tier timeline runs down; put the silver colour stop at the Silver node (--s2) */
(function(){
  function set(){document.querySelectorAll('.nptl').forEach(function(ol){var li=ol.querySelectorAll('.nptl__step');if(li.length<3)return;
    var r=ol.getBoundingClientRect(),m=li[1].querySelector('.nptl__at i')||li[1],b=m.getBoundingClientRect(),l=li[2].querySelector('.nptl__at i')||li[2],e=l.getBoundingClientRect();
    var top=r.top+10,end=e.top+e.height/2,mid=b.top+b.height/2;ol.style.setProperty('--s2',Math.max(5,Math.min(95,(mid-top)/Math.max(1,(r.bottom-24)-top)*100)).toFixed(1)+'%');});}
  set();window.addEventListener('resize',set);window.addEventListener('load',set);
})();
