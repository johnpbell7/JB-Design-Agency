/* Homepage: index.html loads the small home-data.js first (what the page renders), then the full catalogue (data.js) after
   first paint; this merges the full set in so search, the basket and the quick-add pop-up see every product. */
(function(){var h=window.NP_HOME,f=window.NP_DATA;if(!h||!f||h===f||!window.NP)return;var BY=NP.BY,P=NP.P;
f.products.forEach(function(p){if(!BY[p.h]){P.push(p);BY[p.h]=p;}});
var bs={};h.brands.forEach(function(b){bs[b.slug]=b;});
f.brands.forEach(function(b){if(bs[b.slug]){for(var k in b)if(!(k in bs[b.slug]))bs[b.slug][k]=b[k];}else h.brands.push(b);});
['articles','cpages','vendorColl','panels'].forEach(function(k){if(f[k])h[k]=f[k];});
window.NP_DATA=h;if(NP.renderCart)NP.renderCart();})();
