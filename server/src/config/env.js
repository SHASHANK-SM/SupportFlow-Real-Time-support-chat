import 'dotenv/config';
const required = ['MONGO_URI', 'JWT_SECRET'];
if (process.env.NODE_ENV === 'production') required.forEach((key) => { if (!process.env[key]) throw new Error(`Missing ${key}`); });
export const env = { port: process.env.PORT || 5000, mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/support_chat', jwtSecret: process.env.JWT_SECRET || 'development_only_secret_change_me', jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d', clientUrl: process.env.CLIENT_URL || 'http://localhost:5173', nodeEnv: process.env.NODE_ENV || 'development' };
