const commons = 'https://thumb.wikimedia.org/wikipedia/commons/thumb';

export const SUGGESTIONS = [
  {
    slug: 'kadisha-valley',
    title: 'Hike in Kadisha Valley',
    activity: 'hike',
    place: { name: 'Kadisha Valley', country: 'Lebanon', lat: 34.25, lon: 35.95 },
    blurb: 'Walk the Holy Valley between monasteries built into the cliffs.',
    todo: [
      'Hike the paths down to the old monasteries carved into the cliffs, like Qannoubine.',
      'Visit the Monastery of Saint Anthony of Qozhaya.',
      'Add the Cedars of God and the Gibran Museum in Bsharri to the same day.',
    ],
    tips: ['Wear good shoes: the paths are steep and rocky.', 'Bring enough water, there are few shops in the valley.'],
  },
  {
    slug: 'mim-museum',
    title: 'Visit the MIM Mineral Museum',
    activity: 'city',
    place: { name: 'MIM Museum', country: 'Lebanon', lat: 33.8798, lon: 35.5141 },
    blurb: 'Crystals, gems and fossils on the USJ campus in Beirut.',
    about:
      'MIM is a private museum of minerals and fossils that opened in 2013. Its mineral collection has more than 2,300 samples of about 560 species from 80 countries. It is on the Saint Joseph University (USJ) Campus of Innovation and Sport, on Damascus Street.',
    todo: [
      'See crystals and gems from all over the world in lit display cases.',
      'Look at the fossil section: fish fossils from Lebanon and a rare flying reptile (pterosaur).',
      'Walk a few minutes to the National Museum of Beirut on the same street.',
    ],
    tips: ['Closed on Mondays. Check the hours on mim.museum before you go.', 'Ask about the student price and bring your student card.'],
    link: { label: 'mim.museum', url: 'https://mim.museum' },
    photos: [
      { src: `${commons}/4/4b/MIM_%28mus%C3%A9e%29_Mus%C3%A9e_des_min%C3%A9raux_-_Beyrouth_02.jpg/960px-MIM_%28mus%C3%A9e%29_Mus%C3%A9e_des_min%C3%A9raux_-_Beyrouth_02.jpg`, author: 'Patrice Bon', license: 'CC0', page: 'https://commons.wikimedia.org/wiki/File:MIM_(mus%C3%A9e)_Mus%C3%A9e_des_min%C3%A9raux_-_Beyrouth_02.jpg' },
      { src: `${commons}/a/a1/MIM_%28mus%C3%A9e%29_Mus%C3%A9e_des_min%C3%A9raux%2C_fossiles_-_Beyrouth_04.jpg/960px-MIM_%28mus%C3%A9e%29_Mus%C3%A9e_des_min%C3%A9raux%2C_fossiles_-_Beyrouth_04.jpg`, author: 'Patrice Bon', license: 'CC0', page: 'https://commons.wikimedia.org/wiki/File:MIM_(mus%C3%A9e)_Mus%C3%A9e_des_min%C3%A9raux,_fossiles_-_Beyrouth_04.jpg' },
      { src: `${commons}/a/a9/MIM_%28mus%C3%A9e%29_Mus%C3%A9e_des_min%C3%A9raux%2C_fossiles_-_Beyrouth_05.jpg/960px-MIM_%28mus%C3%A9e%29_Mus%C3%A9e_des_min%C3%A9raux%2C_fossiles_-_Beyrouth_05.jpg`, author: 'Patrice Bon', license: 'CC0', page: 'https://commons.wikimedia.org/wiki/File:MIM_(mus%C3%A9e)_Mus%C3%A9e_des_min%C3%A9raux,_fossiles_-_Beyrouth_05.jpg' },
    ],
  },
  {
    slug: 'zaitunay-bay',
    title: 'Evening at Zaitunay Bay',
    activity: 'city',
    place: { name: 'Zaitunay Bay', country: 'Lebanon', lat: 33.9031, lon: 35.4967 },
    blurb: 'A seaside promenade and marina in central Beirut, best at sunset.',
    about:
      'Zaitunay Bay is a marina with a public promenade on Saint George Bay, in the Beirut Central District. A wide wooden boardwalk runs along the yachts, with restaurants and cafés on one side and the sea on the other.',
    todo: [
      'Walk the boardwalk along the marina and look at the yachts.',
      'Come at sunset or in the evening, when the towers behind the bay light up over the water.',
      'Have dinner or a coffee at one of the seafront restaurants and cafés.',
      'Walk on to Beirut Souks, about 15 minutes away on foot.',
    ],
    eat: ['Seafood, Lebanese, burger and café places line the promenade. They change often, so check which ones are open.'],
    tips: ['The promenade is free and open to everyone.'],
    photos: [
      { src: `${commons}/9/9a/Zaitunay_Bay_%281%29.jpg/960px-Zaitunay_Bay_%281%29.jpg`, author: 'Radosław Botev', license: 'CC BY 3.0 pl', page: 'https://commons.wikimedia.org/wiki/File:Zaitunay_Bay_(1).jpg' },
      { src: `${commons}/2/2b/Zaitunay_Bay_%282%29.jpg/960px-Zaitunay_Bay_%282%29.jpg`, author: 'Radosław Botev', license: 'CC BY 3.0 pl', page: 'https://commons.wikimedia.org/wiki/File:Zaitunay_Bay_(2).jpg' },
      { src: `${commons}/9/92/Zaitunay_Bay_%283%29.jpg/960px-Zaitunay_Bay_%283%29.jpg`, author: 'Radosław Botev', license: 'CC BY 3.0 pl', page: 'https://commons.wikimedia.org/wiki/File:Zaitunay_Bay_(3).jpg' },
    ],
  },
  {
    slug: 'harissa',
    title: 'Visit Our Lady of Lebanon in Harissa',
    activity: 'other',
    place: { name: 'Harissa', country: 'Lebanon', lat: 33.9817, lon: 35.6514 },
    blurb: 'A key Christian pilgrimage site above the bay of Jounieh.',
    about:
      'The Shrine of Our Lady of Lebanon (Notre-Dame du Liban), also called Our Lady of Harissa, is one of the main Christian pilgrimage sites in Lebanon. Its bronze statue of the Virgin Mary was inaugurated in 1908 and looks over the bay of Jounieh. The shrine belongs to the Maronite Patriarchate.',
    todo: [
      'Climb the stairs around the base of the statue for the view over Jounieh Bay.',
      'Visit the modern Maronite cathedral of concrete and glass next to the statue.',
      'Ride the cable car (téléférique) up from Jounieh: it opened in 1965 and the ride takes about nine minutes.',
    ],
    tips: ['It is a place of prayer: dress modestly and keep quiet.', 'Weekends and religious holidays are very busy.'],
    photos: [
      { src: `${commons}/b/b5/Our_Lady_Of_Lebanon_Harissa.jpg/960px-Our_Lady_Of_Lebanon_Harissa.jpg`, author: 'Paul Saad', license: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Our_Lady_Of_Lebanon_Harissa.jpg' },
      { src: `${commons}/3/31/Harissa_-_Lady_of_Lebanon_%284011272632%29.jpg/960px-Harissa_-_Lady_of_Lebanon_%284011272632%29.jpg`, author: 'Serge Melki', license: 'CC BY 2.0', page: 'https://commons.wikimedia.org/wiki/File:Harissa_-_Lady_of_Lebanon_(4011272632).jpg' },
    ],
  },
  {
    slug: 'national-museum',
    title: 'Visit the National Museum of Beirut',
    activity: 'city',
    place: { name: 'National Museum of Beirut', country: 'Lebanon', lat: 33.8786, lon: 35.5124 },
    blurb: "Lebanon's main archaeology museum, from prehistory to the Ottomans.",
    about:
      'The National Museum of Beirut is the main archaeology museum of Lebanon. It opened in 1942 and holds about 100,000 objects. During the civil war its mosaics were covered with concrete and its statues and sarcophagi protected with sandbags; it opened again in 1997, and its underground gallery in 2016.',
    todo: [
      'See the sarcophagus of King Ahiram of Byblos, carved with one of the oldest texts in the Phoenician alphabet.',
      'Walk among the Phoenician statues and Roman sarcophagi on the ground floor.',
      'Go down to the underground Maurice Chehab gallery, with tombs and wall paintings.',
      'Walk a few minutes to the MIM Mineral Museum.',
    ],
    tips: ['Check the opening days and hours before you go.', 'Plan about two hours.'],
    photos: [
      { src: `${commons}/c/ce/National_Museum_of_Beirut%2C_Lebanon.jpg/960px-National_Museum_of_Beirut%2C_Lebanon.jpg`, author: 'DIMSFIKAs', license: 'CC BY-SA 3.0', page: 'https://commons.wikimedia.org/wiki/File:National_Museum_of_Beirut,_Lebanon.jpg' },
      { src: `${commons}/1/18/The_National_Museum_of_Beirut%2C_Beirut%2C_Lebanon.jpg/960px-The_National_Museum_of_Beirut%2C_Beirut%2C_Lebanon.jpg`, author: 'Vyacheslav Argenberg', license: 'CC BY 4.0', page: 'https://commons.wikimedia.org/wiki/File:The_National_Museum_of_Beirut,_Beirut,_Lebanon.jpg' },
      { src: `${commons}/5/57/NationalMuseumBeirut_MauriceChehabGallery_RomanDeckert-28112021.jpg/960px-NationalMuseumBeirut_MauriceChehabGallery_RomanDeckert-28112021.jpg`, author: 'RomanDeckert', license: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:NationalMuseumBeirut_MauriceChehabGallery_RomanDeckert-28112021.jpg' },
    ],
  },
  {
    slug: 'bekaa-wine-trail',
    label: 'Bekaa wine trail',
    title: 'Wine day in the Bekaa',
    activity: 'other',
    place: { name: 'Zahlé', country: 'Lebanon', lat: 33.8333, lon: 35.9167 },
    blurb: 'Visit wineries around Zahlé and Chtaura, then stay the night in the valley.',
    about:
      'The Bekaa Valley, between the Mount Lebanon and Anti-Lebanon mountains, is the main wine region of Lebanon. Many estates are close to Zahlé and Chtaura, so several visits fit into one day.',
    todo: [
      'Tour two or three estates and taste their wines and arak.',
      'Walk through the vineyards and the old cellars.',
      'Have lunch at a winery or by the river in Zahlé.',
      'Take a calm walk around the lakes of Domaine de Taanayel.',
    ],
    stops: [
      { name: 'Château Ksara', lat: 33.8263, lon: 35.8923, note: 'Founded in 1857 by Jesuit priests near Zahlé. Tours and tastings include its natural caves, found in 1898 and about 2 km long, where the wine is aged.' },
      { name: 'Massaya', lat: 33.7997, lon: 35.8689, note: 'A winery and arak distillery run by the Ghosn brothers on the Tanaïl estate, with vineyards and a restaurant.' },
      { name: 'Château Héritage', lat: 33.7985, lon: 35.8256, note: 'A family winery started by the Touma family in Kab Elias in 1888, listed among the World’s 50 Best Vineyards in 2025. Book the tour ahead.' },
      { name: 'Domaine de Taanayel', lat: 33.7997, lon: 35.8689, note: 'A large estate run by the NGO arcenciel, with lakes, a dairy farm and paths for walking and cycling. A calm stop between two tastings.' },
    ],
    eat: ['Massaya has a restaurant on its estate.', 'Zahlé is known for its restaurants along the Berdawni river.'],
    stay: ['Chtaura Park Hotel: a five-star hotel in Chtaura, in the middle of the valley.', 'Massabki Hotel: a boutique hotel in Chtaura that opened in 1920, next to the river and its own oak forest.'],
    tips: ['Pick a driver who does not drink, or stay the night.', 'Book winery visits ahead, especially on weekends.', 'Tastings are for adults only.'],
    photos: [
      { src: `${commons}/6/65/Ch%C3%A2teau_Ksara_in_Beqaa-_Zahl%C3%A9.jpg/960px-Ch%C3%A2teau_Ksara_in_Beqaa-_Zahl%C3%A9.jpg`, author: 'Chateau Ksara', license: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Ch%C3%A2teau_Ksara_in_Beqaa-_Zahl%C3%A9.jpg' },
      { src: `${commons}/b/bc/Vineyards-chateau-ksara-lebanese-winery-wine.jpg/960px-Vineyards-chateau-ksara-lebanese-winery-wine.jpg`, author: 'MyaBell117', license: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Vineyards-chateau-ksara-lebanese-winery-wine.jpg' },
      { src: `${commons}/1/1c/Beqaa-valley-chateau-ksara-winery-lebanon.jpg/960px-Beqaa-valley-chateau-ksara-winery-lebanon.jpg`, author: 'MyaBell117', license: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Beqaa-valley-chateau-ksara-winery-lebanon.jpg' },
      { src: `${commons}/a/a9/Centre_spirituel_J%C3%A9suite_-_Taanayel_-_Beyrouth_-_Liban_-_2024.jpg/960px-Centre_spirituel_J%C3%A9suite_-_Taanayel_-_Beyrouth_-_Liban_-_2024.jpg`, author: 'Alexjes98', license: 'CC0', page: 'https://commons.wikimedia.org/wiki/File:Centre_spirituel_J%C3%A9suite_-_Taanayel_-_Beyrouth_-_Liban_-_2024.jpg' },
    ],
  },
  {
    slug: 'beirut-souks',
    title: 'Afternoon in Beirut Souks',
    activity: 'city',
    place: { name: 'Beirut Souks', country: 'Lebanon', lat: 33.8986, lon: 35.5043 },
    blurb: 'Open-air shopping streets in downtown Beirut, built on the old souks.',
    about:
      'Beirut Souks is a shopping district in the Beirut Central District, built where the old souks stood. It has around 200 shops, about 20 to 25 restaurants and cafés, a cinema, and streets that are partly covered and partly open to the sky.',
    todo: [
      'Shop in the open-air streets and covered arcades.',
      'Watch a film at the cinema.',
      "Walk to Martyrs' Square, the Mohammad Al-Amin Mosque and Saint George Cathedral nearby.",
      'End the day at Zaitunay Bay for sunset, about 15 minutes on foot.',
    ],
    eat: [
      'About 20 to 25 restaurants and cafés inside the Souks, from quick bites to sit-down meals.',
      'For more choice, walk about 15 minutes to Gemmayzeh and Mar Mikhael, known for their cafés and restaurants.',
    ],
    tips: ['Shops usually open around 10 in the morning; check the hours before you go.'],
    photos: [
      { src: `${commons}/f/ff/Beirut_Souks.jpg/960px-Beirut_Souks.jpg`, author: 'n.karim', license: 'CC BY 2.0', page: 'https://commons.wikimedia.org/wiki/File:Beirut_Souks.jpg' },
      { src: `${commons}/0/0e/Fakhry_Bey_steps_in_Beirut_Souks.jpg/960px-Fakhry_Bey_steps_in_Beirut_Souks.jpg`, author: 'Olivier Vidal', license: 'CC BY-SA 4.0', page: 'https://commons.wikimedia.org/wiki/File:Fakhry_Bey_steps_in_Beirut_Souks.jpg' },
      { src: `${commons}/c/cc/Souqs_in_Beirut_%281%29.jpg/960px-Souqs_in_Beirut_%281%29.jpg`, author: 'Radosław Botev', license: 'CC BY 3.0 pl', page: 'https://commons.wikimedia.org/wiki/File:Souqs_in_Beirut_(1).jpg' },
      { src: `${commons}/f/fe/Souqs_in_Beirut_%283%29.jpg/960px-Souqs_in_Beirut_%283%29.jpg`, author: 'Radosław Botev', license: 'CC BY 3.0 pl', page: 'https://commons.wikimedia.org/wiki/File:Souqs_in_Beirut_(3).jpg' },
    ],
  },
  {
    slug: 'batroun',
    title: 'Beach day in Batroun',
    activity: 'beach',
    place: { name: 'Batroun', country: 'Lebanon', lat: 34.25, lon: 35.65 },
    blurb: 'Clear water, old stone streets and the famous Batroun lemonade.',
    todo: [
      'Swim at the beaches around the town.',
      'Walk through the old souk to the Phoenician sea wall.',
      'Visit Saint Stephen church at the old port.',
      'Try the famous Batroun lemonade.',
    ],
  },
  {
    slug: 'cedars-of-god',
    title: 'Picnic at the Cedars',
    activity: 'picnic',
    place: { name: 'Cedars of God', country: 'Lebanon', lat: 34.245, lon: 36.04806 },
    blurb: 'Lunch in the shade of cedars that are more than a thousand years old.',
    todo: [
      'Walk the paths among the old cedar trees, a UNESCO World Heritage site.',
      'Have lunch in one of the restaurants or picnic spots around the forest.',
      'In winter, ski at the nearby Cedars ski area.',
    ],
    tips: ['The forest is about 2,000 m high: bring a jacket, even in summer.'],
  },
  {
    slug: 'mzaar',
    title: 'Ski day in Mzaar',
    activity: 'ski',
    place: { name: 'Mzaar Kfardebian', country: 'Lebanon', lat: 34.01108, lon: 35.82483 },
    blurb: "Lebanon's biggest ski area, about an hour's drive from Beirut.",
    todo: [
      'Ski or snowboard on slopes for every level.',
      'Ride the chairlifts for the view over the mountains.',
      'Visit the Roman ruins of Faqra, a few minutes away.',
    ],
    tips: ['Check the snow and the road before you drive up.', 'Snow chains may be needed in winter.'],
  },
  {
    slug: 'byblos',
    title: 'Day out in Byblos',
    activity: 'city',
    place: { name: 'Byblos', country: 'Lebanon', lat: 34.12361, lon: 35.65194 },
    blurb: 'The old souk and harbour of one of the oldest towns in the world.',
    todo: [
      'Walk through the old souk.',
      'Visit Byblos Castle and the archaeological site next to it.',
      'Have lunch by the old harbour.',
    ],
  },
  {
    slug: 'tyre',
    title: 'Beach day in Tyre',
    activity: 'beach',
    place: { name: 'Tyre', country: 'Lebanon', lat: 33.27083, lon: 35.19611 },
    blurb: 'Long sandy beaches right next to Roman ruins in the south.',
    todo: [
      'Swim at the long sandy beach of the Tyre Coast Nature Reserve.',
      'Visit the Roman ruins of Al-Mina and Al-Bass, with its huge hippodrome.',
      'Walk around the old fishing port.',
    ],
  },
  {
    slug: 'jeita-grotto',
    title: 'Visit Jeita Grotto',
    activity: 'other',
    place: { name: 'Jeita Grotto', country: 'Lebanon', lat: 33.94339, lon: 35.64136 },
    blurb: 'Take a boat through a cave full of stalactites.',
    todo: [
      'Take the boat ride through the lower cave.',
      'Walk through the upper cave and its stalactites.',
      'Ride the cable car and the small train on the site.',
    ],
    tips: ['Photos are not allowed inside the caves.', 'The lower cave can close in winter when the water is high.'],
  },
  {
    slug: 'baalbek',
    title: 'Trip to Baalbek',
    activity: 'city',
    place: { name: 'Baalbek', country: 'Lebanon', lat: 34.00634, lon: 36.20732 },
    blurb: 'Stand under the giant Roman temples of the Bekaa valley.',
    todo: [
      'See the Temple of Bacchus, one of the best preserved Roman temples.',
      'Stand under the six remaining columns of the Temple of Jupiter.',
      'Look at the huge cut stones left in the old quarry.',
    ],
  },
];

export function findSuggestion(slug) {
  return SUGGESTIONS.find(suggestion => suggestion.slug === slug) || null;
}
