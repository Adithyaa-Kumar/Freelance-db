export default {
  async fetch(request, env) {
    try {
      return new Response("API WORKING ✅", { status: 200 });
    } catch (err) {
      return new Response(err.message, { status: 500 });
    }
  }
};