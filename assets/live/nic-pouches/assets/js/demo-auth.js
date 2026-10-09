/* demo-auth.js: DEMO SIGN-IN STUB for the prototype (Round 8, 2 Oct 2026; John: "make it so when I click log in it just goes
   to the page"). NOT authentication. Nothing typed into a form is read, checked, stored or sent.
   - Any "Log in / Sign in" link (account-login.html) and the sign-in form's submit go straight to the signed-in Nic Points
     page and set a demo flag (localStorage np_demo_signed_in = 1).
   - With the flag set, every page shows the signed-in header: the "Points: N" pill and the signed-in account icon.
   - "Logout" ([data-demo-logout]) clears the flag and returns to the logged-out Nic Points page.
   For the theme: delete this file and its loader line in app.js; use Shopify customer accounts. The member below is the
   DATA CONTRACT the signed-in page and header read (window.NP_MEMBER), to be filled from the real customer. */
(function(){
  var KEY='np_demo_signed_in', ACC='page-nic-pouches-loyalty-points-account.html', OUT='page-nic-pouches-loyalty-points.html';
  /* DEMO tier switch for review: ?tier=blue|silver|gold on any page (kept for this browser session so the header pill
     matches). Blue is John's live account. Silver and Gold points figures are DEMO PLACEHOLDERS: live states tiers by
     £ spent (Silver £300+, Gold £1200+) and gives no points thresholds, so the business must supply the real ones. */
  var DEMO_TIERS={
    blue:{name:'John Bell',points:100,tier:'Blue',nextTier:'Silver',nextTierPoints:400,nextTierPct:'4%'},
    silver:{name:'John Bell',points:500,tier:'Silver',nextTier:'Gold',tierPoints:400,nextTierPoints:1200,nextTierPct:'8%'},   /* DEMO: 500, 400 and 1200 are placeholders */
    gold:{name:'John Bell',points:1500,tier:'Gold',nextTier:null,tierPoints:1200,nextTierPoints:null,nextTierPct:null}          /* DEMO: 1500 and 1200 are placeholders */
  };
  var tq=(new URLSearchParams(location.search).get('tier')||'').toLowerCase();
  try{if(DEMO_TIERS[tq])sessionStorage.setItem('np_demo_tier',tq);else tq=sessionStorage.getItem('np_demo_tier')||'';}catch(e){}
  if(DEMO_TIERS[tq])window.NP_MEMBER=DEMO_TIERS[tq];
  window.NP_MEMBER=window.NP_MEMBER||{
    name:'John Bell',          /* customer first + last name (live: "Hi John Bell") */
    points:100,                /* current Nic Points balance */
    tier:'Blue',               /* current tier: Blue | Silver | Gold */
    nextTier:'Silver',         /* next tier, or null at the top tier */
    nextTierPoints:400,        /* points total needed for the next tier (live: "Collect 300 more points" at 100) */
    nextTierPct:'4%'           /* the next tier's discount (live: "a whopping 4% on all your nicpouches.com orders") */
  };
  function on(){try{return localStorage.getItem(KEY)==='1';}catch(e){return false;}}
  function set(v){try{if(v)localStorage.setItem(KEY,'1');else localStorage.removeItem(KEY);}catch(e){}}
  if(/page-nic-pouches-loyalty-points-account\.html$/.test(location.pathname)&&!on())set(true);
  function paint(){
    var s=on(), M=window.NP_MEMBER;
    document.documentElement.classList.toggle('is-signed-in',s);
    document.querySelectorAll('.points-btn').forEach(function(b){var t=b.querySelector('span');if(!t)return;
      if(b.dataset.out==null)b.dataset.out=t.textContent;t.textContent=s?'Points: '+M.points:b.dataset.out;b.setAttribute('href',s?ACC:OUT);});
    document.querySelectorAll('.acct-btn').forEach(function(a){a.setAttribute('aria-label',s?'Your account (signed in)':'Account');});
    document.querySelectorAll('.mnav__link[href*="loyalty-points"]').forEach(function(a){var n=a.firstChild;if(!n||n.nodeType!==3)return;
      if(a.dataset.out==null)a.dataset.out=n.textContent;n.textContent=s?'Points: '+M.points+' ':a.dataset.out;a.setAttribute('href',s?ACC:OUT);});
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href="account-login.html"]');
    if(a){e.preventDefault();e.stopPropagation();set(true);location.href=ACC;return;}
    var lo=e.target.closest&&e.target.closest('[data-demo-logout]');
    if(lo){e.preventDefault();e.stopPropagation();set(false);location.href=OUT;}
  },true);
  document.addEventListener('submit',function(e){
    if(!/account-login\.html$/.test(location.pathname))return;
    e.preventDefault();e.stopPropagation();set(true);location.href=ACC;     /* the typed values are never read */
  },true);
  window.NP_DEMO_AUTH={signedIn:on,paint:paint};
  try{document.dispatchEvent(new Event('np:member'));}catch(e){}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',paint);else paint();
  window.addEventListener('load',paint);
})();
