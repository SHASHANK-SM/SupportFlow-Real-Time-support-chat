import User from '../models/User.js';

/** Development-only convenience account; production deployments never create it. */
export async function ensureDemoAgent() {
  if (process.env.NODE_ENV === 'production') return;
  const email = 'agent@example.com';
  const existing = await User.findOne({ email });
  if (!existing) {
    await User.create({ name: 'Maya Chen', email, password: 'SupportDemo2026!', role: 'agent' });
    console.log('Development demo agent created: agent@example.com');
  }
  const adminEmail = 'admin@example.com';
  if (!await User.findOne({ email: adminEmail })) {
    await User.create({ name: 'Support Admin', email: adminEmail, password: 'SupportDemo2026!', role: 'admin' });
    console.log('Development admin created: admin@example.com');
  }
}
