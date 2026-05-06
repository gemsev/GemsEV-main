import { db } from "@workspace/db";
import {
  ownersTable,
  evRangeSpecsTable,
  cposTable,
  accessoriesTable,
  faqItemsTable,
  blogPostsTable,
  galleryItemsTable,
} from "@workspace/db";
import bcrypt from "bcryptjs";

async function seed() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminHash = await bcrypt.hash("admin123", 12);
  const [admin] = await db.insert(ownersTable).values({
    email: "admin@evtribe.in",
    name: "EV Tribe Admin",
    age: 35,
    phoneNumber: "+91 98765 00000",
    whatsappNumber: "+91 98765 00000",
    telegramId: "@evtribeadmin",
    areaOfStay: "Indiranagar, Bengaluru",
    city: "Bengaluru",
    occupation: "Community Manager",
    vehicleNumber: "KA 01 EV 0001",
    evCarsOwned: ["N3L", "WeM"],
    variantColor: "Nexon EV Long Range – Pristine White",
    purchaseMonthYear: "March 2023",
    status: "approved",
    username: "admin",
    passwordHash: adminHash,
    role: "admin",
    blogEnabled: true,
    bio: "Managing the EV Tribe India community. EV enthusiast and charging infrastructure advocate.",
  }).onConflictDoNothing().returning();

  // Sample owners
  const ownerHash = await bcrypt.hash("owner123", 12);
  const sampleOwners = [
    {
      email: "rahul.kumar@example.com", name: "Rahul Kumar", age: 32,
      phoneNumber: "+91 98765 11111", whatsappNumber: "+91 98765 11111", telegramId: "@rahulkev",
      areaOfStay: "Koramangala, Bengaluru", city: "Bengaluru", occupation: "Software Engineer",
      vehicleNumber: "KA 04 EV 1234", evCarsOwned: ["NEV", "N3L"],
      variantColor: "Nexon EV Max – Daytona Grey", purchaseMonthYear: "January 2023",
      status: "approved" as const, username: "rahulkumar", passwordHash: ownerHash, blogEnabled: true,
      bio: "3 years into the EV journey. Range anxiety is a myth!",
    },
    {
      email: "priya.sharma@example.com", name: "Priya Sharma", age: 28,
      phoneNumber: "+91 98765 22222", whatsappNumber: "+91 98765 22222", telegramId: "NA",
      areaOfStay: "Banjara Hills, Hyderabad", city: "Hyderabad", occupation: "Doctor",
      vehicleNumber: "TS 09 EV 5678", evCarsOwned: ["HyC"],
      variantColor: "Hyundai Creta EV – Atlas White", purchaseMonthYear: "March 2024",
      status: "approved" as const, username: "priyasharma", passwordHash: ownerHash, blogEnabled: false,
    },
    {
      email: "amit.patel@example.com", name: "Amit Patel", age: 45,
      phoneNumber: "+91 98765 33333", whatsappNumber: "+91 98765 33333", telegramId: "@amitpev",
      areaOfStay: "Satellite, Ahmedabad", city: "Ahmedabad", occupation: "Business Owner",
      vehicleNumber: "GJ 01 EV 9012", evCarsOwned: ["ByA3", "X400"],
      variantColor: "BYD Atto 3 – Boulder Grey", purchaseMonthYear: "August 2022",
      status: "approved" as const, username: "amitpatel", passwordHash: ownerHash, blogEnabled: true,
    },
    {
      email: "sunita.reddy@example.com", name: "Sunita Reddy", age: 38,
      phoneNumber: "+91 98765 44444", whatsappNumber: "+91 98765 44444", telegramId: "NA",
      areaOfStay: "Madhapur, Hyderabad", city: "Hyderabad", occupation: "Entrepreneur",
      vehicleNumber: "TS 10 EV 3456", evCarsOwned: ["WeM"],
      variantColor: "MG Windsor EV – Starburst Black", purchaseMonthYear: "December 2023",
      status: "approved" as const, username: "sunitareddy", passwordHash: ownerHash, blogEnabled: false,
    },
    {
      email: "vikram.nair@example.com", name: "Vikram Nair", age: 29,
      phoneNumber: "+91 98765 55555", whatsappNumber: "+91 98765 55555", telegramId: "@vikramnev",
      areaOfStay: "Thevara, Kochi", city: "Kochi", occupation: "Architect",
      vehicleNumber: "KL 07 EV 7890", evCarsOwned: ["PuL", "TiL"],
      variantColor: "Tata Punch EV Long Range – Empowered Oxide Red", purchaseMonthYear: "July 2023",
      status: "approved" as const, username: "vikramnair", passwordHash: ownerHash, blogEnabled: true,
    },
    {
      email: "pending@example.com", name: "Deepak Joshi", age: 33,
      phoneNumber: "+91 98765 66666", whatsappNumber: "+91 98765 66666", telegramId: "NA",
      areaOfStay: "Pune Camp, Pune", city: "Pune", occupation: "Teacher",
      vehicleNumber: "MH 12 EV 2345", evCarsOwned: ["CeM"],
      variantColor: "Tata Curvv EV Mid – Pristine White", purchaseMonthYear: "February 2024",
      status: "pending" as const,
    },
  ];

  for (const owner of sampleOwners) {
    await db.insert(ownersTable).values(owner).onConflictDoNothing();
  }

  // EV Range Specs
  await db.insert(evRangeSpecsTable).values([
    { code: "NEV", name: "Tata Nexon EV Prime", brand: "Tata", batteryCapacityKwh: 30.2, wltpRangeKm: 312, realWorldRangeKm: 220, chargingSpeedKw: 7.2 },
    { code: "NEM", name: "Tata Nexon EV Max", brand: "Tata", batteryCapacityKwh: 40.5, wltpRangeKm: 437, realWorldRangeKm: 300, chargingSpeedKw: 50 },
    { code: "N3M", name: "Tata Nexon EV 3.0 Mid Range", brand: "Tata", batteryCapacityKwh: 45.0, wltpRangeKm: 489, realWorldRangeKm: 340, chargingSpeedKw: 50 },
    { code: "N3L", name: "Tata Nexon EV 3.0 Long Range", brand: "Tata", batteryCapacityKwh: 55.0, wltpRangeKm: 601, realWorldRangeKm: 430, chargingSpeedKw: 65 },
    { code: "TiM", name: "Tata Tiago EV Mid Range", brand: "Tata", batteryCapacityKwh: 19.2, wltpRangeKm: 250, realWorldRangeKm: 180, chargingSpeedKw: 3.3 },
    { code: "TiL", name: "Tata Tiago EV Long Range", brand: "Tata", batteryCapacityKwh: 24.0, wltpRangeKm: 315, realWorldRangeKm: 220, chargingSpeedKw: 7.2 },
    { code: "TiG", name: "Tata Tigor EV", brand: "Tata", batteryCapacityKwh: 26.0, wltpRangeKm: 306, realWorldRangeKm: 210, chargingSpeedKw: 25 },
    { code: "PuM", name: "Tata Punch EV Mid Range", brand: "Tata", batteryCapacityKwh: 25.0, wltpRangeKm: 315, realWorldRangeKm: 225, chargingSpeedKw: 3.3 },
    { code: "PuL", name: "Tata Punch EV Long Range", brand: "Tata", batteryCapacityKwh: 35.0, wltpRangeKm: 421, realWorldRangeKm: 300, chargingSpeedKw: 50 },
    { code: "CeM", name: "Tata Curvv EV Mid Range", brand: "Tata", batteryCapacityKwh: 45.0, wltpRangeKm: 502, realWorldRangeKm: 360, chargingSpeedKw: 50 },
    { code: "CeL", name: "Tata Curvv EV Long Range", brand: "Tata", batteryCapacityKwh: 55.0, wltpRangeKm: 585, realWorldRangeKm: 420, chargingSpeedKw: 65 },
    { code: "HeM", name: "Tata Harrier EV Mid Range", brand: "Tata", batteryCapacityKwh: 60.0, wltpRangeKm: 538, realWorldRangeKm: 380, chargingSpeedKw: 50 },
    { code: "HeL", name: "Tata Harrier EV Long Range", brand: "Tata", batteryCapacityKwh: 74.0, wltpRangeKm: 627, realWorldRangeKm: 460, chargingSpeedKw: 100 },
    { code: "ZSM", name: "MG ZS EV", brand: "MG", batteryCapacityKwh: 50.3, wltpRangeKm: 461, realWorldRangeKm: 320, chargingSpeedKw: 76 },
    { code: "WeM", name: "MG Windsor EV", brand: "MG", batteryCapacityKwh: 38.0, wltpRangeKm: 455, realWorldRangeKm: 320, chargingSpeedKw: 11 },
    { code: "CoM", name: "MG Comet EV", brand: "MG", batteryCapacityKwh: 17.3, wltpRangeKm: 230, realWorldRangeKm: 160, chargingSpeedKw: 3.3 },
    { code: "ByA3", name: "BYD Atto 3", brand: "BYD", batteryCapacityKwh: 60.5, wltpRangeKm: 521, realWorldRangeKm: 370, chargingSpeedKw: 80 },
    { code: "ByE6", name: "BYD E6", brand: "BYD", batteryCapacityKwh: 71.7, wltpRangeKm: 520, realWorldRangeKm: 380, chargingSpeedKw: 50 },
    { code: "KE6", name: "Kia EV6", brand: "Kia", batteryCapacityKwh: 77.4, wltpRangeKm: 528, realWorldRangeKm: 400, chargingSpeedKw: 240 },
    { code: "HyC", name: "Hyundai Creta EV", brand: "Hyundai", batteryCapacityKwh: 51.4, wltpRangeKm: 473, realWorldRangeKm: 340, chargingSpeedKw: 50 },
    { code: "Hi5", name: "Hyundai Ioniq 5", brand: "Hyundai", batteryCapacityKwh: 72.6, wltpRangeKm: 614, realWorldRangeKm: 450, chargingSpeedKw: 220 },
    { code: "X400", name: "Mahindra XUV400", brand: "Mahindra", batteryCapacityKwh: 39.4, wltpRangeKm: 456, realWorldRangeKm: 320, chargingSpeedKw: 50 },
    { code: "BEV6", name: "Mahindra BE6", brand: "Mahindra", batteryCapacityKwh: 79.0, wltpRangeKm: 682, realWorldRangeKm: 500, chargingSpeedKw: 175 },
    { code: "XE9", name: "Mahindra XEV9E", brand: "Mahindra", batteryCapacityKwh: 79.0, wltpRangeKm: 656, realWorldRangeKm: 480, chargingSpeedKw: 175 },
  ]).onConflictDoNothing();

  // CPO data
  await db.insert(cposTable).values([
    { networkName: "Tata Power", city: "Bengaluru", state: "Karnataka", address: "Indiranagar, Bengaluru - 560038", chargerTypes: ["CCS2", "Type 2"], maxKw: 50, phone: "1800-209-8282", email: "evcs@tatapower.com", contactPerson: "Support", operatingHours: "24x7" },
    { networkName: "BESCOM EV Charging", city: "Bengaluru", state: "Karnataka", address: "KR Road, Bengaluru", chargerTypes: ["CCS2", "CHAdeMO"], maxKw: 60, phone: "1800-425-9339", contactPerson: "BESCOM", operatingHours: "6am–10pm" },
    { networkName: "Ather Grid", city: "Bengaluru", state: "Karnataka", address: "Koramangala 6th Block", chargerTypes: ["Type 2"], maxKw: 22, phone: "+91 76767 76767", operatingHours: "24x7" },
    { networkName: "Tata Power", city: "Mumbai", state: "Maharashtra", address: "BKC, Mumbai - 400051", chargerTypes: ["CCS2", "Type 2"], maxKw: 100, phone: "1800-209-8282", email: "evcs@tatapower.com", contactPerson: "Support", operatingHours: "24x7" },
    { networkName: "CHARGE+ZONE", city: "Mumbai", state: "Maharashtra", address: "Andheri West, Mumbai", chargerTypes: ["CCS2", "AC Type 2"], maxKw: 120, phone: "+91 99999 88888", whatsapp: "+91 99999 88888", operatingHours: "24x7" },
    { networkName: "NPCL EV Points", city: "Delhi", state: "Delhi", address: "Connaught Place, New Delhi", chargerTypes: ["CCS2", "CHAdeMO", "Type 2"], maxKw: 50, phone: "1800-103-7135", operatingHours: "6am–11pm" },
    { networkName: "Tata Power", city: "Hyderabad", state: "Telangana", address: "Banjara Hills, Hyderabad", chargerTypes: ["CCS2", "Type 2"], maxKw: 50, phone: "1800-209-8282", email: "evcs@tatapower.com", operatingHours: "24x7" },
    { networkName: "EVRE", city: "Hyderabad", state: "Telangana", address: "HITEC City, Hyderabad", chargerTypes: ["CCS2", "AC Type 2"], maxKw: 30, phone: "+91 90000 12345", operatingHours: "8am–10pm" },
    { networkName: "MG Charging", city: "Ahmedabad", state: "Gujarat", address: "SG Highway, Ahmedabad", chargerTypes: ["CCS2", "Type 2"], maxKw: 50, phone: "1800-3000-0600", operatingHours: "9am–9pm" },
    { networkName: "Tata Power", city: "Pune", state: "Maharashtra", address: "Koregaon Park, Pune", chargerTypes: ["CCS2", "Type 2"], maxKw: 50, phone: "1800-209-8282", operatingHours: "24x7" },
    { networkName: "Kerala KSEB EV", city: "Kochi", state: "Kerala", address: "Edapally Junction, Kochi", chargerTypes: ["CCS2", "Type 2", "CHAdeMO"], maxKw: 50, phone: "0484-2383000", operatingHours: "6am–10pm" },
  ]).onConflictDoNothing();

  // Accessories
  await db.insert(accessoriesTable).values([
    { name: "3.3 kW Home Charger (Type 2)", category: "Charging", description: "Compact wall-mount AC charger suitable for all Tata EVs. Includes 5m cable.", sellerName: "Kazam EV", location: "Pan India (Online)", priceRange: "₹8,000–₹12,000", sellerUrl: "https://kazam.in", compatibleCars: ["NEV","NEM","N3M","N3L","TiM","TiL","PuM","PuL","CeM","CeL"], rating: 4.5 },
    { name: "7.2 kW AC Fast Home Charger", category: "Charging", description: "Faster overnight charging solution. OCPP-compatible smart charger.", sellerName: "Statiq", location: "Bengaluru / Delhi / Mumbai", priceRange: "₹18,000–₹25,000", sellerUrl: "https://statiq.in", compatibleCars: ["NEM","N3L","PuL","WeM","ByA3"], rating: 4.3 },
    { name: "Portable Type 2 EVSE (16A)", category: "Charging", description: "Carry-anywhere charging cable for emergency top-ups from 15A socket.", sellerName: "Ampvolts", location: "Pan India (Online)", priceRange: "₹4,500–₹7,000", compatibleCars: [], rating: 4.1 },
    { name: "Custom-fit Seat Covers (Nexon EV)", category: "Interior", description: "Waterproof neoprene seat covers specifically designed for Nexon EV. Front and rear sets.", sellerName: "CarCraft India", location: "Bengaluru, Hyderabad", priceRange: "₹3,500–₹5,500", compatibleCars: ["NEV","NEM","N3M","N3L"], rating: 4.4 },
    { name: "Rear Bumper Guard", category: "Protection", description: "Stainless steel step bumper protector with anti-scratch coating.", sellerName: "ShieldCar", location: "Mumbai, Pune, Delhi", priceRange: "₹2,000–₹3,500", compatibleCars: ["N3L","CeL","WeM"], rating: 4.0 },
    { name: "Dashboard Camera 4K", category: "Safety", description: "Wide-angle 4K dashcam with night vision and parking mode. 64GB included.", sellerName: "Viofo India", location: "Pan India (Online)", priceRange: "₹7,500–₹12,000", compatibleCars: [], rating: 4.6 },
    { name: "EV Battery Conditioner Mat", category: "Protection", description: "Thermal mat to keep the battery warm in cold weather. Reduces range loss in winter.", sellerName: "ThermoEV", location: "Kolkata, Delhi", priceRange: "₹3,000–₹4,500", compatibleCars: ["TiL","TiM","PuM","PuL"], rating: 3.9 },
    { name: "Smart OBD2 + EV Monitor", category: "Connectivity", description: "Bluetooth OBD2 dongle with dedicated EV app. View SOC, battery temp, motor power.", sellerName: "CarIQ", location: "Pan India (Online)", priceRange: "₹2,500–₹4,000", sellerUrl: "https://cariq.in", compatibleCars: [], rating: 4.2 },
    { name: "Boot Organiser Tray (Curvv EV)", category: "Storage", description: "Custom moulded boot tray with 15L storage capacity and waterproof finish.", sellerName: "AutoFurnish", location: "Pan India (Online)", priceRange: "₹1,800–₹2,800", compatibleCars: ["CeM","CeL"], rating: 4.3 },
    { name: "Carbon Fibre Wrap Kit", category: "Exterior", description: "Premium 3M carbon fibre vinyl wrap kit for bonnet and roof. DIY-friendly.", sellerName: "WrapZone India", location: "Bengaluru, Chennai, Mumbai", priceRange: "₹5,000–₹15,000", compatibleCars: [], rating: 4.1 },
  ]).onConflictDoNothing();

  // FAQ Items
  await db.insert(faqItemsTable).values([
    { question: "What is the real-world range of the Tata Nexon EV Long Range?", answer: "The Tata Nexon EV 3.0 Long Range (N3L) offers a WLTP certified range of 601 km, but real-world range in Indian conditions typically comes to around 380–430 km depending on driving style, AC usage, and terrain. In city driving with moderate AC, most owners report 350–400 km.", category: "Range", carModels: ["N3L","NEM"] },
    { question: "How long does it take to charge a Tata Nexon EV from 0 to 100%?", answer: "With a 50 kW DC fast charger: approximately 1 hour to charge from 10% to 80%. With a 7.2 kW AC home charger: approximately 7–8 hours for a full charge on the Long Range model. With a 3.3 kW home charger: approximately 13–14 hours. For daily use, most owners charge overnight at home.", category: "Charging", carModels: ["NEV","NEM","N3M","N3L"] },
    { question: "Is it safe to charge my EV in the rain?", answer: "Yes, it is completely safe to charge your EV in the rain. EV chargers and charging ports are designed and tested to IP54 or higher weatherproofing standards. The charging system automatically monitors for faults. However, avoid charging if the charger cable is visibly damaged or submerged in standing water.", category: "Safety", carModels: [] },
    { question: "What is the battery warranty on Tata EVs?", answer: "Tata Motors provides an 8-year / 1,60,000 km battery warranty on their EV lineup. This covers battery capacity retention to at least 70% of the original capacity. Some flagship models may have extended warranty options available from the dealer.", category: "Warranty", carModels: ["NEV","NEM","N3M","N3L","TiM","TiL","PuM","PuL","CeM","CeL","HeM","HeL"] },
    { question: "How do I activate regenerative braking on my Tata Nexon EV?", answer: "On the Tata Nexon EV, regenerative braking is always active when you lift off the throttle. You can adjust the intensity using the paddle shifters on the steering wheel (if equipped) or via the central touchscreen. B mode (or L mode) provides maximum regeneration and can enable single-pedal driving in many situations.", category: "Features", carModels: ["NEV","NEM","N3M","N3L"] },
    { question: "Can I use a public CCS2 charger with my MG Windsor EV?", answer: "Yes, the MG Windsor EV comes with a CCS2 charging port and can use any CCS2 public charger. It supports up to 11 kW AC charging (Type 2) and up to 50 kW DC charging (CCS2). Networks like Tata Power, Statiq, and CHARGE+ZONE all have compatible chargers.", category: "Charging", carModels: ["WeM"] },
    { question: "How do I check my EV's battery health?", answer: "You can check battery health via: 1) The car's onboard dashboard (usually shows SOH % in settings). 2) Your manufacturer's app (Tata Motors app, MG iSMART, etc.). 3) A third-party OBD2 reader with an EV-compatible app like Car Scanner. The battery is considered healthy if it retains above 80% of its original capacity.", category: "Maintenance", carModels: [] },
    { question: "Does running the AC significantly reduce EV range?", answer: "Yes, running the AC on maximum can reduce range by 15–25% in Indian summer conditions. The impact is more pronounced in smaller battery vehicles (like Tiago EV) than in larger ones (like Nexon EV Long Range). Tips: Pre-cool the cabin while plugged in, use fan mode instead of full AC when possible, and park in shade to reduce cabin heating.", category: "Range", carModels: [] },
    { question: "What happens if my EV runs out of charge on the highway?", answer: "Most EVs have a safety buffer below the indicated 0% to protect the battery. When you reach 0%, the car will enter limp mode and gradually slow down, giving you time to pull over safely. You should call your manufacturer's roadside assistance (Tata Roadside Assistance: 1800-209-7979) who can arrange a flatbed tow or mobile charging van.", category: "Safety", carModels: [] },
    { question: "Is overnight charging at home safe for the battery?", answer: "Yes, overnight charging is designed to be safe. Modern EVs use BMS (Battery Management System) that stops charging at 100% and manages thermal conditions automatically. However, for long-term battery health, it's recommended to charge to 80% for daily use and only charge to 100% before a long trip. Tata EVs and most other brands have a 'scheduled charging' feature for this purpose.", category: "Charging", carModels: [] },
    { question: "How do I become a member of EV Tribe India?", answer: "To join EV Tribe India, click 'Join the Tribe' on the homepage and complete the 3-step registration form. You will need to provide: 1) Personal details (name, contact, location), 2) Vehicle information (car model, vehicle number, variant), and 3) Proof of ownership (RC copy, insurance, or mParivahan screenshot). Our admin team reviews applications within 2–5 working days and sends you login credentials once approved.", category: "Community", carModels: [] },
    { question: "What charger type does the Hyundai Creta EV use?", answer: "The Hyundai Creta EV uses CCS2 for DC fast charging (up to 50 kW) and AC Type 2 for slow/home charging (up to 11 kW). It comes bundled with a portable Mode 2 EVSE for emergency 15A socket charging. The car is compatible with all major public charging networks in India.", category: "Charging", carModels: ["HyC"] },
  ]).onConflictDoNothing();

  // Sample blog posts (if admin user was created)
  if (admin) {
    await db.insert(blogPostsTable).values([
      {
        title: "Welcome to EV Tribe India – The Community for India's Electric Revolution",
        content: `India's electric vehicle revolution is well underway, and EV Tribe India is here to be your trusted community hub.\n\nWhether you're a Day 1 Nexon EV owner who's clocked over 1 lakh kilometres, or you just took delivery of a shiny new Mahindra BE6, this is YOUR community.\n\nEV Tribe India was founded by passionate EV owners who believed that the best source of knowledge about electric vehicles isn't a YouTube video or a brand brochure — it's your fellow owner who's driven through the Bengaluru monsoon, charged at a highway DCFC at midnight, or figured out the perfect battery conditioning schedule for Ooty trips.\n\nWhat can you do here?\n- Connect with verified EV owners across India\n- Share your road trip stories and charging experiences\n- Use our Range Calculator to plan your next journey\n- Find Charge Point Operators (CPOs) near you\n- Discover the best accessories from trusted sellers\n- Browse the community gallery\n- Ask our AI-powered FAQ assistant anything about your EV\n\nJoin the tribe. Go electric. The future is now.`,
        excerpt: "India's EV revolution has a community now. Welcome to EV Tribe India – your home for all things electric.",
        published: true,
        authorId: admin.id,
        tags: ["welcome", "community", "india", "ev"],
        viewCount: 142,
      },
      {
        title: "Bengaluru to Coorg in a Tata Nexon EV Long Range – A Complete Report",
        content: `Road trips in an EV in India are a completely different adventure from the ICE world. Here's my complete report from Bengaluru to Coorg (approximately 265 km one-way) in my Tata Nexon EV 3.0 Long Range.\n\nVehicle: Nexon EV 3.0 Long Range – KA 04 EV 1234\nBattery at start: 95% (charged overnight)\nEstimated range shown: 382 km\n\nRoute: Bengaluru → Mysuru → Hunsur → Madikeri\n\nDay 1 – Bengaluru to Mysuru (140 km)\nLeft Indiranagar at 6 AM to beat traffic. The Bengaluru-Mysuru Expressway is a dream for EVs – flat, smooth, and doing 100-110 kmph used about 1.8 km of range per kilometre of highway due to the aerodynamics.\n\nArrived Mysuru with 61% battery. Made a pitstop at the Tata Power charger at the Forum Mall parking – charged to 80% in about 35 minutes on the 50 kW DCFC. Cost: approximately ₹270.\n\nMysuru to Madikeri (120 km, Ghats)\nThis is where it gets interesting. The ghats are not EV-unfriendly – they're EV-IDEAL. The regenerative braking on the descents recovers a significant amount of energy. I actually arrived in Madikeri with MORE charge than expected (34% vs 25% estimate).\n\nCharging in Coorg: There's a Tata Power 7.2 kW charger at the Evolve Back resort. We charged overnight (8 hours) from 34% to 96%. Sufficient for the return.\n\nConclusion: The Nexon EV Long Range handles this route effortlessly. Range anxiety? Non-existent once you understand regenerative braking and plan your stops.`,
        excerpt: "A detailed first-hand account of driving from Bengaluru to Coorg in the Tata Nexon EV Long Range. 530 km round trip, zero range anxiety.",
        published: true,
        authorId: admin.id,
        tags: ["road-trip", "nexon-ev", "bengaluru", "coorg", "charging"],
        viewCount: 89,
      },
    ]).onConflictDoNothing();
  }

  console.log("✅ Database seeded successfully!");
  console.log("   Admin login: username=admin, password=admin123");
  console.log("   Sample owners: rahulkumar, priyasharma, amitpatel, sunitareddy, vikramnair (password: owner123)");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
