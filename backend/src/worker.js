/**
 * Cloudflare Workers Entry Point for FreelanceFlow API
 * Production-ready with proper CORS, error handling, and environment variables
 */

import { Router } from 'itty-router';

// ============ ROUTER SETUP ============
const router = Router();

// ============ UTILITY FUNCTIONS ============

/**
 * Get safe CORS headers without relying on globalThis
 * @param {Object} env - Cloudflare environment object
 * @returns {Object} CORS headers object
 */
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

/**
 * Add CORS headers to response
 * @param {Response} response - Original response
 * @param {Object} env - Cloudflare environment object
 * @returns {Response} Response with CORS headers
 */
function addCorsHeaders(response, env) {
  if (!response) {
    throw new Error('Response object is required');
  }

  const corsHeaders = getCorsHeaders(env);
  const newResponse = new Response(response.body, response);
  
  // Set all CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    newResponse.headers.set(key, value);
  });
  
  return newResponse;
}

/**
 * Create JSON response with CORS headers
 * @param {*} data - Response data
 * @param {number} status - HTTP status code
 * @param {Object} env - Cloudflare environment object
 * @returns {Response} JSON response with CORS headers
 */
function jsonResponse(data, status, env) {
  const response = new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...getCorsHeaders(env),
    },
  });
  return response;
}

/**
 * Error handler wrapper for routes
 * Ensures errors are caught and formatted properly
 */
function handleErrors(handler) {
  return async (request, env, ctx) => {
    try {
      const response = await handler(request, env, ctx);
      
      // Ensure response exists
      if (!response) {
        console.error('[Route] Handler returned undefined response');
        return jsonResponse(
          {
            success: false,
            message: 'Internal server error: no response',
          },
          500,
          env
        );
      }

      return response;
    } catch (error) {
      console.error('[Route Error]', {
        handler: handler.name,
        message: error.message,
        status: error.status,
      });

      const status = error.status || 500;
      return jsonResponse(
        {
          success: false,
          message: error.message || 'Internal server error',
          error: env?.ENVIRONMENT === 'production' ? undefined : error.stack,
        },
        status,
        env
      );
    }
  };
}

/**
 * Authentication middleware
 */
async function verifyAuth(request, env) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    const error = new Error('Missing authorization token');
    error.status = 401;
    throw error;
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
    const authError = new Error('Invalid token');
    authError.status = 401;
    throw authError;
  }
}

// ============ MIDDLEWARE ============

/**
 * Global OPTIONS handler for CORS preflight
 */
router.options('*', (request, env) => {
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(env),
  });
});



// ============ ROUTES ============

/**
 * Health Check Endpoint
 */
router.get(
  '/api/health',
  handleErrors(async (request, env) => {
    const status = {
      status: 'operational',
      environment: env?.ENVIRONMENT || 'development',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        api: 'operational',
      },
    };

    return jsonResponse({ success: true, data: status }, 200, env);
  })
);

/**
 * Auth Routes - Login
 */
router.post(
  '/api/auth/login',
  handleErrors(async (request, env) => {
    let body;

    try {
      body = await request.json();
    } catch (e) {
      const error = new Error('Invalid JSON body');
      error.status = 400;
      throw error;
    }

    const { email, password } = body || {};

    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.status = 400;
      throw error;
    }

    const mockUser = {
      id: '1',
      email,
      name: email.split('@')[0],
      role: 'user',
    };

    const token = btoa(
      JSON.stringify({
        userId: mockUser.id,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      })
    );

    return jsonResponse(
      {
        success: true,
        data: {
          user: mockUser,
          token,
          expiresIn: '7d',
        },
      },
      200,
      env
    );
  })
);

/**
 * Auth Routes - Register
 */
router.post(
  '/api/auth/register',
  handleErrors(async (request, env) => {
    let body;

    try {
      body = await request.json();
    } catch (e) {
      const error = new Error('Invalid JSON body');
      error.status = 400;
      throw error;
    }

    const { email, password, name } = body || {};

    if (!email || !password || !name) {
      const error = new Error('Email, password, and name are required');
      error.status = 400;
      throw error;
    }

    const mockUser = {
      id: '2',
      email,
      name,
      role: 'user',
    };

    const token = btoa(
      JSON.stringify({
        userId: mockUser.id,
        exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
      })
    );

    return jsonResponse(
      {
        success: true,
        data: {
          user: mockUser,
          token,
          expiresIn: '7d',
        },
      },
      201,
      env
    );
  })
);

/**
 * Auth Routes - Get Current User
 */
router.get(
  '/api/auth/me',
  handleErrors(async (request, env) => {
    await verifyAuth(request, env);

    const mockUser = {
      id: '1',
      email: 'user@example.com',
      name: 'John Doe',
      role: 'user',
    };

    return jsonResponse({ success: true, data: mockUser }, 200, env);
  })
);

/**
 * Projects Routes - Get All
 */
router.get(
  '/api/projects',
  handleErrors(async (request, env) => {
    await verifyAuth(request, env);

    // Mock projects (replace with DB query)
    const projects = [
      {
        id: '1',
        name: 'Project 1',
        description: 'Test project',
        status: 'active',
      },
    ];

    return jsonResponse({ success: true, data: projects }, 200, env);
  })
);

/**
 * Projects Routes - Create
 */
router.post(
  '/api/projects',
  handleErrors(async (request, env) => {
    await verifyAuth(request, env);

    const body = await request.json();
    const { name, description, budget, deadline } = body;

    if (!name || !budget) {
      const error = new Error('Name and budget are required');
      error.status = 400;
      throw error;
    }

    const newProject = {
      id: Date.now().toString(),
      name,
      description,
      budget,
      deadline,
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    return jsonResponse({ success: true, data: newProject }, 201, env);
  })
);

/**
 * Tasks Routes - Get All
 */
router.get(
  '/api/tasks',
  handleErrors(async (request, env) => {
    await verifyAuth(request, env);

    const tasks = [];
    return jsonResponse({ success: true, data: tasks }, 200, env);
  })
);

/**
 * Clients Routes - Get All
 */
router.get(
  '/api/clients',
  handleErrors(async (request, env) => {
    await verifyAuth(request, env);

    const clients = [];
    return jsonResponse({ success: true, data: clients }, 200, env);
  })
);

/**
 * Analytics Routes - Get Dashboard
 */
router.get(
  '/api/analytics/dashboard',
  handleErrors(async (request, env) => {
    const analytics = {
      totalProjects: 0,
      totalEarnings: 0,
      activeClients: 0,
    };

    return jsonResponse({ success: true, data: analytics }, 200, env);
  })
);

// ============ CLOUDFLARE WORKER HANDLER ============
router.all('*', (request, env) => {
  return jsonResponse(
    {
      success: false,
      message: `Route not found: ${request.method} ${new URL(request.url).pathname}`,
    },
    404,
    env
  );
});

export default {
  /**
   * Main Fetch Handler
   * Entry point for all requests
   */
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const method = request.method;
      const pathname = url.pathname;

      console.log(`[Worker] ${method} ${pathname}`, {
        environment: env?.ENVIRONMENT,
        cors_origin: env?.CORS_ORIGIN,
      });

      // Validate env object
      if (!env) {
        console.error('[Worker] Environment object is missing');
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Server configuration error',
          }),
          {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': 'http://localhost:5173',
            },
          }
        );
      }

      // Handle the request with router
      let response = await router.handle(request, env, ctx);

      // Ensure response is defined
      if (!response) {
        console.error('[Worker] Router returned undefined response');
        return jsonResponse(
          {
            success: false,
            message: 'Internal server error',
          },
          500,
          env
        );
      }

      // Clone response and ensure CORS headers - don't call addCorsHeaders if already has them
      const corsHeaders = getCorsHeaders(env);
      const hasAccessControlOrigin = response.headers.get('Access-Control-Allow-Origin');
      
      if (!hasAccessControlOrigin) {
        console.log('[Worker] Adding CORS headers to response');
        const newHeaders = new Headers(response.headers);
        Object.entries(corsHeaders).forEach(([key, value]) => {
          newHeaders.set(key, value);
        });
        
        response = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: newHeaders,
        });
      }

      return response;
    } catch (error) {
      console.error('[Worker Fatal Error]', {
        message: error.message,
        stack: error.stack,
      });

      return jsonResponse(
        {
          success: false,
          message: 'Internal server error',
          error: env?.ENVIRONMENT === 'production' ? undefined : error.message,
        },
        500,
        env
      );
    }
  },

  /**
   * Scheduled Handler (optional)
   */
  async scheduled(event, env, ctx) {
    console.log('[Worker] Scheduled event triggered', {
      cron: event.cron,
    });
  },
};
