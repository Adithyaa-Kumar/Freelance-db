/**
 * Cloudflare Workers Entry Point for FreelanceFlow API
 */

import { Router } from 'itty-router';

const router = Router();

/* ================= UTILITIES ================= */

function getCorsHeaders(env) {
  const corsOrigin = env?.CORS_ORIGIN || 'http://localhost:5173';

  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
    'Access-Control-Allow-Credentials': 'true',
  };
}

function jsonResponse(data, status, env) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(env),
    },
  });
}

function handleErrors(handler) {
  return async (request, env, ctx) => {
    try {
      const response = await handler(request, env, ctx);

      if (!response) {
        return jsonResponse(
          { success: false, message: 'No response returned' },
          500,
          env
        );
      }

      return response;
    } catch (error) {
      console.error('[Route Error]', error);

      return jsonResponse(
        {
          success: false,
          message: error.message || 'Internal server error',
          error: env?.ENVIRONMENT !== 'production' ? error.stack : undefined,
        },
        error.status || 500,
        env
      );
    }
  };
}

async function verifyAuth(request) {
  const authHeader = request.headers.get('Authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    const err = new Error('Missing authorization token');
    err.status = 401;
    throw err;
  }

  return true;
}

/* ================= CORS ================= */

router.options('*', (request, env) => {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(env),
  });
});

/* ================= ROUTES ================= */

// Health
router.get(
  '/api/health',
  handleErrors(async (request, env) => {
    return jsonResponse(
      {
        success: true,
        data: {
          status: 'operational',
          environment: env?.ENVIRONMENT,
          timestamp: new Date().toISOString(),
        },
      },
      200,
      env
    );
  })
);

// Login
router.post(
  '/api/auth/login',
  handleErrors(async (request, env) => {
    let body;

    try {
      body = await request.json();
    } catch {
      throw Object.assign(new Error('Invalid JSON'), { status: 400 });
    }

    const { email, password } = body || {};

    if (!email || !password) {
      throw Object.assign(new Error('Email & password required'), { status: 400 });
    }

    return jsonResponse(
      {
        success: true,
        data: {
          user: { email },
          token: 'mock-token',
        },
      },
      200,
      env
    );
  })
);

// Register
router.post(
  '/api/auth/register',
  handleErrors(async (request, env) => {
    let body;

    try {
      body = await request.json();
    } catch {
      throw Object.assign(new Error('Invalid JSON'), { status: 400 });
    }

    const { email, password, name } = body || {};

    if (!email || !password || !name) {
      throw Object.assign(new Error('All fields required'), { status: 400 });
    }

    return jsonResponse(
      {
        success: true,
        data: { email, name },
      },
      201,
      env
    );
  })
);

// Me
router.get(
  '/api/auth/me',
  handleErrors(async (request, env) => {
    await verifyAuth(request);

    return jsonResponse(
      {
        success: true,
        data: {
          email: 'user@example.com',
          name: 'John Doe',
        },
      },
      200,
      env
    );
  })
);

// Projects
router.get(
  '/api/projects',
  handleErrors(async (request, env) => {
    await verifyAuth(request);

    return jsonResponse(
      { success: true, data: [] },
      200,
      env
    );
  })
);

// Create project
router.post(
  '/api/projects',
  handleErrors(async (request, env) => {
    await verifyAuth(request);

    const body = await request.json();

    if (!body?.name || !body?.budget) {
      throw Object.assign(new Error('Name & budget required'), { status: 400 });
    }

    return jsonResponse(
      {
        success: true,
        data: body,
      },
      201,
      env
    );
  })
);

// Tasks
router.get(
  '/api/tasks',
  handleErrors(async (request, env) => {
    await verifyAuth(request);
    return jsonResponse({ success: true, data: [] }, 200, env);
  })
);

// Clients
router.get(
  '/api/clients',
  handleErrors(async (request, env) => {
    await verifyAuth(request);
    return jsonResponse({ success: true, data: [] }, 200, env);
  })
);

// Analytics
router.get(
  '/api/analytics/dashboard',
  handleErrors(async (request, env) => {
    return jsonResponse(
      {
        success: true,
        data: {
          totalProjects: 0,
        },
      },
      200,
      env
    );
  })
);

// Fallback
router.all('*', (request, env) => {
  return jsonResponse(
    {
      success: false,
      message: 'Route not found',
    },
    404,
    env
  );
});

/* ================= WORKER ================= */

export default {
  async fetch(request, env, ctx) {
    try {
      let response = await router.handle(request, env, ctx);

      // 🔥 CRITICAL FIX (your crash was here)
      const headers = new Headers(response.headers);
      const corsHeaders = getCorsHeaders(env);

      Object.entries(corsHeaders).forEach(([k, v]) => {
        headers.set(k, v);
      });

      return new Response(response.body || null, {
        status: response.status,
        headers,
      });

    } catch (error) {
      console.error('[FATAL]', error);

      return jsonResponse(
        {
          success: false,
          message: error.message,
        },
        500,
        env
      );
    }
  },
};