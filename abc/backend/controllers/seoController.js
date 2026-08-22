import mongoose from 'mongoose';
import Trip from '../models/Trip.js';
import Page from '../models/Page.js';

const isDbConnected = () => mongoose.connection && mongoose.connection.readyState === 1;

// @desc    Generate and serve XML Sitemap for Search Engines
// @route   GET /api/seo/sitemap.xml or /sitemap.xml
// @access  Public
export const getSitemapXml = async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://wanderluxe.in';
    const currentDate = new Date().toISOString().split('T')[0];

    // Static Core Routes
    const staticUrls = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/destinations`, priority: '0.9', changefreq: 'daily' },
      { loc: `${baseUrl}/about`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${baseUrl}/contact`, priority: '0.6', changefreq: 'monthly' },
      { loc: `${baseUrl}/blog`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/influencer/program`, priority: '0.8', changefreq: 'weekly' }
    ];

    // Fetch Trips
    let trips = [];
    if (isDbConnected()) {
      try {
        trips = await Trip.find({}).select('title slug image pageSlug publishAsPage updatedAt');
      } catch (e) {}
    }

    if (trips.length === 0) {
      trips = [
        { title: 'Meghalaya Backpacking Living Root Bridges', slug: 'meghalaya-backpacking-living-root-bridges', image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb', updatedAt: new Date() },
        { title: 'Spiti Valley Circuit High Altitude Roadtrip', slug: 'spiti-valley-circuit-high-altitude-roadtrip', image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800', updatedAt: new Date() },
        { title: 'Goa Sun Beach and Party Getaway', slug: 'goa-sun-beach-and-party-getaway', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', updatedAt: new Date() },
        { title: 'Bali Island Escape Beaches and Culture', slug: 'bali-island-escape-beaches-and-culture', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4', updatedAt: new Date() }
      ];
    }

    const tripUrls = [];
    trips.forEach((t) => {
      tripUrls.push({
        loc: `${baseUrl}/trip/${t.slug}`,
        lastmod: (t.updatedAt || new Date()).toISOString().split('T')[0],
        priority: '0.9',
        changefreq: 'weekly',
        image: t.image,
        title: t.title
      });
      if (t.publishAsPage) {
        tripUrls.push({
          loc: `${baseUrl}/page/${t.pageSlug || t.slug}`,
          lastmod: (t.updatedAt || new Date()).toISOString().split('T')[0],
          priority: '0.85',
          changefreq: 'weekly',
          image: t.image,
          title: t.title
        });
      }
    });

    // Fetch Dynamic Pages
    let pages = [];
    if (isDbConnected()) {
      try {
        pages = await Page.find({ status: 'published' }).select('title slug seo updatedAt');
      } catch (e) {}
    }

    if (pages.length === 0) {
      pages = [
        { title: 'Meghalaya Travel Guide', slug: 'meghalaya-travel-guide', updatedAt: new Date() },
        { title: 'Spiti Valley Complete Circuit Guide', slug: 'spiti-valley-guide', updatedAt: new Date() }
      ];
    }

    const pageUrls = pages.map((p) => ({
      loc: `${baseUrl}/page/${p.slug}`,
      lastmod: (p.updatedAt || new Date()).toISOString().split('T')[0],
      priority: '0.8',
      changefreq: 'weekly',
      image: p.seo?.ogImage,
      title: p.title
    }));

    const allUrls = [...staticUrls, ...tripUrls, ...pageUrls];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
    xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

    allUrls.forEach((u) => {
      xml += `  <url>\n`;
      xml += `    <loc>${u.loc}</loc>\n`;
      xml += `    <lastmod>${u.lastmod || currentDate}</lastmod>\n`;
      xml += `    <changefreq>${u.changefreq || 'weekly'}</changefreq>\n`;
      xml += `    <priority>${u.priority || '0.5'}</priority>\n`;
      if (u.image) {
        xml += `    <image:image>\n`;
        xml += `      <image:loc>${u.image.replace(/&/g, '&amp;')}</image:loc>\n`;
        if (u.title) {
          xml += `      <image:title>${u.title.replace(/&/g, '&amp;')}</image:title>\n`;
        }
        xml += `    </image:image>\n`;
      }
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Sitemap Error:', error);
    res.status(500).send('Error generating XML sitemap');
  }
};

// @desc    Generate and serve Robots.txt
// @route   GET /api/seo/robots.txt or /robots.txt
// @access  Public
export const getRobotsTxt = async (req, res) => {
  try {
    const baseUrl = process.env.FRONTEND_URL || 'https://wanderluxe.in';

    const robotsTxt = `# WanderLuxe Search Engine Robots Directive
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin
Disallow: /profile
Disallow: /checkout
Disallow: /booking/verify/

# Sitemap Location
Sitemap: ${baseUrl}/sitemap.xml
`;

    res.header('Content-Type', 'text/plain');
    res.send(robotsTxt);
  } catch (error) {
    res.status(500).send('Error serving robots.txt');
  }
};

// @desc    Get complete SEO metadata & JSON-LD schema by path/route
// @route   GET /api/seo/metadata
// @access  Public
export const getSeoMetadataByPath = async (req, res) => {
  try {
    const { path: routePath } = req.query;
    const baseUrl = process.env.FRONTEND_URL || 'https://wanderluxe.in';

    if (!routePath || routePath === '/') {
      return res.json({
        metaTitle: 'WanderLuxe - Experiential Small Group Expeditions & Luxury Travel',
        metaDescription: 'Book curated small-group travel expeditions across Meghalaya, Spiti Valley, Goa, Bali, and pristine global destinations.',
        keywords: 'group travel, backpacking, Meghalaya tours, Spiti Valley, adventure travel India',
        canonicalUrl: `${baseUrl}/`,
        robots: 'index, follow',
        ogTitle: 'WanderLuxe Expeditions',
        ogDescription: 'Curated experiential group travel and adventure trips.',
        ogImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        ogType: 'website',
        twitterCard: 'summary_large_image',
        structuredDataType: 'Organization',
        structuredDataJson: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "TravelAgency",
          "name": "WanderLuxe Expeditions",
          "url": baseUrl,
          "description": "Curated experiential travel and group expeditions."
        })
      });
    }

    // Check if it matches trip route (/trip/:idOrSlug)
    const tripMatch = routePath.match(/\/trip\/([^\/]+)/);
    if (tripMatch) {
      const idOrSlug = tripMatch[1];
      let trip = null;
      if (isDbConnected()) {
        try {
          if (mongoose.Types.ObjectId.isValid(idOrSlug)) {
            trip = await Trip.findById(idOrSlug);
          }
          if (!trip) {
            trip = await Trip.findOne({ slug: idOrSlug });
          }
        } catch (e) {}
      }
      if (trip && trip.seo) {
        return res.json({
          metaTitle: trip.seo.metaTitle || trip.seo.seoTitle || `${trip.title} | WanderLuxe`,
          metaDescription: trip.seo.metaDescription || trip.overview,
          keywords: trip.seo.keywords,
          focusKeyword: trip.seo.focusKeyword,
          canonicalUrl: trip.seo.canonicalUrl || `${baseUrl}/trip/${trip.slug}`,
          robots: trip.seo.robots || trip.seo.indexingDirective || 'index, follow',
          ogTitle: trip.seo.ogTitle || trip.title,
          ogDescription: trip.seo.ogDescription || trip.seo.metaDescription,
          ogImage: trip.seo.ogImage || trip.image,
          ogType: trip.seo.ogType || 'website',
          twitterCard: trip.seo.twitterCard || 'summary_large_image',
          twitterTitle: trip.seo.twitterTitle || trip.seo.ogTitle || trip.title,
          twitterDescription: trip.seo.twitterDescription || trip.seo.ogDescription,
          twitterImage: trip.seo.twitterImage || trip.seo.ogImage || trip.image,
          structuredDataType: trip.seo.structuredDataType || 'TouristTrip',
          structuredDataJson: trip.seo.structuredDataJson
        });
      }
    }

    // Check if it matches dynamic page (/page/:slug)
    const pageMatch = routePath.match(/\/page\/([^\/]+)/);
    if (pageMatch) {
      const slug = pageMatch[1];
      let page = null;
      if (isDbConnected()) {
        try { page = await Page.findOne({ slug, status: 'published' }); } catch (e) {}
      }
      if (page && page.seo) {
        return res.json(page.seo);
      }
    }

    // Default Fallback Metadata
    res.json({
      metaTitle: 'WanderLuxe Travel Platform',
      metaDescription: 'Explore handcrafted trip packages and authentic local cultural experiences.',
      keywords: 'wanderluxe, travel, adventures, trips',
      canonicalUrl: `${baseUrl}${routePath}`,
      robots: 'index, follow',
      ogTitle: 'WanderLuxe Travel Platform',
      ogDescription: 'Handcrafted trip packages and cultural travel experiences.',
      ogImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
      ogType: 'website',
      twitterCard: 'summary_large_image',
      structuredDataType: 'WebPage',
      structuredDataJson: ''
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};
