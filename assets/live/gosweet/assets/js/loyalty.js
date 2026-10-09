/* GoSweet redesign — Go Sweet Rewards: loyalty.html (signed out, explains the scheme) and loyalty-account.html
   (signed in, DEMO member). Every fact is the live loyalty page's (research/loyalty.md); "Crazy Candy" in the live FAQ is
   replaced with "GoSweet" (NEW COPY, lead's call). The member's name, points and orders are DEMO data. */
(function(){
'use strict';
var TIERS=[
  {key:'club',name:'Club',range:'0 – 299 pts',min:0,max:299,credit:'2%',perks:['Earn 1 point per £1 spent','Birthday treat in your inbox','Early-bird member newsletter']},
  {key:'gold',name:'Gold',range:'300 – 1199 pts',min:300,max:1199,credit:'4%',perks:['Everything in Club','Free delivery on every order','Exclusive Gold-only discounts','Double points weekends']},
  {key:'black',name:'Black',range:'1200+ pts',min:1200,max:null,credit:'8%',perks:['Everything in Gold','Free surprise treat in every box','Early access to brand new lines','Priority customer support','VIP-only competitions']}
];
var WAYS=[['Order & Earn','Earn points automatically every time you place an order. The higher your tier, the more points you earn on each purchase.','handbag'],
  ['Spend & Save','Redeem your points at checkout for real savings. The more you accumulate, the more you can take off your next order.','coins'],
  ['Grow & Enjoy','Keep shopping to climb the tiers and unlock better rewards. Black members enjoy the highest credit rate — 8% back on every order.','trophy']];
var FAQ=[['How do I earn points?','You\'ll earn 1 point for every £1 you spend on GoSweet. There are bonus ways to earn too — leaving reviews, referring friends and birthday treats.'],
  ['How are tiers calculated?','Your tier is based on your lifetime spend with us. Once you cross a threshold you\'ll move up automatically — no need to claim anything. Club Tier: 0–299 pts · Gold Tier: 300+ pts · Black Tier: 1,200+ pts'],
  ['Do my points expire?','Points stay on your account as long as you place at least one order every 12 months. We\'ll always email you before anything is removed.'],
  ['How do I redeem perks?','Most perks like free delivery and Gold/Black discounts are applied automatically at checkout once you\'ve reached the tier. Birthday and referral rewards are emailed as a one-time code.'],
  ['Can I move down a tier?','Nope — once you\'ve reached a tier it\'s yours to keep. The only thing that changes is whether you keep earning bonus points each year.']];

function run(){
var G=window.GS,$=G.$,$$=G.$$,ic=G.ic,esc=G.esc,fm=G.fm;
var out=$('[data-loyalty]'),acc=$('[data-loyalty-account]');

function tierCard(t,opts){opts=opts||{};
  return '<article class="tier tier--'+t.key+(opts.you?' is-you':'')+'">'+(opts.you?'<span class="tier__you">Your tier</span>':'')+(opts.next?'<span class="tier__you tier__you--next">Next tier</span>':'')+
    '<header class="tier__card"><span class="tier__chip" aria-hidden="true"></span><h3>'+t.name+'</h3><p>'+t.range+'</p><span class="tier__mark" aria-hidden="true">Go Sweet<br>Rewards</span></header>'+
    '<p class="tier__credit"><b>'+t.credit+'</b><span>credit back<br>on every order</span></p>'+
    '<ul class="tier__perks">'+t.perks.map(function(p){return '<li><span class="tier__tick">'+ic('check',13)+'</span>'+esc(p)+'</li>';}).join('')+'</ul></article>';}
function ways(){return '<section class="sec" aria-labelledby="ways-h"><div class="wrap"><div class="sec__head"><div><h2 id="ways-h">Ways to earn points</h2><p class="sec__sub">There\'s more than one way to stack up points and unlock the perks at every tier.</p></div></div>'+
  '<ol class="ways">'+WAYS.map(function(w,i){return '<li class="way"><span class="way__n">'+(i+1)+'</span><span class="way__ic">'+ic(w[2],24)+'</span><h3>'+esc(w[0])+'</h3><p>'+esc(w[1])+'</p></li>';}).join('')+'</ol></div></section>';}
function faq(){return '<section class="sec" aria-labelledby="faq-h"><div class="wrap lfaq"><div><h2 id="faq-h">Loyalty FAQ</h2><p class="sec__sub">Everything you need to know about earning, tracking, and spending your GoSweet points.</p></div>'+
  '<div class="acc">'+FAQ.map(function(f,i){return '<details class="acc__i"'+(i?'':' open')+'><summary>'+esc(f[0])+ic('caret-down',16)+'</summary><div class="acc__b rte"><p>'+esc(f[1])+'</p></div></details>';}).join('')+'</div></div></section>';}

/* ---------- signed out ---------- */
if(out){
  out.innerHTML='<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>'+ic('caret-right',12)+'<span aria-current="page">Loyalty Points</span></nav>'+
    '<section class="lhero"><div class="lhero__txt"><span class="slide__eyebrow">Go Sweet Rewards</span><h1>Your sweet rewards</h1><p>Earn 1 point for every £1 you spend. The more you shop, the better the perks get.</p>'+
      '<div class="lhero__acts" id="join"><a class="btn btn--white" href="loyalty-account.html?signin=1">Create an account</a><a class="btn lhero__ghost" href="loyalty-account.html?signin=1">Sign in</a></div>'+
      '<p class="lhero__small">Welcome to Go Sweet Rewards 🍭 Join the Club Tier and start earning today.</p></div>'+
      '<div class="lhero__wallet">'+G.wallet()+'</div></section>'+ // same membership cards as the homepage (John: "can these match the homepage")

    '<section class="sec" aria-labelledby="tiers-h"><div class="sec__head"><div><h2 id="tiers-h">Three tiers, better perks as you go</h2><p class="sec__sub">Your tier is based on your lifetime spend. Once you reach a tier it\'s yours to keep.</p></div></div>'+
      '<div class="tiers">'+TIERS.map(function(t){return tierCard(t);}).join('')+'</div></section></div>'+
    ways()+faq()+
    '<section class="sec"><div class="wrap"><div class="lband"><div><h2>Start earning today</h2><p>Earn 1 point for every £1 you spend.</p></div><div class="lband__acts"><a class="btn" href="loyalty-account.html?signin=1">Create an account</a><a class="btn btn--ghost" href="loyalty-account.html?signin=1">Sign in</a></div></div></div></section>';
}

/* ---------- signed in (DEMO) ---------- */
if(acc){
  if(G.qs('signout')==='1'){try{localStorage.removeItem('gs_demo_signed_in');}catch(e){}location.replace('loyalty.html');return;}
  if(!G.isSigned()){
    acc.innerHTML='<div class="wrap"><div class="cempty"><h1>Sign in to see your points</h1><p>This is the prototype: signing in here just shows a demo member account. No details are asked for.</p><a class="btn" href="loyalty-account.html?signin=1">Show the demo account</a></div></div>';return;}
  var M=window.GS_MEMBER,cur=TIERS.filter(function(t){return M.points>=t.min&&(t.max===null||M.points<=t.max);})[0],nxt=TIERS[TIERS.indexOf(cur)+1];
  var pct=nxt?Math.min(100,(M.points-cur.min)/(nxt.min-cur.min)*100):100;
  acc.innerHTML='<div class="wrap"><nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a>'+ic('caret-right',12)+'<a href="loyalty.html">Loyalty Points</a>'+ic('caret-right',12)+'<span aria-current="page">Your rewards</span></nav>'+
    '<section class="ahero"><div class="ahero__txt"><h1>Hi '+esc(M.first)+'</h1><p>You\'re a <b>'+cur.name+'</b> member. Here\'s where your points stand.</p>'+
      '<div class="lhero__acts"><a class="btn btn--white" href="collection.html?c=all">Keep shopping</a><a class="btn lhero__ghost" href="loyalty-account.html?signout=1">Log out</a></div></div>'+
      '<div class="mcard mcard--'+cur.key+' mcard--member"><span class="mcard__logo">GoSweet</span><span class="mcard__tier">'+cur.name+'</span><span class="mcard__name">'+esc(M.name)+'</span>'+
        '<span class="mcard__pts"><b>'+M.points+'</b> points</span>'+
        (nxt?'<span class="mcard__bar" role="img" aria-label="'+M.points+' of '+nxt.min+' points to '+nxt.name+'"><i style="width:'+pct.toFixed(1)+'%"></i></span><span class="mcard__next">'+(nxt.min-M.points)+' points to '+nxt.name+'</span>':'<span class="mcard__next">Top tier</span>')+
        '<span class="mcard__credit">'+cur.credit+' credit back on every order</span></div></section>'+
    '<div class="astats"><div><b>'+M.points+'</b><span>Points</span></div><div><b>'+cur.credit+'</b><span>Credit back</span></div><div><b>'+M.orders.length+'</b><span>Orders this year</span></div><div><b>'+esc(M.expires)+'</b><span>Points kept while you order by</span></div></div>'+
    '<section class="sec" aria-labelledby="tl-h"><div class="sec__head"><div><h2 id="tl-h">Your tier and what\'s next</h2></div></div><div class="tiers">'+TIERS.map(function(t){return tierCard(t,{you:t===cur,next:t===nxt});}).join('')+'</div></section>'+
    '<section class="sec" aria-labelledby="oh-h"><div class="sec__head"><div><h2 id="oh-h">Recent orders</h2><p class="sec__sub">1 point for every £1 spent.</p></div></div>'+
      '<div class="orders" role="table" aria-label="Recent orders"><div class="orders__r orders__r--h" role="row"><span role="columnheader">Order</span><span role="columnheader">Date</span><span role="columnheader">Total</span><span role="columnheader">Points</span></div>'+
      M.orders.map(function(o){return '<div class="orders__r" role="row"><span role="cell">'+esc(o.no)+'</span><span role="cell">'+esc(o.date)+'</span><span role="cell">'+fm(o.total)+'</span><span role="cell" class="orders__pts">+'+Math.floor(o.total)+'</span></div>';}).join('')+'</div></section></div>'+
    ways()+faq();
}
}
if(window.GS)run();else document.addEventListener('gs:ready',run);
})();
