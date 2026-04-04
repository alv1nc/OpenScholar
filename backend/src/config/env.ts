import dotenv from 'dotenv';

dotenv.config();

export const env = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/openscholar?schema=public',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-jwt-key',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-key',
  NODE_ENV: process.env.NODE_ENV || 'development'
};
