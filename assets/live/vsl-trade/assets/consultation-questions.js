
window.VSL_CONSULT_SCREENS = [
 {
  "id": "A1",
  "topic": "about",
  "title": "Who is answering",
  "intro": "",
  "questions": [
   {
    "key": "A1.q1",
    "text": "In what capacity are you responding to this survey?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "An individual sharing my personal views and experiences",
     "An individual sharing my professional views",
     "On behalf of an organisation"
    ],
    "designNote": "A retailer answering as their shop picks the third option. Do not pre-select it. If they pick either individual option, screen A3 appears."
   },
   {
    "key": "A1.q2",
    "text": "Do you have any direct or indirect links to, or receive funding from, the tobacco industry?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Yes",
     "No"
    ]
   }
  ]
 },
 {
  "id": "A2",
  "topic": "about",
  "title": "Your trade",
  "intro": "",
  "questions": [
   {
    "key": "A2.q1",
    "text": "Do you work for, or are you providing views on behalf of, any of the following?",
    "hint": "Select all that apply.",
    "type": "checkbox",
    "required": true,
    "options": [
     "Manufacturer or producer of a tobacco product",
     "Manufacturer or producer of a vape or nicotine product",
     "Importer of a tobacco product",
     "Importer of a vape or nicotine product",
     "Distributor of a tobacco product",
     "Distributor of a vape or nicotine product",
     "Retailer of a tobacco product",
     "Retailer of a vape or nicotine product",
     "None of the above"
    ],
    "exclusive": "None of the above",
    "designNote": "Ticking None of the above clears every other box. Show an Or divider above it, as the DHSC form does."
   }
  ]
 },
 {
  "id": "A3",
  "topic": "about",
  "title": "Your own smoking and vaping",
  "intro": "",
  "questions": [
   {
    "key": "A3.q1",
    "text": "Which of the following best describes your smoking habits (including heated tobacco use)?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "I currently smoke at least once a week",
     "I smoke occasionally (less than once a week)",
     "I used to smoke but have now quit",
     "I have never smoked",
     "Prefer not to say"
    ]
   },
   {
    "key": "A3.q2",
    "text": "Which of the following best describes your vaping habits?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "I currently vape at least once a week",
     "I vape occasionally (less than once a week)",
     "I used to vape but have now quit",
     "I have never vaped",
     "Prefer not to say"
    ]
   },
   {
    "key": "A3.q3",
    "text": "Which of the following best describes your usage of other nicotine products?",
    "hint": "For example, nicotine pouches.",
    "type": "radio",
    "required": true,
    "options": [
     "I currently use nicotine products at least once a week",
     "I use nicotine products occasionally (less than once a week)",
     "I used to use nicotine products but have now quit",
     "I have never used nicotine products",
     "Prefer not to say"
    ]
   }
  ],
  "showNote": "Only if A1 capacity is either individual option"
 },
 {
  "id": "G3",
  "topic": "t3",
  "title": "Vape and nicotine packaging and flavours",
  "intro": "",
  "gate": true,
  "questions": [
   {
    "key": "G3.q1",
    "text": "Would you like to answer the questions in this section?",
    "hint": "",
    "type": "gate",
    "required": true,
    "options": [
     "Yes",
     "No"
    ]
   }
  ]
 },
 {
  "id": "3.1",
  "topic": "t3",
  "title": "Colour of packaging",
  "intro": "The Government proposes that the packaging for vaping and nicotine products should be white.",
  "questions": [
   {
    "key": "3.1.q1",
    "text": "Do you agree or disagree with our proposal to restrict the colour of packaging of all vaping products to white?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.1.q2",
    "text": "Do you agree or disagree with our proposal to restrict the colour of packaging of all nicotine products to white?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.1.q3",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ]
 },
 {
  "id": "3.2",
  "topic": "t3",
  "title": "Imagery, branding, text and promotion",
  "intro": "No imagery. All text, including brand names, in a standard colour, font and typeface. No promotional features on or in the pack.",
  "questions": [
   {
    "key": "3.2.q1",
    "text": "Do you agree or disagree with our proposal to introduce the restrictions to imagery, branding, text and promotional features outlined above for the packaging of all vaping products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.2.q2",
    "text": "Do you agree or disagree with our proposal to introduce the restrictions to imagery, branding, text and promotional features outlined above for the packaging of all nicotine products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.2.q3",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ]
 },
 {
  "id": "3.3",
  "topic": "t3",
  "title": "Shape, materials and safety",
  "intro": "Uniform pack shapes. No glossy, holographic or tactile finishes. Child-resistant and tamper-evident for all vaping and nicotine products.",
  "questions": [
   {
    "key": "3.3.q1",
    "text": "Do you agree or disagree with our proposal that packaging for all vaping products should have uniform shapes, and that there should be restrictions on materials and finishes that can enhance appeal?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.3.q2",
    "text": "Do you agree or disagree with our proposal that packaging for all nicotine products should have uniform shapes, and that there should be restrictions on materials and finishes that can enhance appeal?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.3.q3",
    "text": "Do you agree or disagree with our proposal that packaging for all vaping products should be both child-resistant and tamper-evident?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.3.q4",
    "text": "Do you agree or disagree with our proposal that packaging for all nicotine products should be both child-resistant and tamper-evident?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.3.q5",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ]
 },
 {
  "id": "3.4",
  "topic": "t3",
  "title": "Flavour names",
  "intro": "One recognised flavour name per pack. No concept or sensory names, no confectionery, dessert, alcohol or drink names.",
  "questions": [
   {
    "key": "3.4.q1",
    "text": "Do you agree or disagree with our proposal to restrict flavour descriptors on the packaging of all vaping products to a single lead flavour?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.4.q2",
    "text": "Do you agree or disagree with our proposal to restrict flavour descriptors on the packaging of all nicotine products to a single lead flavour?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.4.q3",
    "text": "Do you agree or disagree with our proposal that concept and sensory flavour descriptors should be restricted on the packaging of all vaping products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.4.q4",
    "text": "Do you agree or disagree with our proposal that concept and sensory flavour descriptors should be restricted on the packaging of all nicotine products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.4.q5",
    "text": "Do you agree or disagree with our proposal that confectionery, sweets, dessert and cake name descriptors should be restricted on the packaging of all vaping products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.4.q6",
    "text": "Do you agree or disagree with our proposal that confectionery, sweets, dessert and cake name descriptors should be restricted on the packaging of all nicotine products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.4.q7",
    "text": "Do you agree or disagree with our proposal that alcohol and drink name descriptors should be restricted on the packaging of all vaping products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.4.q8",
    "text": "Do you agree or disagree with our proposal that alcohol and drink name descriptors should be restricted on the packaging of all nicotine products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.4.q9",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ]
 },
 {
  "id": "3.5",
  "topic": "t3",
  "title": "Information on and inside the pack",
  "intro": "Full ingredients, expiry, an age symbol, standard nicotine strength, nicotine per puff or pouch, a nicotine warning front and back, disposal instructions and a leaflet where relevant.",
  "questions": [
   {
    "key": "3.5.q1",
    "text": "Do you agree or disagree with our proposal to require the consumer information listed above on and inside the packaging of all vaping products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.5.q2",
    "text": "Do you agree or disagree with our proposal to require the consumer information listed above on and inside the packaging of all nicotine products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.5.q3",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ]
 },
 {
  "id": "3.6",
  "topic": "t3",
  "title": "Time to comply",
  "intro": "Twelve months from when the detail is clear, for packaging.",
  "questions": [
   {
    "key": "3.6.q1",
    "text": "Do you agree or disagree with our proposed implementation period of no less than 12 months (from when the detail of any new requirements is clear)?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "3.6.q2",
    "text": "Please explain your answer.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ]
 },
 {
  "id": "G4",
  "topic": "t4",
  "title": "Vape device appearance",
  "intro": "",
  "gate": true,
  "questions": [
   {
    "key": "G4.q1",
    "text": "Would you like to answer the questions in this section?",
    "hint": "",
    "type": "gate",
    "required": true,
    "options": [
     "Yes",
     "No"
    ]
   }
  ]
 },
 {
  "id": "4.1",
  "topic": "t4",
  "title": "Colour, finish and lights",
  "intro": "Devices in white, black or grey only, matt, one colour per device.",
  "questions": [
   {
    "key": "4.1.q1",
    "text": "Do you agree or disagree with our proposal to limit the colour of a vaping device (including all visible parts) to white, black or grey with a matt finish?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "4.1.q2",
    "text": "Do you agree or disagree that vape devices should be banned from having cosmetic lights?",
    "hint": "This would not apply to functional lights, such as those that indicate charge level.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "4.1.q3",
    "text": "Please explain your answer.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ]
 },
 {
  "id": "4.2",
  "topic": "t4",
  "title": "Branding on the device",
  "intro": "No images or artwork. One brand name in a set font, size and colour.",
  "questions": [
   {
    "key": "4.2.q1",
    "text": "Do you agree or disagree with our proposal to restrict all branding, imagery and artwork on vapes?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "4.2.q2",
    "text": "Please explain your answer.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ]
 },
 {
  "id": "4.3",
  "topic": "t4",
  "title": "Screens",
  "intro": "",
  "questions": [
   {
    "key": "4.3.q1",
    "text": "Do you agree or disagree that digital screens on vapes should be restricted to only the display of safety and status information such as battery level, and be greyscale in colour (black, white and grey only)?",
    "hint": "This would not include lights that indicate status information, such as when the device is being recharged.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "4.3.q2",
    "text": "Please explain your answer.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ]
 },
 {
  "id": "4.4",
  "topic": "t4",
  "title": "Looking like other things",
  "intro": "",
  "questions": [
   {
    "key": "4.4.q1",
    "text": "Do you agree or disagree that vapes should not be permitted to mimic the design of other products and items?",
    "hint": "The objective of this proposal is to limit the appeal or attractiveness of vapes.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "4.4.q2",
    "text": "Please explain your answer.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ]
 },
 {
  "id": "4.5",
  "topic": "t4",
  "title": "Time to comply",
  "intro": "Twelve months from when the detail is clear, for devices.",
  "questions": [
   {
    "key": "4.5.q1",
    "text": "Do you agree or disagree with our proposed implementation period of no less than 12 months (from when the detail of any new requirements is clear)?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "4.5.q2",
    "text": "Please explain your answer.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ]
 },
 {
  "id": "5.0",
  "topic": "t5",
  "title": "Which display questions apply to you",
  "intro": "",
  "questions": [
   {
    "key": "5.0.q1",
    "text": "Which questions, if any, would you like to answer?",
    "hint": "",
    "type": "checkbox",
    "required": false,
    "options": [
     "Questions about proposed policy in England, Wales and Northern Ireland",
     "Questions about proposed policy in Scotland",
     "None of the above"
    ],
    "exclusive": "None of the above",
    "designNote": "Optional on the DHSC form. None of the above skips to 5.11."
   }
  ]
 },
 {
  "id": "5.1",
  "topic": "t5",
  "title": "Tobacco display. England, Wales and Northern Ireland",
  "intro": "Requested display only from behind a sales counter. The same restrictions extended to cigarette papers, tobacco-related devices and herbal smoking products.",
  "questions": [
   {
    "key": "5.1.q1",
    "text": "Do you agree or disagree with our proposal to introduce a legal requirement that the requested temporary display of all tobacco products must take place from behind a sales counter?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.1.q2",
    "text": "Do you agree or disagree with our proposal to restrict the display of cigarette papers?",
    "hint": "This would include the requirement that their requested temporary display must take place from behind a sales counter.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.1.q3",
    "text": "Do you agree or disagree with our proposal to restrict the display of heated and other tobacco-related devices?",
    "hint": "This would include the requirement that their requested temporary display must take place from behind a sales counter.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.1.q4",
    "text": "Do you agree or disagree with our proposal to restrict the display of herbal smoking products?",
    "hint": "This would include the requirement that their requested temporary display must take place from behind a sales counter.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.1.q5",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "England, Wales and Northern Ireland ticked"
 },
 {
  "id": "5.2",
  "topic": "t5",
  "title": "Prices. England, Wales and Northern Ireland",
  "intro": "",
  "questions": [
   {
    "key": "5.2.q1",
    "text": "Do you agree or disagree with our proposal to restrict the display of prices for cigarette papers?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.2.q2",
    "text": "Do you agree or disagree with our proposal to restrict the display of prices for all tobacco-related devices including heated tobacco devices?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.2.q3",
    "text": "Do you agree or disagree with our proposal to restrict the display of prices for herbal smoking products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.2.q4",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "as 5.1"
 },
 {
  "id": "5.3",
  "topic": "t5",
  "title": "Trade premises exemption. England, Wales and Northern Ireland",
  "intro": "",
  "questions": [
   {
    "key": "5.3.q1",
    "text": "Do you agree or disagree with our proposal to allow for the display of cigarette papers and their prices in relevant trade premises?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.3.q2",
    "text": "Do you agree or disagree with our proposal to allow for the display of tobacco-related devices, including heated tobacco devices, and their prices in relevant trade premises?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.3.q3",
    "text": "Do you agree or disagree with our proposal to allow for the display of herbal smoking products and their prices in relevant trade premises?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.3.q4",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "as 5.1"
 },
 {
  "id": "5.4",
  "topic": "t5",
  "title": "Specialist tobacconist exemption. England, Wales and Northern Ireland",
  "intro": "",
  "questions": [
   {
    "key": "5.4.q1",
    "text": "Do you agree or disagree with our proposal to allow for the display of cigarette papers and their prices inside specialist tobacconists?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.4.q2",
    "text": "Do you agree or disagree with our proposal to allow for the display of tobacco-related devices, including heated tobacco devices, and their prices inside specialist tobacconists?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.4.q3",
    "text": "Do you agree or disagree with our proposal to allow for the display of herbal smoking products and their prices inside specialist tobacconists?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.4.q4",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "as 5.1"
 },
 {
  "id": "5.5",
  "topic": "t5",
  "title": "Bulk tobacconist exemption. England, Wales and Northern Ireland",
  "intro": "",
  "questions": [
   {
    "key": "5.5.q1",
    "text": "Do you agree or disagree with our proposal to remove and not replicate this exemption for all products in scope of this consultation?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.5.q2",
    "text": "Please explain your answer.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "as 5.1"
 },
 {
  "id": "5.6",
  "topic": "t5",
  "title": "Tobacco display. Scotland",
  "intro": "",
  "questions": [
   {
    "key": "5.6.q1",
    "text": "Do you agree or disagree with our proposal to introduce a legal requirement that the requested temporary display of tobacco products and smoking-related products must take place from behind a sales counter?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.6.q2",
    "text": "Do you agree or disagree with our proposal to restrict the display of heated tobacco devices?",
    "hint": "This would include the requirement that their requested temporary display must take place from behind a sales counter.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.6.q3",
    "text": "Do you agree or disagree with our proposal to restrict the display of herbal smoking products?",
    "hint": "This would include the requirement that their requested temporary display must take place from behind a sales counter.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.6.q4",
    "text": "Do you agree or disagree that the maximum visible area of display unit permitted as a result of a requested or incidental display of herbal smoking products or heated tobacco devices in Scotland should be 0.1 square metres?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.6.q5",
    "text": "If we expand the area of display, what size do you think it should be increased to?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "0.5 square metres",
     "1 square metre",
     "1.5 square metres",
     "Don't know"
    ]
   },
   {
    "key": "5.6.q6",
    "text": "Do you agree or disagree that the current list of smoking-related products reflects all tobacco-related devices used for smoking currently available to purchase?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.6.q7",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "Scotland ticked"
 },
 {
  "id": "5.7",
  "topic": "t5",
  "title": "Prices. Scotland",
  "intro": "",
  "questions": [
   {
    "key": "5.7.q1",
    "text": "Do you agree or disagree with our proposal to restrict the display of prices of heated tobacco devices?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.7.q2",
    "text": "Do you agree or disagree with our proposal to restrict the display of prices for herbal smoking products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.7.q3",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "as 5.6"
 },
 {
  "id": "5.8",
  "topic": "t5",
  "title": "Trade premises exemption. Scotland",
  "intro": "",
  "questions": [
   {
    "key": "5.8.q1",
    "text": "Do you agree or disagree with our proposal to allow for the display of heated tobacco devices and prices in relevant trade premises in Scotland?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.8.q2",
    "text": "Do you agree or disagree with our proposal to allow for the display of herbal smoking products and prices in relevant trade premises in Scotland?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.8.q3",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "as 5.6"
 },
 {
  "id": "5.9",
  "topic": "t5",
  "title": "Specialist tobacconist exemption. Scotland",
  "intro": "",
  "questions": [
   {
    "key": "5.9.q1",
    "text": "Do you agree or disagree with our proposal to allow for the display of heated tobacco devices and prices inside specialist tobacconists in Scotland?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.9.q2",
    "text": "Do you agree or disagree with our proposal to allow for the display of herbal smoking products and prices inside specialist tobacconists in Scotland?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.9.q3",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "as 5.6"
 },
 {
  "id": "5.10",
  "topic": "t5",
  "title": "Bulk tobacconist exemption. Scotland",
  "intro": "",
  "questions": [
   {
    "key": "5.10.q1",
    "text": "Do you agree or disagree with our proposal to remove and not replicate the bulk tobacconist exemption for all products in scope of this consultation?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.10.q2",
    "text": "Please explain your answer.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "as 5.6"
 },
 {
  "id": "5.11",
  "topic": "t5",
  "title": "Vape and nicotine display. Do you want these questions?",
  "intro": "",
  "questions": [
   {
    "key": "5.11.q1",
    "text": "Would you like to answer these questions?",
    "hint": "",
    "type": "gate",
    "required": true,
    "options": [
     "Yes",
     "No"
    ],
    "designNote": "This is the gate that matters most to a vape retailer. No skips to 5.16."
   }
  ]
 },
 {
  "id": "5.12",
  "topic": "t5",
  "title": "Vape and nicotine display",
  "intro": "Vapes and nicotine products kept out of sight, shown on request from behind the counter. Maximum visible area 1.5 square metres in England, Wales and Northern Ireland, 0.1 in Scotland.",
  "questions": [
   {
    "key": "5.12.q1",
    "text": "Do you agree or disagree with our proposal to restrict the display of vaping products?",
    "hint": "This would include the requirement that their requested temporary display must take place from behind a sales counter.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.12.q2",
    "text": "Do you agree or disagree with our proposal to restrict the display of nicotine products?",
    "hint": "This would include the requirement that their requested temporary display must take place from behind a sales counter.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.12.q3",
    "text": "Do you agree or disagree that the requested temporary or incidental display of vaping and nicotine products should not result in the display of tobacco products (and smoking-related products in Scotland), cigarette papers, heated and other tobacco devices or herbal smoking products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.12.q4",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "5.11 Yes"
 },
 {
  "id": "5.13",
  "topic": "t5",
  "title": "Vape and nicotine prices",
  "intro": "",
  "questions": [
   {
    "key": "5.13.q1",
    "text": "Do you agree or disagree with our proposal to restrict the display of prices for vaping products, and allow for additional information on nicotine strength and ingredients?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.13.q2",
    "text": "Do you agree or disagree with our proposal to restrict the display of prices for nicotine products and allow for additional information on nicotine strength and ingredients?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.13.q3",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "5.11 Yes"
 },
 {
  "id": "5.14",
  "topic": "t5",
  "title": "Trade premises exemption. Vape and nicotine",
  "intro": "",
  "questions": [
   {
    "key": "5.14.q1",
    "text": "Do you agree or disagree with our proposal to allow for the display of vaping products in relevant trade premises?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.14.q2",
    "text": "Do you agree or disagree with our proposal to allow for the display of nicotine products in relevant trade premises?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.14.q3",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "5.11 Yes"
 },
 {
  "id": "5.15",
  "topic": "t5",
  "title": "Pharmacies",
  "intro": "",
  "questions": [
   {
    "key": "5.15.q1",
    "text": "Do you agree or disagree that community pharmacies in England, Wales and Scotland should be permitted an exemption to allow for the limited display of vaping and nicotine products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.15.q2",
    "text": "Please explain your answer.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "5.11 Yes"
 },
 {
  "id": "5.16",
  "topic": "t5",
  "title": "Time to comply",
  "intro": "Six months from when the detail is clear, for display changes.",
  "questions": [
   {
    "key": "5.16.q1",
    "text": "Do you agree with our proposal that there should be a minimum of 6 months\u2019 notice (from when the detail if any new requirements is clear)?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "5.16.q2",
    "text": "Please explain your answer.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ]
 },
 {
  "id": "X0",
  "topic": "x0",
  "title": "Anything else that affects you?",
  "intro": "",
  "questions": [
   {
    "key": "X0.q1",
    "text": "The consultation also covers three areas that most convenience stores will not need. Tick any you want to answer.",
    "hint": "",
    "type": "checkbox",
    "required": false,
    "options": [
     "Tobacco packaging, health warnings and pack inserts",
     "Heated tobacco device appearance",
     "Evidence for the Government\u2019s impact assessments"
    ],
    "designNote": "Optional. Our own wording, not DHSC\u2019s. Three plain toggles, none pre-ticked, with one line under each saying what it covers."
   }
  ]
 },
 {
  "id": "G1",
  "topic": "t1",
  "title": "Tobacco packaging",
  "intro": "",
  "gate": true,
  "questions": [
   {
    "key": "G1.q1",
    "text": "Would you like to answer the questions in this section?",
    "hint": "",
    "type": "gate",
    "required": true,
    "options": [
     "Yes",
     "No"
    ]
   }
  ]
 },
 {
  "id": "1.1",
  "topic": "t1",
  "title": "Plain packaging for more products",
  "intro": "Plain packs extended to all tobacco products other than cigarettes and hand-rolling tobacco, to heated tobacco devices, herbal smoking products and cigarette papers.",
  "questions": [
   {
    "key": "1.1.q1",
    "text": "Do you agree or disagree with our proposal to introduce the plain packaging requirements outlined above for all tobacco products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "1.1.q2",
    "text": "Do you agree or disagree with our proposal to introduce the plain packaging requirements outlined above for heated tobacco devices?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "1.1.q3",
    "text": "Do you agree or disagree with our proposal to introduce the plain packaging requirements outlined above for herbal smoking products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "1.1.q4",
    "text": "Do you agree or disagree with our proposal to introduce the plain packaging requirements outlined above for cigarette papers?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "1.1.q5",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "ticked on X0"
 },
 {
  "id": "1.2",
  "topic": "t1",
  "title": "Text health warnings",
  "intro": "",
  "questions": [
   {
    "key": "1.2.q1",
    "text": "Do you agree or disagree with our proposal to introduce text health warnings on the packaging of heated tobacco devices?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "1.2.q2",
    "text": "Do you agree or disagree with our proposal to introduce text health warnings on the packaging of cigarette papers?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "1.2.q3",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "ticked on X0"
 },
 {
  "id": "1.3",
  "topic": "t1",
  "title": "Picture health warnings",
  "intro": "",
  "questions": [
   {
    "key": "1.3.q1",
    "text": "Do you agree or disagree with our proposal to introduce picture health warnings on the packaging of all tobacco products?",
    "hint": "This builds on requirements that are already in place for most tobacco products.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "1.3.q2",
    "text": "Do you agree or disagree with our proposal to introduce picture health warnings on the packaging of heated tobacco devices?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "1.3.q3",
    "text": "Do you agree or disagree with our proposal to introduce picture health warnings on the packaging of herbal smoking products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "1.3.q4",
    "text": "Do you agree or disagree that picture health warnings should not be required on the packaging of cigarette papers?",
    "hint": "We do not propose including picture health warnings on cigarette papers due to the small size of the packaging.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "1.3.q5",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "ticked on X0"
 },
 {
  "id": "1.4",
  "topic": "t1",
  "title": "Pack inserts",
  "intro": "",
  "questions": [
   {
    "key": "1.4.q1",
    "text": "Do you agree or disagree with our proposal to introduce pack inserts for all tobacco products?",
    "hint": "This does not include cigarettes and hand-rolling tobacco which we are addressing separately to this consultation.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "1.4.q2",
    "text": "Do you agree or disagree with our proposal to introduce pack inserts for heated tobacco devices?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "1.4.q3",
    "text": "Do you agree or disagree with our proposal to introduce pack inserts for herbal smoking products?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "1.4.q4",
    "text": "Do you agree or disagree that pack inserts should not be required in the packaging of cigarette papers?",
    "hint": "We do not propose including pack inserts for cigarette papers due to the small size of the packaging.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "1.4.q5",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "ticked on X0"
 },
 {
  "id": "1.5",
  "topic": "t1",
  "title": "Time to comply",
  "intro": "",
  "questions": [
   {
    "key": "1.5.q1",
    "text": "Do you agree or disagree with our proposed implementation period of no less than 12 months (from when the detail of any new requirements is clear)?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "1.5.q2",
    "text": "Please explain your answer.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "ticked on X0"
 },
 {
  "id": "G2",
  "topic": "t2",
  "title": "Heated tobacco device appearance",
  "intro": "",
  "gate": true,
  "questions": [
   {
    "key": "G2.q1",
    "text": "Would you like to answer the questions in this section?",
    "hint": "",
    "type": "gate",
    "required": true,
    "options": [
     "Yes",
     "No"
    ]
   }
  ]
 },
 {
  "id": "2.1",
  "topic": "t2",
  "title": "Colour, finish and lights",
  "intro": "",
  "questions": [
   {
    "key": "2.1.q1",
    "text": "Do you agree or disagree with our proposal to restrict the colour of heated tobacco devices to Pantone 448C (drab dark brown) with an opaque matt finish?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "2.1.q2",
    "text": "Do you agree or disagree that heated tobacco devices should be banned from having cosmetic lights?",
    "hint": "This will not apply to functional lights, like those that indicate charge level.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "2.1.q3",
    "text": "Please explain your answers.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "ticked on X0"
 },
 {
  "id": "2.2",
  "topic": "t2",
  "title": "Branding on the device",
  "intro": "",
  "questions": [
   {
    "key": "2.2.q1",
    "text": "Do you agree or disagree with our proposal to restrict all branding, imagery and artwork on heated tobacco devices?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "2.2.q2",
    "text": "Please explain your answer.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "ticked on X0"
 },
 {
  "id": "2.3",
  "topic": "t2",
  "title": "Screens",
  "intro": "",
  "questions": [
   {
    "key": "2.3.q1",
    "text": "Do you agree or disagree that digital screens on heated tobacco devices should be restricted to only the display of safety and status information such as battery level, and be greyscale in colour (black, white and grey only)?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "2.3.q2",
    "text": "Please explain your answer.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "ticked on X0"
 },
 {
  "id": "2.4",
  "topic": "t2",
  "title": "Looking like other things",
  "intro": "",
  "questions": [
   {
    "key": "2.4.q1",
    "text": "Do you agree or disagree that heated tobacco devices should not be permitted to mimic the design of other products and items?",
    "hint": "The objective of this proposal is to limit the appeal or attractiveness of heated tobacco devices.",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "2.4.q2",
    "text": "Please explain your answer.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "ticked on X0"
 },
 {
  "id": "2.5",
  "topic": "t2",
  "title": "Time to comply",
  "intro": "",
  "questions": [
   {
    "key": "2.5.q1",
    "text": "Do you agree or disagree with our proposed implementation period of no less than 12 months (from when the detail of any new requirements is clear)?",
    "hint": "",
    "type": "radio",
    "required": true,
    "options": [
     "Agree",
     "Neither agree nor disagree",
     "Disagree",
     "Don't know"
    ]
   },
   {
    "key": "2.5.q2",
    "text": "Please explain your answer.",
    "hint": "Maximum 600 words. Do not include anything that could identify you or someone else.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "ticked on X0"
 },
 {
  "id": "G6",
  "topic": "t6",
  "title": "Evidence for the impact assessments",
  "intro": "",
  "gate": true,
  "questions": [
   {
    "key": "G6.q1",
    "text": "Would you like to answer the questions in this section?",
    "hint": "",
    "type": "gate",
    "required": true,
    "options": [
     "Yes",
     "No"
    ]
   }
  ]
 },
 {
  "id": "6.1",
  "topic": "t6",
  "title": "Impact assessment: standardised packaging and pack inserts for tobacco products, heated tobacco devices, herbal smoking products and cigarette papers",
  "intro": "",
  "questions": [
   {
    "key": "6.1.q1",
    "text": "Provide any evidence to inform our estimates in the impact assessment of the benefits of the proposed policy.",
    "hint": "For example, information on the impact that options will have on the number of people using products in scope and/or health benefits associated with any reduction in usage.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   },
   {
    "key": "6.1.q2",
    "text": "Provide any evidence to inform our estimates in the impact assessment of the costs of the proposed policy.",
    "hint": "For example, information on profit margins for manufacturers, wholesalers and retailers, and/or costs and process of product redesign.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   },
   {
    "key": "6.1.q3",
    "text": "Specify any stakeholders that may be impacted by the proposed policy and/or costs and benefits that we have not identified in the impact assessment.",
    "hint": "",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   },
   {
    "key": "6.1.q4",
    "text": "Outline any potential unintended consequences of the proposed policy that we have not identified in the impact assessment.",
    "hint": "",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   },
   {
    "key": "6.1.q5",
    "text": "Provide any other comments to inform our assumptions or analysis in the impact assessment.",
    "hint": "",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "ticked on X0"
 },
 {
  "id": "6.2",
  "topic": "t6",
  "title": "Impact assessment: restricting the appearance of vapes and heated tobacco products",
  "intro": "",
  "questions": [
   {
    "key": "6.2.q1",
    "text": "Provide any evidence to inform our estimates in the impact assessment of the benefits of the proposed policy.",
    "hint": "For example, information on the impact that options will have on the number of people using products in scope and/or health benefits associated with any reduction in usage.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   },
   {
    "key": "6.2.q2",
    "text": "Provide any evidence to inform our estimates in the impact assessment of the costs of the proposed policy.",
    "hint": "For example, information on profit margins for manufacturers, wholesalers and retailers, and/or costs and process of product redesign.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   },
   {
    "key": "6.2.q3",
    "text": "Specify any stakeholders that may be impacted by the proposed policy and/or costs and benefits that we have not identified in the impact assessment.",
    "hint": "",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   },
   {
    "key": "6.2.q4",
    "text": "Outline any potential unintended consequences of the proposed policy that we have not identified in the impact assessment.",
    "hint": "",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   },
   {
    "key": "6.2.q5",
    "text": "Provide any other comments to inform our assumptions or analysis in the impact assessment.",
    "hint": "",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "ticked on X0"
 },
 {
  "id": "6.3",
  "topic": "t6",
  "title": "Impact assessment: standardising packaging for vaping products and nicotine products",
  "intro": "",
  "questions": [
   {
    "key": "6.3.q1",
    "text": "Provide any evidence to inform our estimates in the impact assessment of the benefits of the proposed policy.",
    "hint": "For example, information on the impact that options will have on the number of people using products in scope and/or health benefits associated with any reduction in usage.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   },
   {
    "key": "6.3.q2",
    "text": "Provide any evidence to inform our estimates in the impact assessment of the costs of the proposed policy.",
    "hint": "For example, information on profit margins for manufacturers, wholesalers and retailers, and/or costs and process of product redesign.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   },
   {
    "key": "6.3.q3",
    "text": "Specify any stakeholders that may be impacted by the proposed policy and/or costs and benefits that we have not identified in the impact assessment.",
    "hint": "",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   },
   {
    "key": "6.3.q4",
    "text": "Outline any potential unintended consequences of the proposed policy that we have not identified in the impact assessment.",
    "hint": "",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   },
   {
    "key": "6.3.q5",
    "text": "Provide any other comments to inform our assumptions or analysis in the impact assessment.",
    "hint": "",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5
   }
  ],
  "showNote": "ticked on X0"
 },
 {
  "id": "6.4",
  "topic": "t6",
  "title": "Impact assessments on retail display",
  "intro": "",
  "questions": [
   {
    "key": "6.4.q1",
    "text": "Provide any evidence to inform our estimates in the impact assessments of the benefits of the proposed policy. In your response, please specify which impact assessments you are referring to.",
    "hint": "For example, information on the impact that options will have on the number of people using products in scope and/or health benefits associated with any reduction in usage.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5,
    "derived": "Pluralised from 6.1 per the spec note. Verify against the live DHSC form."
   },
   {
    "key": "6.4.q2",
    "text": "Provide any evidence to inform our estimates in the impact assessments of the costs of the proposed policy. In your response, please specify which impact assessments you are referring to.",
    "hint": "For example, information on profit margins for manufacturers, wholesalers and retailers, and/or costs and process of product redesign.",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5,
    "derived": "Pluralised from 6.1 per the spec note. Verify against the live DHSC form."
   },
   {
    "key": "6.4.q3",
    "text": "Specify any stakeholders that may be impacted by the proposed policy and/or costs and benefits that we have not identified in the impact assessments. In your response, please specify which impact assessments you are referring to.",
    "hint": "",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5,
    "derived": "Pluralised from 6.1 per the spec note. Verify against the live DHSC form."
   },
   {
    "key": "6.4.q4",
    "text": "Outline any potential unintended consequences of the proposed policy that we have not identified in the impact assessments. In your response, please specify which impact assessments you are referring to.",
    "hint": "",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5,
    "derived": "Pluralised from 6.1 per the spec note. Verify against the live DHSC form."
   },
   {
    "key": "6.4.q5",
    "text": "Provide any other comments to inform our assumptions or analysis in the impact assessments. In your response, please specify which impact assessments you are referring to.",
    "hint": "",
    "type": "textarea",
    "required": false,
    "maxLength": 4500,
    "rows": 5,
    "derived": "Pluralised from 6.1 per the spec note. Verify against the live DHSC form."
   }
  ],
  "showNote": "ticked on X0"
 }
];
