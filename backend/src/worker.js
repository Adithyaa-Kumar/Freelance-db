/**
 * Cloudflare Workers Entry Point for FreelanceFlow API
 * Handles routing and transforms Express-style routes to Workers format
 */

import { Router } from 'itty-router';

// ============ CONFIGURATION ============
const ENVIRONMENT = globalThis.ENVIRONMENT || 'development';
const CORS_ORIGIN = globalThis.CORS_ORIGIN || 'http://localhost:5173';
const JWT_SECRET = globalThis.JWT_SECRET || 'change-me-in-production';

// ============ ROUTER SETUP ============
const router = Router();

// ============ MIDDLEWARE ============

/**
 * CORS Middleware
 */
const corsHeaders = (origin = CORS_ORIGIN) => ({
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
});

/**
 * Handle CORS preflight requests
 */
router.options('*', () => {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
});

/**
 * Add CORS headers to all responses
 */
function addCorsHeaders(response, origin = CORS_ORIGIN) {
  const newResponse = new Response(response.body, response);
  Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  return newResponse;
}

/**
 * Error handler wrapper
 */
function handleErrors(handler) {
  return async (request, env, ctx) => {
    try {
      return await handler(request, env, ctx);
    } catch (error) {
      console.error('Error:', error);
      const response = new Response(
        JSON.stringify({
          success: false,
          message: error.message || 'Internal server error',
          error: ENVIRONMENT === 'production' ? undefined : error.stack,
        }),
        {
          status: error.status || 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders() },
        }
      );
      return response;
    }
  };
}

/**
 * Authentication middleware
 */
async function verifyAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    throw { status: 401, message: 'Missing authorization token' };
  }

  const token = authHeader.slice(7);
  try {
    // Verify JWT (simplified - use proper JWT library in production)
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    // In production, use proper JWT verification library
    return { verified: true, token };
  } catch (error) {
    throw { status: 401, message: 'Invalid token' };
  }
}

// ============ ROUTES ============

/**
 * Health Check Endpoint
 */
router.get('/api/health', handleErrors(async (request, env) => {
  const status = {
    status: 'healthy',
    environment: ENVIRONMENT,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(Math.random() * 86400), // Placeholder
    services: {
      api: 'operational',
      database: env.DB ? 'connected' : 'not configured',
    },
  };

  return new Response(JSON.stringify(status), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}));

/**
 * Auth Routes - Login
 */
router.post('/api/auth/login', handleErrors(async (request, env) => {
  const { email, password } = await request.json();

  if (!email || !password) {
    throw { status: 400, message: 'Email and password required' };
  }

  // TODO: Implement actual authentication against D1 database
  // This is a placeholder demonstrating the structure
  const mockUser = {
    id: '1',
    email,
    name: email.split('@')[0],
    role: 'user',
  };

  const token = btoa(JSON.stringify({ userId: mockUser.id, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        user: mockUser,
        token,
        expiresIn: '7d',
      },
    }),
    {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    }
  );
}));

/**
 * Auth Routes - Register
 */
router.post('/api/auth/register', handleErrors(async (request, env) => {
  const { email, password, name } = await request.json();

  if (!email || !password || !name) {
    throw { status: 400, message: 'Email, password, and name required' };
  }

  // TODO: Implement actual registration against D1 database
  const mockUser = {
    id: '2',
    email,
    name,
    role: 'user',
  };

  const token = btoa(JSON.stringify({ userId: mockUser.id, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }));

  return new Response(
    JSON.stringify({
      success: true,
      data: {
        user: mockUser,
        token,
        expiresIn: '7d',
      },
    }),
    {
      status: 201,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    }
  );
}));

/**
 * Auth Routes - Get Current User
 */
router.get('/api/auth/me', handleErrors(async (request, env) => {
  await verifyAuth(request, env);

  const mockUser = {
    id: '1',
    email: 'user@example.com',
    name: 'John Doe',
    role: 'user',
  };

  return new Response(JSON.stringify({ success: true, data: mockUser }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}));

/**
 * Projects Routes - Get All
 */
router.get('/api/projects', handleErrors(async (request, env) => {
  await verifyAuth(request, env);

  // TODO: Implement actual query to D1 database
  const projects = [];

  return new Response(JSON.stringify({ success: true, data: projects }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}));

/**
 * Projects Routes - Create
 */
router.post('/api/projects', handleErrors(async (request, env) => {
  await verifyAuth(request, env);

  const { name, description, budget, deadline } = await request.json();

  if (!name || !budget) {
    throw { status: 400, message: 'Name and budget required' };
  }

  // TODO: Implement actual insertion to D1 database
  const newProject = {
    id: Date.now().toString(),
    name,
    description,
    budget,
    deadline,
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  return new Response(JSON.stringify({ success: true, data: newProject }), {
    status: 201,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}));

/**
 * 404 Handler
 */
router.all('*', () => {
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Route not found',
    }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    }
  );
});

// ============ CLOUDFLARE WORKER HANDLER ============
export default {
  async fetch(request, env, ctx) {
    console.log(`[${new Date().toISOString()}] ${request.method} ${new URL(request.url).pathname}`);

    // Set global variables for middleware access
    globalThis.ENVIRONMENT = env.ENVIRONMENT || 'development';
    globalThis.CORS_ORIGIN = env.CORS_ORIGIN || 'http://localhost:5173';
    globalThis.JWT_SECRET = env.JWT_SECRET || 'change-me-in-production';

    const response = await router.handle(request, env, ctx);
    return addCorsHeaders(response, env.CORS_ORIGIN);
  },

  async scheduled(event, env, ctx) {
    // Handle scheduled triggers if needed
    console.log('Scheduled event triggered');
  },
};
