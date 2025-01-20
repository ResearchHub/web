import NextAuth from 'next-auth';
import { authOptions } from './auth.config';

// Create handler
const handler = NextAuth(authOptions);

// Export as named functions for Next.js Edge API Routes
export const GET = handler;
export const POST = handler;
