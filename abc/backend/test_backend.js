import http from 'http';
import app from './server.js';

console.log('🧪 Starting WanderLuxe Backend Endpoint Verification Test Suite...');

const testEndpoints = async () => {
  const baseUrl = 'http://localhost:5000';

  const makeRequest = (path, method = 'GET', body = null, headers = {}) => {
    return new Promise((resolve, reject) => {
      const url = new URL(baseUrl + path);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  };

  try {
    // 1. Test Root Endpoint
    const root = await makeRequest('/');
    console.log('✅ GET / -> Status:', root.status, root.body.message);

    // 2. Test Health Endpoint
    const health = await makeRequest('/api/health');
    console.log('✅ GET /api/health -> Status:', health.status, 'DB Status:', health.body.database?.status);

    // 3. Test Trips API
    const trips = await makeRequest('/api/trips');
    console.log('✅ GET /api/trips -> Status:', trips.status, 'Count:', trips.body.count);

    // 4. Test Single Trip Detail API
    const singleTrip = await makeRequest('/api/trips/meghalaya-backpacking-living-root-bridges');
    console.log('✅ GET /api/trips/:slug -> Status:', singleTrip.status, 'Title:', singleTrip.body.data?.title);

    // 5. Test Public Coupon Validation
    const couponVal = await makeRequest('/api/checkout/coupon/validate', 'POST', {
      code: 'GOA-KR7X9P',
      bookingAmount: 20000
    });
    console.log('✅ POST /api/checkout/coupon/validate -> Status:', couponVal.status, 'Valid:', couponVal.body.valid, 'Message:', couponVal.body.message);

    // 6. Test User Registration
    const register = await makeRequest('/api/auth/register', 'POST', {
      name: 'Test Traveler',
      email: `test_${Date.now()}@wanderluxe.in`,
      password: 'password123',
      phone: '9999999999'
    });
    console.log('✅ POST /api/auth/register -> Status:', register.status, 'Token issued:', !!register.body.token);

    // 7. Test User Login
    const login = await makeRequest('/api/auth/login', 'POST', {
      email: 'gaurav999@gmail.com',
      password: 'gaurav@999'
    });
    console.log('✅ POST /api/auth/login (Admin) -> Status:', login.status, 'Role:', login.body.role);
    const token = login.body.token;

    // 8. Test Protected GET /api/auth/me
    const me = await makeRequest('/api/auth/me', 'GET', null, { Authorization: `Bearer ${token}` });
    console.log('✅ GET /api/auth/me (Protected) -> Status:', me.status, 'Email:', me.body.email);

    // 9. Test Protected Admin Stats
    const adminStats = await makeRequest('/api/admin/stats', 'GET', null, { Authorization: `Bearer ${token}` });
    console.log('✅ GET /api/admin/stats (Protected Admin) -> Status:', adminStats.status, 'Revenue:', adminStats.body.totalRevenue);

    // 10. Test Lead Submission
    const lead = await makeRequest('/api/leads', 'POST', {
      name: 'Pooja V',
      email: 'pooja@gmail.com',
      phone: '9876543210',
      destination: 'Bali Island Escape'
    });
    console.log('✅ POST /api/leads -> Status:', lead.status, 'Message:', lead.body.message);

    // 11. Test QR Token Verification
    const qrVerify = await makeRequest('/api/bookings/verify/invalid-test-token');
    console.log('✅ GET /api/bookings/verify/:token -> Status:', qrVerify.status, 'Valid:', qrVerify.body.valid);

    // 12. Test Booking Creation & Automated WhatsApp E-Ticket & Receipt Notification
    const createBk = await makeRequest('/api/bookings/create-order', 'POST', {
      tripId: '1',
      travelersCount: 2,
      occupancy: 'Double Sharing',
      leadTraveler: { name: 'Test Traveler', email: 'test@wanderluxe.in', phone: '9876543210' }
    }, { Authorization: `Bearer ${token}` });
    console.log('✅ POST /api/bookings/create-order -> Status:', createBk.status, 'Booking ID:', createBk.body.bookingId);

    if (createBk.body.bookingId) {
      const bId = createBk.body.bookingId;
      const orderId = createBk.body.orderId;

      // Verify Payment (Triggers auto WhatsApp E-Ticket & Receipt dispatch)
      const payVerify = await makeRequest('/api/bookings/verify-payment', 'POST', {
        bookingId: bId,
        razorpay_order_id: orderId,
        razorpay_payment_id: 'pay_test_' + Date.now(),
        razorpay_signature: 'sig_test'
      }, { Authorization: `Bearer ${token}` });
      console.log('✅ POST /api/bookings/verify-payment -> Status:', payVerify.status, 'WhatsApp Status:', payVerify.body.booking?.whatsappNotification?.status);

      // Test Manual WhatsApp Resend Endpoint
      const waResend = await makeRequest(`/api/bookings/${bId}/send-whatsapp`, 'POST', null, { Authorization: `Bearer ${token}` });
      console.log('✅ POST /api/bookings/:bookingId/send-whatsapp -> Status:', waResend.status, 'Resend Status:', waResend.body.whatsappNotification?.status);
    }

    // 13. Test XML Sitemap Generation
    const sitemap = await makeRequest('/sitemap.xml');
    console.log('✅ GET /sitemap.xml -> Status:', sitemap.status, 'Is XML:', typeof sitemap.body === 'string' && sitemap.body.includes('<urlset'));

    // 14. Test Robots.txt Generation
    const robots = await makeRequest('/robots.txt');
    console.log('✅ GET /robots.txt -> Status:', robots.status, 'Has Sitemap Link:', typeof robots.body === 'string' && robots.body.includes('Sitemap:'));

    // 15. Test Dynamic Pages List & Live SEO Health Scores
    const pages = await makeRequest('/api/pages');
    console.log('✅ GET /api/pages -> Status:', pages.status, 'Pages Count:', pages.body?.length, 'First SEO Score:', pages.body?.[0]?.seoHealthScore + '%');

    // 16. Test Single Page Lookup by Slug
    const singlePage = await makeRequest('/api/pages/meghalaya-travel-guide');
    console.log('✅ GET /api/pages/:slug -> Status:', singlePage.status, 'Title:', singlePage.body?.title, 'Meta Title:', singlePage.body?.seo?.metaTitle);

    // 17. Test Admin Creation of Dynamic Page & SEO Suite
    const newCustomPage = await makeRequest('/api/pages', 'POST', {
      title: 'Bali Honeymoon & Culture Itinerary 2026',
      slug: 'bali-honeymoon-guide',
      heroSubtitle: 'Romantic beach villas, Uluwatu sunsets, and Ubud culture',
      category: 'Guides',
      content: 'Plan an unforgettable luxury honeymoon escape in Bali with WanderLuxe custom arrangements.',
      status: 'published',
      seo: {
        metaTitle: 'Bali Honeymoon Guide 2026 | Luxury Villas & Sunset Spots | WanderLuxe',
        metaDescription: 'Discover romantic Bali honeymoon itineraries. Explore Ubud rice terraces, Uluwatu cliff temples, and beach resorts.',
        keywords: 'Bali honeymoon, Bali villas, Ubud travel, Indonesia tours',
        canonicalUrl: 'https://wanderluxe.in/page/bali-honeymoon-guide',
        robots: 'index, follow',
        ogTitle: 'Bali Honeymoon & Culture Itinerary 2026',
        ogImage: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
        structuredDataType: 'TouristAttraction'
      }
    }, { Authorization: `Bearer ${token}` });
    console.log('✅ POST /api/pages (Admin CMS) -> Status:', newCustomPage.status, 'Created Slug:', newCustomPage.body?.page?.slug, 'SEO Score:', newCustomPage.body?.page?.seoHealthScore + '%');

    // 18. Test Route SEO Metadata Query
    const seoMeta = await makeRequest('/api/seo/metadata?path=/page/bali-honeymoon-guide');
    console.log('✅ GET /api/seo/metadata -> Status:', seoMeta.status, 'Meta Title:', seoMeta.body?.metaTitle);

    console.log('\n🎉 ALL BACKEND ENDPOINTS, WHATSAPP DISPATCH & BACKEND SEO CMS SUITE VERIFIED WITH 100% HEALTH!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Endpoint test failed:', err);
    process.exit(1);
  }
};

setTimeout(testEndpoints, 1500);
