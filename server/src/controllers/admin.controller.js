const User = require('../models/User');
const Job = require('../models/Job');
const Report = require('../models/Report');
const ActivityLog = require('../models/ActivityLog');
const OrganizationProfile = require('../models/OrganizationProfile');
const ProviderProfile = require('../models/ProviderProfile');

// ─── Users ────────────────────────────────────────────────────────────────────

const getAllUsers = async (req, res) => {
  try {
    const { role, search, status } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (status === 'suspended') filter.suspended = true;
    if (status === 'active')    filter.suspended = false;
    const users = await User.find(filter).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin')
      return res.status(403).json({ message: 'Cannot delete another admin' });
    await OrganizationProfile.deleteOne({ userId: user._id });
    await ProviderProfile.deleteOne({ userId: user._id });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const changeUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['organization', 'provider', 'admin'].includes(role))
    return res.status(400).json({ message: 'Invalid role' });
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const suspendUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot suspend an admin' });
    user.suspended = true;
    user.suspendReason = reason || 'Suspended by admin';
    await user.save();
    res.json({ message: 'User suspended', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const unsuspendUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.suspended = false;
    user.suspendReason = '';
    await user.save();
    res.json({ message: 'User unsuspended', user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const toggleVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.verified = !user.verified;
    await user.save();
    res.json({ message: `User ${user.verified ? 'verified' : 'unverified'}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Jobs ─────────────────────────────────────────────────────────────────────

const getAllJobs = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.title = { $regex: search, $options: 'i' };
    const jobs = await Job.find(filter)
      .populate('organizationId', 'name email')
      .populate('assignedProviderId', 'name email')
      .sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Reports ──────────────────────────────────────────────────────────────────

const getReports = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;
    const reports = await Report.find(filter)
      .populate('reportedBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createReport = async (req, res) => {
  try {
    const { targetType, targetId, reason, details } = req.body;
    const report = await Report.create({
      reportedBy: req.user._id,
      targetType,
      targetId,
      reason,
      details,
    });
    res.status(201).json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateReport = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNote },
      { new: true }
    ).populate('reportedBy', 'name email');
    if (!report) return res.status(404).json({ message: 'Report not found' });
    res.json(report);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Stats / Analytics ────────────────────────────────────────────────────────

const getStats = async (req, res) => {
  try {
    const Application = require('../models/Application');
    const Subscription = require('../models/Subscription');
    const Payment = require('../models/Payment');

    const [totalUsers, totalJobs, openJobs, inProgressJobs, completedJobs, pendingReports] = await Promise.all([
      User.countDocuments(),
      Job.countDocuments(),
      Job.countDocuments({ status: 'open' }),
      Job.countDocuments({ status: 'in-progress' }),
      Job.countDocuments({ status: 'completed' }),
      Report.countDocuments({ status: 'pending' }),
    ]);

    const [totalProviders, totalOrganizations] = await Promise.all([
      User.countDocuments({ role: 'provider' }),
      User.countDocuments({ role: 'organization' }),
    ]);

    const byRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    const revenueAgg = await Payment.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueAgg[0]?.total || 0;

    // Fallback: if no payments yet, estimate from completed jobs
    const jobRevenueAgg = await Job.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$budget' } } },
    ]);
    const estimatedRevenue = totalRevenue || Math.round((jobRevenueAgg[0]?.total || 0) * 0.1);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    const jobsByMonth = await Job.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const usersByMonth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const suspendedUsers = await User.countDocuments({ suspended: true });

    // Provider verification stats
    const verificationStats = await ProviderProfile.aggregate([
      { $group: { _id: '$verificationStatus', count: { $sum: 1 } } },
    ]);

    // Subscription stats
    const subscriptionStats = await Subscription.aggregate([
      { $match: { active: true } },
      { $group: { _id: '$plan', count: { $sum: 1 } } },
    ]);

    // Application stats
    const totalApplications = await Application.countDocuments();
    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    res.json({
      totalUsers, totalJobs, openJobs, inProgressJobs, completedJobs,
      totalProviders, totalOrganizations,
      pendingReports, totalRevenue: estimatedRevenue, suspendedUsers,
      byRole, jobsByMonth, usersByMonth,
      verificationStats, subscriptionStats, totalApplications, applicationsByStatus,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Activity Logs ────────────────────────────────────────────────────────────

const getAnalytics = async (req, res) => {
  try {
    const Application = require('../models/Application');
    const Subscription = require('../models/Subscription');
    const Payment = require('../models/Payment');
    const Contract = require('../models/Contract');

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const [
      totalContracts, activeContracts,
      revenueByMonth, applicationsByMonth,
    ] = await Promise.all([
      Contract.countDocuments(),
      Contract.countDocuments({ status: { $in: ['signed', 'active'] } }),
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
        { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          total: { $sum: '$amount' }, count: { $sum: 1 },
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Application.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    // Top categories
    const topCategories = await Job.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 }, totalBudget: { $sum: '$budget' } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Average match score
    const avgMatch = await Application.aggregate([
      { $match: { matchScore: { $gt: 0 } } },
      { $group: { _id: null, avg: { $avg: '$matchScore' } } },
    ]);

    res.json({
      totalContracts, activeContracts,
      revenueByMonth, applicationsByMonth, topCategories,
      avgMatchScore: Math.round(avgMatch[0]?.avg || 0),
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

// ─── Revenue Intelligence ─────────────────────────────────────────────────────

const getRevenue = async (req, res) => {
  try {
    const Payment = require('../models/Payment');
    const Subscription = require('../models/Subscription');

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const [totalRevenueAgg, monthlyRevenue, activeSubscriptions, totalUsers, paidUsers] = await Promise.all([
      Payment.aggregate([
        { $match: { status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.aggregate([
        { $match: { status: 'completed', createdAt: { $gte: sixMonthsAgo } } },
        { $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          revenue: { $sum: '$amount' }, count: { $sum: 1 },
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Subscription.countDocuments({ active: true, plan: { $ne: 'free' } }),
      User.countDocuments(),
      Subscription.countDocuments({ active: true, plan: { $in: ['pro', 'enterprise'] } }),
    ]);

    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    const conversionRate = totalUsers > 0 ? Math.round((paidUsers / totalUsers) * 100) : 0;

    // Projected monthly revenue = active paid subs × avg plan price
    const subsByPlan = await Subscription.aggregate([
      { $match: { active: true, plan: { $ne: 'free' } } },
      { $group: { _id: '$plan', count: { $sum: 1 }, totalPrice: { $sum: '$priceNPR' } } },
    ]);
    const projectedRevenue = subsByPlan.reduce((sum, s) => sum + (s.totalPrice || 0), 0);

    // Growth: compare last 2 months
    const lastMonth = monthlyRevenue[monthlyRevenue.length - 1]?.revenue || 0;
    const prevMonth = monthlyRevenue[monthlyRevenue.length - 2]?.revenue || 0;
    const growthPct = prevMonth > 0 ? Math.round(((lastMonth - prevMonth) / prevMonth) * 100) : 0;

    res.json({
      totalRevenue, monthlyRevenue, activeSubscriptions,
      conversionRate, projectedRevenue, growthPct,
      paidUsers, totalUsers, subsByPlan,
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

const getActivityLogs = async (req, res) => {
  try {
    const { action, limit = 50 } = req.query;
    const filter = {};
    if (action) filter.action = action;
    const logs = await ActivityLog.find(filter)
      .populate('userId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Provider Verification ────────────────────────────────────────────────────

const updateProviderVerification = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Invalid verification status' });
    const profile = await ProviderProfile.findOne({ userId: req.params.id });
    if (!profile) return res.status(404).json({ message: 'Provider profile not found' });
    profile.verificationStatus = status;
    await profile.save();
    // Also toggle user verified flag
    if (status === 'approved') await User.findByIdAndUpdate(req.params.id, { verified: true });
    if (status === 'rejected') await User.findByIdAndUpdate(req.params.id, { verified: false });
    res.json({ message: `Provider verification: ${status}`, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Job Approval ─────────────────────────────────────────────────────────────

const updateJobApproval = async (req, res) => {
  try {
    const { approvalStatus } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(approvalStatus))
      return res.status(400).json({ message: 'Invalid approval status' });
    const job = await Job.findByIdAndUpdate(req.params.id, { approvalStatus }, { new: true });
    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: `Job approval: ${approvalStatus}`, job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAllUsers, deleteUser, changeUserRole, suspendUser, unsuspendUser, toggleVerification,
  getAllJobs, deleteJob, updateJobApproval,
  getReports, createReport, updateReport,
  getStats, getAnalytics, getRevenue, getActivityLogs, updateProviderVerification,
};
