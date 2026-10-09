/* Site copy and imagery, transcribed from nicpouches.com on 30 Sep 2026.
   Anything written new for the redesign is marked NEW COPY so John can check it. */
(function(){
var I='assets/img/brand/';
window.NP_CONTENT={
  trust:[
    {icon:I+'icons/icon-truck.svg',text:'Free Fast Delivery for Orders Over £20 (T&Cs Apply)'},
    {icon:I+'icons/icon-clock.svg',text:'Order by 6:30pm for Same Day Dispatch'},
    {icon:I+'icons/icon-tag.svg',text:'Bulk Buy Discount | Save up to 30%'}
  ],
  /* the four hero tiles, same images and order as the live homepage */
  /* Round 8 (2 Oct 2026, John: "add Übbs to be the first image when you go on the site", "remove jol from banners"):
     Übbs first (the live tile, original 1080px, live alt text, linking to our Übbs brand page); JOL archived to
     Working files/superseded/round8-homepage-jol-tile/ */
  banners:[
    {img:I+'banners/0-ubbs-collection.webp',alt:'Ubbs collection from £2.49/can!',href:'brand.html?b=ubbs'},
    {img:I+'banners/1-pablo-5-pack-bundle.webp',alt:'Exclusive Pablo Bundle Deal',href:'shop.html?brand=Pablo'},
    {img:I+'banners/2-fumi-price-drop.webp',alt:'Fumi Price Drop to £1.99',href:'shop.html?brand=FUMI'},
    {img:I+'banners/3-koldnic-uk-launch.webp',alt:'All new Kold nic pouches',href:'shop.html?brand=Koldnic',label:'Exclusive UK Launch'}
  ],
  brands:[
    {name:'Velo',vendor:'VELO',img:I+'brands/velo.jpg'},
    {name:'Pablo',vendor:'Pablo',img:I+'brands/pablo.jpg'},
    {name:'Killa',vendor:'Killa',img:I+'brands/killa.jpg'},
    {name:'Fumi',vendor:'FUMI',img:I+'brands/fumi.jpg'},
    {name:'XQS',vendor:'XQS',img:I+'brands/xqs.jpg'},
    {name:'Kold Nic',vendor:'Koldnic',img:I+'brands/koldnic.jpg'},
    {name:'JOL',vendor:'Jol',img:I+'brands/jol.png'},
    {name:'NicLeaf',vendor:'NicLeaf',img:I+'brands/nicleaf.png'},
    {name:'Nordic Spirit',vendor:'Nordic Spirit',img:I+'brands/nordic-spirit.jpg'},
    {name:'Kuma',vendor:'KUMA',img:I+'brands/kuma.jpg'},
    {name:'White Fox',vendor:'White Fox',img:I+'brands/white-fox.jpg'},
    {name:'Zyn',vendor:'ZYN',img:I+'brands/zyn.jpg'}
  ],
  promos:[
    {tone:'blue',title:'Save with Nic Points',text:'Up to 8% savings on nic pouches for life.',icon:'points',href:'page-nic-pouches-loyalty-points.html'},
    {tone:'mint',title:'Mix & Match!',text:'Save more on nic pouches and buy in bulk!',icon:'mix',href:'page-mix-match.html'},
    {tone:'amber',title:'Grab a deal!',text:'Top nic pouches brands at discounted prices!',icon:'deal',href:'collection-offers.html'}
  ],
  /* the live basket drawer's promo banner (FUMI Fiery Range Expanded, 99p only) */
  basketPromo:{img:I+'misc/99p-pouches.webp',alt:'FUMI Fiery Range Expanded — 99p only'},
  /* the live site's strength bands (Strengths menu) */
  bands:[
    {key:'low',name:'Low',range:'Up to 6mg per pouch',who:'Ideal for beginners',lvl:1},
    {key:'medium',name:'Medium',range:'7mg to 11mg per pouch',who:'Moderate users',lvl:2},
    {key:'high',name:'High',range:'12mg to 20mg per pouch',who:'Advanced user',lvl:3},
    {key:'strong',name:'Strong',range:'Over 20mg per pouch',who:'Love the burn user',lvl:4},
    {key:'extra',name:'Extra Strong',range:'Over 40mg per pouch',who:'Embrace the intensity',lvl:5}
  ],
  flavours:[
    {key:'beverage',name:'Beverage Inspired',img:I+'flavours/beverage.webp'},
    {key:'sweet',name:'Candy & Sweet',img:I+'flavours/sweet.webp'},
    {key:'citrus',name:'Citrus',img:I+'flavours/citrus.webp'},
    {key:'exotic',name:'Exotic',img:I+'flavours/exotic.webp'},
    {key:'fruit',name:'Fruit',img:I+'flavours/fruit.webp'},
    {key:'herbal',name:'Herbal & Spice',img:I+'flavours/herbal.webp'},
    {key:'mint',name:'Minty & Cool',img:I+'flavours/mint.webp'}
  ],
  types:[
    {name:'Nicotine Pouches',href:'shop.html'},
    {name:'Caffeine Pouches',href:'collection-caffeine-pouches.html'},
    {name:'Nicotine Toothpicks',href:'collection-nicotine-toothpicks.html'},
    {name:'Nicotine Strips',href:'collection-nicotine-strips.html'}
  ],
  featured:{
    spot:{tag:'HOT',title:'Brand Spotlight - Nordic Spirit',
      text:'The tobacco-free range from Japan Tobacco International, crafted in Sweden. Available in 12 flavours across four strength tiers from 6mg to 17mg, with 20 pouches per can. From £2.49 per can.',
      img:I+'featured/nordic-spirit-spotlight.png',alt:'New Nordic Branding',href:'shop.html?brand=Nordic%20Spirit'},
    /* headlines are the live tiles' own titles; the artwork is replaced by our brand tiles (John: no ripped banners) */
    spotSlug:'nordic-spirit',
    tiles:[
      {slug:'apres',title:'Apres Exclusive Collection',tone:'coral'},
      {slug:'koldnic',title:'All new KoldNic Pouches',tone:'sky'},
      {slug:'velo',title:'All New Velo Flavours',tone:'mint'},
      {slug:'slay',title:'Slay 1mg pouches',tone:'amber'}
    ]
  },
  loyalty:{eyebrow:'Save with Nic Points',title:'Save up to 8% on nicpouches for life with NIC Points – Loyalty that pays off every day!',cta:'How it works',img:I+'misc/loyalty-hero.webp'},
  guides:[
    {tag:'News',title:'Best ZYN Flavours UK, Ranked',text:'We rank the best ZYN flavours in the UK, from Cool Mint and Spearmint to the strongest Menthol Ice, with taste notes and strengths.',date:'June 30, 2026',img:I+'guides/best-zyn-flavours.png'},
    {tag:'News',title:'ZYN vs the World: UK vs USA',text:"ZYN leads everywhere, but the UK and US pouch markets look completely different. The real search data on who's biggest where, and why.",date:'September 08, 2026',img:I+'guides/zyn-vs-the-world.png'},
    {tag:'News',title:'How Popular Are Nicotine Pouches in the UK?',text:'Nicotine pouch use in the UK has more than doubled among young adults since 2023. Here is what the latest 2026 ASH figures actually show.',date:'September 07, 2026',img:I+'guides/how-popular-uk.png'},
    {tag:'News',title:'Best Nicotine Pouches UK, Ranked',text:'The best nicotine pouches in the UK, ranked. ZYN Cool Mint leads for all-round quality, with VELO Freezing Peppermint and Nordic Spirit close behind.',date:'June 30, 2026',img:I+'guides/best-nicotine-pouches.png'}
  ],
  seoTitle:'Buy Nic Pouches UK',
  seoIntro:'NicPouches.com is the UK\'s largest dedicated nic pouch store, with more than 300 tobacco-free nic pouches from over 25 brands. Whether you already know your preferred brand and strength or you are switching from cigarettes and just starting out, everything is in one place, with next working day UK delivery. Nic pouches fit discreetly under your top lip, do not produce smoke or vapour, and require nothing to charge or refill. That is why so many UK adults have switched to them.',
  seo:[
    ['What Are Nic Pouches?','A nic pouch is a small white pouch that you place between your gum and top lip. It contains nicotine, plant fibre, and flavour, but no tobacco leaf, so there is nothing to smoke, spit, or burn. You keep it in for up to an hour, then dispose of it. Since they are tobacco-free and smoke-free, you can use them in places where vaping or smoking would not work. New to them? Read our full <a href="#">beginner\'s guide to nicotine pouches</a>.'],
    ['Nic Pouch Strengths Explained','Nic pouches are available in different strengths, shown in milligrams of nicotine per pouch. Lighter strengths are best for newer users or those wanting a gentle effect, while higher strengths are aimed at heavier ex-smokers. As a general guide:<div class="tbl"><table><thead><tr><th>Strength band</th><th>Typical range</th><th>Who it suits</th></tr></thead><tbody><tr><td>Low</td><td>Up to 6mg</td><td>New users and lighter cravings</td></tr><tr><td>Medium</td><td>6mg to 10mg</td><td>Regular users and social smokers switching</td></tr><tr><td>Strong</td><td>10mg to 15mg</td><td>Heavier ex-smokers</td></tr><tr><td>Extra strong</td><td>15mg and above</td><td>Experienced users wanting the biggest hit</td></tr></tbody></table></div>Not sure where to begin? Our <a href="#">nicotine pouch strength guide</a> helps you choose the right one.'],
    ['Shop Nic Pouches by Brand','We stock every major UK nic pouch brand, plus many you will not find elsewhere. The most popular lines are <a href="shop.html?brand=VELO">VELO</a>, <a href="shop.html?brand=ZYN">ZYN</a>, <a href="shop.html?brand=Nordic%20Spirit">Nordic Spirit</a>, <a href="shop.html?brand=Pablo">Pablo</a>, and <a href="shop.html?brand=Killa">Killa</a>. If you want to see everything in one place, visit our full <a href="shop.html">nicotine pouches</a> range or check out the latest <a href="collection-offers.html">deals and offers</a>. On a budget, our <a href="collection-99p-nic-pouches.html">99p pouches</a> are the most affordable entry point.'],
    ['Why Choose Nic Pouches?','Nic pouches give you nicotine without the smoke, the vapour or the tobacco. There is no device to carry or charge like a vape, and unlike snus there is no tobacco leaf, just plant fibre, nicotine and flavour. You get a discreet, hands-free hit you can use almost anywhere, with no smell and nothing to exhale. That mix of convenience and a clean, tobacco-free format is what makes pouches such an easy swap. Weighing up your options? Our <a href="#">nicotine pouches vs snus</a> guide breaks down the differences.'],
    ['How to Choose Your Nic Pouches','If you are new, start with a low or medium strength and a flavour you already like, such as mint or fruit. Fit is important too: slim pouches are more discreet, while larger ones hold more and last longer. Most people try a few brands before finding a favourite, so our <a href="collection-offers.html">mix and match bundles</a> make it easy to sample without buying full cans. Once you have found your match, buying in bulk lowers the per-can price. For help matching flavours across brands, see our <a href="#">nicotine pouch flavours</a> guide.'],
    ['Why Buy Nic Pouches from NicPouches.com?','We only sell nicotine pouches, so this is not a vape shop with a small pouch section. That focus means we offer the widest UK selection, genuine stock from official distributors, and staff who actually know the products. Order by the evening cut-off for same-day dispatch, get free UK delivery over the order threshold, and earn Nic Points on every purchase. Nic pouches are age-restricted, so we only sell to over-18s, with age verification at checkout.']
  ],
  faqTitle:'Nic Pouches FAQ',
  faq:[
    ['Are nic pouches safer than vaping?','Both are tobacco-free and smoke-free, but neither is risk-free. Nic pouches involve no inhalation, as the nicotine is absorbed through the gum rather than the lungs. Action on Smoking and Health (ASH) says nicotine pouches are likely to be far less harmful than smoking for adults who switch completely, though more research is needed. If you do not already smoke or use nicotine, the advice is not to start.'],
    ['Is the nicotine in nic pouches bad for you?','Nicotine is the addictive part of tobacco, but it is not the main cause of smoking-related harm; that comes from burning tobacco and inhaling smoke. Nic pouches deliver nicotine without tobacco, smoke, or vapour. They are meant for existing adult smokers and nicotine users, not for non-users, under-18s, or anyone who is pregnant.'],
    ['What does a nic pouch do?','A nic pouch sits between your gum and top lip and slowly releases nicotine, which is absorbed through the lining of your mouth. You feel a mild tingle at first, then a steady release for up to an hour. It satisfies a nicotine craving discreetly, with no smoke, no vapour, and no need to go outside.'],
    ['Are nic pouches stronger than cigarettes?','It depends entirely on the strength you choose. A low 4mg to 6mg pouch is milder than most cigarettes, while an extra strong 15mg-plus pouch delivers much more nicotine per use. The point of the strength bands is to help you match a pouch to your current habit, which is why we suggest starting lower and moving up only if needed.'],
    ['Are nic pouches legal in the UK?','Yes. Nic pouches are legal to buy and sell in the UK to adults aged 18 and over. They are an age-restricted product, so we verify age at checkout and only sell to over-18s.']
  ],
  collectionIntro:'Nicotine pouches are small, tobacco-free packets that fit under your upper lip and gradually release nicotine, with no smoke, no vapour, and no tobacco leaf. At NicPouches, we offer more than 300 pouches from over 25 brands, such as <a href="shop.html?brand=VELO">VELO</a>, <a href="shop.html?brand=ZYN">ZYN</a>, <a href="shop.html?brand=Pablo">Pablo</a>, <a href="shop.html?brand=Killa">Killa</a>, and <a href="shop.html?brand=Nordic%20Spirit">Nordic Spirit</a>, with strengths ranging from 1.5mg up to 150mg per pouch and prices starting at £0.99 per can.',
  pdp:{
    warning:'This product contains nicotine which is a highly addictive substance.',
    dispatch:'Same day dispatch',
    freeDelivery:'Fast free delivery on orders over £20',
    delivery:[
      ['England & Wales Shipping',''],
      ['Same-Day Dispatch: Order by 6:00pm (Mon–Fri)',''],
      ['Orders £20+ (Mon-Fri): Evri 48–72hr Tracked','FREE'],
      ['Orders £20+ (Mon-Fri): Evri Next Working Day','£2.99'],
      ['Orders under £20 (Mon-Fri): Evri Next Working Day (Tracked) Delivery','£2.99'],
      ['Weekends: Order by 2pm on Saturday for Monday delivery.',''],
      ['Northern Ireland & Scotland Shipping: Evri (Tracked) Delivery','£4.99'],
      ['British Forces Shipping: Evri (Tracked) Delivery','£6.99']
    ],
    whyLow:{intro:'At NicPouches.com, we are committed to offering premium nicotine pouches at the lowest possible prices. We achieve this by:',points:['Sourcing from multiple suppliers to find the best deals.','Negotiating directly with manufacturers to cut out unnecessary costs.','Offering bulk-buy options that allow us to pass on even more savings to our customers.'],outro:'We believe that high-quality nicotine pouches should be affordable and accessible without compromising on variety or freshness.'},
    howto:[
      {img:I+'how-to/1-place.webp',step:'Step 1',text:'Tuck the nicotine pouch between your lip & gum'},
      {img:I+'how-to/2-tingle.webp',step:'Step 2',text:'You may feel a burning or tingling sensation'},
      {img:I+'how-to/3-wait.webp',step:'Step 3',text:'Leave it for 30 mins to max nicotine intake'},
      {img:I+'how-to/4-remove.webp',step:'Step 4',text:'Times up remove used pouch & dispose of it.'},
      {img:I+'how-to/5-repeat.webp',step:'Step 5',text:'Rinse & Repeat'}
    ]
  },
  shipping:{threshold:20,options:[
    {id:'free',name:'Evri 48–72hr Tracked',note:'Orders £20+',price:0,min:20},
    {id:'nwd',name:'Evri Next Working Day',note:'Tracked',price:2.99,min:0},
    {id:'ni',name:'Northern Ireland & Scotland',note:'Evri (Tracked) Delivery',price:4.99,min:0},
    {id:'bf',name:'British Forces',note:'Evri (Tracked) Delivery',price:6.99,min:0}
  ]},
  footer:{
    blurb:'Discover a world of nicotine pouches at nicpouches.com, offering a smokeless, discreet way to enjoy nicotine with the best deals in the UK!',
    whatsapp:'Join our WhatsApp Channel',
    news:'Subscribe to our newsletter to receive the latest news & discount codes!',
    cols:[
      ['Nicotine Pouch Guides',[['The Rise In Nicotine Pouches','blog-the-rise-in-nicotine-pouches.html'],['Nicotine Pouch Beginners Guide','page-what-are-nicotine-pouches-a-beginners-guide-to-nicotine.html'],['How To Use Guide','page-how-to-use-nicotine-pouches-a-step-by-step-guide-for-new-users.html']]],
      ['Popular Brands',[['Caffeine Pouches','collection-caffeine-pouches.html'],['VELO Nicotine Pouches','shop.html?brand=VELO'],['Pablo Nicotine Pouches','shop.html?brand=Pablo'],['Killa Nicotine Pouches','shop.html?brand=Killa'],['Nordic Spirit Nicotine Pouches','shop.html?brand=Nordic%20Spirit'],['ZYN Nicotine Pouches','shop.html?brand=ZYN'],['Shop All','shop.html']]],
      ['Nicotine Pouches',[['Shop All Nicotine Pouches','shop.html'],['Shop By Brands','brands.html'],['Shop By Flavours','page-nicotine-pouch-flavours.html'],['Shop By Strengths','page-nicotine-pouch-strengths.html'],['Shop Snus Free Pouches','collection-snus.html']]],
      ['Important Information',[['Terms & Conditions','page-terms-conditions.html'],['Privacy Policy','policy-privacy-policy.html'],['Delivery Information','page-delivery-information.html'],['Refunds and Returns Policy','page-refunds-and-returns-policy.html'],['Medical Disclaimer','page-nicotine-pouch-products-medical-disclaimer.html'],['About Us','page-about-us.html'],['Contact Us','page-contact.html'],['Sitemap','page-site-map.html']]]
    ],
    age:'This product contains nicotine which is a highly addictive substance.',
    age2:'You must be 18 or over to buy nicotine pouches. Age is verified at checkout.',
    office:'Registered Office: Cavendish House, 369 Burnt Oak Broadway, Edgware, Middlesex, HA8 5AW - Registered in England',
    copy:'© Copyright 2026, Nic Pouches - All Rights Reserved',
    pay:['Amex','Diners Club','Discover','Google Pay','Maestro','Mastercard','Shop Pay','UnionPay','Visa']
  }
};
})();
