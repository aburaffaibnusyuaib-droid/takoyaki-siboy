export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/',
    },
    sitemap: 'https://takoyaki-siboy.vercel.app/sitemap.xml',
  };
}
