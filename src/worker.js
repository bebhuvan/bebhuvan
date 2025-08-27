export default {
  async fetch(request, env) {
    // Serve static assets from the ASSETS binding
    const response = await env.ASSETS.fetch(request);
    
    // Clone response to modify headers
    const newResponse = new Response(response.body, response);
    
    // Set cache headers based on file type
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    if (pathname.endsWith('.html') || pathname === '/' || !pathname.includes('.')) {
      // HTML pages: 1 hour cache
      newResponse.headers.set('Cache-Control', 'public, max-age=3600');
    } else if (pathname.match(/\.(css|js|woff2?|png|jpg|jpeg|webp|svg|ico)$/)) {
      // Static assets: 1 day cache
      newResponse.headers.set('Cache-Control', 'public, max-age=86400');
    } else if (pathname.endsWith('.xml')) {
      // RSS feeds: 30 minutes cache
      newResponse.headers.set('Cache-Control', 'public, max-age=1800');
    }
    
    return newResponse;
  }
}