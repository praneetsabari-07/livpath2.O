import { Job, EducationLevel } from '../types';

export const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Senior Tailor & Garment Stitcher',
    company: 'Salem Textiles & Exports Ltd.',
    location: 'Salem, Tamil Nadu',
    district: 'Salem',
    workType: 'Full-time',
    salary: '₹18,000 – ₹24,000 / month',
    salaryNumeric: 20000,
    minEducation: '10th_pass',
    educationLabel: '10th Standard Pass (SSLC)',
    skillsRequired: ['Tailoring', 'Stitching', 'Pattern Cutting', 'Garment Finishing'],
    demandLevel: 'critical',
    trainingAvailable: true,
    trainingNote: 'Free 2-week advanced industrial machine training with stipend.',
    description: 'We are hiring experienced & semi-experienced tailors for garment stitching, blouse design, and export-grade clothing assembly. Overtime pay and free lunch provided.',
    requirements: [
      'Basic knowledge of manual or power sewing machine',
      '10th pass qualification preferred (or equivalent practical skill)',
      'Ability to measure and follow apparel patterns',
      'Good teamwork and punctuality'
    ],
    contactPhone: '+91 98421 88760',
    distanceKm: 4.2,
    category: 'textile',
    icon: 'Scissors',
    badges: [
      { text: '10th Pass Friendly', color: 'bg-blue-100 text-blue-800' },
      { text: 'Free Training Included', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'Urgent Hiring Today', color: 'bg-amber-100 text-amber-800' }
    ]
  },
  {
    id: 'job-2',
    title: 'House Electrician & Wiring Technician',
    company: 'PowerGrid Electricals & Services',
    location: 'Coimbatore, Tamil Nadu',
    district: 'Coimbatore',
    workType: 'Full-time',
    salary: '₹16,000 – ₹22,000 / month',
    salaryNumeric: 19000,
    minEducation: '10th_pass',
    educationLabel: '10th Pass / ITI Preferred',
    skillsRequired: ['Electrician', 'House Wiring', 'Circuit Breakers', 'Troubleshooting'],
    demandLevel: 'high',
    trainingAvailable: true,
    trainingNote: 'Safety tools, safety helmet & electrical safety certification provided.',
    description: 'Looking for residential electricians for new building conduit wiring, switchboard fixing, inverter installation, and repair work across city.',
    requirements: [
      '10th Pass or ITI Electrical certificate',
      'Knowledge of single-phase and 3-phase wiring',
      'Own two-wheeler preferred for local travel allowance',
      'Safety consciousness and basic multimeter usage'
    ],
    contactPhone: '+91 94432 11980',
    distanceKm: 8.5,
    category: 'technical',
    icon: 'Zap',
    badges: [
      { text: '10th Pass / ITI', color: 'bg-blue-100 text-blue-800' },
      { text: 'Travel Allowance Provided', color: 'bg-purple-100 text-purple-800' }
    ]
  },
  {
    id: 'job-3',
    title: 'Junior Web Designer & Data Entry Assistant',
    company: 'NexTech Digital Solutions',
    location: 'Chennai / Remote Option',
    district: 'Chennai',
    workType: 'Full-time',
    salary: '₹20,000 – ₹28,000 / month',
    salaryNumeric: 24000,
    minEducation: '12th_pass',
    educationLabel: '12th Pass or Diploma / College',
    skillsRequired: ['Web Design', 'HTML/CSS Basics', 'Data Entry', 'Computer Basics', 'Typing'],
    demandLevel: 'high',
    trainingAvailable: true,
    trainingNote: 'Full mentorship on modern website builders (WordPress, Wix) and web layouts.',
    description: 'Join our friendly web team to build small business websites, upload product catalogs, manage customer spreadsheets, and perform web content updates.',
    requirements: [
      '12th standard pass or Diploma in Computer / IT',
      'Basic typing and computer operating skills',
      'Willingness to learn HTML, web design, and digital tools',
      'Good communication in local language and basic English'
    ],
    contactPhone: '+91 99620 44510',
    distanceKm: 12.0,
    category: 'tech',
    icon: 'Laptop',
    badges: [
      { text: '12th Pass / Fresher Welcome', color: 'bg-blue-100 text-blue-800' },
      { text: 'Computer Training', color: 'bg-emerald-100 text-emerald-800' }
    ]
  },
  {
    id: 'job-4',
    title: 'Arc & MIG Welder',
    company: 'Kovai Industrial Fabricators',
    location: 'Coimbatore, Tamil Nadu',
    district: 'Coimbatore',
    workType: 'Full-time',
    salary: '₹19,000 – ₹26,000 / month',
    salaryNumeric: 22500,
    minEducation: 'below_10th',
    educationLabel: 'Below 10th or 10th Pass',
    skillsRequired: ['Welding', 'Metal Fabrication', 'Grinding', 'Gas Cutting'],
    demandLevel: 'critical',
    trainingAvailable: true,
    trainingNote: 'Safety gear provided. Additional training for TIG welding provided.',
    description: 'Urgent requirement for structural welders and metal fabricators. High overtime incentives and quarterly bonuses.',
    requirements: [
      'Hands-on welding experience or ITI Welder',
      'Ability to read simple engineering drawings',
      'Physical fitness and safety adherence'
    ],
    contactPhone: '+91 97890 22340',
    distanceKm: 6.8,
    category: 'technical',
    icon: 'Flame',
    badges: [
      { text: 'No High Degree Needed', color: 'bg-green-100 text-green-800' },
      { text: 'High Overtime Pay', color: 'bg-amber-100 text-amber-800' }
    ]
  },
  {
    id: 'job-5',
    title: 'Express Delivery Partner & Dispatcher',
    company: 'FastTrack Logistics Hub',
    location: 'Salem & Surrounding Towns',
    district: 'Salem',
    workType: 'Full-time',
    salary: '₹18,000 – ₹25,000 / month (with incentives)',
    salaryNumeric: 21000,
    minEducation: 'below_10th',
    educationLabel: '8th Pass or 10th Pass',
    skillsRequired: ['Driving', 'Two-wheeler Delivery', 'Smartphone Usage', 'Customer Service'],
    demandLevel: 'high',
    trainingAvailable: true,
    trainingNote: 'App navigation and delivery route onboarding provided on Day 1.',
    description: 'Deliver e-commerce parcels, grocery orders, and documents in your chosen local area. Flexible shifts and daily fuel allowance.',
    requirements: [
      'Valid driving license (2-wheeler) or bicycle',
      'Basic smartphone usage for delivery apps',
      'Familiarity with local roads and colonies'
    ],
    contactPhone: '+91 93600 55430',
    distanceKm: 2.5,
    category: 'delivery',
    icon: 'Truck',
    badges: [
      { text: 'Immediate Joining', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'Fuel Allowance Included', color: 'bg-cyan-100 text-cyan-800' }
    ]
  },
  {
    id: 'job-6',
    title: 'Automobile Mechanic & Two-Wheeler Service',
    company: 'Apex Multi-brand Motor Works',
    location: 'Madurai, Tamil Nadu',
    district: 'Madurai',
    workType: 'Full-time',
    salary: '₹17,000 – ₹23,000 / month',
    salaryNumeric: 20000,
    minEducation: '10th_pass',
    educationLabel: '10th Pass or Vocational',
    skillsRequired: ['Auto Mechanic', 'Engine Repair', 'Brake Servicing', 'Oil Change'],
    demandLevel: 'high',
    trainingAvailable: true,
    trainingNote: 'Training on BS-6 fuel injection and EV bike diagnosis.',
    description: 'Full bike servicing, engine overhaul, electrical repairs, and water wash service for leading two-wheeler brands.',
    requirements: [
      'Basic mechanical aptitude or prior garage experience',
      '10th pass or ITI Automobile certificate',
      'Willingness to learn latest EV maintenance'
    ],
    contactPhone: '+91 98940 33210',
    distanceKm: 9.1,
    category: 'technical',
    icon: 'Wrench',
    badges: [
      { text: '10th Pass Suitable', color: 'bg-blue-100 text-blue-800' },
      { text: 'EV Training Free', color: 'bg-teal-100 text-teal-800' }
    ]
  },
  {
    id: 'job-7',
    title: 'Plumber & Pipe Fitting Specialist',
    company: 'Citywide Infrastructure Services',
    location: 'Salem, Tamil Nadu',
    district: 'Salem',
    workType: 'Contract',
    salary: '₹16,000 – ₹21,000 / month',
    salaryNumeric: 18500,
    minEducation: 'below_10th',
    educationLabel: 'Below 10th or 10th Pass',
    skillsRequired: ['Plumbing', 'Pipe Fitting', 'Sanitary Installation', 'Leakage Repair'],
    demandLevel: 'medium',
    trainingAvailable: true,
    trainingNote: 'Modern CPVC and PPR pipe welding tools provided.',
    description: 'Residential & commercial plumbing contracts. Includes CPVC piping, bathroom fixture fittings, water tank pipeline connections.',
    requirements: [
      'Basic plumbing tool handling knowledge',
      'Hardworking and cooperative personality',
      'Ability to travel locally within district'
    ],
    contactPhone: '+91 94860 77120',
    distanceKm: 5.0,
    category: 'services',
    icon: 'Droplet',
    badges: [
      { text: 'No Degree Required', color: 'bg-green-100 text-green-800' }
    ]
  },
  {
    id: 'job-8',
    title: 'Chef Assistant & Catering Cook',
    company: 'Annapoorna Caterers & Kitchens',
    location: 'Salem, Tamil Nadu',
    district: 'Salem',
    workType: 'Full-time',
    salary: '₹16,000 – ₹22,000 / month + Free Food & Stay',
    salaryNumeric: 19000,
    minEducation: 'below_10th',
    educationLabel: 'Any Qualification / School',
    skillsRequired: ['Cooking', 'Food Prep', 'Vegetable Cutting', 'Kitchen Hygiene', 'Catering'],
    demandLevel: 'high',
    trainingAvailable: true,
    trainingNote: 'South Indian & North Indian recipes culinary guidance provided.',
    description: 'Assist master chefs in preparation of morning breakfast, meals, sweet dishes, and function catering. Free hygienic accommodation and meals provided.',
    requirements: [
      'Passion for cooking and kitchen hygiene',
      'Good health and ability to work in busy kitchen shifts',
      'No formal degree needed'
    ],
    contactPhone: '+91 97500 11223',
    distanceKm: 3.1,
    category: 'hospitality',
    icon: 'Utensils',
    badges: [
      { text: 'Free Food & Accommodation', color: 'bg-emerald-100 text-emerald-800' },
      { text: 'No Degree Required', color: 'bg-green-100 text-green-800' }
    ]
  },
  {
    id: 'job-9',
    title: 'Apparel Quality Checker & Packaging Supervisor',
    company: 'Royal Garments International',
    location: 'Tirupur, Tamil Nadu',
    district: 'Tirupur',
    workType: 'Full-time',
    salary: '₹17,000 – ₹23,000 / month',
    salaryNumeric: 20000,
    minEducation: '10th_pass',
    educationLabel: '10th Standard Pass (SSLC)',
    skillsRequired: ['Quality Inspection', 'Tailoring Knowledge', 'Packaging', 'Barcoding'],
    demandLevel: 'high',
    trainingAvailable: true,
    trainingNote: 'Garment export defect measurement and barcode scanning training.',
    description: 'Inspect finished stitched garments for stitching defects, loose threads, measurements, and prepare export packing boxes.',
    requirements: [
      '10th standard pass minimum',
      'Attention to detail and good eyesight',
      'Basic knowledge of clothing or stitching'
    ],
    contactPhone: '+91 98430 99881',
    distanceKm: 14.2,
    category: 'textile',
    icon: 'CheckCircle',
    badges: [
      { text: '10th Pass Friendly', color: 'bg-blue-100 text-blue-800' },
      { text: 'Clean Factory Environment', color: 'bg-purple-100 text-purple-800' }
    ]
  },
  {
    id: 'job-10',
    title: 'CNC Machine Operator & Trainee',
    company: 'Precision Engineering Components',
    location: 'Hosur / Salem, Tamil Nadu',
    district: 'Salem',
    workType: 'Full-time',
    salary: '₹19,000 – ₹25,000 / month',
    salaryNumeric: 22000,
    minEducation: '10th_pass',
    educationLabel: '10th Pass / ITI or Diploma',
    skillsRequired: ['CNC Operator', 'Lathe Machine', 'Vernier Caliper', 'Engineering Basics'],
    demandLevel: 'high',
    trainingAvailable: true,
    trainingNote: 'Govt certified CNC programming and operation certificate issued after 3 months.',
    description: 'Load metal raw materials, monitor computerized cutting machines, inspect component dimensions using vernier and micrometer instruments.',
    requirements: [
      '10th standard pass or ITI Machinist / Fitter',
      'Basic math calculation skills',
      'Willingness to work in rotating factory shifts'
    ],
    contactPhone: '+91 94440 66772',
    distanceKm: 11.5,
    category: 'technical',
    icon: 'Cpu',
    badges: [
      { text: '10th Pass / ITI', color: 'bg-blue-100 text-blue-800' },
      { text: 'Certification Included', color: 'bg-emerald-100 text-emerald-800' }
    ]
  },
  {
    id: 'job-11',
    title: 'Retail Store Assistant & Billing Clerk',
    company: 'SmartMart Hypermarket',
    location: 'Salem, Tamil Nadu',
    district: 'Salem',
    workType: 'Full-time',
    salary: '₹15,000 – ₹19,000 / month',
    salaryNumeric: 17000,
    minEducation: '10th_pass',
    educationLabel: '10th Pass or 12th Pass',
    skillsRequired: ['Customer Service', 'Cash Billing', 'Stock Arrangement', 'Barcode Scanning'],
    demandLevel: 'medium',
    trainingAvailable: true,
    trainingNote: 'POS billing computer software training provided.',
    description: 'Help retail store shoppers find grocery items, arrange store shelves, handle barcode billing, and ensure store tidiness.',
    requirements: [
      '10th Pass minimum',
      'Friendly customer speaking attitude',
      'Basic calculation and counting skills'
    ],
    contactPhone: '+91 99940 88214',
    distanceKm: 1.8,
    category: 'retail',
    icon: 'ShoppingBag',
    badges: [
      { text: 'Nearby Location (1.8 km)', color: 'bg-emerald-100 text-emerald-800' },
      { text: '10th Pass Friendly', color: 'bg-blue-100 text-blue-800' }
    ]
  },
  {
    id: 'job-12',
    title: 'Security Guard & Gate Management',
    company: 'Apex Security & Facility Management',
    location: 'Salem, Tamil Nadu',
    district: 'Salem',
    workType: 'Full-time',
    salary: '₹15,500 – ₹18,500 / month + Free Uniform',
    salaryNumeric: 17000,
    minEducation: 'below_10th',
    educationLabel: '8th Pass or 10th Pass',
    skillsRequired: ['Security Guard', 'Visitor Log Entry', 'Night Surveillance', 'Discipline'],
    demandLevel: 'high',
    trainingAvailable: true,
    trainingNote: 'Fire safety and access control training provided.',
    description: 'Monitor apartment complex and commercial office entry gates, log visitor details, manage vehicle parking, and perform security rounds.',
    requirements: [
      'Age between 20 to 50 years',
      'Good physical fitness and alertness',
      'Free uniforms, shoes, and PF/ESI benefits provided'
    ],
    contactPhone: '+91 98410 77651',
    distanceKm: 3.5,
    category: 'services',
    icon: 'Shield',
    badges: [
      { text: 'PF & ESI Included', color: 'bg-indigo-100 text-indigo-800' },
      { text: 'Free Uniforms', color: 'bg-green-100 text-green-800' }
    ]
  }
];

export const EDUCATION_ORDER: Record<EducationLevel, number> = {
  'below_10th': 1,
  '10th_pass': 2,
  '12th_pass': 3,
  'iti_vocational': 3,
  'diploma': 4,
  'graduate': 5
};
