export default {
  async fetch(request, env) {
    // Serve static assets from the ASSETS binding
    const response = await env.ASSETS.fetch(request);
    
    // Clone response to modify headers
    const newResponse = new Response(response.body, response);
    
    // Set security headers
    newResponse.headers.set('X-Frame-Options', 'DENY');
    newResponse.headers.set('X-XSS-Protection', '1; mode=block');
    newResponse.headers.set('X-Content-Type-Options', 'nosniff');
    newResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Set cache headers based on file type
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    if (pathname.startsWith('/_astro/')) {
      // Astro assets: 1 year cache with immutable
      newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (pathname.match(/\.(png|jpg|jpeg|webp|svg|ico)$/)) {
      // Images: 30 days cache
      newResponse.headers.set('Cache-Control', 'public, max-age=2592000');
    } else if (pathname.match(/\.(woff|woff2|ttf|otf)$/)) {
      // Fonts: 1 year cache with immutable
      newResponse.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (pathname.endsWith('/rss.xml')) {
      // RSS feed: 1 hour cache
      newResponse.headers.set('Cache-Control', 'public, max-age=3600');
    } else if (pathname.endsWith('.xml')) {
      // Sitemap: 1 day cache
      newResponse.headers.set('Cache-Control', 'public, max-age=86400');
    } else if (pathname.endsWith('.html') || pathname === '/' || !pathname.includes('.')) {
      // HTML pages: 1 hour cache
      newResponse.headers.set('Cache-Control', 'public, max-age=3600');
    }
    
    return newResponse;
  }
}