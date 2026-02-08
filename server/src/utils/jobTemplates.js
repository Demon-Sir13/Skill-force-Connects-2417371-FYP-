const templates = {
  'Healthcare': {
    titles: ['Registered Nurse', 'Home Care Assistant', 'Medical Receptionist', 'Lab Technician', 'Physiotherapist'],
    responsibilities: [
      'Provide quality patient care following established protocols',
      'Maintain accurate medical records and documentation',
      'Collaborate with healthcare team for treatment plans',
      'Monitor patient vitals and report changes',
      'Ensure compliance with health and safety regulations',
    ],
    skills: ['Patient Care', 'First Aid', 'Medical Records', 'Communication', 'CPR Certified'],
  },
  'Security Services': {
    titles: ['Security Guard', 'CCTV Operator', 'Event Security Lead', 'Night Patrol Officer', 'VIP Protection'],
    responsibilities: [
      'Monitor premises and ensure safety of personnel and property',
      'Conduct regular patrols and security checks',
      'Respond to emergencies and security incidents',
      'Maintain detailed incident reports and logs',
      'Operate surveillance and access control systems',
    ],
    skills: ['Surveillance', 'First Aid', 'Crowd Control', 'Communication', 'Physical Fitness'],
  },
  'Cleaning & Facility': {
    titles: ['Facility Cleaner', 'Sanitation Specialist', 'Housekeeping Supervisor', 'Deep Cleaning Technician'],
    responsibilities: [
      'Perform thorough cleaning and sanitization of assigned areas',
      'Follow WHO sanitation protocols and safety guidelines',
      'Manage cleaning supplies inventory and equipment',
      'Report maintenance issues and facility damage',
      'Coordinate with facility management for scheduling',
    ],
    skills: ['Sanitation', 'Equipment Operation', 'Time Management', 'Attention to Detail', 'Chemical Safety'],
  },
  'IT Services': {
    titles: ['Full-Stack Developer', 'UI/UX Designer', 'System Administrator', 'Data Analyst', 'Mobile Developer'],
    responsibilities: [
      'Design, develop, and maintain software applications',
      'Write clean, efficient, and well-documented code',
      'Collaborate with cross-functional teams on project delivery',
      'Perform code reviews and ensure quality standards',
      'Troubleshoot and resolve technical issues',
    ],
    skills: ['React', 'Node.js', 'Python', 'MongoDB', 'Git', 'REST APIs'],
  },
  'Media & Marketing': {
    titles: ['Social Media Manager', 'Content Creator', 'Graphic Designer', 'Video Editor', 'Brand Strategist'],
    responsibilities: [
      'Create engaging content for social media platforms',
      'Develop and execute marketing campaigns',
      'Analyze performance metrics and optimize strategies',
      'Manage brand identity and visual consistency',
      'Collaborate with clients on creative direction',
    ],
    skills: ['Adobe Creative Suite', 'Social Media', 'Content Strategy', 'Analytics', 'Copywriting'],
  },
  'Construction': {
    titles: ['Site Supervisor', 'Electrician', 'Plumber', 'Civil Engineer', 'Mason'],
    responsibilities: [
      'Execute construction tasks according to blueprints and specifications',
      'Ensure compliance with building codes and safety regulations',
      'Coordinate with project managers on timelines and materials',
      'Maintain tools and equipment in working condition',
      'Report progress and any issues to supervisors',
    ],
    skills: ['Blueprint Reading', 'Safety Compliance', 'Tool Operation', 'Physical Stamina', 'Teamwork'],
  },
  'Event Management': {
    titles: ['Event Coordinator', 'Stage Manager', 'Catering Supervisor', 'AV Technician', 'Logistics Manager'],
    responsibilities: [
      'Plan and coordinate event logistics from start to finish',
      'Manage vendor relationships and contracts',
      'Ensure smooth execution of events on the day',
      'Handle budgets, timelines, and resource allocation',
      'Provide post-event reports and feedback analysis',
    ],
    skills: ['Project Management', 'Communication', 'Budgeting', 'Vendor Management', 'Problem Solving'],
  },
};

function generateJobDescription(category) {
  const t = templates[category] || templates['IT Services'];
  const title = t.titles[Math.floor(Math.random() * t.titles.length)];
  const numResp = 3 + Math.floor(Math.random() * 3);
  const shuffled = [...t.responsibilities].sort(() => Math.random() - 0.5);
  const responsibilities = shuffled.slice(0, numResp);
  const numSkills = 3 + Math.floor(Math.random() * 3);
  const skills = [...t.skills].sort(() => Math.random() - 0.5).slice(0, numSkills);

  const description = `We are looking for a skilled ${title} to join our team.\n\nResponsibilities:\n${responsibilities.map(r => `• ${r}`).join('\n')}\n\nThis is a great opportunity for professionals in the ${category} sector in Nepal.`;

  return { title, description, skills, category };
}

module.exports = { generateJobDescription };
