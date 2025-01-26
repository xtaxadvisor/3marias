import { sign, verify } from 'jose';
import { createSecureHash } from './crypto';

const TOKEN_EXPIRY = 3600; // 1 hour in seconds

interface AdminUser {
  id: string;
  role: 'admin';
  permissions: string[];
}

export async function validateCredentials(username: string, password: string): Promise<boolean> {
  if (!process.env.ADMIN_USERNAME || !process.env.ADMIN_PASSWORD) {
    throw new Error('Admin credentials not configured');
  }

  const hashedPassword = await createSecureHash(password);
  const hashedStoredPassword = await createSecureHash(process.env.ADMIN_PASSWORD);

  return username === process.env.ADMIN_USERNAME && 
         hashedPassword === hashedStoredPassword;
}

export async function generateToken(user: AdminUser): Promise<string> {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT secret not configured');
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const now = Math.floor(Date.now() / 1000);
  
  const token = await new sign({
    exp: now + TOKEN_EXPIRY,
    iat: now,
    sub: user.id,
    role: user.role,
    permissions: user.permissions
  })
  .setProtectedHeader({ alg: 'HS256' })
  .sign(secret);

  return token;
}

export function createAdminUser(): AdminUser {
  return {
    id: `admin-${Date.now()}`,
    role: 'admin',
    permissions: [
      'view:dashboard',
      'manage:users',
      'manage:settings'
    ]
  };
}