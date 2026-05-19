import dotenv from 'dotenv';
dotenv.config();

// Fail fast: validate required env vars at startup, not at runtime
const requireEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
};

export const config = {
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),
  mongo: {
    uri: requireEnv('MONGO_URI'),
  },
  jwt: {
    secret: requireEnv('JWT_SECRET'),
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '900000', 10),
    max: parseInt(process.env.RATE_LIMIT_MAX ?? '100', 10),
  },
  isDev: process.env.NODE_ENV !== 'production',
} as const;
