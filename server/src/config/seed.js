import bcrypt from 'bcryptjs';
import {
  User,
  Member,
  MembershipPlan,
  Court,
  Booking,
  Product,
  InventoryMovement,
  Order,
  Table,
  BarMenuItem,
  BarOrder,
  Transaction,
  Lead,
  Employee,
  LeaveRequest,
  Expense,
  Invoice,
  CorporateClient
} from '../models/index.js';

export async function seedDatabase() {
  console.log('🔄 Checking database seed status...');

  // 1. Membership Plans
  const plans = [
    {
      id: 'plan_gold',
      name: 'Gold',
      tagline: 'All-inclusive premium athletic privilege with complimentary court reservations',
      priceAnnual: 45000,
      priceMonthly: 4200,
      courtDiscountPercent: 100,
      shopDiscountPercent: 15,
      priorityBookingDays: 7,
      features: [
        'Complimentary 100% court reservation fee waiver',
        '7-day advance court booking window',
        '15% discount on all pro shop gear & cafeteria dining',
        'Complimentary locker & sauna access',
        '2 guest passes per month'
      ]
    },
    {
      id: 'plan_silver',
      name: 'Silver',
      tagline: 'Balanced competitive tier for frequent evening & weekend club players',
      priceAnnual: 28000,
      priceMonthly: 2600,
      courtDiscountPercent: 50,
      shopDiscountPercent: 10,
      priorityBookingDays: 4,
      features: [
        '50% discount on all court bookings',
        '4-day advance court booking window',
        '10% discount on pro shop gear & cafeteria',
        'Standard locker room access',
        'Quarterly coach review session'
      ]
    },
    {
      id: 'plan_junior',
      name: 'Junior',
      tagline: 'Under-18 developmental academy membership for aspiring young athletes',
      priceAnnual: 18000,
      priceMonthly: 1700,
      courtDiscountPercent: 30,
      shopDiscountPercent: 5,
      priorityBookingDays: 3,
      features: [
        '30% court booking discount',
        'Access to weekend junior group clinics',
        '5% discount in sports shop',
        'Supervised gym conditioning access',
        'Academy matchday entry'
      ]
    }
  ];

  for (const p of plans) {
    await MembershipPlan.findOneAndUpdate({ name: p.name }, p, { upsert: true, returnDocument: 'after' });
  }

  // 2. Users
  const users = [
    {
      id: 'usr_admin_1',
      name: 'Alexander Wright',
      email: 'admin@championsclub.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      plan: 'Gold'
    },
    {
      id: 'usr_staff_1',
      name: 'Sunita Verma',
      email: 'staff@championsclub.com',
      password: 'staff123',
      role: 'staff',
      phone: '+91 98765 43211',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
      plan: 'Silver'
    },
    {
      id: 'usr_member_1',
      name: 'Vikram Mehta',
      email: 'member@championsclub.com',
      password: 'member123',
      role: 'member',
      phone: '+91 98765 43212',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      memberId: 'MEM-2026-001',
      plan: 'Gold'
    },
    {
      id: 'usr_member_2',
      name: 'Priya Sharma',
      email: 'priya@gmail.com',
      password: 'member123',
      role: 'member',
      phone: '+91 98765 43213',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      memberId: 'MEM-2026-002',
      plan: 'Silver'
    },
    {
      id: 'usr_member_3',
      name: 'Rohan Kapoor',
      email: 'rohan@gmail.com',
      password: 'member123',
      role: 'member',
      phone: '+91 98765 43214',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      memberId: 'MEM-2026-003',
      plan: 'Junior'
    }
  ];

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (!existing) {
      await User.create(u);
    }
  }

  // 3. Members
  const members = [
    {
      id: 'MEM-2026-001',
      userId: 'usr_member_1',
      name: 'Vikram Mehta',
      email: 'member@championsclub.com',
      phone: '+91 98765 43212',
      plan: 'Gold',
      status: 'active',
      startDate: '2026-01-15',
      expiryDate: '2027-01-15',
      emergencyContact: 'Rohit Mehta (+91 98765 00001)',
      bloodGroup: 'O+',
      sportsInterest: ['Tennis', 'Cricket'],
      totalBookings: 18,
      totalSpent: 62400
    },
    {
      id: 'MEM-2026-002',
      userId: 'usr_member_2',
      name: 'Priya Sharma',
      email: 'priya@gmail.com',
      phone: '+91 98765 43213',
      plan: 'Silver',
      status: 'active',
      startDate: '2026-02-01',
      expiryDate: '2027-02-01',
      emergencyContact: 'Amit Sharma (+91 98765 00002)',
      bloodGroup: 'A+',
      sportsInterest: ['Tennis'],
      totalBookings: 9,
      totalSpent: 34500
    },
    {
      id: 'MEM-2026-003',
      userId: 'usr_member_3',
      name: 'Rohan Kapoor',
      email: 'rohan@gmail.com',
      phone: '+91 98765 43214',
      plan: 'Junior',
      status: 'active',
      startDate: '2026-02-15',
      expiryDate: '2027-02-15',
      emergencyContact: 'Sanjay Kapoor (+91 98765 00003)',
      bloodGroup: 'B+',
      sportsInterest: ['Cricket'],
      totalBookings: 12,
      totalSpent: 22800
    },
    {
      id: 'MEM-2026-004',
      name: 'Ananya Deshmukh',
      email: 'ananya@gmail.com',
      phone: '+91 98765 43215',
      plan: 'Gold',
      status: 'expired',
      startDate: '2025-01-10',
      expiryDate: '2026-01-10',
      emergencyContact: 'Kavita (+91 98765 00004)',
      bloodGroup: 'AB+',
      sportsInterest: ['Tennis', 'Gym'],
      totalBookings: 32,
      totalSpent: 58000
    }
  ];

  for (const m of members) {
    await Member.findOneAndUpdate({ id: m.id }, m, { upsert: true, returnDocument: 'after' });
  }

  // 4. Courts
  const courts = [
    {
      id: 'court_1',
      name: 'Center Court 1',
      sport: 'Tennis',
      surface: 'Plexicushion Pro Hard Court',
      hourlyRate: 1200,
      isIndoor: false,
      status: 'available',
      description: 'Championship stadium court with ITF Class 4 Plexicushion cushioning and 750-lux ArenaVision LED tournament lighting.'
    },
    {
      id: 'court_2',
      name: 'Red Clay Court 2',
      sport: 'Tennis',
      surface: 'Roland Garros Red Clay',
      hourlyRate: 1000,
      isIndoor: false,
      status: 'available',
      description: 'Authentic imported crushed brick red clay surface sliding court with automated subterranean sprinkler misting.'
    },
    {
      id: 'court_3',
      name: 'Practice Hard Court 3',
      sport: 'Tennis',
      surface: 'Cushioned Acrylic Hard Court',
      hourlyRate: 800,
      isIndoor: false,
      status: 'available',
      description: 'Dual-tone green cushioned acrylic court with high-speed ball rebound and adjacent ball machine station.'
    },
    {
      id: 'court_4',
      name: 'RoboArm Cricket Net 1',
      sport: 'Cricket',
      surface: '22-Yard Natural Grass Turf',
      hourlyRate: 1000,
      isIndoor: true,
      status: 'available',
      description: 'Full-length match pitch equipped with programmable RoboArm bowling machine calibrated from 90 to 145 km/h with swing.'
    },
    {
      id: 'court_5',
      name: 'RoboArm Cricket Net 2',
      sport: 'Cricket',
      surface: '22-Yard Poly-Turf All-Weather',
      hourlyRate: 900,
      isIndoor: true,
      status: 'available',
      description: 'High-density poly-turf lane with automatic ball feeder, video playback review screen, and spin/pace simulation.'
    }
  ];

  for (const c of courts) {
    await Court.findOneAndUpdate({ id: c.id }, c, { upsert: true, returnDocument: 'after' });
  }

  // 5. Products & Inventory
  const products = [
    {
      id: 'prd_1',
      name: 'Head Speed Pro 2026 Tennis Racket',
      category: 'Rackets',
      brand: 'Head',
      sku: 'HD-SPD-PRO',
      price: 18999,
      memberPrice: 16149,
      costPrice: 13000,
      stock: 8,
      minStockAlert: 3,
      image: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600',
      description: 'Novak Djokovic signature racket with Graphene 360+ tech for maximum tournament control.',
      isActive: true
    },
    {
      id: 'prd_2',
      name: 'Babolat Pure Aero 98 Racket',
      category: 'Rackets',
      brand: 'Babolat',
      sku: 'BAB-PA-98',
      price: 19499,
      memberPrice: 16574,
      costPrice: 13500,
      stock: 4,
      minStockAlert: 3,
      image: 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?w=400',
      description: 'Ultimate topspin racket featuring aerodynamic frame design and dense 16x20 string pattern.',
      isActive: true
    },
    {
      id: 'prd_3',
      name: 'Wilson US Open Tennis Balls (Can of 4)',
      category: 'Balls',
      brand: 'Wilson',
      sku: 'WIL-USO-4B',
      price: 650,
      memberPrice: 552,
      costPrice: 420,
      stock: 64,
      minStockAlert: 15,
      image: 'https://images.unsplash.com/photo-1558365849-6ebd8b0454b2?w=400',
      description: 'Official Grand Slam tournament play ball with premium extra-duty woven felt.',
      isActive: true
    },
    {
      id: 'prd_4',
      name: 'Nike Court Air Zoom Vapor 11 Shoes',
      category: 'Footwear',
      brand: 'Nike',
      sku: 'NK-VAPOR-11',
      price: 13995,
      memberPrice: 11895,
      costPrice: 9500,
      stock: 2,
      minStockAlert: 3,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
      description: 'Low-profile hard court tennis shoes with herringbone generative outsole and Zoom Air unit.',
      isActive: true
    },
    {
      id: 'prd_5',
      name: 'SG Player Grade 1 English Willow Cricket Bat',
      category: 'Cricket',
      brand: 'SG',
      sku: 'SG-PLR-G1',
      price: 24999,
      memberPrice: 21249,
      costPrice: 17500,
      stock: 5,
      minStockAlert: 2,
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=400',
      description: 'Hand-crafted unbleached Grade 1 English willow with massive edges and dynamic sweet spot.',
      isActive: true
    },
    {
      id: 'prd_6',
      name: 'Kookaburra Turf White Leather Ball (Box of 6)',
      category: 'Cricket',
      brand: 'Kookaburra',
      sku: 'KB-TRF-WHT',
      price: 4800,
      memberPrice: 4080,
      costPrice: 3200,
      stock: 12,
      minStockAlert: 5,
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600',
      description: 'Four-piece alum tanned white leather balls certified for day/night professional cricket matches.',
      isActive: true
    },
    {
      id: 'prd_7',
      name: 'KHELORA Performance Quick-Dry Polo',
      category: 'Apparel',
      brand: 'KHELORA',
      sku: 'KH-POLO-NAVY',
      price: 2499,
      memberPrice: 2124,
      costPrice: 1200,
      stock: 28,
      minStockAlert: 10,
      image: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=400',
      description: 'Official KHELORA embroidered athletic performance polo with UV50+ sun protection and laser-perforated collar.',
      isActive: true
    },
    {
      id: 'prd_8',
      name: 'Wilson Pro Overgrip (Pack of 3)',
      category: 'Accessories',
      brand: 'Wilson',
      sku: 'WIL-OG-3P',
      price: 499,
      memberPrice: 424,
      costPrice: 250,
      stock: 45,
      minStockAlert: 10,
      image: 'https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?w=400',
      description: 'Super-thin, high-stretch felt surface providing unmatched tackiness and sweat absorption.',
      isActive: true
    }
  ];

  for (const pr of products) {
    await Product.findOneAndUpdate({ id: pr.id }, pr, { upsert: true, returnDocument: 'after' });
  }

  // 6. Tables
  const tables = [
    { id: 'tbl_1', name: 'Table 1 (Veranda)', capacity: 4, status: 'available', section: 'Veranda Lounge' },
    { id: 'tbl_2', name: 'Table 2 (Veranda)', capacity: 4, status: 'available', section: 'Veranda Lounge' },
    { id: 'tbl_3', name: 'Table 3 (Court View)', capacity: 6, status: 'available', section: 'Court View' },
    { id: 'tbl_4', name: 'Table 4 (Court View)', capacity: 6, status: 'available', section: 'Court View' },
    { id: 'tbl_5', name: 'Table 5 (Terrace)', capacity: 4, status: 'available', section: 'Open Terrace' },
    { id: 'tbl_6', name: 'Table 6 (Terrace)', capacity: 4, status: 'available', section: 'Open Terrace' },
    { id: 'tbl_7', name: 'Table 7 (Indoor)', capacity: 2, status: 'available', section: 'Main Lounge' },
    { id: 'tbl_8', name: 'Table 8 (Indoor)', capacity: 2, status: 'available', section: 'Main Lounge' },
    { id: 'tbl_9', name: 'Table 9 (VIP Booth)', capacity: 8, status: 'available', section: 'VIP Suite' },
    { id: 'tbl_10', name: 'Table 10 (VIP Booth)', capacity: 8, status: 'available', section: 'VIP Suite' },
    { id: 'tbl_counter', name: 'Bar Counter', capacity: 10, status: 'available', section: 'Bar Counter' },
    { id: 'tbl_takeaway', name: 'Takeaway / Court Delivery', capacity: 0, status: 'available', section: 'Takeaway' }
  ];

  for (const t of tables) {
    await Table.findOneAndUpdate({ id: t.id }, t, { upsert: true, returnDocument: 'after' });
  }

  // 7. Bar Menu Items
  const barMenu = [
    {
      id: 'menu_1',
      name: 'Whey Isolate Berry Blast Recovery Smoothie',
      category: 'Smoothies',
      price: 340,
      memberPrice: 289,
      isAvailable: true,
      isVeg: true,
      calories: 310,
      protein: '30g',
      tags: ['High Protein', 'Post-Workout', 'Antioxidants'],
      image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=800&auto=format&fit=crop&q=80',
      description: '30g grass-fed whey isolate, antioxidant blueberries, organic strawberries, almond milk, and chia seeds.'
    },
    {
      id: 'menu_2',
      name: 'Cold-Pressed Green Fuel Detox Juice',
      category: 'Smoothies',
      price: 290,
      memberPrice: 246,
      isAvailable: true,
      isVeg: true,
      calories: 125,
      protein: '4g',
      tags: ['Cold Pressed', 'Raw Detox', 'Zero Sugar'],
      image: 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=800&auto=format&fit=crop&q=80',
      description: 'Hydrating cold-pressed green apple, crisp celery, cucumber, baby spinach, ginger root, and Persian lime.'
    },
    {
      id: 'menu_3',
      name: 'Single Origin Cold Brew (Chikmagalur Reserve)',
      category: 'Coffee',
      price: 240,
      memberPrice: 204,
      isAvailable: true,
      isVeg: true,
      calories: 15,
      protein: '1g',
      tags: ['18h Steep', 'Natural Cocoa Notes', 'Pre-Match Focus'],
      image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=800&auto=format&fit=crop&q=80',
      description: 'Slow-steeped for 18 hours in filtered cold spring water. Velvety body with natural dark chocolate and caramel notes.'
    },
    {
      id: 'menu_4',
      name: 'Velvet Oat Milk Flat White',
      category: 'Coffee',
      price: 260,
      memberPrice: 221,
      isAvailable: true,
      isVeg: true,
      calories: 140,
      protein: '3g',
      tags: ['Artisanal Barista', 'Dairy-Free', 'Double Ristretto'],
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=800&auto=format&fit=crop&q=80',
      description: 'Double ristretto shot of estate espresso poured over silky micro-foamed barista oat milk.'
    },
    {
      id: 'menu_5',
      name: 'Sourdough Hass Avocado & Poached Eggs',
      category: 'Food',
      price: 420,
      memberPrice: 357,
      isAvailable: true,
      isVeg: true,
      calories: 460,
      protein: '18g',
      tags: ['Chef Special', 'Healthy Fats', 'All-Day Energy'],
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80',
      description: 'Stone-ground artisanal sourdough, smashed Hass avocado, two pasture-raised poached eggs, Danish feta, and organic micro-greens.'
    },
    {
      id: 'menu_6',
      name: 'Grilled Herb Chicken & Quinoa Super Bowl',
      category: 'Food',
      price: 490,
      memberPrice: 416,
      isAvailable: true,
      isVeg: false,
      calories: 520,
      protein: '42g',
      tags: ['Athlete Macro', 'High Protein', 'Gluten-Free'],
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      description: 'Sous-vide rosemary grilled chicken breast, warm tri-color Andean quinoa, crisp edamame, roasted chickpeas, avocado, and tahini vinaigrette.'
    },
    {
      id: 'menu_7',
      name: 'Plant-Protein Power Buddha Bowl (Vegan)',
      category: 'Food',
      price: 440,
      memberPrice: 374,
      isAvailable: true,
      isVeg: true,
      calories: 410,
      protein: '24g',
      tags: ['100% Plant Based', 'Fiber Rich', 'Clean Recovery'],
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&auto=format&fit=crop&q=80',
      description: 'Organic baked tofu cubes, baby kale, roasted Japanese sweet potato, shelled edamame, toasted pumpkin seeds, and peanut lime vinaigrette.'
    },
    {
      id: 'menu_8',
      name: 'Matchday Energy Cacao Protein Truffles (3 pcs)',
      category: 'Snacks',
      price: 180,
      memberPrice: 153,
      isAvailable: true,
      isVeg: true,
      calories: 220,
      protein: '10g',
      tags: ['Raw Organic', 'Quick Energy', 'Gluten-Free'],
      image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=800&auto=format&fit=crop&q=80',
      description: 'Handcrafted from raw organic cacao, Medjool dates, roasted Californian almonds, chia seeds, and Himalayan pink salt crystals.'
    },
    {
      id: 'menu_9',
      name: 'Himalayan Citrus Electrolyte Sparkler',
      category: 'Smoothies',
      price: 160,
      memberPrice: 136,
      isAvailable: true,
      isVeg: true,
      calories: 45,
      protein: '1g',
      tags: ['Rapid Hydration', 'Zero Added Sugar', 'Matchday Fuel'],
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&auto=format&fit=crop&q=80',
      description: 'Sparkling young coconut water infused with freshly squeezed Key limes, mint leaves, and mineral-rich Himalayan pink salt.'
    },
    {
      id: 'menu_10',
      name: 'Amazonian Acai & Wild Berry Recovery Bowl',
      category: 'Food',
      price: 460,
      memberPrice: 391,
      isAvailable: true,
      isVeg: true,
      calories: 380,
      protein: '8g',
      tags: ['Superfood', 'Antioxidants', 'Member Favorite'],
      image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&auto=format&fit=crop&q=80',
      description: 'Thick organic Brazilian acai sorbet, topped with fresh sliced banana, blueberries, toasted coconut chips, and raw clover honey.'
    },
    {
      id: 'menu_11',
      name: 'Norwegian Smoked Salmon & Dill Cream Bagel',
      category: 'Food',
      price: 490,
      memberPrice: 416,
      isAvailable: true,
      isVeg: false,
      calories: 480,
      protein: '28g',
      tags: ['Omega-3 Rich', 'Gourmet Deli', 'High Protein'],
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&auto=format&fit=crop&q=80',
      description: 'Toasted artisan sesame bagel, cold-smoked Norwegian salmon, whipped caper-dill cream cheese, cucumber ribbons, and pickled red onions.'
    },
    {
      id: 'menu_12',
      name: 'Chilled Tender Coconut Water with Chia',
      category: 'Smoothies',
      price: 140,
      memberPrice: 119,
      isAvailable: true,
      isVeg: true,
      calories: 60,
      protein: '2g',
      tags: ['100% Natural', 'Isotonic Hydration', 'Pure'],
      image: 'https://images.unsplash.com/photo-1525385133512-2f3bdd039054?w=800&auto=format&fit=crop&q=80',
      description: 'Freshly cracked young green coconut water served ice-cold with soaked organic chia seeds and a fresh Persian lime wedge.'
    }
  ];

  for (const m of barMenu) {
    await BarMenuItem.findOneAndUpdate({ id: m.id }, m, { upsert: true, returnDocument: 'after' });
  }

  // 8. Staff
  const staffMembers = [
    { id: 'stf_1', name: 'Coach Rajesh Kumar', email: 'rajesh@championsclub.com', phone: '+91 98111 22334', role: 'Head Tennis Coach', department: 'Coaching', shift: 'Morning (06:00 - 14:00)', salary: 85000, joinDate: '2018-04-01', status: 'Active' },
    { id: 'stf_2', name: 'Coach Alok Sharma', email: 'alok@championsclub.com', phone: '+91 98111 22335', role: 'Cricket Academy Director', department: 'Coaching', shift: 'Afternoon (14:00 - 22:00)', salary: 80000, joinDate: '2019-06-15', status: 'Active' },
    { id: 'stf_3', name: 'Sunita Verma', email: 'staff@championsclub.com', phone: '+91 98765 43211', role: 'Front Desk & Concierge Manager', department: 'Front Desk', shift: 'Morning (06:00 - 14:00)', salary: 45000, joinDate: '2021-02-10', status: 'Active' },
    { id: 'stf_4', name: 'Chef Manish Joshi', email: 'manish@championsclub.com', phone: '+91 98111 22336', role: 'Head Nutritionist & Barista', department: 'Food & Beverage', shift: 'Morning (07:00 - 15:00)', salary: 50000, joinDate: '2022-01-05', status: 'Active' },
    { id: 'stf_5', name: 'Ramesh Yadav', email: 'ramesh@championsclub.com', phone: '+91 98111 22337', role: 'Chief Groundsman & Turf Engineer', department: 'Maintenance', shift: 'Full Day (05:30 - 13:30)', salary: 38000, joinDate: '2017-09-01', status: 'Active' }
  ];

  for (const s of staffMembers) {
    await Employee.findOneAndUpdate({ email: s.email }, s, { upsert: true, returnDocument: 'after' });
  }

  // 9. Sample Bookings (Today and Recent)
  const todayStr = new Date().toISOString().split('T')[0];
  const sampleBookings = [
    {
      id: 'bkg_sample_1',
      courtId: 'court_1',
      courtName: 'Center Court 1',
      memberId: 'MEM-2026-001',
      memberName: 'Vikram Mehta',
      memberPhone: '+91 98765 43212',
      date: todayStr,
      startTime: '07:00',
      endTime: '08:00',
      bookingType: 'member',
      status: 'confirmed',
      amount: 0,
      baseAmount: 1200,
      discount: 1200,
      notes: 'Gold Member complimentary morning rally'
    },
    {
      id: 'bkg_sample_2',
      courtId: 'court_2',
      courtName: 'Red Clay Court 2',
      memberId: 'MEM-2026-002',
      memberName: 'Priya Sharma',
      memberPhone: '+91 98765 43213',
      date: todayStr,
      startTime: '08:30',
      endTime: '09:30',
      bookingType: 'member',
      status: 'confirmed',
      amount: 500,
      baseAmount: 1000,
      discount: 500,
      notes: 'Silver member 50% discount'
    },
    {
      id: 'bkg_sample_3',
      courtId: 'court_4',
      courtName: 'RoboArm Cricket Net 1',
      memberId: null,
      memberName: 'Karan Malhotra',
      memberPhone: '+91 98222 33445',
      date: todayStr,
      startTime: '16:00',
      endTime: '17:00',
      bookingType: 'walk-in',
      status: 'confirmed',
      amount: 1000,
      baseAmount: 1000,
      discount: 0,
      notes: 'Walk-in cricket net booking'
    }
  ];

  for (const b of sampleBookings) {
    await Booking.findOneAndUpdate({ id: b.id }, b, { upsert: true, returnDocument: 'after' });
  }

  // 10. Sample Transactions
  const sampleTransactions = [
    {
      id: 'txn_init_1',
      type: 'income',
      category: 'Membership',
      referenceId: 'MEM-2026-001',
      description: 'Annual Gold Tier Membership (Vikram Mehta)',
      amount: 45000,
      method: 'UPI',
      status: 'paid',
      memberName: 'Vikram Mehta',
      memberId: 'MEM-2026-001',
      createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000)
    },
    {
      id: 'txn_init_2',
      type: 'income',
      category: 'Membership',
      referenceId: 'MEM-2026-002',
      description: 'Annual Silver Tier Membership (Priya Sharma)',
      amount: 28000,
      method: 'Card',
      status: 'paid',
      memberName: 'Priya Sharma',
      memberId: 'MEM-2026-002',
      createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000)
    },
    {
      id: 'txn_init_3',
      type: 'income',
      category: 'Shop',
      referenceId: 'ORD-2026-0001',
      description: 'Pro Shop Sale: Babolat Pure Aero Racket + US Open Balls',
      amount: 20149,
      method: 'UPI',
      status: 'paid',
      memberName: 'Vikram Mehta',
      memberId: 'MEM-2026-001',
      createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000)
    },
    {
      id: 'txn_init_4',
      type: 'income',
      category: 'Bar',
      referenceId: 'BAR-2026-0001',
      description: 'Veranda Cafe Order: Smoothies & Sourdough Toasts',
      amount: 1240,
      method: 'Card',
      status: 'paid',
      memberName: 'Priya Sharma',
      memberId: 'MEM-2026-002',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000)
    },
    {
      id: 'txn_init_5',
      type: 'income',
      category: 'Courts',
      referenceId: 'bkg_sample_3',
      description: 'RoboArm Cricket Net 1 Walk-in Session',
      amount: 1000,
      method: 'UPI',
      status: 'paid',
      memberName: 'Karan Malhotra',
      memberId: null,
      createdAt: new Date()
    }
  ];

  for (const tx of sampleTransactions) {
    await Transaction.findOneAndUpdate({ id: tx.id }, tx, { upsert: true, returnDocument: 'after' });
  }

  // 11. Leads
  const sampleLeads = [
    {
      id: 'lead_1',
      name: 'Aditya Birla Group Team',
      email: 'sports@adityabirla.com',
      phone: '+91 99887 76655',
      interestedSport: 'Tennis & Cricket',
      membershipTier: 'Corporate Gold',
      source: 'Website Contact',
      status: 'new',
      notes: 'Interested in reserving weekly Saturday cricket net sessions for 25 executives.'
    },
    {
      id: 'lead_2',
      name: 'Siddharth Roy',
      email: 'siddharth@gmail.com',
      phone: '+91 98777 66554',
      interestedSport: 'Lawn Tennis',
      membershipTier: 'Gold',
      source: 'Trial Booking',
      status: 'trial_scheduled',
      trialDate: todayStr,
      trialTime: '17:30',
      assignedStaff: 'Coach Rajesh Kumar',
      notes: 'State-ranked amateur player interested in personal tournament training.'
    }
  ];

  for (const ld of sampleLeads) {
    await Lead.findOneAndUpdate({ email: ld.email }, ld, { upsert: true, returnDocument: 'after' });
  }

  // 12. Corporate Clients
  const sampleCorporate = [
    {
      id: 'corp_1',
      companyName: 'DLF CyberCity Tech Consortium',
      contactPerson: 'Megha Singhania',
      email: 'megha@dlfcyber.com',
      phone: '+91 98100 12345',
      contractValue: 240000,
      balanceDue: 40000,
      activeSlots: 4,
      renewalDate: '2026-08-31',
      status: 'Active'
    },
    {
      id: 'corp_2',
      companyName: 'McKinsey & Co. Gurgaon Club',
      contactPerson: 'Tarun Varma',
      email: 'tarun_varma@mckinsey.com',
      phone: '+91 98100 67890',
      contractValue: 180000,
      balanceDue: 0,
      activeSlots: 2,
      renewalDate: '2026-11-15',
      status: 'Active'
    }
  ];

  for (const cp of sampleCorporate) {
    await CorporateClient.findOneAndUpdate({ id: cp.id }, cp, { upsert: true, returnDocument: 'after' });
  }

  console.log('✅ Database seed check completed successfully!');
}
