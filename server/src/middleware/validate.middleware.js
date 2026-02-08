// Lightweight request body validator — no extra deps needed.

const validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;
  const errors = [];

  if (!name || name.trim().length < 2)
    errors.push('Name must be at least 2 characters');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push('Valid email is required');
  if (!password || password.length < 6)
    errors.push('Password must be at least 6 characters');
  if (!['organization', 'provider'].includes(role))
    errors.push('Role must be organization or provider');

  if (errors.length) return res.status(400).json({ message: errors[0], errors });
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: 'Email and password are required' });
  next();
};

const validateChangePassword = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword)
    return res.status(400).json({ message: 'Both currentPassword and newPassword are required' });
  if (newPassword.length < 6)
    return res.status(400).json({ message: 'New password must be at least 6 characters' });
  if (currentPassword === newPassword)
    return res.status(400).json({ message: 'New password must differ from current password' });
  next();
};

const validateJob = (req, res, next) => {
  const { title, description, category, budget, deadline } = req.body;
  const errors = [];

  if (!title || title.trim().length < 5)
    errors.push('Title must be at least 5 characters');
  if (title && title.trim().length > 120)
    errors.push('Title must be under 120 characters');
  if (!description || description.trim().length < 20)
    errors.push('Description must be at least 20 characters');
  if (!category)
    errors.push('Category is required');
  if (!budget || isNaN(budget) || Number(budget) < 1)
    errors.push('Budget must be a positive number');
  if (Number(budget) > 1_000_000)
    errors.push('Budget cannot exceed $1,000,000');
  if (!deadline)
    errors.push('Deadline is required');
  else if (new Date(deadline) <= new Date())
    errors.push('Deadline must be in the future');

  if (errors.length) return res.status(400).json({ message: errors[0], errors });
  next();
};

module.exports = { validateRegister, validateLogin, validateChangePassword, validateJob };
