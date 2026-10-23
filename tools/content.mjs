/**
 * Site content.
 *
 * Change the domain, phone number or opening details here — every page,
 * the sitemap, robots.txt and the structured data are generated from this file.
 */

export const site = {
  // ⚠️ Replace with the live domain before deploying.
  url: "https://avinteriordecoration.com",
  name: "AV Interior Decoration",
  shortName: "AV Interior Decoration",
  tagline: "Interior & exterior works across Tamil Nadu",
  phoneDisplay: "+91 97150 32513",
  phone: "+919715032513",
  whatsapp: "919715032513",
  email: "contact@avinteriordecoration.com",
  ownerEmail: "anand@avinteriordecoration.com",
  street: "Annai Theresa Nagar",
  locality: "Thoothukudi",
  region: "Tamil Nadu",
  country: "IN",
  countryName: "India",
  geo: { lat: 8.8027577, lng: 78.1174878 },
  mapsLink: "https://maps.google.com/?cid=5658656810334090653",
  mapsEmbed:
    "https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d15771.289271885958!2d78.1174878!3d8.8027577!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b03efb2fd3c3353%3A0x4e6da1e40f53b69d!2sAV%20INTERIOR%20DECORATION!5e0!3m2!1sen!2sin!4v1748697393710!5m2!1sen!2sin",
  yearsExperience: "10+",
  projects: "500+",
};

export const nav = [
  { href: "/services", label: "Services" },
  { href: "/#work", label: "Our work" },
  { href: "/#process", label: "Process" },
  { href: "/contact", label: "Contact" },
];

export const trustPoints = [
  "Free, itemised quotation",
  "Site visit and measurement",
  "Single point of contact",
  "10+ years on site",
];

export const whyPoints = [
  {
    title: "Materials you can compare",
    body:
      "We bring PVC, MDF, plywood, UPVC, aluminium and glass samples to you. You can see what each one costs and where it works best before you decide.",
  },
  {
    title: "Measured before it is quoted",
    body:
      "We visit the site before quoting. Levels, corners, plumbing and electrical points all get checked, so the price is based on your actual room.",
  },
  {
    title: "One team across trades",
    body:
      "Ceilings, cupboards, windows, blinds and flooring are planned together. The carpenter is not waiting on the electrician, and nothing gets fitted twice.",
  },
  {
    title: "Chosen for this climate",
    body:
      "Salt air, humidity and strong summer sun affect every material. We use UPVC, aluminium and moisture-resistant boards where wood would swell or fade.",
  },
];

export const processSteps = [
  {
    title: "Tell us about the space",
    body:
      "Call, WhatsApp or send the form with the rooms involved and roughly what you have in mind. Photos help.",
  },
  {
    title: "Site visit and measurement",
    body:
      "We measure on site, check services and existing finishes, and flag anything that will affect the design or the budget.",
  },
  {
    title: "Quotation and material choice",
    body:
      "You get an itemised quote with the material options for each line, so you can see what changes the price.",
  },
  {
    title: "Execution and handover",
    body:
      "Work is scheduled room by room, cleaned up as we go, and walked through with you before handover.",
  },
];

export const gallery = [
  {
    img: "a10-1000",
    alt: "False ceiling with a wooden inlay border and warm cove lighting",
    caption: "False ceiling with warm cove lighting",
  },
  {
    img: "ssg-1000",
    alt: "Glass staircase railing with a wooden handrail",
    caption: "Staircase railing in glass and steel",
  },
  {
    img: "zebra-1000",
    alt: "Zebra blinds fitted to a bedroom window",
    caption: "Zebra blinds for a bedroom",
  },
  {
    img: "gypsum-1000",
    alt: "Gypsum false ceiling with concealed lighting above a television wall",
    caption: "Gypsum ceiling and TV wall",
  },
  {
    img: "upvcopen-1000",
    alt: "Openable UPVC window with a white frame",
    caption: "Openable UPVC windows",
  },
  {
    img: "woodenflooring-1000",
    alt: "Herringbone wooden flooring in a bright room",
    caption: "Herringbone wooden flooring",
  },
  {
    img: "hero2-1400",
    alt: "Glass balcony railings on an apartment building",
    caption: "Glass balcony railings",
  },
  {
    img: "aluminiumcupboard-1000",
    alt: "Aluminium wardrobe with dark grey shutters",
    caption: "Aluminium wardrobe",
  },
  {
    img: "toughen-1000",
    alt: "Toughened glass partition in an office",
    caption: "Toughened glass office partition",
  },
];

export const homeFaqs = [
  {
    q: "Which areas do you work in?",
    a: "Our office is in Annai Theresa Nagar, Thoothukudi. We work in Thoothukudi and travel to homes, offices and shops across Tamil Nadu. Send us your location and we will tell you when we can visit.",
  },
  {
    q: "How do I get a price?",
    a: "Send the rooms you want to change, or call and describe them. We visit, measure and give you an itemised quote that separates material and labour.",
  },
  {
    q: "Do you supply materials or work with what I have?",
    a: "Both. Most customers ask us to supply and fit everything. We also fit blinds, nets, windows or flooring that you have already bought.",
  },
  {
    q: "How long does a modular kitchen take?",
    a: "It depends on the size, the material and how ready the site is. Once measurements are final, we give you a written timeline with the quote and update you as the work moves.",
  },
  {
    q: "Do you handle offices and commercial spaces?",
    a: "Yes. A lot of our aluminium, glass partition and grid ceiling work is for offices, clinics and shops. We can work after hours if the business needs to stay open.",
  },
  {
    q: "Can you handle a single room?",
    a: "Yes. One bedroom, a kitchen, a balcony railing or a set of blinds is a normal job for us. We take small jobs.",
  },
];

/** The eight service lines. Each one becomes a page at /services/<slug>. */
export const services = [
  {
    slug: "modular-kitchens",
    name: "Modular Kitchens & Cupboards",
    short: "Kitchens, wardrobes, TV units and storage in PVC, MDF, plywood or aluminium.",
    cardImg: "modular-900",
    cardImgSmall: "modular-600",
    heroImg: "modular-1400",
    heroAlt:
      "Modular kitchen with L-shaped counters, glossy brown upper cabinets and cream lower shutters",
    title: "Modular Kitchens & Cupboards | Thoothukudi & Tamil Nadu",
    description:
      "Modular kitchens, wardrobes and TV units built to measure. Based in Thoothukudi, working across Tamil Nadu. PVC, MDF, plywood and aluminium, with a free itemised quote.",
    h1: "Modular kitchens and cupboards, built to measure",
    lead:
      "A kitchen has to survive steam, oil, monsoon damp and a family using it every day. We plan the layout around how you cook, then choose the carcass and shutter materials that will still look right years from now.",
    intro: [
      "Most of the work happens before a single board is cut. We measure the room, check where the sink, hob, chimney and sockets need to sit, and agree on the working triangle — storage, preparation and cooking — before we talk finishes.",
      "Thoothukudi's coastal air is hard on anything that absorbs moisture. For kitchens, utility areas and bathrooms we usually recommend PVC or UPVC carcasses with aluminium or moisture-resistant shutters; for bedrooms and living rooms, plywood and MDF give you more finish options at a lower cost.",
    ],
    includes: [
      "Site measurement and a layout drawing before work starts",
      "Carcass and shutter options priced separately",
      "Hinges, channels, handles and edge banding included in the quote",
      "Cut-outs and clearances coordinated with your chimney, hob and sink",
      "Installation, alignment and a final walkthrough",
    ],
    types: [
      { name: "Modular kitchen", img: "modular-600", alt: "L-shaped modular kitchen with brown and cream shutters" },
      { name: "TV showcase", img: "tv-480", alt: "TV unit with a backlit feature panel" },
      { name: "UPVC cupboard", img: "upvccupboard-480", alt: "UPVC wardrobe with light wood-finish shutters" },
      { name: "Aluminium cupboard", img: "aluminiumcupboard-700", alt: "Aluminium wardrobe with dark grey shutters" },
      { name: "PVC cupboard", img: "pvccupboard-480", alt: "PVC wardrobe with wood-finish doors and a mirror" },
      { name: "Plywood cupboard", img: "plywood-480", alt: "Plywood wardrobe with wood-grain shutters" },
      { name: "MDF cupboard", img: "mdf-480", alt: "MDF wardrobe with white and wood-finish shutters" },
    ],
    notes: [
      {
        title: "Ask what is behind the shutter",
        body:
          "A beautiful finish on a weak carcass will sag within a couple of years. We quote the board thickness and grade on every line so you can compare quotes fairly.",
      },
      {
        title: "Plan the services first",
        body:
          "Chimney ducts, sink plumbing, hob position and socket heights are much cheaper to move before the cabinets go in. We mark them on site with you.",
      },
      {
        title: "Hardware decides daily comfort",
        body:
          "Soft-close hinges, full-extension channels and a properly aligned shutter matter more than most finishes. We fit hardware we can service locally.",
      },
    ],
    faqs: [
      {
        q: "Which material is best for kitchen cupboards in Thoothukudi?",
        a: "For the base units and anything near water, PVC or UPVC carcasses handle humidity better than wood-based boards. For upper cabinets and bedroom storage, plywood or MDF are perfectly suitable when the edges are sealed properly. We will show you samples of each before you decide.",
      },
      {
        q: "Do you make wardrobes and TV units as well as kitchens?",
        a: "Yes. Cupboards, wardrobes, TV showcases, study tables and storage units are all made to measure using the same materials and hardware.",
      },
      {
        q: "Can you match the finish of furniture I already own?",
        a: "In most cases, yes. Bring a shutter, a laminate sample or a clear photo and we will match the closest laminate, acrylic or PVC finish available.",
      },
    ],
  },
  {
    slug: "false-ceiling",
    name: "False Ceiling",
    short: "Gypsum, grid, PVC and thermocol ceilings with lighting planned in.",
    cardImg: "a10-1000",
    cardImgSmall: "a10-700",
    heroImg: "a10-1500",
    heroAlt: "False ceiling with a wooden border and recessed cove lighting",
    title: "False Ceiling Work in Thoothukudi & Tamil Nadu",
    description:
      "Gypsum, grid, PVC and thermocol false ceilings with cove lighting, AC ducting and access panels. Based in Thoothukudi, working across Tamil Nadu.",
    h1: "False ceilings that hide the services and lift the room",
    lead:
      "A ceiling is the one surface you cannot move later. We plan it around your AC ducts, wiring, light fittings and room height — then choose a material that suits the room rather than the trend.",
    intro: [
      "In living rooms, gypsum gives the cleanest joints and takes paint or texture well, which is why most of our cove-lit ceilings use it. Grid ceilings are quicker and give you access to the plenum above, so they suit offices and utility areas. PVC and thermocol panels are a practical choice for kitchens, bathrooms and budget renovations where moisture is the main concern.",
      "The design question is usually about height. A dropped ceiling eats 100–150 mm or more depending on ducting and fittings, so we set the lowest point first and work outwards. Beams, door heads and window tops decide how deep the cove can be.",
    ],
    includes: [
      "Ceiling layout marked on site, including light and fan positions",
      "Framing, boarding and jointing with the finish you choose",
      "Cove details for concealed strip lighting",
      "Access panels for AC units and junction boxes",
      "Painting-ready surfaces and site clearing",
    ],
    types: [
      { name: "Gypsum ceiling", img: "gypsum-700", alt: "Gypsum false ceiling with a curved cove and concealed lighting" },
      { name: "Grid ceiling", img: "grid-480", alt: "Grid false ceiling with square tiles in an office" },
      { name: "PVC ceiling", img: "pvcceiling-480", alt: "PVC ceiling with a wood-grain finish" },
      { name: "Thermocol ceiling", img: "thermocol-480", alt: "Thermocol ceiling panels in a room" },
    ],
    notes: [
      {
        title: "Ceiling height comes first",
        body:
          "Before choosing a design, we check the lowest beam and the AC duct route. A shallow cove that clears them will look better than a deep design that makes the room feel low.",
      },
      {
        title: "Leave a way in",
        body:
          "AC units, drivers and junction boxes need access. We plan discreet access panels instead of cutting a hole later.",
      },
      {
        title: "Match the material to the room",
        body:
          "Gypsum in living and dining areas, grid in offices, PVC where steam and cleaning are routine. Using one material everywhere is rarely the best answer.",
      },
    ],
    faqs: [
      {
        q: "How much height will a false ceiling take?",
        a: "It depends on the ducts, beams and light fittings above it. A simple ceiling can sit quite close to the slab; a cove with an AC duct may need considerably more. We measure and tell you the exact drop before you commit.",
      },
      {
        q: "Can you install a ceiling in just one room?",
        a: "Yes. Single-room ceilings are common, and we can match an existing design elsewhere in the house if you have one.",
      },
      {
        q: "Do you handle the electrical work and lighting?",
        a: "We coordinate the ceiling with your electrician, or arrange the wiring and fittings as part of the job. Light positions are marked before boarding begins.",
      },
    ],
  },
  {
    slug: "blinds-and-curtains",
    name: "Blinds & Curtains",
    short: "Roller, zebra, roman, venetian and bamboo blinds, plus made-to-measure curtains.",
    cardImg: "curtains-1000",
    cardImgSmall: "curtains-700",
    heroImg: "curtains-1000",
    heroAlt: "Floor-length curtains and sheer drapes in a living room",
    title: "Blinds & Curtains in Thoothukudi & Tamil Nadu",
    description:
      "Made-to-measure roller, zebra, roman, venetian, wooden, bamboo and blackout blinds and curtains. Measured and fitted across Tamil Nadu from Thoothukudi.",
    h1: "Blinds and curtains, fitted for coastal light",
    lead:
      "The right window covering cuts heat and glare without making a room feel closed in. We measure the recess, talk through how the room is used, and fit a blind or curtain that actually operates smoothly.",
    intro: [
      "West-facing windows in Thoothukudi take a lot of afternoon sun. For those, a roller or zebra blind with a heat-reflective fabric makes an immediate difference. Bedrooms usually want blackout; living rooms often need a sheer layer by day and something heavier at night.",
      "We fit inside the recess where the window allows it, and outside the recess where the wall is uneven or the window opens outwards. Curtains are made to the drop you want, with the track or rod positioned so the fabric clears the floor and the AC unit.",
    ],
    includes: [
      "On-site measurement of every window and door",
      "Fabric, colour and opacity samples to compare at home",
      "Recess or face fitting, whichever suits the window",
      "Tracks, rods, brackets and child-safe chain fittings",
      "Installation and a walkthrough of how to operate and clean",
    ],
    types: [
      { name: "Roller blinds", img: "roller-480", alt: "Roller blind pulled down over a window" },
      { name: "Zebra blinds", img: "zebra-700", alt: "Zebra blinds with alternating sheer and opaque bands" },
      { name: "Roman blinds", img: "roman-480", alt: "Roman blind folded in soft horizontal pleats" },
      { name: "PVC blinds", img: "pvcblinds-480", alt: "PVC blinds fitted to a balcony opening" },
      { name: "Wooden blinds", img: "wooden-480", alt: "Wooden venetian blinds with slats partly open" },
      { name: "Curtains", img: "curtains-700", alt: "Curtains and sheer drapes in a living room" },
      { name: "Venetian blinds", img: "venetian-480", alt: "Venetian blinds on a window above a plant" },
      { name: "Bamboo blinds", img: "bamboo-480", alt: "Bamboo blind behind a green planter" },
    ],
    notes: [
      {
        title: "Blackout is not just a colour",
        body:
          "Ask for the blackout rating, not just a dark fabric. We bring samples and hold them against the window so you can see how much light comes through.",
      },
      {
        title: "Fixings matter on coastal walls",
        body:
          "Salt air and damp weaken some anchors over time. We choose fixings for the wall type and check that the bracket sits flat before drilling.",
      },
      {
        title: "Think about the whole window",
        body:
          "An AC unit, window handle or openable sash can clash with a blind. We check clearances so the window still opens fully after fitting.",
      },
    ],
    faqs: [
      {
        q: "Can I get blackout blinds for a bedroom?",
        a: "Yes. Roller and roman blinds are available in blackout fabrics, and curtains can be made with a blackout lining. We can also combine a sheer curtain with a blackout blind on the same window.",
      },
      {
        q: "Do you make curtains to a specific drop?",
        a: "Every curtain is stitched to the measurements taken on site, including the drop, fullness and heading style you prefer.",
      },
      {
        q: "Can blinds be fitted to aluminium or UPVC windows?",
        a: "Yes. We check the frame depth and choose brackets that fit without interfering with the opening mechanism.",
      },
    ],
  },
  {
    slug: "upvc-windows-and-doors",
    name: "UPVC Windows & Doors",
    short: "Sliding, openable and fixed UPVC windows and doors that seal out salt air and rain.",
    cardImg: "upvcsliding-1000",
    cardImgSmall: "upvcsliding-700",
    heroImg: "upvcsliding-1400",
    heroAlt: "UPVC sliding window with plants on the outside sill",
    title: "UPVC Windows & Doors | Thoothukudi & Tamil Nadu",
    description:
      "Sliding, openable and fixed UPVC windows and doors with sealed gaskets, drainage and optional mosquito nets. Based in Thoothukudi, working across Tamil Nadu.",
    h1: "UPVC windows and doors for salt air and monsoon rain",
    lead:
      "UPVC does not rust, swell or need repainting, which is why it holds up so well on the coast. The difference between a good and a poor installation is in the profile, the reinforcement and how carefully the frame is sealed.",
    intro: [
      "We fit multi-chamber UPVC profiles with steel reinforcement, rubber gaskets and proper drainage slots. That combination is what keeps out driving rain and cuts street noise. Sliding systems are the usual choice for balconies and wide openings; openable casements seal more tightly and suit bedrooms and living rooms.",
      "Fixed glazing is useful where you want light without ventilation — stairwells, above door heads, or a window that opens onto a busy road. We can combine fixed and openable panels in one frame so the elevation still reads as a single window.",
    ],
    includes: [
      "Measurement and frame detailing for each opening",
      "Multi-chamber UPVC profiles with steel reinforcement",
      "Glass specification to suit the room and exposure",
      "Gaskets, drainage and sealed perimeter joints",
      "Optional integrated mosquito nets and grills",
    ],
    types: [
      { name: "UPVC openable window", img: "upvcopen-700", alt: "Openable UPVC window with white frames" },
      { name: "UPVC sliding window", img: "upvcsliding-700", alt: "UPVC sliding window with plants on the sill" },
      { name: "Fixed window", img: "upvcfixed-480", alt: "Fixed UPVC window with two glass panes" },
      { name: "UPVC partition", img: "upvcp-480", alt: "UPVC partition with glass panels" },
    ],
    notes: [
      {
        title: "Reinforcement is the hidden difference",
        body:
          "Good UPVC sections carry a steel or aluminium reinforcement inside the profile. Without it, long spans can bow. Ask for the section detail, not just the colour.",
      },
      {
        title: "Drainage has to work",
        body:
          "Sliding tracks need unobstructed drainage slots. We check the sill level and slope so water leaves the frame instead of sitting in it.",
      },
      {
        title: "Plan the net with the window",
        body:
          "If you want a mosquito net, choose the system before the frame is ordered so the track and clearance are built in rather than screwed on later.",
      },
    ],
    faqs: [
      {
        q: "Is UPVC better than aluminium for coastal homes?",
        a: "Both work. UPVC is a poor conductor of heat, does not corrode and needs no painting. Aluminium is stronger for very large spans and can be powder-coated to a specific colour. We will recommend based on the size of the opening and the look you want.",
      },
      {
        q: "Can UPVC windows reduce street noise?",
        a: "A well-sealed UPVC window with the right glass reduces noise noticeably compared with a loose-fitting window. For a busy road, we would specify a thicker or laminated glass unit.",
      },
      {
        q: "Do UPVC windows need much maintenance?",
        a: "Very little. Wipe the frames with water and mild soap, and keep the drainage slots and tracks clear. The hardware may need occasional adjustment over the years.",
      },
    ],
  },
  {
    slug: "aluminium-works",
    name: "Aluminium Works",
    short: "Partitions, windows and fabrication in powder-coated aluminium.",
    cardImg: "normalp-900",
    cardImgSmall: "normalp-700",
    heroImg: "normalp-900",
    heroAlt: "Aluminium partition with glass panels in an office",
    title: "Aluminium Partitions & Windows | Thoothukudi & Tamil Nadu",
    description:
      "Office partitions, sliding and openable windows in powder-coated aluminium with glass infill. Measured and installed across Tamil Nadu from Thoothukudi.",
    h1: "Aluminium partitions, windows and fabrication",
    lead:
      "Aluminium is still the most practical way to divide an office, glaze a balcony or replace a rusting steel window. The frame section and the finishing decide how long it lasts.",
    intro: [
      "For offices we build partition systems with aluminium framing and glass infill, using either full-height panels or a lower solid section for privacy. Powder-coated sections are available in standard colours and give a more finished look than mill finish, especially on exterior work.",
      "For homes, aluminium sliding and openable windows remain a sensible alternative to UPVC where a large opening needs extra rigidity, or where a specific colour needs to match existing work. We fabricate to the measured opening rather than forcing a standard size into it.",
    ],
    includes: [
      "Site measurement and fabrication drawings",
      "Powder-coated or mill-finish aluminium sections",
      "Glass, laminate or solid infill panels",
      "Sliding, openable and fixed configurations",
      "Installation, sealing and hardware adjustment",
    ],
    types: [
      { name: "Aluminium partition", img: "normalp-700", alt: "Aluminium office partition with glass panels" },
      { name: "Glass partition", img: "glassp-480", alt: "Glass partition framing an office cabin" },
      { name: "Powder-coated partition", img: "a1-480", alt: "Exterior glazing with powder-coated aluminium framing" },
      { name: "Sliding windows", img: "windows-480", alt: "Aluminium sliding window with two panes" },
      { name: "Open windows", img: "aopen-480", alt: "Openable aluminium window with two sashes" },
    ],
    notes: [
      {
        title: "Powder coating earns its cost",
        body:
          "On exterior frames, powder coating protects the aluminium and holds its colour far better than mill finish. It also lets you match the joinery to the facade.",
      },
      {
        title: "Section size should follow the span",
        body:
          "A wide opening needs a deeper section. Under-sized framing is the usual reason sliding windows begin to rattle or jam after a few years.",
      },
      {
        title: "Glass is not soundproofing",
        body:
          "Standard glass in an aluminium frame will reduce some noise, but it is not an acoustic system. If noise is the main concern, tell us at the measurement stage.",
      },
    ],
    faqs: [
      {
        q: "Can you match the colour of my existing aluminium windows?",
        a: "We can match most standard powder-coat colours. Bring a sample or a photo in daylight and we will confirm the closest available shade.",
      },
      {
        q: "Do you build office partitions that can be dismantled later?",
        a: "Yes. Partition systems can be designed with removable panels and modular framing so the layout can change without demolishing the whole thing.",
      },
      {
        q: "How long does an aluminium partition take?",
        a: "A typical office partition is measured, fabricated and installed within a couple of weeks, depending on the glass and the size of the job. We confirm the timeline with the quotation.",
      },
    ],
  },
  {
    slug: "glass-partitions-and-railings",
    name: "Glass Partitions & Railings",
    short: "Toughened glass partitions, balcony railings and staircase railing systems.",
    cardImg: "ssg-1000",
    cardImgSmall: "ssg-700",
    heroImg: "ssg-1000",
    heroAlt: "Glass staircase railing with a wooden handrail",
    title: "Glass Partitions & Railings | Thoothukudi & Tamil Nadu",
    description:
      "Toughened glass partitions, balcony and staircase railings with stainless steel or aluminium hardware. Based in Thoothukudi, working across Tamil Nadu.",
    h1: "Toughened glass partitions and railings",
    lead:
      "Glass keeps light moving through a space and makes a staircase or balcony feel open. It also has to be the right thickness, correctly supported and safely installed — this is not a place to improvise.",
    intro: [
      "For office cabins we use 12 mm toughened glass partitions with patch fittings or a slim aluminium channel, depending on how the door needs to operate. In homes, glass partitions work well between a living room and a study, or to close off a staircase without blocking daylight.",
      "Balcony and staircase railings are specified around the opening they protect. Toughened glass is heat-treated so it breaks into small, blunt pieces rather than shards; the panels are held in stainless steel spigots, clamps or a channel, with a handrail where the height or use calls for one.",
    ],
    includes: [
      "Site measurement and railing height checks",
      "Toughened glass to the required thickness",
      "Stainless steel spigots, clamps, patch fittings or channels",
      "Handrail options in steel, aluminium or wood",
      "Installation and safety check with you on site",
    ],
    types: [
      { name: "12 mm glass partition", img: "12mm-480", alt: "12 mm glass partition enclosing an office cabin" },
      { name: "Toughened glass partition", img: "toughen-700", alt: "Toughened glass partition in an office" },
      { name: "Aluminium balcony railing", img: "a6-480", alt: "Glass balcony railing on a white house" },
      { name: "Stainless steel railing", img: "ss-480", alt: "Stainless steel and glass balcony railing" },
      { name: "Staircase glass railing", img: "ssg-700", alt: "Glass staircase railing with wooden handrail" },
    ],
    notes: [
      {
        title: "Toughened, not just thick",
        body:
          "Thickness alone does not make glass safe. Toughened glass is heat-treated and breaks into blunt fragments. Ask for the process, not just the millimetre.",
      },
      {
        title: "Edges and fixings carry the load",
        body:
          "A glass panel is only as good as its support. We specify the spigots, clamps and edge clearance for the panel size, and never drill toughened glass on site.",
      },
      {
        title: "Outdoor panels need room to move",
        body:
          "Heat and wind cause movement. Exterior railings are detailed with the right gaps and gaskets so the glass is not pinched in the frame.",
      },
    ],
    faqs: [
      {
        q: "Is toughened glass safe for a balcony railing?",
        a: "Yes, when it is correctly specified and fixed. We use toughened glass with rated fittings and check the panel height, edge clearance and handrail requirement for your balcony.",
      },
      {
        q: "What thickness of glass do you use for partitions?",
        a: "Office partitions are commonly 12 mm toughened glass. Larger panels or doors need thicker glass or additional support, which we work out from the opening size.",
      },
      {
        q: "Can glass railings be used outdoors in coastal weather?",
        a: "Yes. Use stainless steel hardware rated for exterior use and clean the glass and fittings regularly to prevent salt build-up.",
      },
    ],
  },
  {
    slug: "flooring",
    name: "Flooring",
    short: "Vinyl, wooden and carpet flooring laid over properly prepared subfloors.",
    cardImg: "woodenflooring-1000",
    cardImgSmall: "woodenflooring-700",
    heroImg: "woodenflooring-1400",
    heroAlt: "Herringbone wooden flooring in a bright room",
    title: "Flooring in Thoothukudi & Tamil Nadu | Vinyl & Wood",
    description:
      "Vinyl, wooden and carpet flooring with subfloor preparation, moisture checks and clean installation. Based in Thoothukudi, working across Tamil Nadu.",
    h1: "Flooring that stands up to a coastal climate",
    lead:
      "Most flooring failures start under the floor, not on top of it. Moisture, uneven screed and poor expansion gaps cause more problems than the surface material ever does.",
    intro: [
      "Vinyl is the practical choice for kitchens, clinics and busy offices: it is water-resistant, quiet underfoot and easy to clean. Modern wood-look vinyl is convincing enough for living areas, and it handles humidity far better than solid wood.",
      "Wooden and engineered flooring bring warmth that other materials cannot match, but they need a dry subfloor and room to expand. Carpet remains a good option for bedrooms, studios and offices where sound absorption matters more than easy cleaning.",
    ],
    includes: [
      "Subfloor inspection, levelling and moisture checks",
      "Material and shade selection with samples on site",
      "Skirting, beading and expansion gaps detailed correctly",
      "Clean cutting around door frames and services",
      "Installation and post-laying care instructions",
    ],
    types: [
      { name: "Vinyl flooring", img: "vinyl-flooring-480", alt: "Wood-look vinyl flooring with a light grain" },
      { name: "Wooden flooring", img: "woodenflooring-700", alt: "Herringbone wooden flooring in a bright room" },
      { name: "Carpet", img: "carpet-700", alt: "Textured yellow carpet flooring" },
    ],
    notes: [
      {
        title: "Test the subfloor first",
        body:
          "A simple moisture check and a straight-edge check save a lot of trouble. If the screed is damp or uneven, we fix that before any material is laid.",
      },
      {
        title: "Leave an expansion gap",
        body:
          "Wood and vinyl both move with temperature. Gaps hidden under skirting and beading keep the floor flat instead of cupping at the joints.",
      },
      {
        title: "Think about the room",
        body:
          "Vinyl for wet areas and heavy footfall, wood for living and bedrooms, carpet where quiet matters. The same floor everywhere is rarely the best compromise.",
      },
    ],
    faqs: [
      {
        q: "Can vinyl flooring be laid over existing tiles?",
        a: "Often yes, provided the tiles are sound, level and clean. We inspect the floor first and levelling compound may be needed to remove ridges and dips.",
      },
      {
        q: "Is wooden flooring suitable for Thoothukudi's humidity?",
        a: "Engineered wooden flooring is more stable than solid wood in humid conditions, especially with a moisture barrier and proper expansion gaps. We check the subfloor before recommending it.",
      },
      {
        q: "How do I maintain vinyl flooring?",
        a: "Sweep or vacuum regularly and mop with a damp mop and a pH-neutral cleaner. Avoid soaking the floor or using abrasive pads.",
      },
    ],
  },
  {
    slug: "mosquito-nets",
    name: "Mosquito Nets",
    short: "Pleated, honeycomb, magnetic and retractable nets for windows and doors.",
    cardImg: "mosopen-900",
    cardImgSmall: "mosopen-600",
    heroImg: "mosopen-900",
    heroAlt: "Openable mosquito net fitted into a window frame",
    title: "Mosquito Nets for Windows & Doors | Thoothukudi & Tamil Nadu",
    description:
      "Pleated, honeycomb, magnetic, fibreglass and openable mosquito nets for windows and doors. Measured and fitted across Tamil Nadu from Thoothukudi.",
    h1: "Mosquito nets that do not block the breeze",
    lead:
      "In a coastal town you want the windows open in the evening. A well-fitted net lets the air in, keeps the mosquitoes out, and still lets you reach the handle and close the window.",
    intro: [
      "The right system depends on the opening. Sliding windows suit a sliding pleated net that folds to one side. Openable windows work best with a fixed or openable frame net. Doors need something you can walk through — a magnetic curtain, a pleated door or a retractable screen.",
      "We measure the window or door frame and fit the net to it, rather than covering the whole wall. That keeps the frame lines clean and means the net does not interfere with curtains, blinds or the window handle.",
    ],
    includes: [
      "Measurement of the frame and opening direction",
      "Mesh and frame colour options to match your joinery",
      "Pleated, honeycomb, magnetic or fixed systems",
      "Smooth tracks, magnets and tensioning adjusted on site",
      "Fitting to existing windows and doors",
    ],
    types: [
      { name: "Open window net", img: "mosopen-600", alt: "Openable mosquito net fitted to a window" },
      { name: "Sliding pleated net", img: "apleated-480", alt: "Pleated mosquito net with aluminium frame" },
      { name: "Honeycomb net", img: "honey-480", alt: "Honeycomb mosquito net panel" },
      { name: "Magnetic door net", img: "magnet-480", alt: "Magnetic mosquito net on a doorway" },
      { name: "Fibre sliding pleated", img: "fiber-480", alt: "Fibreglass pleated mosquito net" },
    ],
    notes: [
      {
        title: "Fit the frame, not the wall",
        body:
          "A net fixed to the window frame looks neater and leaves the wall free for curtains or blinds. We check the frame depth before choosing the system.",
      },
      {
        title: "The handle still has to work",
        body:
          "Openable windows need clearance for the handle and the sash. We position the net so you can open, close and lock the window without removing it.",
      },
      {
        title: "Mesh size matters",
        body:
          "A finer mesh keeps out smaller insects but cuts more airflow. We will show you the options so you can choose the right balance for your area.",
      },
    ],
    faqs: [
      {
        q: "Can mosquito nets be fitted to existing windows?",
        a: "Yes. Most of our net work is retrofitted to windows and doors that are already installed. We measure the frame and choose a system that fits its depth.",
      },
      {
        q: "Will a net stop me from closing the window?",
        a: "No. We position the net and its track so the window handle and sash remain accessible. On openable windows we check this with you during fitting.",
      },
      {
        q: "How do I clean a mosquito net?",
        a: "Vacuum gently with a brush attachment or wipe with a damp cloth. Pleated nets should be cleaned in place rather than removed.",
      },
    ],
  },
];

export const serviceBySlug = Object.fromEntries(services.map((s) => [s.slug, s]));
