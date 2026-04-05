export default {
  async fetch(request, env) {
    try {
      const url = new URL(request.url);

      // CORS headers
      const cors = {
        "Access-Control-Allow-Origin": env?.CORS_ORIGIN || "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization"
      };

      // Handle preflight
      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: cors });
      }

      // HEALTH CHECK
      if (url.pathname === "/api/health") {
        return new Response(
          JSON.stringify({
            success: true,
            status: "working",
            time: new Date().toISOString()
          }),
          { status: 200, headers: { "Content-Type": "application/json", ...cors } }
        );
      }

      // DEFAULT
      return new Response(
        JSON.stringify({ message: "Not Found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...cors } }
      );

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