export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);
      const method = request.method;

      const cors = {
        "Access-Control-Allow-Origin": env?.CORS_ORIGIN || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      };

      // OPTIONS
      if (method === "OPTIONS") {
        return new Response(null, { status: 204, headers: cors });
      }

      // ================= HEALTH =================
      if (url.pathname === "/api/health") {
        return json({
          success: true,
          status: "operational",
          time: new Date().toISOString()
        });
      }

      // ================= LOGIN =================
      if (url.pathname === "/api/auth/login" && method === "POST") {
        const body = await safeJson(request);

        if (!body?.email || !body?.password) {
          return error("Email & password required", 400);
        }

        return json({
          success: true,
          user: { email: body.email },
          token: "mock-token"
        });
      }

      // ================= REGISTER =================
      if (url.pathname === "/api/auth/register" && method === "POST") {
        const body = await safeJson(request);

        if (!body?.email || !body?.password || !body?.name) {
          return error("All fields required", 400);
        }

        return json({
          success: true,
          user: { email: body.email, name: body.name }
        }, 201);
      }

      // ================= AUTH CHECK =================
      function checkAuth() {
        const auth = request.headers.get("Authorization");
        if (!auth?.startsWith("Bearer ")) {
          throw new Error("Unauthorized");
        }
      }

      // ================= PROJECTS =================
      if (url.pathname === "/api/projects" && method === "GET") {
        checkAuth();

        return json({
          success: true,
          data: []
        });
      }

      if (url.pathname === "/api/projects" && method === "POST") {
        checkAuth();
        const body = await safeJson(request);

        if (!body?.name || !body?.budget) {
          return error("Name & budget required", 400);
        }

        return json({
          success: true,
          data: body
        }, 201);
      }

      // ================= DEFAULT =================
      return error("Route not found", 404);

      // ================= HELPERS =================

      function json(data, status = 200) {
        return new Response(JSON.stringify(data), {
          status,
          headers: { "Content-Type": "application/json", ...cors }
        });
      }

      function error(msg, status = 500) {
        return json({ success: false, message: msg }, status);
      }

      async function safeJson(req) {
        try {
          return await req.json();
        } catch {
          return null;
        }
      }

    } catch (err) {
      return new Response(
        JSON.stringify({
          error: err.message,
          stack: err.stack
        }),
        { status: 500 }
      );
    }
  }
};