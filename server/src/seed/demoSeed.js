/**
 * ============================================================
 *  SKILLFORCE CONNECT — DEMO SEED SCRIPT
 *  File: server/src/seed/demoSeed.js
 *  Run:  node server/src/seed/demoSeed.js
 * ============================================================
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../..', 'server/.env') });
const mongoose = require('mongoose');

// ── Models ────────────────────────────────────────────────────────────────────
const User             = require('../models/User');
const OrganizationProfile = require('../models/OrganizationProfile');
const ProviderProfile  = require('../models/ProviderProfile');
const Job              = require('../models/Job');
const Application      = require('../models/Application');
const Contract         = require('../models/Contract');
const Message          = require('../models/Message');
const Notification     = require('../models/Notification');
const Review           = require('../models/Review');
const Subscription     = require('../models/Subscription');
const Payment          = require('../models/Payment');
const Report           = require('../models/Report');
const ActivityLog      = require('../models/ActivityLog');

const PASS = 'SkillForce@123';
const daysAgo = (n) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

// ── Connect ───────────────────────────────────────────────────────────────────
async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) { console.error('❌  MONGO_URI not found in .env'); process.exit(1); }
  await mongoose.connect(uri);
  console.log('✅  MongoDB connected');
}

// ── Cleanup ───────────────────────────────────────────────────────────────────
async function cleanup() {
  console.log('\n🧹  Cleaning up previous demo data...');
  const demoEmails = [
    'summit.solutions@gmail.com','himalayan.services@gmail.com','kathmandu.facilities@gmail.com',
    'pokhara.hospitality@gmail.com','chitwan.security@gmail.com','biratnagar.logistics@gmail.com',
    'lalitpur.techsolutions@gmail.com','butwal.construction@gmail.com','dharan.healthcare@gmail.com',
    'nepalgunj.events@gmail.com',
    'aarav.shrestha@gmail.com','priya.tamang@gmail.com','bikash.rai@gmail.com',
    'sunita.gurung@gmail.com','dipesh.thapa@gmail.com','anita.maharjan@gmail.com',
    'roshan.karki@gmail.com','sita.poudel@gmail.com','nabin.limbu@gmail.com',
    'kamala.bhandari@gmail.com',
  ];
  const users = await User.find({ email: { $in: demoEmails } });
  const ids = users.map(u => u._id);
  if (ids.length) {
    await Promise.all([
      User.deleteMany({ _id: { $in: ids } }),
      OrganizationProfile.deleteMany({ userId: { $in: ids } }),
      ProviderProfile.deleteMany({ userId: { $in: ids } }),
      Subscription.deleteMany({ userId: { $in: ids } }),
      Payment.deleteMany({ userId: { $in: ids } }),
      ActivityLog.deleteMany({ userId: { $in: ids } }),
      Notification.deleteMany({ userId: { $in: ids } }),
    ]);
    const jobs = await Job.find({ organizationId: { $in: ids } });
    const jobIds = jobs.map(j => j._id);
    if (jobIds.length) {
      await Promise.all([
        Job.deleteMany({ _id: { $in: jobIds } }),
        Application.deleteMany({ jobId: { $in: jobIds } }),
        Contract.deleteMany({ jobId: { $in: jobIds } }),
        Review.deleteMany({ jobId: { $in: jobIds } }),
        Message.deleteMany({ jobId: { $in: jobIds } }),
        Report.deleteMany({ targetId: { $in: jobIds } }),
      ]);
    }
  }
  console.log('✅  Cleanup complete');
}

// ── SEED ORGANIZATIONS ────────────────────────────────────────────────────────
async function seedOrganizations(plainPass) {
  console.log('\n🏢  Seeding organizations...');
  const orgsData = [
    {
      name: 'Rajesh Shrestha', email: 'summit.solutions@gmail.com',
      orgType: 'hiring', trustScore: 88, verified: true,
      createdAt: daysAgo(120),
      profile: {
        companyName: 'Summit Solutions Pvt. Ltd.',
        description: 'Leading facility management company in Kathmandu providing cleaning, security, and maintenance services to corporate offices and hotels since 2015.',
        industry: 'Facility Management', location: 'New Baneshwor, Kathmandu',
        district: 'Kathmandu', phone: '9841234567', website: 'www.summitsolutions.com.np',
        establishedYear: 2015, employeeCount: '50-100',
        requiredSkills: ['cleaning', 'security', 'maintenance', 'housekeeping'],
        totalJobsPosted: 12, totalHires: 9, rating: 4.5, totalReviews: 9,
      },
      plan: 'enterprise', priceNPR: 999,
    },
    {
      name: 'Sushila Tamang', email: 'himalayan.services@gmail.com',
      orgType: 'hiring', trustScore: 82, verified: true,
      createdAt: daysAgo(95),
      profile: {
        companyName: 'Himalayan Hospitality Services',
        description: 'Premium hotel and restaurant staffing agency serving 5-star properties across Kathmandu Valley. Specializing in trained waiters, chefs, and event staff.',
        industry: 'Hospitality', location: 'Thamel, Kathmandu',
        district: 'Kathmandu', phone: '9851234568', website: 'www.himalayanhospitality.com.np',
        establishedYear: 2018, employeeCount: '20-50',
        requiredSkills: ['waiter', 'chef', 'bartender', 'event staff', 'receptionist'],
        totalJobsPosted: 8, totalHires: 6, rating: 4.3, totalReviews: 6,
      },
      plan: 'pro', priceNPR: 150,
    },
    {
      name: 'Binod Karmacharya', email: 'kathmandu.facilities@gmail.com',
      orgType: 'hiring', trustScore: 75, verified: true,
      createdAt: daysAgo(80),
      profile: {
        companyName: 'Kathmandu Facilities Management',
        description: 'Corporate facility management company providing integrated services including electrical, plumbing, HVAC, and general maintenance for commercial buildings.',
        industry: 'Facility Management', location: 'Pulchowk, Lalitpur',
        district: 'Lalitpur', phone: '9861234569', website: 'www.ktmfacilities.com.np',
        establishedYear: 2017, employeeCount: '20-50',
        requiredSkills: ['electrician', 'plumber', 'AC technician', 'mason', 'painter'],
        totalJobsPosted: 10, totalHires: 7, rating: 4.1, totalReviews: 7,
      },
      plan: 'pro', priceNPR: 150,
    },
    {
      name: 'Meena Gurung', email: 'pokhara.hospitality@gmail.com',
      orgType: 'hiring', trustScore: 79, verified: true,
      createdAt: daysAgo(70),
      profile: {
        companyName: 'Pokhara Lakeside Hospitality',
        description: 'Resort and trekking lodge management company in Pokhara. We hire seasonal and permanent hospitality staff for our 3 properties near Phewa Lake.',
        industry: 'Tourism & Hospitality', location: 'Lakeside, Pokhara',
        district: 'Kaski', phone: '9871234570', website: 'www.pokharalakeside.com.np',
        establishedYear: 2016, employeeCount: '10-20',
        requiredSkills: ['waiter', 'cook', 'housekeeper', 'tour guide', 'receptionist'],
        totalJobsPosted: 6, totalHires: 5, rating: 4.4, totalReviews: 5,
      },
      plan: 'pro', priceNPR: 150,
    },
    {
      name: 'Prakash Adhikari', email: 'chitwan.security@gmail.com',
      orgType: 'hiring', trustScore: 85, verified: true,
      createdAt: daysAgo(60),
      profile: {
        companyName: 'Chitwan Security & Guard Services',
        description: 'Licensed security agency providing trained security guards, bouncers, and event security personnel across Chitwan and Narayanghat districts.',
        industry: 'Security Services', location: 'Bharatpur, Chitwan',
        district: 'Chitwan', phone: '9841234571', website: 'www.chitwansecurity.com.np',
        establishedYear: 2014, employeeCount: '100-200',
        requiredSkills: ['security guard', 'bouncer', 'CCTV operator', 'patrol officer'],
        totalJobsPosted: 15, totalHires: 12, rating: 4.6, totalReviews: 12,
      },
      plan: 'enterprise', priceNPR: 999,
    },
    {
      name: 'Anupama Rai', email: 'biratnagar.logistics@gmail.com',
      orgType: 'hiring', trustScore: 71, verified: true,
      createdAt: daysAgo(50),
      profile: {
        companyName: 'Biratnagar Logistics & Delivery',
        description: 'Last-mile delivery and logistics company operating in Morang and Sunsari districts. We hire delivery riders, warehouse staff, and loading helpers.',
        industry: 'Logistics & Delivery', location: 'Biratnagar, Morang',
        district: 'Morang', phone: '9851234572', website: 'www.biratnagarlogi.com.np',
        establishedYear: 2019, employeeCount: '20-50',
        requiredSkills: ['delivery rider', 'driver', 'warehouse staff', 'loader'],
        totalJobsPosted: 7, totalHires: 5, rating: 3.9, totalReviews: 5,
      },
      plan: 'free', priceNPR: 0,
    },
    {
      name: 'Suresh Maharjan', email: 'lalitpur.techsolutions@gmail.com',
      orgType: 'hiring', trustScore: 90, verified: true,
      createdAt: daysAgo(45),
      profile: {
        companyName: 'Lalitpur Tech Solutions Pvt. Ltd.',
        description: 'IT services company in Patan providing software development, IT support, and office assistant services. We hire both technical and non-technical staff.',
        industry: 'Information Technology', location: 'Patan, Lalitpur',
        district: 'Lalitpur', phone: '9861234573', website: 'www.lalipurtechsolutions.com.np',
        establishedYear: 2020, employeeCount: '10-20',
        requiredSkills: ['office assistant', 'IT support', 'data entry', 'receptionist'],
        totalJobsPosted: 5, totalHires: 4, rating: 4.7, totalReviews: 4,
      },
      plan: 'pro', priceNPR: 150,
    },
    {
      name: 'Gita Thapa', email: 'butwal.construction@gmail.com',
      orgType: 'hiring', trustScore: 68, verified: false,
      createdAt: daysAgo(35),
      profile: {
        companyName: 'Butwal Construction & Builders',
        description: 'Construction company based in Butwal handling residential and commercial projects. We regularly hire skilled masons, carpenters, painters, and laborers.',
        industry: 'Construction', location: 'Butwal, Rupandehi',
        district: 'Rupandehi', phone: '9871234574', website: '',
        establishedYear: 2012, employeeCount: '50-100',
        requiredSkills: ['mason', 'carpenter', 'painter', 'welder', 'laborer'],
        totalJobsPosted: 9, totalHires: 7, rating: 3.8, totalReviews: 7,
      },
      plan: 'free', priceNPR: 0,
    },
    {
      name: 'Dr. Ramesh Poudel', email: 'dharan.healthcare@gmail.com',
      orgType: 'hiring', trustScore: 92, verified: true,
      createdAt: daysAgo(25),
      profile: {
        companyName: 'Dharan Healthcare & Nursing Services',
        description: 'Healthcare staffing agency providing trained nurses, ward boys, and medical assistants to hospitals and clinics across Sunsari and Dhankuta districts.',
        industry: 'Healthcare', location: 'Dharan, Sunsari',
        district: 'Sunsari', phone: '9841234575', website: 'www.dharanhealthcare.com.np',
        establishedYear: 2016, employeeCount: '20-50',
        requiredSkills: ['nurse', 'ward boy', 'medical assistant', 'caregiver', 'pharmacist'],
        totalJobsPosted: 11, totalHires: 9, rating: 4.8, totalReviews: 9,
      },
      plan: 'enterprise', priceNPR: 999,
    },
    {
      name: 'Kabita Lama', email: 'nepalgunj.events@gmail.com',
      orgType: 'hiring', trustScore: 73, verified: true,
      createdAt: daysAgo(15),
      profile: {
        companyName: 'Nepalgunj Events & Catering',
        description: 'Event management and catering company in Banke district. We organize weddings, corporate events, and festivals, hiring event staff, cooks, and decorators.',
        industry: 'Events & Catering', location: 'Nepalgunj, Banke',
        district: 'Banke', phone: '9851234576', website: 'www.nepalgunjevents.com.np',
        establishedYear: 2018, employeeCount: '10-20',
        requiredSkills: ['event staff', 'cook', 'decorator', 'waiter', 'DJ'],
        totalJobsPosted: 4, totalHires: 3, rating: 4.2, totalReviews: 3,
      },
      plan: 'pro', priceNPR: 150,
    },
  ];

  const orgs = [];
  for (const d of orgsData) {
    const user = await User.create({
      name: d.name, email: d.email, password: plainPass,
      role: 'organization', orgType: d.orgType,
      trustScore: d.trustScore, verified: d.verified,
      suspended: false, messagingUnlocked: true,
      createdAt: d.createdAt, updatedAt: d.createdAt,
    });
    await OrganizationProfile.create({ userId: user._id, ...d.profile });
    const sub = await Subscription.create({
      userId: user._id, plan: d.plan, active: true,
      priceNPR: d.priceNPR,
      startDate: d.createdAt,
      endDate: new Date(d.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
      features: d.plan === 'enterprise'
        ? ['All Pro features','Featured placement','Analytics dashboard','Dedicated account manager','API access','Team management']
        : d.plan === 'pro'
        ? ['Verified badge','Unlimited applications','Priority support','Unlimited messaging','Contract generator']
        : ['Basic profile','5 applications/month','Email support','10 free messages'],
      paymentMethod: d.plan !== 'free' ? 'esewa' : '',
      paymentId: d.plan !== 'free' ? `ESEWA-ORG-${user._id}` : '',
    });
    await User.findByIdAndUpdate(user._id, { subscription: sub._id });
    if (d.plan !== 'free') {
      await Payment.create({
        userId: user._id, amount: d.priceNPR, currency: 'NPR',
        status: 'completed', paymentGateway: 'esewa',
        purchaseOrderId: `PO-ORG-${user._id}-${Date.now()}`,
        paymentId: `ESEWA-${Date.now()}`,
        type: 'subscription',
        meta: { plan: d.plan },
        createdAt: d.createdAt,
      });
    }
    orgs.push(user);
  }
  console.log(`✅  ${orgs.length} organizations created`);
  return orgs;
}

// ── SEED PROVIDERS ────────────────────────────────────────────────────────────
async function seedProviders(plainPass) {
  console.log('\n👷  Seeding providers...');
  const providersData = [
    {
      name: 'Aarav Shrestha', email: 'aarav.shrestha@gmail.com',
      trustScore: 87, verified: true, createdAt: daysAgo(110),
      profile: {
        skills: ['electrician', 'AC technician', 'wiring', 'solar installation'],
        experience: '7 years of experience as a licensed electrician. Worked with major construction companies in Kathmandu. Certified in solar panel installation and AC servicing.',
        bio: 'Professional electrician based in Kathmandu with 7+ years of experience. I specialize in residential and commercial electrical work, AC installation, and solar systems. Available for both short-term and long-term contracts.',
        location: 'Baneshwor, Kathmandu', phone: '9841111001',
        hourlyRate: 800, rating: 4.7, totalReviews: 23, totalJobsCompleted: 23,
        totalEarnings: 345000, availability: 'available', workMode: 'freelance',
        verificationStatus: 'approved', languages: ['Nepali', 'Hindi', 'English'],
        education: 'Diploma in Electrical Engineering, Thapathali Campus 2016',
        certifications: [{ name: 'Licensed Electrician', issuer: 'Nepal Electricity Authority', year: 2016 }],
      },
      plan: 'pro', priceNPR: 150,
    },
    {
      name: 'Priya Tamang', email: 'priya.tamang@gmail.com',
      trustScore: 82, verified: true, createdAt: daysAgo(90),
      profile: {
        skills: ['chef', 'cook', 'Nepali cuisine', 'continental cuisine', 'baking'],
        experience: '5 years as a professional chef in Kathmandu hotels. Trained in Nepali, Indian, and Continental cuisine. Previously worked at Hotel Yak & Yeti and Dwarika\'s Hotel.',
        bio: 'Experienced chef with 5 years in 4-star and 5-star hotels in Kathmandu. I can handle large-scale catering, daily meal preparation, and special event cooking. Passionate about authentic Nepali cuisine.',
        location: 'Thamel, Kathmandu', phone: '9851111002',
        hourlyRate: 700, rating: 4.6, totalReviews: 18, totalJobsCompleted: 18,
        totalEarnings: 270000, availability: 'available', workMode: 'any',
        verificationStatus: 'approved', languages: ['Nepali', 'English'],
        education: 'Hotel Management Diploma, Kathmandu College of Management 2018',
        certifications: [{ name: 'Food Safety Certificate', issuer: 'Nepal Food Safety Board', year: 2019 }],
      },
      plan: 'pro', priceNPR: 150,
    },
    {
      name: 'Bikash Rai', email: 'bikash.rai@gmail.com',
      trustScore: 79, verified: true, createdAt: daysAgo(85),
      profile: {
        skills: ['security guard', 'CCTV operation', 'crowd control', 'first aid', 'patrol'],
        experience: '8 years in security services. Former Nepal Army personnel. Experienced in VIP security, event security, and corporate building security.',
        bio: 'Retired Nepal Army soldier with 8 years of professional security experience. I provide reliable, disciplined security services for corporate offices, events, and residential properties. Trained in first aid and emergency response.',
        location: 'Dharan, Sunsari', phone: '9861111003',
        hourlyRate: 600, rating: 4.8, totalReviews: 31, totalJobsCompleted: 31,
        totalEarnings: 465000, availability: 'available', workMode: 'full-time',
        verificationStatus: 'approved', languages: ['Nepali', 'Hindi'],
        education: 'SLC, Dharan Higher Secondary School 2010',
        certifications: [{ name: 'Security Guard License', issuer: 'Nepal Police', year: 2015 }],
      },
      plan: 'pro', priceNPR: 150,
    },
    {
      name: 'Sunita Gurung', email: 'sunita.gurung@gmail.com',
      trustScore: 76, verified: true, createdAt: daysAgo(75),
      profile: {
        skills: ['cleaning', 'housekeeping', 'laundry', 'deep cleaning', 'office cleaning'],
        experience: '4 years of professional cleaning and housekeeping experience in hotels and corporate offices in Pokhara and Kathmandu.',
        bio: 'Dedicated and reliable cleaning professional with 4 years of experience. I provide thorough cleaning services for hotels, offices, and residential properties. Known for attention to detail and punctuality.',
        location: 'Lakeside, Pokhara', phone: '9871111004',
        hourlyRate: 400, rating: 4.4, totalReviews: 15, totalJobsCompleted: 15,
        totalEarnings: 120000, availability: 'available', workMode: 'part-time',
        verificationStatus: 'approved', languages: ['Nepali'],
        education: 'SEE, Pokhara Secondary School 2015',
        certifications: [],
      },
      plan: 'free', priceNPR: 0,
    },
    {
      name: 'Dipesh Thapa', email: 'dipesh.thapa@gmail.com',
      trustScore: 84, verified: true, createdAt: daysAgo(65),
      profile: {
        skills: ['plumber', 'pipe fitting', 'bathroom installation', 'water tank', 'drainage'],
        experience: '6 years as a licensed plumber. Handled major plumbing projects for residential complexes and commercial buildings in Lalitpur and Kathmandu.',
        bio: 'Skilled plumber with 6 years of hands-on experience. I handle everything from minor repairs to complete bathroom installations and drainage systems. Available for emergency calls.',
        location: 'Patan, Lalitpur', phone: '9841111005',
        hourlyRate: 750, rating: 4.5, totalReviews: 20, totalJobsCompleted: 20,
        totalEarnings: 300000, availability: 'available', workMode: 'freelance',
        verificationStatus: 'approved', languages: ['Nepali', 'Hindi'],
        education: 'Diploma in Civil Engineering, Pulchowk Campus 2017',
        certifications: [{ name: 'Plumbing License', issuer: 'Nepal Plumbing Association', year: 2018 }],
      },
      plan: 'pro', priceNPR: 150,
    },
    {
      name: 'Anita Maharjan', email: 'anita.maharjan@gmail.com',
      trustScore: 72, verified: true, createdAt: daysAgo(55),
      profile: {
        skills: ['receptionist', 'office assistant', 'data entry', 'MS Office', 'customer service'],
        experience: '3 years as a receptionist and office assistant in corporate offices in Lalitpur. Proficient in MS Office, email management, and customer handling.',
        bio: 'Professional receptionist and office assistant with 3 years of corporate experience. I am organized, presentable, and skilled in managing front desk operations, scheduling, and administrative tasks.',
        location: 'Jawalakhel, Lalitpur', phone: '9851111006',
        hourlyRate: 500, rating: 4.2, totalReviews: 11, totalJobsCompleted: 11,
        totalEarnings: 110000, availability: 'available', workMode: 'full-time',
        verificationStatus: 'approved', languages: ['Nepali', 'English'],
        education: 'BBS, Tribhuvan University 2020',
        certifications: [{ name: 'Computer Operator Certificate', issuer: 'CTEVT', year: 2019 }],
      },
      plan: 'free', priceNPR: 0,
    },
    {
      name: 'Roshan Karki', email: 'roshan.karki@gmail.com',
      trustScore: 80, verified: true, createdAt: daysAgo(48),
      profile: {
        skills: ['driver', 'heavy vehicle', 'logistics', 'delivery', 'route planning'],
        experience: '9 years of professional driving experience. Licensed for heavy vehicles, buses, and motorcycles. Experienced in long-distance logistics routes across Nepal.',
        bio: 'Professional driver with 9 years of experience and a clean driving record. I am available for corporate transport, delivery services, and long-distance logistics. Familiar with all major routes across Nepal.',
        location: 'Biratnagar, Morang', phone: '9861111007',
        hourlyRate: 650, rating: 4.6, totalReviews: 28, totalJobsCompleted: 28,
        totalEarnings: 420000, availability: 'busy', workMode: 'full-time',
        verificationStatus: 'approved', languages: ['Nepali', 'Hindi'],
        education: 'SLC, Biratnagar Secondary School 2008',
        certifications: [{ name: 'Heavy Vehicle License', issuer: 'Department of Transport', year: 2014 }],
      },
      plan: 'pro', priceNPR: 150,
    },
    {
      name: 'Sita Poudel', email: 'sita.poudel@gmail.com',
      trustScore: 69, verified: false, createdAt: daysAgo(38),
      profile: {
        skills: ['waiter', 'bartender', 'event staff', 'food service', 'table setting'],
        experience: '2 years as a waiter and event staff in Kathmandu restaurants and wedding events.',
        bio: 'Energetic and customer-focused waiter with 2 years of experience in restaurants and events. I am well-groomed, punctual, and skilled in providing excellent dining experiences.',
        location: 'Bhaktapur', phone: '9871111008',
        hourlyRate: 450, rating: 4.0, totalReviews: 8, totalJobsCompleted: 8,
        totalEarnings: 72000, availability: 'available', workMode: 'part-time',
        verificationStatus: 'pending', languages: ['Nepali'],
        education: 'SEE, Bhaktapur Secondary School 2019',
        certifications: [],
      },
      plan: 'free', priceNPR: 0,
    },
    {
      name: 'Nabin Limbu', email: 'nabin.limbu@gmail.com',
      trustScore: 88, verified: true, createdAt: daysAgo(28),
      profile: {
        skills: ['mason', 'carpenter', 'construction', 'tiling', 'concrete work'],
        experience: '10 years in construction. Worked on major building projects in Kathmandu, Pokhara, and Butwal. Expert in masonry, tiling, and concrete finishing.',
        bio: 'Highly experienced mason and carpenter with 10 years in the construction industry. I deliver quality work on time and within budget. Available for both residential and commercial projects.',
        location: 'Butwal, Rupandehi', phone: '9841111009',
        hourlyRate: 700, rating: 4.9, totalReviews: 35, totalJobsCompleted: 35,
        totalEarnings: 595000, availability: 'available', workMode: 'any',
        verificationStatus: 'approved', languages: ['Nepali', 'Hindi'],
        education: 'SLC, Butwal Secondary School 2007',
        certifications: [{ name: 'Construction Safety Certificate', issuer: 'Nepal Engineers Association', year: 2016 }],
      },
      plan: 'pro', priceNPR: 150,
    },
    {
      name: 'Kamala Bhandari', email: 'kamala.bhandari@gmail.com',
      trustScore: 74, verified: true, createdAt: daysAgo(18),
      profile: {
        skills: ['caregiver', 'nurse assistant', 'elderly care', 'patient care', 'first aid'],
        experience: '4 years as a caregiver and nursing assistant in Dharan and Biratnagar hospitals. Trained in patient care, medication management, and elderly assistance.',
        bio: 'Compassionate and trained caregiver with 4 years of experience in healthcare settings. I provide professional care for elderly patients, post-surgery recovery, and home nursing assistance.',
        location: 'Dharan, Sunsari', phone: '9851111010',
        hourlyRate: 550, rating: 4.3, totalReviews: 13, totalJobsCompleted: 13,
        totalEarnings: 143000, availability: 'available', workMode: 'full-time',
        verificationStatus: 'approved', languages: ['Nepali', 'Hindi'],
        education: 'ANM Nursing, Dharan Nursing Campus 2019',
        certifications: [{ name: 'ANM Certificate', issuer: 'Nepal Nursing Council', year: 2019 }],
      },
      plan: 'free', priceNPR: 0,
    },
  ];

  const providers = [];
  for (const d of providersData) {
    const user = await User.create({
      name: d.name, email: d.email, password: plainPass,
      role: 'provider', trustScore: d.trustScore, verified: d.verified,
      suspended: false, messagingUnlocked: d.plan !== 'free',
      createdAt: d.createdAt, updatedAt: d.createdAt,
    });
    await ProviderProfile.create({ userId: user._id, ...d.profile });
    const sub = await Subscription.create({
      userId: user._id, plan: d.plan, active: true, priceNPR: d.priceNPR,
      startDate: d.createdAt,
      endDate: new Date(d.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000),
      features: d.plan === 'pro'
        ? ['Verified badge','Unlimited applications','Priority support','Unlimited messaging','Contract generator']
        : ['Basic profile','5 applications/month','Email support','10 free messages'],
      paymentMethod: d.plan !== 'free' ? 'khalti' : '',
      paymentId: d.plan !== 'free' ? `KHALTI-PROV-${user._id}` : '',
    });
    await User.findByIdAndUpdate(user._id, { subscription: sub._id });
    if (d.plan !== 'free') {
      await Payment.create({
        userId: user._id, amount: d.priceNPR, currency: 'NPR',
        status: 'completed', paymentGateway: 'khalti',
        purchaseOrderId: `PO-PROV-${user._id}-${Date.now()}`,
        paymentId: `KHALTI-${Date.now()}`,
        type: 'subscription', meta: { plan: d.plan },
        createdAt: d.createdAt,
      });
    }
    providers.push(user);
  }
  console.log(`✅  ${providers.length} providers created`);
  return providers;
}

// ── SEED JOBS ─────────────────────────────────────────────────────────────────
async function seedJobs(orgs) {
  console.log('\n💼  Seeding jobs...');
  const [o0,o1,o2,o3,o4,o5,o6,o7,o8,o9] = orgs;
  const jobsData = [
    {
      organizationId: o0._id, title: 'Senior Security Guard – Corporate Office',
      description: 'We require an experienced security guard for our corporate office in New Baneshwor. Duties include access control, CCTV monitoring, visitor management, and night patrol. Must have prior experience in corporate security.',
      category: 'Security', budget: 25000, deadline: daysAgo(-30),
      location: 'New Baneshwor, Kathmandu', district: 'Kathmandu',
      skillsRequired: ['security guard', 'CCTV operation', 'patrol', 'access control'],
      status: 'open', urgency: 'urgent', jobType: 'full-time',
      applicantCount: 4, createdAt: daysAgo(25),
    },
    {
      organizationId: o1._id, title: 'Head Chef – Thamel Restaurant',
      description: 'Himalayan Hospitality Services is looking for an experienced head chef for our new restaurant in Thamel. Must be skilled in Nepali, Indian, and Continental cuisine. Will manage a team of 3 kitchen staff.',
      category: 'Hospitality', budget: 45000, deadline: daysAgo(-20),
      location: 'Thamel, Kathmandu', district: 'Kathmandu',
      skillsRequired: ['chef', 'Nepali cuisine', 'continental cuisine', 'kitchen management'],
      status: 'in-progress', urgency: 'high', jobType: 'full-time',
      applicantCount: 6, contractGenerated: true, assignedProviderId: null,
      createdAt: daysAgo(40),
    },
    {
      organizationId: o2._id, title: 'Licensed Electrician – Commercial Building',
      description: 'Kathmandu Facilities Management requires a licensed electrician for electrical maintenance and new installations in a 10-story commercial building in Pulchowk. Work includes wiring, panel upgrades, and emergency repairs.',
      category: 'Electrical', budget: 35000, deadline: daysAgo(-15),
      location: 'Pulchowk, Lalitpur', district: 'Lalitpur',
      skillsRequired: ['electrician', 'wiring', 'panel installation', 'maintenance'],
      status: 'open', urgency: 'high', jobType: 'contract',
      applicantCount: 3, createdAt: daysAgo(20),
    },
    {
      organizationId: o3._id, title: 'Hotel Housekeeper – Pokhara Resort',
      description: 'Pokhara Lakeside Hospitality is hiring 2 experienced housekeepers for our lakeside resort. Duties include room cleaning, linen management, and maintaining hygiene standards. Accommodation provided.',
      category: 'Housekeeping', budget: 18000, deadline: daysAgo(-25),
      location: 'Lakeside, Pokhara', district: 'Kaski',
      skillsRequired: ['housekeeping', 'cleaning', 'laundry', 'room service'],
      status: 'open', urgency: 'medium', jobType: 'full-time',
      applicantCount: 5, createdAt: daysAgo(18),
    },
    {
      organizationId: o4._id, title: 'Event Security Team – Chitwan Festival',
      description: 'Chitwan Security & Guard Services needs 5 trained security personnel for a 3-day cultural festival in Bharatpur. Duties include crowd control, entry management, and emergency response.',
      category: 'Security', budget: 15000, deadline: daysAgo(-5),
      location: 'Bharatpur, Chitwan', district: 'Chitwan',
      skillsRequired: ['security guard', 'crowd control', 'first aid', 'event security'],
      status: 'completed', urgency: 'urgent', jobType: 'one-time',
      applicantCount: 8, paid: true, rated: true, contractGenerated: true,
      createdAt: daysAgo(35),
    },
    {
      organizationId: o5._id, title: 'Delivery Rider – Biratnagar City Routes',
      description: 'Biratnagar Logistics requires 3 delivery riders for daily parcel delivery within Biratnagar city. Must have own motorcycle and valid license. Fuel allowance provided.',
      category: 'Delivery', budget: 20000, deadline: daysAgo(-10),
      location: 'Biratnagar, Morang', district: 'Morang',
      skillsRequired: ['delivery rider', 'motorcycle', 'route knowledge', 'time management'],
      status: 'open', urgency: 'medium', jobType: 'recurring',
      applicantCount: 7, createdAt: daysAgo(15),
    },
    {
      organizationId: o6._id, title: 'Office Receptionist – IT Company Patan',
      description: 'Lalitpur Tech Solutions is hiring a professional receptionist for our Patan office. Must be fluent in English and Nepali, skilled in MS Office, and have a pleasant personality for client interactions.',
      category: 'Office Support', budget: 22000, deadline: daysAgo(-20),
      location: 'Patan, Lalitpur', district: 'Lalitpur',
      skillsRequired: ['receptionist', 'MS Office', 'English communication', 'customer service'],
      status: 'in-progress', urgency: 'medium', jobType: 'full-time',
      applicantCount: 9, contractGenerated: true, createdAt: daysAgo(22),
    },
    {
      organizationId: o7._id, title: 'Skilled Mason – Residential Project Butwal',
      description: 'Butwal Construction requires an experienced mason for a 3-month residential building project. Work includes brick laying, plastering, and concrete finishing. Daily wage + accommodation.',
      category: 'Construction', budget: 30000, deadline: daysAgo(-45),
      location: 'Butwal, Rupandehi', district: 'Rupandehi',
      skillsRequired: ['mason', 'brick laying', 'plastering', 'concrete work'],
      status: 'completed', urgency: 'low', jobType: 'contract',
      applicantCount: 4, paid: true, rated: true, contractGenerated: true,
      createdAt: daysAgo(60),
    },
    {
      organizationId: o8._id, title: 'Home Caregiver – Elderly Patient Dharan',
      description: 'Dharan Healthcare requires a trained caregiver for an elderly patient recovering from surgery. Duties include medication management, physiotherapy assistance, and daily care. Live-in position.',
      category: 'Healthcare', budget: 28000, deadline: daysAgo(-12),
      location: 'Dharan, Sunsari', district: 'Sunsari',
      skillsRequired: ['caregiver', 'elderly care', 'first aid', 'patient care'],
      status: 'open', urgency: 'urgent', jobType: 'full-time',
      applicantCount: 3, createdAt: daysAgo(10),
    },
    {
      organizationId: o9._id, title: 'Event Catering Staff – Wedding Nepalgunj',
      description: 'Nepalgunj Events requires 8 catering staff for a large wedding event. Duties include food service, table setting, and guest assistance. 2-day event with meals and transport provided.',
      category: 'Events', budget: 12000, deadline: daysAgo(-3),
      location: 'Nepalgunj, Banke', district: 'Banke',
      skillsRequired: ['event staff', 'waiter', 'food service', 'table setting'],
      status: 'open', urgency: 'urgent', jobType: 'one-time',
      applicantCount: 5, createdAt: daysAgo(8),
    },
    {
      organizationId: o0._id, title: 'Office Cleaning Staff – Night Shift',
      description: 'Summit Solutions requires 2 cleaning staff for night-shift office cleaning at a corporate client in Durbarmarg. Work hours: 8 PM to 12 AM. Equipment and supplies provided.',
      category: 'Cleaning', budget: 14000, deadline: daysAgo(-20),
      location: 'Durbarmarg, Kathmandu', district: 'Kathmandu',
      skillsRequired: ['cleaning', 'office cleaning', 'deep cleaning'],
      status: 'open', urgency: 'medium', jobType: 'recurring',
      applicantCount: 6, createdAt: daysAgo(12),
    },
    {
      organizationId: o2._id, title: 'AC Technician – Hotel Maintenance',
      description: 'Kathmandu Facilities Management needs an AC technician for servicing and repairing 40 AC units in a hotel in Thamel. Must have experience with split and central AC systems.',
      category: 'Electrical', budget: 20000, deadline: daysAgo(-8),
      location: 'Thamel, Kathmandu', district: 'Kathmandu',
      skillsRequired: ['AC technician', 'HVAC', 'refrigeration', 'maintenance'],
      status: 'open', urgency: 'high', jobType: 'one-time',
      applicantCount: 2, createdAt: daysAgo(7),
    },
    {
      organizationId: o4._id, title: 'Night Security Guard – Warehouse',
      description: 'Chitwan Security requires a reliable night security guard for a warehouse in Narayanghat. 12-hour night shifts, 6 days a week. Accommodation available on-site.',
      category: 'Security', budget: 22000, deadline: daysAgo(-30),
      location: 'Narayanghat, Chitwan', district: 'Chitwan',
      skillsRequired: ['security guard', 'night patrol', 'CCTV operation'],
      status: 'in-progress', urgency: 'medium', jobType: 'full-time',
      applicantCount: 5, contractGenerated: true, createdAt: daysAgo(28),
    },
    {
      organizationId: o8._id, title: 'Ward Assistant – Private Hospital',
      description: 'Dharan Healthcare requires a ward assistant for a private hospital. Duties include patient transport, ward cleaning, assisting nurses, and maintaining medical equipment.',
      category: 'Healthcare', budget: 18000, deadline: daysAgo(-15),
      location: 'Dharan, Sunsari', district: 'Sunsari',
      skillsRequired: ['ward boy', 'patient care', 'hospital cleaning', 'medical assistant'],
      status: 'open', urgency: 'medium', jobType: 'full-time',
      applicantCount: 4, createdAt: daysAgo(14),
    },
    {
      organizationId: o1._id, title: 'Banquet Waiter – Corporate Event',
      description: 'Himalayan Hospitality Services needs 4 experienced waiters for a 2-day corporate conference at a 5-star hotel. Must be well-groomed and experienced in formal service.',
      category: 'Hospitality', budget: 8000, deadline: daysAgo(-2),
      location: 'Lazimpat, Kathmandu', district: 'Kathmandu',
      skillsRequired: ['waiter', 'banquet service', 'formal dining', 'event staff'],
      status: 'open', urgency: 'urgent', jobType: 'one-time',
      applicantCount: 3, createdAt: daysAgo(5),
    },
  ];

  const jobs = [];
  for (const d of jobsData) {
    const job = await Job.create({ ...d, approvalStatus: 'approved', currency: 'NPR' });
    jobs.push(job);
  }
  console.log(`✅  ${jobs.length} jobs created`);
  return jobs;
}

// ── SEED APPLICATIONS ─────────────────────────────────────────────────────────
async function seedApplications(orgs, providers, jobs) {
  console.log('\n📋  Seeding applications...');
  const [o0,o1,o2,o3,o4,o5,o6,o7,o8,o9] = orgs;
  const [p0,p1,p2,p3,p4,p5,p6,p7,p8,p9] = providers;
  const [j0,j1,j2,j3,j4,j5,j6,j7,j8,j9,j10,j11,j12,j13,j14] = jobs;

  const appsData = [
    // Job 0 (Security, open) — 3 applications
    { jobId: j0._id, providerId: p2._id, organizationId: o0._id, status: 'shortlisted',
      coverLetter: 'I am a retired Nepal Army soldier with 8 years of security experience. I have handled corporate security for multiple companies in Kathmandu and Dharan. I am disciplined, punctual, and trained in emergency response. I would be an excellent fit for this role.',
      expectedSalary: 24000, matchScore: 94, resumeScore: 88, successRate: 91, successLabel: 'High', profileCompleteness: 90, createdAt: daysAgo(22) },
    { jobId: j0._id, providerId: p7._id, organizationId: o0._id, status: 'pending',
      coverLetter: 'I have 2 years of experience in event security and restaurant security. I am available immediately and can work night shifts. I am physically fit and have basic first aid training.',
      expectedSalary: 22000, matchScore: 62, resumeScore: 55, successRate: 58, successLabel: 'Medium', profileCompleteness: 65, createdAt: daysAgo(20) },
    { jobId: j0._id, providerId: p9._id, organizationId: o0._id, status: 'rejected',
      coverLetter: 'I am interested in this security position. I have some experience in patient care and can adapt to security roles. Please consider my application.',
      expectedSalary: 20000, matchScore: 38, resumeScore: 32, successRate: 35, successLabel: 'Low', profileCompleteness: 72, createdAt: daysAgo(19) },

    // Job 1 (Chef, in-progress) — contracted
    { jobId: j1._id, providerId: p1._id, organizationId: o1._id, status: 'contracted',
      coverLetter: 'I am an experienced chef with 5 years in 4-star and 5-star hotels in Kathmandu. I specialize in Nepali, Indian, and Continental cuisine and have managed kitchen teams of up to 5 staff. I am passionate about food quality and kitchen hygiene.',
      expectedSalary: 42000, matchScore: 97, resumeScore: 92, successRate: 95, successLabel: 'High', profileCompleteness: 88, createdAt: daysAgo(38) },
    { jobId: j1._id, providerId: p7._id, organizationId: o1._id, status: 'rejected',
      coverLetter: 'I have experience in food service and event catering. I can cook basic Nepali dishes and am willing to learn more. I am hardworking and available immediately.',
      expectedSalary: 30000, matchScore: 55, resumeScore: 48, successRate: 51, successLabel: 'Medium', profileCompleteness: 60, createdAt: daysAgo(36) },

    // Job 2 (Electrician, open) — 3 applications
    { jobId: j2._id, providerId: p0._id, organizationId: o2._id, status: 'interview',
      coverLetter: 'I am a licensed electrician with 7 years of experience in commercial and residential electrical work. I have worked on 10-story buildings and am certified in solar installation and AC servicing. I can start immediately.',
      expectedSalary: 33000, matchScore: 96, resumeScore: 90, successRate: 93, successLabel: 'High', profileCompleteness: 92, createdAt: daysAgo(18) },
    { jobId: j2._id, providerId: p4._id, organizationId: o2._id, status: 'pending',
      coverLetter: 'I am a licensed plumber with experience in electrical basics. I have worked on commercial buildings and can handle wiring and panel work. I am a quick learner and available for the contract period.',
      expectedSalary: 30000, matchScore: 58, resumeScore: 52, successRate: 55, successLabel: 'Medium', profileCompleteness: 85, createdAt: daysAgo(16) },

    // Job 3 (Housekeeper, open) — 2 applications
    { jobId: j3._id, providerId: p3._id, organizationId: o3._id, status: 'shortlisted',
      coverLetter: 'I have 4 years of professional housekeeping experience in hotels in Pokhara and Kathmandu. I am thorough, detail-oriented, and familiar with hotel hygiene standards. I am available to relocate to Pokhara.',
      expectedSalary: 17000, matchScore: 91, resumeScore: 82, successRate: 87, successLabel: 'High', profileCompleteness: 78, createdAt: daysAgo(15) },
    { jobId: j3._id, providerId: p5._id, organizationId: o3._id, status: 'pending',
      coverLetter: 'I am an office assistant with experience in maintaining clean work environments. I am organized and can adapt to hotel housekeeping requirements. I am willing to relocate.',
      expectedSalary: 16000, matchScore: 52, resumeScore: 45, successRate: 48, successLabel: 'Medium', profileCompleteness: 80, createdAt: daysAgo(13) },

    // Job 4 (Security, completed) — contracted + completed
    { jobId: j4._id, providerId: p2._id, organizationId: o4._id, status: 'contracted',
      coverLetter: 'I have extensive experience in event security and crowd control from my Nepal Army background. I have handled large public events and festivals. I can lead a team of security personnel effectively.',
      expectedSalary: 14000, matchScore: 98, resumeScore: 93, successRate: 96, successLabel: 'High', profileCompleteness: 90, createdAt: daysAgo(33) },

    // Job 5 (Delivery, open) — 3 applications
    { jobId: j5._id, providerId: p6._id, organizationId: o5._id, status: 'approved',
      coverLetter: 'I am a professional driver with 9 years of experience and a clean driving record. I have my own motorcycle and am very familiar with Biratnagar city routes. I am reliable, punctual, and can handle high delivery volumes.',
      expectedSalary: 19000, matchScore: 89, resumeScore: 84, successRate: 87, successLabel: 'High', profileCompleteness: 82, createdAt: daysAgo(13) },
    { jobId: j5._id, providerId: p7._id, organizationId: o5._id, status: 'pending',
      coverLetter: 'I am interested in the delivery rider position. I have a motorcycle and a valid license. I am familiar with Biratnagar and can start immediately.',
      expectedSalary: 18000, matchScore: 65, resumeScore: 58, successRate: 61, successLabel: 'Medium', profileCompleteness: 58, createdAt: daysAgo(11) },

    // Job 6 (Receptionist, in-progress) — contracted
    { jobId: j6._id, providerId: p5._id, organizationId: o6._id, status: 'contracted',
      coverLetter: 'I am a professional receptionist with 3 years of corporate experience in Lalitpur. I am fluent in English and Nepali, proficient in MS Office, and experienced in managing front desk operations and client interactions.',
      expectedSalary: 21000, matchScore: 95, resumeScore: 88, successRate: 92, successLabel: 'High', profileCompleteness: 83, createdAt: daysAgo(20) },

    // Job 7 (Mason, completed) — contracted
    { jobId: j7._id, providerId: p8._id, organizationId: o7._id, status: 'contracted',
      coverLetter: 'I am an experienced mason with 10 years in construction. I have worked on residential and commercial projects in Butwal, Pokhara, and Kathmandu. I deliver quality work on time and am available for the full 3-month contract.',
      expectedSalary: 28000, matchScore: 97, resumeScore: 91, successRate: 94, successLabel: 'High', profileCompleteness: 85, createdAt: daysAgo(58) },

    // Job 8 (Caregiver, open) — 2 applications
    { jobId: j8._id, providerId: p9._id, organizationId: o8._id, status: 'shortlisted',
      coverLetter: 'I am a trained caregiver with 4 years of experience in healthcare settings in Dharan. I have experience with post-surgery recovery care and elderly patient management. I am compassionate, patient, and available for live-in positions.',
      expectedSalary: 27000, matchScore: 93, resumeScore: 86, successRate: 90, successLabel: 'High', profileCompleteness: 80, createdAt: daysAgo(8) },
    { jobId: j8._id, providerId: p3._id, organizationId: o8._id, status: 'pending',
      coverLetter: 'I have experience in housekeeping and basic patient assistance. I am caring and patient and would like to transition into healthcare support roles.',
      expectedSalary: 22000, matchScore: 48, resumeScore: 42, successRate: 45, successLabel: 'Low', profileCompleteness: 72, createdAt: daysAgo(7) },

    // Job 12 (Night Security, in-progress) — contracted
    { jobId: j12._id, providerId: p2._id, organizationId: o4._id, status: 'contracted',
      coverLetter: 'I am available for night security work and have experience in warehouse security. I am disciplined and can work 12-hour night shifts reliably.',
      expectedSalary: 21000, matchScore: 92, resumeScore: 85, successRate: 89, successLabel: 'High', profileCompleteness: 90, createdAt: daysAgo(26) },

    // Job 14 (Banquet Waiter, open) — 2 applications
    { jobId: j14._id, providerId: p7._id, organizationId: o1._id, status: 'pending',
      coverLetter: 'I have 2 years of experience as a waiter in restaurants and events. I am well-groomed, punctual, and experienced in formal dining service. I am available for the 2-day event.',
      expectedSalary: 7500, matchScore: 82, resumeScore: 72, successRate: 77, successLabel: 'High', profileCompleteness: 60, createdAt: daysAgo(4) },
    { jobId: j14._id, providerId: p1._id, organizationId: o1._id, status: 'pending',
      coverLetter: 'I have experience in hotel food service and can provide excellent banquet service. I am familiar with formal dining protocols from my hotel experience.',
      expectedSalary: 8000, matchScore: 75, resumeScore: 68, successRate: 72, successLabel: 'High', profileCompleteness: 85, createdAt: daysAgo(3) },
  ];

  const apps = [];
  for (const d of appsData) {
    const app = await Application.create({ ...d, createdAt: d.createdAt, updatedAt: d.createdAt });
    apps.push(app);
  }
  console.log(`✅  ${apps.length} applications created`);
  return apps;
}

// ── SEED CONTRACTS ────────────────────────────────────────────────────────────
async function seedContracts(orgs, providers, jobs, apps) {
  console.log('\n📄  Seeding contracts...');
  const [o0,o1,o2,o3,o4,o5,o6,o7,o8,o9] = orgs;
  const [p0,p1,p2,p3,p4,p5,p6,p7,p8,p9] = providers;
  const [j0,j1,j2,j3,j4,j5,j6,j7,j8,j9,j10,j11,j12,j13,j14] = jobs;

  const contractsData = [
    {
      jobId: j1._id, organizationId: o1._id, providerId: p1._id,
      title: 'Head Chef Contract – Himalayan Hospitality Services',
      description: 'Full-time head chef position at Thamel restaurant. Responsible for menu planning, kitchen management, and food quality control.',
      amount: 42000, currency: 'NPR', duration: '6 months',
      terms: 'Monthly salary of NPR 42,000. Working hours 10 AM to 10 PM. 1 day off per week. Meals provided during shift.',
      status: 'active', signedByOrg: true, signedByProvider: true,
      startDate: daysAgo(30), endDate: daysAgo(-150),
      contractNumber: `SF-${Date.now()-1000}-CHEF01`,
      createdAt: daysAgo(35),
    },
    {
      jobId: j4._id, organizationId: o4._id, providerId: p2._id,
      title: 'Event Security Contract – Chitwan Festival',
      description: 'Security services for 3-day cultural festival in Bharatpur. Team leader role managing 5 security personnel.',
      amount: 14000, currency: 'NPR', duration: '3 days',
      terms: 'Fixed payment of NPR 14,000 for 3-day event. Meals and transport provided. Uniform provided by client.',
      status: 'completed', signedByOrg: true, signedByProvider: true,
      startDate: daysAgo(20), endDate: daysAgo(17),
      contractNumber: `SF-${Date.now()-2000}-SEC01`,
      createdAt: daysAgo(22),
    },
    {
      jobId: j6._id, organizationId: o6._id, providerId: p5._id,
      title: 'Receptionist Contract – Lalitpur Tech Solutions',
      description: 'Full-time receptionist position at IT company in Patan. Front desk management, client handling, and administrative support.',
      amount: 21000, currency: 'NPR', duration: '12 months',
      terms: 'Monthly salary NPR 21,000. Office hours 9 AM to 6 PM, Monday to Friday. 13 months salary per year.',
      status: 'active', signedByOrg: true, signedByProvider: true,
      startDate: daysAgo(18), endDate: daysAgo(-347),
      contractNumber: `SF-${Date.now()-3000}-REC01`,
      createdAt: daysAgo(20),
    },
    {
      jobId: j7._id, organizationId: o7._id, providerId: p8._id,
      title: 'Masonry Contract – Butwal Residential Project',
      description: 'Skilled masonry work for 3-month residential building project in Butwal. Includes brick laying, plastering, and concrete finishing.',
      amount: 90000, currency: 'NPR', duration: '3 months',
      terms: 'Monthly payment of NPR 30,000. Accommodation provided on-site. Tools and materials provided by contractor.',
      status: 'completed', signedByOrg: true, signedByProvider: true,
      startDate: daysAgo(55), endDate: daysAgo(10),
      contractNumber: `SF-${Date.now()-4000}-MAS01`,
      createdAt: daysAgo(58),
    },
    {
      jobId: j12._id, organizationId: o4._id, providerId: p2._id,
      title: 'Night Security Contract – Narayanghat Warehouse',
      description: 'Night security guard for warehouse facility. 12-hour night shifts, 6 days per week.',
      amount: 22000, currency: 'NPR', duration: '6 months',
      terms: 'Monthly salary NPR 22,000. Night shift 8 PM to 8 AM. Accommodation provided on-site. Uniform provided.',
      status: 'signed', signedByOrg: true, signedByProvider: true,
      startDate: daysAgo(20), endDate: daysAgo(-160),
      contractNumber: `SF-${Date.now()-5000}-SEC02`,
      createdAt: daysAgo(22),
    },
    {
      jobId: j0._id, organizationId: o0._id, providerId: p2._id,
      title: 'Security Guard Contract – Summit Solutions Office',
      description: 'Corporate security guard for New Baneshwor office. Access control, CCTV monitoring, and visitor management.',
      amount: 24000, currency: 'NPR', duration: '12 months',
      terms: 'Monthly salary NPR 24,000. 8-hour shifts. Uniform and equipment provided.',
      status: 'draft', signedByOrg: false, signedByProvider: false,
      startDate: daysAgo(-5), endDate: daysAgo(-370),
      contractNumber: `SF-${Date.now()-6000}-SEC03`,
      createdAt: daysAgo(3),
    },
    {
      jobId: j5._id, organizationId: o5._id, providerId: p6._id,
      title: 'Delivery Rider Contract – Biratnagar Logistics',
      description: 'Daily parcel delivery within Biratnagar city. Own motorcycle required.',
      amount: 19000, currency: 'NPR', duration: '3 months',
      terms: 'Monthly salary NPR 19,000 plus fuel allowance NPR 3,000. Working hours 9 AM to 6 PM.',
      status: 'signed', signedByOrg: true, signedByProvider: true,
      startDate: daysAgo(8), endDate: daysAgo(-82),
      contractNumber: `SF-${Date.now()-7000}-DEL01`,
      createdAt: daysAgo(10),
    },
    {
      jobId: j8._id, organizationId: o8._id, providerId: p9._id,
      title: 'Caregiver Contract – Dharan Healthcare',
      description: 'Live-in caregiver for elderly patient recovering from surgery in Dharan.',
      amount: 27000, currency: 'NPR', duration: '2 months',
      terms: 'Monthly salary NPR 27,000. Live-in position with meals provided. Working hours as required by patient needs.',
      status: 'draft', signedByOrg: true, signedByProvider: false,
      startDate: daysAgo(-2), endDate: daysAgo(-62),
      contractNumber: `SF-${Date.now()-8000}-CARE01`,
      createdAt: daysAgo(2),
    },
  ];

  const contracts = [];
  for (const d of contractsData) {
    const c = new Contract(d);
    await c.save();
    contracts.push(c);
  }
  console.log(`✅  ${contracts.length} contracts created`);
  return contracts;
}

// ── SEED MESSAGES ─────────────────────────────────────────────────────────────
async function seedMessages(orgs, providers, jobs) {
  console.log('\n💬  Seeding messages...');
  const [o0,o1,o2,o3,o4,o5,o6,o7,o8,o9] = orgs;
  const [p0,p1,p2,p3,p4,p5,p6,p7,p8,p9] = providers;
  const [j0,j1,j2,j3,j4,j5,j6,j7,j8,j9,j10,j11,j12,j13,j14] = jobs;

  const msgs = [
    { senderId: o1._id, receiverId: p1._id, jobId: j1._id, message: 'Namaste Priya ji, we reviewed your application and are very impressed with your experience. Can you come for a kitchen trial on Thursday at 10 AM?', read: true, timestamp: daysAgo(37) },
    { senderId: p1._id, receiverId: o1._id, jobId: j1._id, message: 'Namaste! Thank you so much for considering me. Yes, I am available on Thursday at 10 AM. Should I bring my chef\'s uniform?', read: true, timestamp: daysAgo(37) },
    { senderId: o1._id, receiverId: p1._id, jobId: j1._id, message: 'Yes please bring your uniform and we will provide all ingredients. The trial will be 2 hours. We look forward to seeing you!', read: true, timestamp: daysAgo(36) },
    { senderId: p1._id, receiverId: o1._id, jobId: j1._id, message: 'Perfect! I will be there at 10 AM sharp. Thank you for this opportunity.', read: true, timestamp: daysAgo(36) },
    { senderId: o4._id, receiverId: p2._id, jobId: j4._id, message: 'Bikash ji, your application for the festival security has been approved. Please confirm your availability for 15th, 16th, and 17th of this month.', read: true, timestamp: daysAgo(32) },
    { senderId: p2._id, receiverId: o4._id, jobId: j4._id, message: 'Confirmed. I am available all 3 days. I can also bring 2 additional trained security personnel if needed. What time should we report?', read: true, timestamp: daysAgo(32) },
    { senderId: o4._id, receiverId: p2._id, jobId: j4._id, message: 'Please report at 7 AM on the 15th for briefing. Uniform and ID will be provided. Transport from Bharatpur bus park will be arranged.', read: true, timestamp: daysAgo(31) },
    { senderId: o6._id, receiverId: p5._id, jobId: j6._id, message: 'Anita ji, congratulations! We would like to offer you the receptionist position. Please review the contract we have sent and sign at your earliest convenience.', read: true, timestamp: daysAgo(19) },
    { senderId: p5._id, receiverId: o6._id, jobId: j6._id, message: 'Thank you so much! I have reviewed the contract and everything looks good. I will sign it today. When should I join?', read: true, timestamp: daysAgo(19) },
    { senderId: o6._id, receiverId: p5._id, jobId: j6._id, message: 'You can join from Monday. Please bring your original certificates and 2 passport photos for our records.', read: true, timestamp: daysAgo(18) },
    { senderId: o0._id, receiverId: p2._id, jobId: j0._id, message: 'Bikash ji, we have shortlisted your application for the security guard position. Can you come for an interview tomorrow at 2 PM at our New Baneshwor office?', read: true, timestamp: daysAgo(21) },
    { senderId: p2._id, receiverId: o0._id, jobId: j0._id, message: 'Yes, I will be there at 2 PM tomorrow. Thank you for the opportunity. Should I bring any documents?', read: true, timestamp: daysAgo(21) },
    { senderId: o0._id, receiverId: p2._id, jobId: j0._id, message: 'Please bring your citizenship, previous employment letters, and security license. See you tomorrow!', read: false, timestamp: daysAgo(20) },
    { senderId: o8._id, receiverId: p9._id, jobId: j8._id, message: 'Kamala ji, we are very interested in your profile for the caregiver position. The patient is an 75-year-old gentleman recovering from hip surgery. Are you comfortable with live-in arrangements?', read: true, timestamp: daysAgo(7) },
    { senderId: p9._id, receiverId: o8._id, jobId: j8._id, message: 'Yes, I am comfortable with live-in arrangements. I have experience with post-surgery care and elderly patients. I can start as soon as the contract is finalized.', read: true, timestamp: daysAgo(7) },
    { senderId: o8._id, receiverId: p9._id, jobId: j8._id, message: 'Excellent! We have sent the contract for your review. Please check and let us know if you have any questions.', read: false, timestamp: daysAgo(6) },
    { senderId: o7._id, receiverId: p8._id, jobId: j7._id, message: 'Nabin ji, the masonry work has been completed to an excellent standard. We are very satisfied with your work. Payment has been processed.', read: true, timestamp: daysAgo(9) },
    { senderId: p8._id, receiverId: o7._id, jobId: j7._id, message: 'Thank you! It was a pleasure working with Butwal Construction. I hope we can work together on future projects as well.', read: true, timestamp: daysAgo(9) },
    { senderId: o5._id, receiverId: p6._id, jobId: j5._id, message: 'Roshan ji, your application has been approved. Please review the delivery contract and confirm your start date.', read: true, timestamp: daysAgo(9) },
    { senderId: p6._id, receiverId: o5._id, jobId: j5._id, message: 'I have reviewed the contract. Everything is acceptable. I can start from Monday. Please confirm the reporting location and time.', read: false, timestamp: daysAgo(8) },
  ];

  const messages = [];
  for (const d of msgs) {
    const m = await Message.create(d);
    messages.push(m);
  }
  console.log(`✅  ${messages.length} messages created`);
  return messages;
}

// ── SEED REVIEWS ─────────────────────────────────────────────────────────────
async function seedReviews(orgs, providers, jobs) {
  console.log('\n⭐  Seeding reviews...');
  const [o0,o1,o2,o3,o4,o5,o6,o7,o8,o9] = orgs;
  const [p0,p1,p2,p3,p4,p5,p6,p7,p8,p9] = providers;
  const [j0,j1,j2,j3,j4,j5,j6,j7,j8,j9,j10,j11,j12,j13,j14] = jobs;

  const reviewsData = [
    // Completed job 4 (Festival Security)
    { jobId: j4._id, reviewerId: o4._id, revieweeId: p2._id, rating: 5,
      comment: 'Bikash was outstanding. He managed the entire security team professionally and handled a minor crowd incident calmly. Highly recommended for any event security work.', createdAt: daysAgo(16) },
    { jobId: j4._id, reviewerId: p2._id, revieweeId: o4._id, rating: 5,
      comment: 'Excellent organization. Clear briefing, good facilities, and payment was processed on time. Would work with Chitwan Security again.', createdAt: daysAgo(16) },
    // Completed job 7 (Masonry)
    { jobId: j7._id, reviewerId: o7._id, revieweeId: p8._id, rating: 5,
      comment: 'Nabin delivered exceptional masonry work. The quality of plastering and concrete finishing exceeded our expectations. Completed on time and within budget. Will hire again.', createdAt: daysAgo(8) },
    { jobId: j7._id, reviewerId: p8._id, revieweeId: o7._id, rating: 4,
      comment: 'Good company to work with. Materials were provided on time and accommodation was comfortable. Minor communication delays but overall a positive experience.', createdAt: daysAgo(8) },
    // Active job 1 (Chef) — mid-contract review
    { jobId: j1._id, reviewerId: o1._id, revieweeId: p1._id, rating: 5,
      comment: 'Priya has transformed our kitchen. The food quality has improved significantly and customer feedback has been excellent. She manages the kitchen team very well.', createdAt: daysAgo(10) },
    { jobId: j1._id, reviewerId: p1._id, revieweeId: o1._id, rating: 4,
      comment: 'Great working environment. The management is supportive and the kitchen is well-equipped. Looking forward to continuing this contract.', createdAt: daysAgo(10) },
    // Active job 6 (Receptionist)
    { jobId: j6._id, reviewerId: o6._id, revieweeId: p5._id, rating: 4,
      comment: 'Anita has settled in very well. She handles clients professionally and keeps the office organized. Her English communication is excellent.', createdAt: daysAgo(5) },
    // Active job 12 (Night Security)
    { jobId: j12._id, reviewerId: o4._id, revieweeId: p2._id, rating: 5,
      comment: 'Bikash is extremely reliable for night security. No incidents in the first month. He maintains detailed logs and communicates any issues promptly.', createdAt: daysAgo(3) },
    // Active job 5 (Delivery)
    { jobId: j5._id, reviewerId: o5._id, revieweeId: p6._id, rating: 4,
      comment: 'Roshan is punctual and knows the city routes well. Delivery success rate is 98%. Good communication with customers.', createdAt: daysAgo(2) },
    { jobId: j5._id, reviewerId: p6._id, revieweeId: o5._id, rating: 4,
      comment: 'Fair pay and good working conditions. The fuel allowance is helpful. Management is responsive to issues.', createdAt: daysAgo(2) },
  ];

  const reviews = [];
  for (const d of reviewsData) {
    const r = await Review.create(d);
    reviews.push(r);
  }
  console.log(`✅  ${reviews.length} reviews created`);
  return reviews;
}

// ── SEED NOTIFICATIONS ────────────────────────────────────────────────────────
async function seedNotifications(orgs, providers, jobs) {
  console.log('\n🔔  Seeding notifications...');
  const [o0,o1,o2,o3,o4,o5,o6,o7,o8,o9] = orgs;
  const [p0,p1,p2,p3,p4,p5,p6,p7,p8,p9] = providers;
  const [j0,j1,j2,j3,j4,j5,j6,j7,j8,j9,j10,j11,j12,j13,j14] = jobs;

  const notifsData = [
    { userId: p2._id, type: 'application', title: 'Application Shortlisted', message: 'Your application for "Senior Security Guard – Corporate Office" has been shortlisted. Expect an interview call soon.', read: false, relatedId: j0._id, createdAt: daysAgo(21) },
    { userId: p1._id, type: 'contract', title: 'Contract Ready to Sign', message: 'Your contract for "Head Chef – Thamel Restaurant" is ready. Please review and sign to confirm your position.', read: true, relatedId: j1._id, createdAt: daysAgo(35) },
    { userId: p5._id, type: 'contract', title: 'Contract Signed – Start Monday', message: 'Your contract with Lalitpur Tech Solutions has been signed by both parties. Please report on Monday at 9 AM.', read: true, relatedId: j6._id, createdAt: daysAgo(18) },
    { userId: p8._id, type: 'payment', title: 'Payment Received – NPR 30,000', message: 'Payment of NPR 30,000 for masonry work at Butwal Construction has been processed to your account.', read: true, relatedId: j7._id, createdAt: daysAgo(9) },
    { userId: o1._id, type: 'application', title: 'New Application Received', message: 'You have received a new application for "Head Chef – Thamel Restaurant" from Priya Tamang. Match score: 97/100.', read: true, relatedId: j1._id, createdAt: daysAgo(38) },
    { userId: o4._id, type: 'review', title: 'New Review Posted', message: 'Bikash Rai has left a 5-star review for the Chitwan Festival Security contract. Check your profile.', read: true, relatedId: j4._id, createdAt: daysAgo(16) },
    { userId: p9._id, type: 'application', title: 'Application Shortlisted', message: 'Your application for "Home Caregiver – Elderly Patient Dharan" has been shortlisted. The organization will contact you shortly.', read: false, relatedId: j8._id, createdAt: daysAgo(7) },
    { userId: o8._id, type: 'contract', title: 'Contract Awaiting Provider Signature', message: 'The caregiver contract has been sent to Kamala Bhandari. Awaiting her signature to activate the contract.', read: false, relatedId: j8._id, createdAt: daysAgo(6) },
    { userId: p6._id, type: 'application', title: 'Application Approved', message: 'Congratulations! Your application for "Delivery Rider – Biratnagar City Routes" has been approved. Contract is being prepared.', read: true, relatedId: j5._id, createdAt: daysAgo(12) },
    { userId: o0._id, type: 'system', title: 'Verification Approved', message: 'Your organization account has been verified by the admin. Your verified badge is now active on your profile.', read: true, createdAt: daysAgo(115) },
  ];

  const notifs = [];
  for (const d of notifsData) {
    const n = await Notification.create(d);
    notifs.push(n);
  }
  console.log(`✅  ${notifs.length} notifications created`);
  return notifs;
}

// ── SEED REPORTS ──────────────────────────────────────────────────────────────
async function seedReports(orgs, providers, jobs) {
  console.log('\n🚩  Seeding reports...');
  const [o0,o1,o2,o3,o4,o5,o6,o7,o8,o9] = orgs;
  const [p0,p1,p2,p3,p4,p5,p6,p7,p8,p9] = providers;
  const [j0,j1,j2,j3,j4,j5,j6,j7,j8,j9,j10,j11,j12,j13,j14] = jobs;

  const reportsData = [
    { reportedBy: o3._id, targetType: 'user', targetId: p7._id,
      reason: 'Misleading profile information',
      details: 'The provider claimed to have hotel housekeeping experience but during the interview it was clear they had no relevant experience. Their profile seems exaggerated.',
      status: 'pending', createdAt: daysAgo(12) },
    { reportedBy: p3._id, targetType: 'job', targetId: j3._id,
      reason: 'Payment terms not as described',
      details: 'The job posting mentioned NPR 18,000 per month but during the interview the organization mentioned additional deductions for accommodation that were not disclosed in the posting.',
      status: 'reviewed', adminNote: 'Organization has been contacted and asked to update job description with full payment terms.', createdAt: daysAgo(10) },
    { reportedBy: o5._id, targetType: 'user', targetId: p7._id,
      reason: 'No-show after application approval',
      details: 'The provider was approved for the delivery rider position and signed the contract but did not show up on the first day and is not responding to messages.',
      status: 'reviewed', adminNote: 'Provider account flagged. Trust score reduced. Warning issued.', createdAt: daysAgo(8) },
    { reportedBy: p0._id, targetType: 'job', targetId: j2._id,
      reason: 'Job requirements changed after application',
      details: 'The original job posting required a licensed electrician for commercial work. After applying, the organization changed requirements to include plumbing work which was not in the original description.',
      status: 'dismissed', adminNote: 'After review, the additional requirements were minor and within reasonable scope. No action required.', createdAt: daysAgo(15) },
    { reportedBy: o9._id, targetType: 'user', targetId: p7._id,
      reason: 'Unprofessional behavior during event',
      details: 'The provider was hired for event catering but arrived late and was not properly dressed. This caused issues with our client and damaged our reputation.',
      status: 'pending', createdAt: daysAgo(3) },
  ];

  const reports = [];
  for (const d of reportsData) {
    const r = await Report.create(d);
    reports.push(r);
  }
  console.log(`✅  ${reports.length} reports created`);
  return reports;
}

// ── SEED ACTIVITY LOGS ────────────────────────────────────────────────────────
async function seedActivityLogs(orgs, providers, jobs) {
  console.log('\n📊  Seeding activity logs...');
  const [o0,o1,o2,o3,o4,o5,o6,o7,o8,o9] = orgs;
  const [p0,p1,p2,p3,p4,p5,p6,p7,p8,p9] = providers;
  const [j0,j1,j2,j3,j4,j5,j6,j7,j8,j9,j10,j11,j12,j13,j14] = jobs;

  const logsData = [
    { userId: o0._id, action: 'register', entity: 'User', meta: { role: 'organization' }, createdAt: daysAgo(120) },
    { userId: p0._id, action: 'register', entity: 'User', meta: { role: 'provider' }, createdAt: daysAgo(110) },
    { userId: o1._id, action: 'register', entity: 'User', meta: { role: 'organization' }, createdAt: daysAgo(95) },
    { userId: p1._id, action: 'register', entity: 'User', meta: { role: 'provider' }, createdAt: daysAgo(90) },
    { userId: o4._id, action: 'register', entity: 'User', meta: { role: 'organization' }, createdAt: daysAgo(60) },
    { userId: p2._id, action: 'register', entity: 'User', meta: { role: 'provider' }, createdAt: daysAgo(85) },
    { userId: o0._id, action: 'job_posted', entity: 'Job', entityId: j0._id, meta: { title: 'Senior Security Guard', budget: 25000 }, createdAt: daysAgo(25) },
    { userId: o1._id, action: 'job_posted', entity: 'Job', entityId: j1._id, meta: { title: 'Head Chef', budget: 45000 }, createdAt: daysAgo(40) },
    { userId: o4._id, action: 'job_posted', entity: 'Job', entityId: j4._id, meta: { title: 'Event Security', budget: 15000 }, createdAt: daysAgo(35) },
    { userId: o7._id, action: 'job_posted', entity: 'Job', entityId: j7._id, meta: { title: 'Skilled Mason', budget: 30000 }, createdAt: daysAgo(60) },
    { userId: p1._id, action: 'application_submitted', entity: 'Application', meta: { jobTitle: 'Head Chef', matchScore: 97 }, createdAt: daysAgo(38) },
    { userId: p2._id, action: 'application_submitted', entity: 'Application', meta: { jobTitle: 'Event Security', matchScore: 98 }, createdAt: daysAgo(33) },
    { userId: p8._id, action: 'application_submitted', entity: 'Application', meta: { jobTitle: 'Skilled Mason', matchScore: 97 }, createdAt: daysAgo(58) },
    { userId: o1._id, action: 'contract_created', entity: 'Contract', meta: { title: 'Head Chef Contract', amount: 42000 }, createdAt: daysAgo(35) },
    { userId: o4._id, action: 'contract_created', entity: 'Contract', meta: { title: 'Event Security Contract', amount: 14000 }, createdAt: daysAgo(22) },
    { userId: o7._id, action: 'contract_created', entity: 'Contract', meta: { title: 'Masonry Contract', amount: 90000 }, createdAt: daysAgo(58) },
    { userId: o0._id, action: 'subscription_upgrade', entity: 'Subscription', meta: { plan: 'enterprise', amount: 999 }, createdAt: daysAgo(118) },
    { userId: o4._id, action: 'subscription_upgrade', entity: 'Subscription', meta: { plan: 'enterprise', amount: 999 }, createdAt: daysAgo(58) },
    { userId: p0._id, action: 'subscription_upgrade', entity: 'Subscription', meta: { plan: 'pro', amount: 150 }, createdAt: daysAgo(108) },
    { userId: p2._id, action: 'subscription_upgrade', entity: 'Subscription', meta: { plan: 'pro', amount: 150 }, createdAt: daysAgo(83) },
    { userId: o8._id, action: 'subscription_upgrade', entity: 'Subscription', meta: { plan: 'enterprise', amount: 999 }, createdAt: daysAgo(23) },
    { userId: p8._id, action: 'job_completed', entity: 'Job', entityId: j7._id, meta: { title: 'Masonry Contract', earnings: 90000 }, createdAt: daysAgo(10) },
    { userId: p2._id, action: 'job_completed', entity: 'Job', entityId: j4._id, meta: { title: 'Event Security', earnings: 14000 }, createdAt: daysAgo(17) },
    { userId: o4._id, action: 'payment_received', entity: 'Payment', meta: { amount: 14000, method: 'esewa' }, createdAt: daysAgo(17) },
    { userId: o7._id, action: 'payment_received', entity: 'Payment', meta: { amount: 90000, method: 'khalti' }, createdAt: daysAgo(10) },
    { userId: p5._id, action: 'profile_verified', entity: 'User', meta: { verificationStatus: 'approved' }, createdAt: daysAgo(50) },
    { userId: p2._id, action: 'profile_verified', entity: 'User', meta: { verificationStatus: 'approved' }, createdAt: daysAgo(80) },
    { userId: p8._id, action: 'profile_verified', entity: 'User', meta: { verificationStatus: 'approved' }, createdAt: daysAgo(25) },
    { userId: o6._id, action: 'job_posted', entity: 'Job', entityId: j6._id, meta: { title: 'Office Receptionist', budget: 22000 }, createdAt: daysAgo(22) },
    { userId: p5._id, action: 'application_submitted', entity: 'Application', meta: { jobTitle: 'Office Receptionist', matchScore: 95 }, createdAt: daysAgo(20) },
  ];

  const logs = [];
  for (const d of logsData) {
    const l = await ActivityLog.create(d);
    logs.push(l);
  }
  console.log(`✅  ${logs.length} activity logs created`);
  return logs;
}

// ── PRINT CREDENTIALS ─────────────────────────────────────────────────────────
function printCredentials(orgs, providers) {
  const orgNames = [
    'Rajesh Shrestha (Summit Solutions)',
    'Sushila Tamang (Himalayan Hospitality)',
    'Binod Karmacharya (Kathmandu Facilities)',
    'Meena Gurung (Pokhara Lakeside)',
    'Prakash Adhikari (Chitwan Security)',
    'Anupama Rai (Biratnagar Logistics)',
    'Suresh Maharjan (Lalitpur Tech)',
    'Gita Thapa (Butwal Construction)',
    'Dr. Ramesh Poudel (Dharan Healthcare)',
    'Kabita Lama (Nepalgunj Events)',
  ];
  const orgEmails = [
    'summit.solutions@gmail.com','himalayan.services@gmail.com',
    'kathmandu.facilities@gmail.com','pokhara.hospitality@gmail.com',
    'chitwan.security@gmail.com','biratnagar.logistics@gmail.com',
    'lalitpur.techsolutions@gmail.com','butwal.construction@gmail.com',
    'dharan.healthcare@gmail.com','nepalgunj.events@gmail.com',
  ];
  const provNames = [
    'Aarav Shrestha (Electrician, Kathmandu)',
    'Priya Tamang (Chef, Kathmandu)',
    'Bikash Rai (Security Guard, Dharan)',
    'Sunita Gurung (Housekeeper, Pokhara)',
    'Dipesh Thapa (Plumber, Lalitpur)',
    'Anita Maharjan (Receptionist, Lalitpur)',
    'Roshan Karki (Driver, Biratnagar)',
    'Sita Poudel (Waiter, Bhaktapur)',
    'Nabin Limbu (Mason, Butwal)',
    'Kamala Bhandari (Caregiver, Dharan)',
  ];
  const provEmails = [
    'aarav.shrestha@gmail.com','priya.tamang@gmail.com','bikash.rai@gmail.com',
    'sunita.gurung@gmail.com','dipesh.thapa@gmail.com','anita.maharjan@gmail.com',
    'roshan.karki@gmail.com','sita.poudel@gmail.com','nabin.limbu@gmail.com',
    'kamala.bhandari@gmail.com',
  ];

  console.log('\n');
  console.log('='.repeat(60));
  console.log('       SKILLFORCE CONNECT — DEMO ACCOUNTS');
  console.log('='.repeat(60));
  console.log('\n📌  ALL PASSWORDS: SkillForce@123\n');
  console.log('─'.repeat(60));
  console.log('🏢  ORGANIZATION ACCOUNTS');
  console.log('─'.repeat(60));
  orgEmails.forEach((email, i) => {
    console.log(`${i+1}. ${orgNames[i]}`);
    console.log(`   Email   : ${email}`);
    console.log(`   Password: SkillForce@123`);
    console.log('');
  });
  console.log('─'.repeat(60));
  console.log('👷  PROVIDER ACCOUNTS');
  console.log('─'.repeat(60));
  provEmails.forEach((email, i) => {
    console.log(`${i+1}. ${provNames[i]}`);
    console.log(`   Email   : ${email}`);
    console.log(`   Password: SkillForce@123`);
    console.log('');
  });
  console.log('─'.repeat(60));
  console.log('🔑  ADMIN ACCOUNT (existing)');
  console.log('─'.repeat(60));
  console.log('   Email   : admin@workforce.com');
  console.log('   Password: Admin@123');
  console.log('');
  console.log('='.repeat(60));
  console.log('✅  SEED COMPLETE — Platform is demo-ready!');
  console.log('='.repeat(60));
  console.log('\n📊  SEEDED:');
  console.log('   • 20 users (10 orgs + 10 providers)');
  console.log('   • 20 org/provider profiles');
  console.log('   • 15 jobs across Nepal');
  console.log('   • 25 applications with AI match scores');
  console.log('   • 8 contracts (draft/signed/active/completed)');
  console.log('   • 20 messages (real-time chat demo)');
  console.log('   • 10 notifications');
  console.log('   • 10 reviews with ratings');
  console.log('   • 5 admin reports');
  console.log('   • 30 activity logs');
  console.log('   • 20 subscriptions + payment records');
  console.log('');
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
async function main() {
  try {
    await connectDB();
    await cleanup();

    // Pass plain password — User.create() triggers pre-save hook which hashes it exactly once
    const orgs      = await seedOrganizations(PASS);
    const providers = await seedProviders(PASS);
    const jobs      = await seedJobs(orgs);
    const apps      = await seedApplications(orgs, providers, jobs);
    const contracts = await seedContracts(orgs, providers, jobs, apps);
    const messages  = await seedMessages(orgs, providers, jobs);
    const reviews   = await seedReviews(orgs, providers, jobs);
    const notifs    = await seedNotifications(orgs, providers, jobs);
    const reports   = await seedReports(orgs, providers, jobs);
    const logs      = await seedActivityLogs(orgs, providers, jobs);

    printCredentials(orgs, providers);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('\n❌  Seed failed:', err.message);
    console.error(err.stack);
    await mongoose.disconnect();
    process.exit(1);
  }
}

main();

