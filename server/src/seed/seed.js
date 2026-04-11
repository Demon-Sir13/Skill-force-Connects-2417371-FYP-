const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Job = require('../models/Job');
const OrganizationProfile = require('../models/OrganizationProfile');
const ProviderProfile = require('../models/ProviderProfile');
const Application = require('../models/Application');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Subscription = require('../models/Subscription');
const Contract = require('../models/Contract');

const hash = (pw) => bcrypt.hashSync(pw, 12);

const seedDatabase = async () => {
  const count = await User.countDocuments();
  if (count > 0) return;

  console.log('[Seed] Empty database detected — seeding Nepal demo data...');

  // ── Admin ───────────────────────────────────────────────────────────────
  const admin = await User.create({
    name: 'Admin', email: 'admin@workforce.com', password: 'Admin@123',
    role: 'admin', verified: true, trustScore: 100,
    profileImage: 'https://ui-avatars.com/api/?name=Admin&background=0EA5E9&color=fff&size=200',
  });

  // ── Hiring Organizations (2) ────────────────────────────────────────────
  const hiringOrgs = await User.insertMany([
    { name: 'Summit Media Strategies', email: 'summit@workforce.com', password: hash('Org@1234'), role: 'organization', orgType: 'hiring', verified: true, trustScore: 88, profileImage: 'https://ui-avatars.com/api/?name=Summit+Media&background=6366F1&color=fff&size=200' },
    { name: 'City Hospital Lalitpur', email: 'hospital@workforce.com', password: hash('Org@1234'), role: 'organization', orgType: 'hiring', verified: true, trustScore: 92, profileImage: 'https://ui-avatars.com/api/?name=City+Hospital&background=10B981&color=fff&size=200' },
  ]);

  // ── Service Provider Organizations (2) ──────────────────────────────────
  const serviceOrgs = await User.insertMany([
    { name: 'Nepal Shield Security', email: 'shield@workforce.com', password: hash('Org@1234'), role: 'organization', orgType: 'service_provider', verified: true, trustScore: 85, profileImage: 'https://ui-avatars.com/api/?name=Nepal+Shield&background=EF4444&color=fff&size=200' },
    { name: 'CleanPro Nepal', email: 'cleanpro@workforce.com', password: hash('Org@1234'), role: 'organization', orgType: 'service_provider', verified: true, trustScore: 80, profileImage: 'https://ui-avatars.com/api/?name=CleanPro&background=F59E0B&color=fff&size=200' },
  ]);

  await OrganizationProfile.insertMany([
    { userId: hiringOrgs[0]._id, companyName: 'Summit Media Strategies', industry: 'Media & Marketing', location: 'Kathmandu', district: 'Kathmandu', phone: '+977-01-4567890', website: 'https://summitmedia.com.np', establishedYear: 2018, employeeCount: '25-50', panNumber: '301234567', description: 'Full-service digital marketing agency specializing in brand strategy, content creation, and social media management for Nepal\'s top brands.', requiredSkills: ['Content Creator', 'Graphic Designer', 'Social Media Manager', 'Video Editor'], servicesOffered: [], serviceAreas: ['Kathmandu', 'Lalitpur', 'Bhaktapur'], rating: 4.7, totalReviews: 23, totalJobsPosted: 15, totalHires: 8, certifications: [{ name: 'Google Partner', issuer: 'Google', year: 2023 }], portfolio: [{ title: 'Nepal Tourism Campaign', description: 'Digital campaign for Visit Nepal 2025', imageUrl: '', date: new Date('2024-06-15') }] },
    { userId: hiringOrgs[1]._id, companyName: 'City Hospital Lalitpur', industry: 'Healthcare', location: 'Lalitpur', district: 'Lalitpur', phone: '+977-01-5523456', website: 'https://cityhospital.com.np', establishedYear: 2005, employeeCount: '200+', panNumber: '201234567', description: 'Leading multi-specialty hospital providing world-class healthcare services with 200+ beds and state-of-the-art facilities in Lalitpur.', requiredSkills: ['Cleaning Staff', 'Security Guard', 'Receptionist', 'Data Entry'], servicesOffered: [], serviceAreas: ['Lalitpur', 'Kathmandu'], rating: 4.5, totalReviews: 45, totalJobsPosted: 22, totalHires: 18 },
    { userId: serviceOrgs[0]._id, companyName: 'Nepal Shield Security', industry: 'Security Services', location: 'Kathmandu', district: 'Kathmandu', phone: '+977-01-4234567', website: 'https://nepalshield.com.np', establishedYear: 2015, employeeCount: '100-200', panNumber: '401234567', description: 'Professional security services provider offering armed/unarmed guards, event security, CCTV monitoring, and corporate security solutions across Nepal.', requiredSkills: [], servicesOffered: ['Armed Security', 'Event Security', 'CCTV Monitoring', 'Corporate Security', 'VIP Protection'], serviceAreas: ['Kathmandu Valley', 'Pokhara', 'Chitwan', 'Biratnagar'], rating: 4.6, totalReviews: 34, totalJobsPosted: 8, totalHires: 5, certifications: [{ name: 'Nepal Security License', issuer: 'Nepal Police', year: 2023 }, { name: 'ISO 9001:2015', issuer: 'ISO', year: 2022 }] },
    { userId: serviceOrgs[1]._id, companyName: 'CleanPro Nepal', industry: 'Cleaning Services', location: 'Bhaktapur', district: 'Bhaktapur', phone: '+977-01-6612345', website: 'https://cleanpro.com.np', establishedYear: 2019, employeeCount: '50-100', panNumber: '501234567', description: 'Professional cleaning and sanitation company serving hospitals, offices, hotels, and residential complexes across the Kathmandu Valley.', requiredSkills: [], servicesOffered: ['Deep Cleaning', 'Sanitization', 'Carpet Cleaning', 'Window Cleaning', 'Post-Construction Cleanup'], serviceAreas: ['Kathmandu Valley', 'Pokhara'], rating: 4.3, totalReviews: 19, totalJobsPosted: 6, totalHires: 4, portfolio: [{ title: 'Hyatt Regency Deep Clean', description: 'Complete sanitization of 200+ rooms', imageUrl: '', date: new Date('2024-03-10') }] },
  ]);

  // ── Individual Providers (5) ────────────────────────────────────────────
  const providers = await User.insertMany([
    { name: 'Aarav Sharma', email: 'aarav@workforce.com', password: hash('Pro@1234'), role: 'provider', verified: true, trustScore: 90, profileImage: 'https://ui-avatars.com/api/?name=Aarav+Sharma&background=0EA5E9&color=fff&size=200' },
    { name: 'Sita Thapa', email: 'sita@workforce.com', password: hash('Pro@1234'), role: 'provider', verified: false, trustScore: 72, profileImage: 'https://ui-avatars.com/api/?name=Sita+Thapa&background=EC4899&color=fff&size=200' },
    { name: 'Bikash Gurung', email: 'bikash@workforce.com', password: hash('Pro@1234'), role: 'provider', verified: true, trustScore: 95, profileImage: 'https://ui-avatars.com/api/?name=Bikash+Gurung&background=10B981&color=fff&size=200' },
    { name: 'Ramesh Tamang', email: 'ramesh@workforce.com', password: hash('Pro@1234'), role: 'provider', verified: true, trustScore: 78, profileImage: 'https://ui-avatars.com/api/?name=Ramesh+Tamang&background=F59E0B&color=fff&size=200' },
    { name: 'Anita Rai', email: 'anita@workforce.com', password: hash('Pro@1234'), role: 'provider', verified: true, trustScore: 85, profileImage: 'https://ui-avatars.com/api/?name=Anita+Rai&background=8B5CF6&color=fff&size=200' },
  ]);

  await ProviderProfile.insertMany([
    { userId: providers[0]._id, skills: ['Graphic Design', 'Adobe Photoshop', 'Illustrator', 'Figma', 'Branding'], experience: '5 years in branding & visual design for Nepal\'s top agencies', bio: 'Creative designer from Kathmandu specializing in brand identity, UI/UX, and digital illustrations.', rating: 4.8, totalReviews: 23, totalJobsCompleted: 23, totalEarnings: 345000, availability: 'available', workMode: 'freelance', location: 'Kathmandu', phone: '+977-9841234567', hourlyRate: 1500, resumeUrl: 'https://example.com/resume/aarav.pdf', verificationStatus: 'approved', languages: ['Nepali', 'English', 'Hindi'], education: 'BFA, Kathmandu University', portfolioLinks: ['https://dribbble.com/aarav', 'https://behance.net/aarav'], portfolio: [{ title: 'Nepal Tourism Rebrand', description: 'Complete visual identity for Visit Nepal 2025 campaign', imageUrl: '', date: new Date('2024-08-15') }, { title: 'Himalayan Coffee Packaging', description: 'Product packaging design for premium Nepali coffee brand', imageUrl: '', date: new Date('2024-05-20') }], certifications: [{ name: 'Google UX Design', issuer: 'Google', year: 2023 }, { name: 'Adobe Certified Expert', issuer: 'Adobe', year: 2022 }] },
    { userId: providers[1]._id, skills: ['Security', 'Surveillance', 'First Aid', 'Crowd Control', 'CCTV Operation'], experience: '8 years in private security and event management', bio: 'Experienced security professional with expertise in corporate and event security across Kathmandu Valley.', rating: 4.5, totalReviews: 45, totalJobsCompleted: 45, totalEarnings: 540000, availability: 'busy', workMode: 'full-time', location: 'Lalitpur', phone: '+977-9851234567', hourlyRate: 800, verificationStatus: 'pending', languages: ['Nepali', 'English'], education: 'SLC, Nepal Police Training' },
    { userId: providers[2]._id, skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Next.js', 'Python'], experience: '4 years full-stack development for startups and agencies', bio: 'Full-stack developer from Bhaktapur building modern web applications. Open source contributor and tech community organizer.', rating: 4.9, totalReviews: 18, totalJobsCompleted: 18, totalEarnings: 890000, availability: 'available', workMode: 'any', location: 'Bhaktapur', phone: '+977-9861234567', hourlyRate: 2500, resumeUrl: 'https://example.com/resume/bikash.pdf', verificationStatus: 'approved', languages: ['Nepali', 'English', 'Newari'], education: 'BSc CSIT, Tribhuvan University', portfolioLinks: ['https://github.com/bikash'], portfolio: [{ title: 'E-Commerce Platform', description: 'Built full-stack e-commerce for Nepali handicraft marketplace', imageUrl: '', date: new Date('2024-07-10') }], certifications: [{ name: 'AWS Solutions Architect', issuer: 'Amazon', year: 2024 }, { name: 'Meta Frontend Developer', issuer: 'Meta', year: 2023 }] },
    { userId: providers[3]._id, skills: ['Electrical Wiring', 'Solar Installation', 'Maintenance', 'Inverter Setup', 'Generator Repair'], experience: '12 years as licensed electrician in Kathmandu Valley', bio: 'Licensed electrician specializing in residential and commercial electrical work, solar panel installation, and inverter systems.', rating: 4.6, totalReviews: 67, totalJobsCompleted: 67, totalEarnings: 720000, availability: 'available', workMode: 'part-time', location: 'Kathmandu', phone: '+977-9871234567', hourlyRate: 1000, verificationStatus: 'approved', languages: ['Nepali', 'Hindi'], education: 'CTEVT Diploma in Electrical Engineering', certifications: [{ name: 'Nepal Electricity Authority License', issuer: 'NEA', year: 2023 }] },
    { userId: providers[4]._id, skills: ['Nursing', 'Patient Care', 'ICU Management', 'First Aid', 'Elderly Care'], experience: '6 years as registered nurse at various hospitals in Nepal', bio: 'Registered nurse with experience in ICU, emergency care, and home nursing. Compassionate caregiver dedicated to patient wellbeing.', rating: 4.7, totalReviews: 31, totalJobsCompleted: 31, totalEarnings: 465000, availability: 'available', workMode: 'full-time', location: 'Lalitpur', phone: '+977-9881234567', hourlyRate: 1200, resumeUrl: 'https://example.com/resume/anita.pdf', verificationStatus: 'approved', languages: ['Nepali', 'English', 'Maithili'], education: 'BN, Patan Academy of Health Sciences', certifications: [{ name: 'Nepal Nursing Council License', issuer: 'NNC', year: 2024 }, { name: 'BLS Certification', issuer: 'AHA', year: 2023 }] },
  ]);

  // ── Jobs (8) ────────────────────────────────────────────────────────────
  const now = new Date();
  const d = (days) => new Date(now.getTime() + days * 86400000);

  const jobs = await Job.insertMany([
    { organizationId: hiringOrgs[0]._id, title: 'Brand Identity Redesign', description: 'Complete brand identity overhaul including logo, color palette, typography, and brand guidelines for our agency rebrand. Must understand Nepali market aesthetics.', category: 'Media & Marketing', budget: 75000, currency: 'NPR', deadline: d(30), status: 'open', location: 'Kathmandu', district: 'Kathmandu', skillsRequired: ['Graphic Design', 'Branding', 'Figma'], approvalStatus: 'approved', urgency: 'medium', jobType: 'one-time' },
    { organizationId: hiringOrgs[0]._id, title: 'Social Media Campaign Manager', description: 'Plan and execute a 3-month social media campaign across Instagram, Facebook, and TikTok for a major Nepali brand launch.', category: 'Media & Marketing', budget: 120000, currency: 'NPR', deadline: d(45), status: 'in-progress', assignedProviderId: providers[0]._id, location: 'Kathmandu', district: 'Kathmandu', skillsRequired: ['Social Media', 'Content Marketing'], approvalStatus: 'approved', urgency: 'high', jobType: 'contract' },
    { organizationId: hiringOrgs[1]._id, title: 'Night Security Guard - Hospital', description: 'Experienced security personnel needed for night shift (10 PM - 6 AM) at hospital premises. Must have first aid certification and clean record.', category: 'Security Services', budget: 35000, currency: 'NPR', deadline: d(14), status: 'in-progress', assignedProviderId: providers[1]._id, location: 'Lalitpur', district: 'Lalitpur', skillsRequired: ['Security', 'First Aid'], approvalStatus: 'approved', urgency: 'urgent', jobType: 'recurring' },
    { organizationId: hiringOrgs[1]._id, title: 'Hospital Ward Deep Cleaning', description: 'Complete deep cleaning and sanitization of all hospital wards, operating rooms, and common areas. Must follow WHO sanitation protocols.', category: 'Cleaning & Facility', budget: 55000, currency: 'NPR', deadline: d(7), status: 'open', location: 'Lalitpur', district: 'Lalitpur', skillsRequired: ['Cleaning', 'Sanitation'], approvalStatus: 'approved', urgency: 'high', jobType: 'one-time' },
    { organizationId: hiringOrgs[0]._id, title: 'React Dashboard Development', description: 'Build a responsive admin dashboard with real-time analytics, user management, and data visualization for our internal tools.', category: 'IT Services', budget: 200000, currency: 'NPR', deadline: d(60), status: 'completed', assignedProviderId: providers[2]._id, rated: true, location: 'Bhaktapur', district: 'Bhaktapur', skillsRequired: ['React', 'Node.js', 'MongoDB'], approvalStatus: 'approved', urgency: 'medium', jobType: 'contract' },
    { organizationId: hiringOrgs[1]._id, title: 'Electrical Maintenance - Hospital Wing', description: 'Complete electrical inspection and maintenance of the new hospital wing. Includes wiring check, generator testing, and solar panel maintenance.', category: 'Construction', budget: 45000, currency: 'NPR', deadline: d(10), status: 'open', location: 'Lalitpur', district: 'Lalitpur', skillsRequired: ['Electrical Wiring', 'Maintenance', 'Solar Installation'], approvalStatus: 'approved', urgency: 'high', jobType: 'one-time' },
    { organizationId: hiringOrgs[1]._id, title: 'Home Nursing Care - Elderly Patient', description: 'Seeking experienced nurse for daily home visits to elderly patient in Lalitpur. 4 hours/day, 6 days/week. Must have nursing license.', category: 'Healthcare', budget: 60000, currency: 'NPR', deadline: d(30), status: 'open', location: 'Lalitpur', district: 'Lalitpur', skillsRequired: ['Nursing', 'Elderly Care', 'Patient Care'], approvalStatus: 'approved', urgency: 'medium', jobType: 'recurring' },
    { organizationId: hiringOrgs[0]._id, title: 'Corporate Event Security', description: 'Security team needed for 3-day corporate conference at Soaltee Hotel. 10 guards required with event security experience.', category: 'Event Management', budget: 90000, currency: 'NPR', deadline: d(20), status: 'open', location: 'Kathmandu', district: 'Kathmandu', skillsRequired: ['Security', 'Crowd Control', 'Event Security'], approvalStatus: 'approved', urgency: 'high', jobType: 'one-time' },
  ]);

  // ── Applications ────────────────────────────────────────────────────────
  await Application.insertMany([
    { jobId: jobs[0]._id, providerId: providers[0]._id, organizationId: hiringOrgs[0]._id, status: 'pending', coverLetter: 'I have 5 years of branding experience working with top Nepali agencies. I understand the local market aesthetics.', expectedSalary: 70000, availabilityDate: new Date() },
    { jobId: jobs[0]._id, providerId: providers[2]._id, organizationId: hiringOrgs[0]._id, status: 'shortlisted', coverLetter: 'My design skills combined with dev experience make me a great fit for digital brand work.', expectedSalary: 65000 },
    { jobId: jobs[3]._id, providerId: providers[1]._id, organizationId: hiringOrgs[1]._id, status: 'pending', coverLetter: 'I have experience in facility management and cleaning services at hospitals.', expectedSalary: 40000 },
    { jobId: jobs[4]._id, providerId: providers[2]._id, organizationId: hiringOrgs[0]._id, status: 'approved', coverLetter: 'Full-stack developer with React expertise ready to build your dashboard.', expectedSalary: 180000 },
    { jobId: jobs[5]._id, providerId: providers[3]._id, organizationId: hiringOrgs[1]._id, status: 'pending', coverLetter: 'Licensed electrician with 12 years experience. I specialize in hospital electrical systems.', expectedSalary: 42000 },
    { jobId: jobs[6]._id, providerId: providers[4]._id, organizationId: hiringOrgs[1]._id, status: 'pending', coverLetter: 'Registered nurse with 6 years experience in patient care and home nursing.', expectedSalary: 55000 },
    { jobId: jobs[7]._id, providerId: providers[1]._id, organizationId: hiringOrgs[0]._id, status: 'pending', coverLetter: 'Experienced in event security with 8 years in the field.', expectedSalary: 80000 },
  ]);

  await Job.findByIdAndUpdate(jobs[0]._id, { applicantCount: 2 });
  await Job.findByIdAndUpdate(jobs[3]._id, { applicantCount: 1 });
  await Job.findByIdAndUpdate(jobs[4]._id, { applicantCount: 1 });
  await Job.findByIdAndUpdate(jobs[5]._id, { applicantCount: 1 });
  await Job.findByIdAndUpdate(jobs[6]._id, { applicantCount: 1 });
  await Job.findByIdAndUpdate(jobs[7]._id, { applicantCount: 1 });

  // ── Reviews ─────────────────────────────────────────────────────────────
  await Review.insertMany([
    { jobId: jobs[4]._id, reviewerId: hiringOrgs[0]._id, revieweeId: providers[2]._id, rating: 5, comment: 'Excellent work on the dashboard. Delivered ahead of schedule with great attention to detail. Highly recommended!' },
    { jobId: jobs[1]._id, reviewerId: hiringOrgs[0]._id, revieweeId: providers[0]._id, rating: 5, comment: 'Aarav\'s design work is outstanding. The social media campaign visuals were exactly what we needed.' },
  ]);

  // ── Contracts ───────────────────────────────────────────────────────────
  await Contract.create({
    jobId: jobs[4]._id, organizationId: hiringOrgs[0]._id, providerId: providers[2]._id,
    title: 'React Dashboard Development', description: 'Build responsive admin dashboard with analytics',
    amount: 200000, currency: 'NPR', endDate: d(60),
    terms: 'This contract is between Summit Media Strategies and Bikash Gurung for the React Dashboard Development project. The agreed amount is NPR 200,000. Payment will be released upon satisfactory completion.',
    status: 'completed', signedByOrg: true, signedByProvider: true,
  });

  // ── Subscriptions ───────────────────────────────────────────────────────
  await Subscription.insertMany([
    { userId: admin._id, plan: 'enterprise', active: true, priceNPR: 999, features: ['All Pro features', 'Featured placement', 'Analytics dashboard', 'Dedicated account manager', 'Custom branding', 'API access', 'Team management', 'SLA guarantee', 'Priority matching'] },
    { userId: hiringOrgs[0]._id, plan: 'pro', active: true, priceNPR: 150, features: ['Verified badge', 'Unlimited applications', 'Priority support', 'Unlimited messaging', 'Portfolio priority boost', 'Contract generator'] },
    { userId: hiringOrgs[1]._id, plan: 'free', active: true, priceNPR: 0, features: ['Basic profile', '5 applications/month', 'Email support', '10 free messages'] },
    { userId: serviceOrgs[0]._id, plan: 'pro', active: true, priceNPR: 150, features: ['Verified badge', 'Unlimited applications', 'Priority support', 'Unlimited messaging', 'Portfolio priority boost', 'Contract generator'] },
    { userId: serviceOrgs[1]._id, plan: 'free', active: true, priceNPR: 0, features: ['Basic profile', '5 applications/month', 'Email support', '10 free messages'] },
    { userId: providers[0]._id, plan: 'pro', active: true, priceNPR: 150, features: ['Verified badge', 'Unlimited applications', 'Priority support', 'Unlimited messaging', 'Portfolio priority boost', 'Contract generator'] },
    { userId: providers[1]._id, plan: 'free', active: true, priceNPR: 0, features: ['Basic profile', '5 applications/month', 'Email support', '10 free messages'] },
    { userId: providers[2]._id, plan: 'enterprise', active: true, priceNPR: 999, features: ['All Pro features', 'Featured placement', 'Analytics dashboard', 'Dedicated account manager', 'Custom branding', 'API access', 'Team management', 'SLA guarantee', 'Priority matching'] },
    { userId: providers[3]._id, plan: 'free', active: true, priceNPR: 0, features: ['Basic profile', '5 applications/month', 'Email support', '10 free messages'] },
    { userId: providers[4]._id, plan: 'pro', active: true, priceNPR: 150, features: ['Verified badge', 'Unlimited applications', 'Priority support', 'Unlimited messaging', 'Portfolio priority boost', 'Contract generator'] },
  ]);

  // ── Notifications ───────────────────────────────────────────────────────
  await Notification.insertMany([
    { userId: hiringOrgs[0]._id, type: 'application', title: 'New Application', message: 'Aarav Sharma applied to "Brand Identity Redesign"', relatedId: jobs[0]._id },
    { userId: hiringOrgs[0]._id, type: 'application', title: 'New Application', message: 'Bikash Gurung applied to "Brand Identity Redesign"', relatedId: jobs[0]._id },
    { userId: providers[2]._id, type: 'review', title: 'New Review', message: 'You received a 5-star review for "React Dashboard Development"', relatedId: jobs[4]._id, read: true },
    { userId: providers[0]._id, type: 'system', title: 'Welcome to SkillForce Nepal', message: 'Your account has been verified. Start applying to jobs across Nepal!' },
    { userId: hiringOrgs[1]._id, type: 'application', title: 'New Application', message: 'Sita Thapa applied to "Hospital Ward Deep Cleaning"', relatedId: jobs[3]._id },
    { userId: providers[3]._id, type: 'system', title: 'Profile Verified', message: 'Your electrician profile has been verified. You can now apply to premium jobs.' },
    { userId: providers[4]._id, type: 'system', title: 'New Job Match', message: 'A new nursing job matching your skills was posted in Lalitpur.' },
  ]);

  console.log('[Seed] Nepal demo data created successfully!');
  console.log('[Seed] Admin:    admin@workforce.com / Admin@123');
  console.log('[Seed] Org:      summit@workforce.com / Org@1234');
  console.log('[Seed] Provider: aarav@workforce.com / Pro@1234');
  console.log('[Seed] Security: shield@workforce.com / Org@1234');
  console.log('[Seed] Cleaning: cleanpro@workforce.com / Org@1234');
};

module.exports = { seedDatabase };
