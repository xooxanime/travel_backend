import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, Users, Ticket, Tag, Plus, Trash2, 
  Edit3, ShieldCheck, CheckCircle2, XCircle, Search, RefreshCw, 
  DollarSign, MapPin, Calendar, Lock, AlertTriangle, Layers, Eye, Power, Check, X, LogOut, Sparkles, Wallet, UserCheck, UserX, Globe, Save, FileText, Award, Upload, Image, Video,
  ExternalLink, Copy, HelpCircle, Monitor, Smartphone, Sliders, ChevronDown, ChevronUp, Link as LinkIcon, Compass, Sparkle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { UPCOMING_TRIPS } from '../constants/mockData';
import { 
  getAdminStatsApi, getCouponsApi, createCouponApi, toggleCouponApi, 
  deleteCouponApi, getAdminUsersApi, updateUserRoleApi, getAdminBookingsApi,
  getAllPagesApi, createPageApi, updatePageApi, deletePageApi,
  getTripsApi, createTripApi, updateTripApi, deleteTripApi, updateTripSeoApi
} from '../services/api';
import MediaUploader from '../components/MediaUploader';

const AdminDashboard = () => {
  const { 
    user, logout, eligiblePlans, allPayoutRequests, adminApprovePayout, adminTogglePlanEligibility,
    influencerApplications, fetchInfluencerApplications, approveInfluencerApplication, rejectInfluencerApplication
  } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');

  // Stats Data
  const [stats, setStats] = useState({
    totalRevenue: 4850000,
    totalBookings: 1240,
    activeTrips: 18,
    newLeads: 342,
    conversionRate: '14.2%',
    monthlyRevenue: [
      { month: 'Jan', revenue: 320000 },
      { month: 'Feb', revenue: 410000 },
      { month: 'Mar', revenue: 580000 },
      { month: 'Apr', revenue: 620000 },
      { month: 'May', revenue: 790000 },
      { month: 'Jun', revenue: 940000 },
      { month: 'Jul', revenue: 1190000 }
    ]
  });

  // Coupons State
  const [coupons, setCoupons] = useState([
    { id: 'c1', code: 'WANDER10', type: 'percentage', value: 10, expiry: '2026-12-31', maxUses: 500, usesCount: 142, active: true },
    { id: 'c2', code: 'SUMMER500', type: 'flat', value: 500, expiry: '2026-09-30', maxUses: 300, usesCount: 89, active: true },
    { id: 'c3', code: 'EARLYBIRD15', type: 'percentage', value: 15, expiry: '2026-10-15', maxUses: 200, usesCount: 45, active: true },
    { id: 'c4', code: 'FESTIVE20', type: 'percentage', value: 20, expiry: '2026-11-01', maxUses: 100, usesCount: 12, active: false }
  ]);

  // Users State (Loaded from MongoDB)
  const [usersList, setUsersList] = useState([]);

  // Trips State & Trip-Level SEO Management State
  const [tripsList, setTripsList] = useState(UPCOMING_TRIPS);
  const [selectedSeoTripId, setSelectedSeoTripId] = useState(1);
  const [tripSeoForm, setTripSeoForm] = useState({
    seoTitle: 'Meghalaya Backpacking Living Root Bridges (5D/4N) | WanderLuxe Expeditions',
    metaTitle: 'Meghalaya Backpacking Living Root Bridges (5D/4N) | WanderLuxe Expeditions',
    metaDescription: 'Book 5-day Meghalaya group trip. Explore Dawki crystal river, Cherrapunji waterfalls, and living root bridges with top-rated trip captains.',
    focusKeyword: 'Meghalaya Backpacking',
    keywords: 'Meghalaya, living root bridges, Cherrapunji, Dawki river, backpacking India',
    canonicalUrl: 'https://wanderluxe.in/trip/meghalaya-backpacking-living-root-bridges',
    indexingDirective: 'index, follow',
    robots: 'index, follow',
    ogTitle: 'Meghalaya Backpacking Living Root Bridges',
    ogDescription: 'Experience the magic of Meghalaya living root bridges and Dawki river.',
    ogImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    structuredDataType: 'TouristTrip',
    structuredDataJson: '',
    seoHealthScore: 95
  });
  const [seoSavedSuccess, setSeoSavedSuccess] = useState(false);

  // Master Bookings Log
  const [masterBookings, setMasterBookings] = useState([
    { id: 'WL-894201', customer: 'Gaurav Kumar Yadav', email: 'kumar.gaurav.yadav2007@gmail.com', trip: 'Meghalaya Backpacking', amount: 37000, date: '2026-08-01', status: 'Confirmed' },
    { id: 'WL-782104', customer: 'Sarah Jenkins', email: 'sarah.j@gmail.com', trip: 'Spiti Valley Circuit', amount: 22000, date: '2026-08-03', status: 'Confirmed' },
    { id: 'WL-541289', customer: 'Rohit Sharma', email: 'rohit.sharma@yahoo.com', trip: 'Bali Island Escape', amount: 45000, date: '2026-08-04', status: 'Pending' }
  ]);

  // Modal States for Coupon
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'percentage', value: '', expiry: '2026-12-31', maxUses: 500 });
  
  // Trip Modal States (Create & Edit Trip + Dedicated SEO Page Studio)
  const [showTripModal, setShowTripModal] = useState(false);
  const [editingTripId, setEditingTripId] = useState(null);
  const [tripModalTab, setTripModalTab] = useState('basic'); // 'basic' | 'landing_page' | 'seo_studio' | 'serp_preview'
  const [serpPreviewMode, setSerpPreviewMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [tripFormSuccess, setTripFormSuccess] = useState('');

  const [tripForm, setTripForm] = useState({
    title: '',
    slug: '',
    location: '',
    destination: 'India',
    duration: '5N/6D',
    price: '',
    originalPrice: '',
    image: '',
    tags: 'Trending, Adventure, Backpacking',
    nextBatch: '15 Sep',
    overview: '',
    publishAsPage: false,
    pageSlug: '',
    pageSubtitle: '',
    pageContent: '',
    customSections: [
      { heading: 'Tour Highlights & Hidden Gems', subheading: 'Curated Experiences', body: 'Discover pristine natural wonders with certified local trip captains.', imageUrl: '', imageAlt: '', ctaLabel: 'Reserve Departure', ctaUrl: '/destinations' }
    ],
    seo: {
      seoTitle: '',
      metaTitle: '',
      metaDescription: '',
      focusKeyword: '',
      keywords: '',
      canonicalUrl: '',
      indexingDirective: 'index, follow',
      robots: 'index, follow',
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      ogType: 'website',
      twitterCard: 'summary_large_image',
      twitterTitle: '',
      twitterDescription: '',
      twitterImage: '',
      structuredDataType: 'TouristTrip',
      structuredDataJson: '',
      seoHealthScore: 85
    },
    faqs: [
      { question: 'What is included in the package price?', answer: 'Accommodations, internal transfers, certified captain guidance, breakfast, and permits.' },
      { question: 'Is partial advance payment allowed?', answer: 'Yes, reserve with 20% advance or choose 0% EMI.' }
    ]
  });

  // Dynamic Pages CMS State
  const [cmsPages, setCmsPages] = useState([]);
  const [showCmsModal, setShowCmsModal] = useState(false);
  const [editingPageId, setEditingPageId] = useState(null);
  const [cmsFormSuccess, setCmsFormSuccess] = useState('');

  const [cmsForm, setCmsForm] = useState({
    title: '',
    slug: '',
    heroSubtitle: '',
    category: 'Guides',
    content: '',
    status: 'published',
    author: 'WanderLuxe Editorial',
    seoTitle: '',
    metaDescription: '',
    keywords: '',
    canonicalUrl: '',
    robots: 'index, follow',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    structuredDataType: 'TouristAttraction',
    structuredDataJson: ''
  });

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const statsData = await getAdminStatsApi();
        setStats(statsData);
        const couponsData = await getCouponsApi();
        setCoupons(couponsData);
        const usersData = await getAdminUsersApi();
        setUsersList(usersData);
        const pagesData = await getAllPagesApi();
        if (Array.isArray(pagesData)) setCmsPages(pagesData);
        
        // Fetch Real Trips from DB
        try {
          const tripsData = await getTripsApi();
          if (tripsData && tripsData.data && Array.isArray(tripsData.data) && tripsData.data.length > 0) {
            setTripsList(tripsData.data);
          }
        } catch (tripErr) {
          console.warn('Trips loaded from fallback constant');
        }

        const bookingsData = await getAdminBookingsApi();
        if (Array.isArray(bookingsData) && bookingsData.length > 0) {
          setMasterBookings(bookingsData.map(b => ({
            id: b.bookingId || b._id,
            customer: b.customer?.name || 'Traveler',
            email: b.customer?.email || '',
            trip: b.tripSnapshot?.title || 'Expedition',
            amount: b.pricing?.finalAmount || b.paidAmount || 18500,
            date: b.createdAt ? new Date(b.createdAt).toISOString().split('T')[0] : '2026-08-14',
            status: b.bookingStatus === 'CONFIRMED' ? 'Confirmed' : b.bookingStatus === 'CANCELLED' ? 'Cancelled' : 'Pending'
          })));
        }
        if (typeof fetchInfluencerApplications === 'function') {
          await fetchInfluencerApplications();
        }
      } catch (e) {
        console.warn('Backend API offline, utilizing state fallback');
      }
    };
    loadAdminData();
  }, []);

  const handleAdminLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    if (!newCoupon.code || !newCoupon.value) return;

    try {
      const added = await createCouponApi(newCoupon);
      setCoupons([added, ...coupons]);
    } catch (e) {
      const fallbackCoupon = {
        id: 'c_' + Date.now(),
        code: newCoupon.code.toUpperCase().trim(),
        type: newCoupon.type,
        value: Number(newCoupon.value),
        expiry: newCoupon.expiry,
        maxUses: Number(newCoupon.maxUses),
        usesCount: 0,
        active: true
      };
      setCoupons([fallbackCoupon, ...coupons]);
    }

    setNewCoupon({ code: '', type: 'percentage', value: '', expiry: '2026-12-31', maxUses: 500 });
    setShowCouponModal(false);
  };

  const handleToggleCoupon = async (id) => {
    try {
      await toggleCouponApi(id);
    } catch (e) {
      console.warn('Toggle coupon offline mode');
    }
    setCoupons(coupons.map((c) => (c.id === id ? { ...c, active: !c.active } : c)));
  };

  const handleDeleteCoupon = async (id) => {
    try {
      await deleteCouponApi(id);
    } catch (e) {
      console.warn('Delete coupon offline mode');
    }
    setCoupons(coupons.filter((c) => c.id !== id));
  };

  const handleToggleRole = async (userId, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    try {
      await updateUserRoleApi(userId, newRole);
    } catch (e) {
      console.warn('Role toggle offline mode');
    }
    setUsersList(usersList.map((u) => (u.id === userId || u._id === userId ? { ...u, role: newRole } : u)));
  };

  // Helper to compute live SEO score for Trip form editor (0-100%)
  const computeLiveTripSeoScore = (form) => {
    let score = 0;
    const title = form.seo?.metaTitle || form.seo?.seoTitle || form.title || '';
    const desc = form.seo?.metaDescription || form.overview || '';
    const kw = form.seo?.focusKeyword || form.tags || '';

    // Title length: optimal 40-65 chars
    if (title.length >= 40 && title.length <= 65) score += 25;
    else if (title.length > 0) score += 12;

    // Meta description: optimal 100-165 chars
    if (desc.length >= 100 && desc.length <= 165) score += 25;
    else if (desc.length > 0) score += 12;

    // Focus keyword in title or description
    if (kw && kw.length >= 3) {
      score += 10;
      const cleanKw = kw.toLowerCase().split(',')[0].trim();
      if (cleanKw && title.toLowerCase().includes(cleanKw)) score += 10;
      if (cleanKw && desc.toLowerCase().includes(cleanKw)) score += 10;
    }

    // Canonical & Media
    if (form.seo?.canonicalUrl && form.seo?.canonicalUrl.startsWith('http')) score += 10;
    if (form.seo?.ogImage || form.image) score += 10;
    if (form.seo?.structuredDataJson || form.seo?.structuredDataType) score += 10;

    return Math.min(100, Math.max(0, score));
  };

  // 1-Click Auto-Generate Best Practice SEO Metadata
  const handleAutoGenerateSeo = () => {
    const cleanTitle = tripForm.title.trim() || 'Curated Expedition';
    const cleanLocation = tripForm.location.trim() || 'India';
    const cleanDuration = tripForm.duration.trim() || '5N/6D';
    const cleanPrice = tripForm.price ? `₹${Number(tripForm.price).toLocaleString()}` : 'Best Price';
    const primaryTag = (tripForm.tags || '').split(',')[0]?.trim() || 'Backpacking';
    const cleanSlug = (tripForm.slug || tripForm.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const autoTitle = `${cleanTitle} (${cleanDuration}) | WanderLuxe Expeditions`;
    const autoDesc = `Book ${cleanTitle} in ${cleanLocation}. Includes boutique stays, transfers, certified captain, and 0% EMI from ${cleanPrice}. Reserve your seat now!`;
    const autoKeywords = `${cleanLocation} tour, ${primaryTag.toLowerCase()} trip, group travel ${cleanLocation}, ${cleanTitle.toLowerCase()}, best ${cleanDuration} itinerary`;
    const autoCanonical = `https://wanderluxe.in/trip/${cleanSlug}`;

    const autoJsonLd = {
      "@context": "https://schema.org",
      "@type": "TouristTrip",
      "name": cleanTitle,
      "description": autoDesc,
      "image": tripForm.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      "touristType": ["Adventure Traveler", "Backpacker", "Group Expeditions"],
      "offers": {
        "@type": "Offer",
        "price": Number(tripForm.price) || 18500,
        "priceCurrency": "INR",
        "url": autoCanonical,
        "availability": "https://schema.org/InStock"
      }
    };

    setTripForm(prev => ({
      ...prev,
      slug: cleanSlug,
      pageSlug: prev.pageSlug || cleanSlug,
      pageSubtitle: prev.pageSubtitle || `${cleanDuration} Curated Group Expedition in ${cleanLocation}`,
      seo: {
        ...prev.seo,
        seoTitle: autoTitle,
        metaTitle: autoTitle,
        metaDescription: autoDesc,
        focusKeyword: primaryTag,
        keywords: autoKeywords,
        canonicalUrl: autoCanonical,
        indexingDirective: 'index, follow',
        robots: 'index, follow',
        ogTitle: cleanTitle,
        ogDescription: autoDesc,
        ogImage: prev.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        ogType: 'website',
        twitterCard: 'summary_large_image',
        twitterTitle: cleanTitle,
        twitterDescription: autoDesc,
        twitterImage: prev.image || "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
        structuredDataType: 'TouristTrip',
        structuredDataJson: JSON.stringify(autoJsonLd, null, 2),
        seoHealthScore: 98
      }
    }));
  };

  // Open Create Trip Modal
  const handleOpenAddTripModal = () => {
    setEditingTripId(null);
    setTripModalTab('basic');
    setTripFormSuccess('');
    setTripForm({
      title: '',
      slug: '',
      location: '',
      destination: 'India',
      duration: '5N/6D',
      price: '',
      originalPrice: '',
      image: '',
      tags: 'Trending, Adventure, Backpacking',
      nextBatch: '15 Sep',
      overview: '',
      publishAsPage: false,
      pageSlug: '',
      pageSubtitle: '',
      pageContent: '',
      customSections: [
        { heading: 'Tour Highlights & Hidden Gems', subheading: 'Curated Experiences', body: 'Discover pristine natural wonders with certified local trip captains.', imageUrl: '', imageAlt: '', ctaLabel: 'Reserve Departure', ctaUrl: '/destinations' }
      ],
      seo: {
        seoTitle: '',
        metaTitle: '',
        metaDescription: '',
        focusKeyword: '',
        keywords: '',
        canonicalUrl: '',
        indexingDirective: 'index, follow',
        robots: 'index, follow',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        ogType: 'website',
        twitterCard: 'summary_large_image',
        twitterTitle: '',
        twitterDescription: '',
        twitterImage: '',
        structuredDataType: 'TouristTrip',
        structuredDataJson: '',
        seoHealthScore: 85
      },
      faqs: [
        { question: 'What is included in the package price?', answer: 'Accommodations, internal transfers, certified captain guidance, breakfast, and permits.' },
        { question: 'Is partial advance payment allowed?', answer: 'Yes, reserve with 20% advance or choose 0% EMI.' }
      ]
    });
    setShowTripModal(true);
  };

  // Open Edit Trip Modal (Anytime)
  const handleOpenEditTripModal = (t) => {
    setEditingTripId(t._id || t.id);
    setTripModalTab('basic');
    setTripFormSuccess('');
    const cleanSlug = t.slug || t.title?.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
    setTripForm({
      title: t.title || '',
      slug: cleanSlug,
      location: t.location || '',
      destination: t.destination || 'India',
      duration: t.duration || '5N/6D',
      price: t.price || '',
      originalPrice: t.originalPrice || '',
      image: t.image || '',
      tags: Array.isArray(t.tags) ? t.tags.join(', ') : (t.tags || 'Trending, Adventure'),
      nextBatch: t.nextBatch || '15 Sep',
      overview: t.overview || '',
      publishAsPage: Boolean(t.publishAsPage),
      pageSlug: t.pageSlug || cleanSlug,
      pageSubtitle: t.pageSubtitle || t.overview || '',
      pageContent: t.pageContent || t.overview || '',
      customSections: t.customSections && t.customSections.length > 0 ? t.customSections : [
        { heading: 'Tour Highlights & Hidden Gems', subheading: 'Curated Experiences', body: 'Discover pristine locations with certified local captains.', imageUrl: t.image || '', imageAlt: t.title || '', ctaLabel: 'Reserve Departure', ctaUrl: `/trip/${cleanSlug}` }
      ],
      seo: {
        seoTitle: t.seo?.seoTitle || t.seo?.metaTitle || `${t.title} | WanderLuxe Expeditions`,
        metaTitle: t.seo?.metaTitle || t.seo?.seoTitle || `${t.title} | WanderLuxe Expeditions`,
        metaDescription: t.seo?.metaDescription || t.overview || `Book ${t.title} in ${t.location}.`,
        focusKeyword: t.seo?.focusKeyword || (Array.isArray(t.tags) ? t.tags[0] : 'Backpacking'),
        keywords: t.seo?.keywords || (Array.isArray(t.tags) ? t.tags.join(', ') : 'group travel, adventure tours'),
        canonicalUrl: t.seo?.canonicalUrl || `https://wanderluxe.in/trip/${cleanSlug}`,
        indexingDirective: t.seo?.indexingDirective || t.seo?.robots || 'index, follow',
        robots: t.seo?.robots || t.seo?.indexingDirective || 'index, follow',
        ogTitle: t.seo?.ogTitle || t.title,
        ogDescription: t.seo?.ogDescription || t.seo?.metaDescription || t.overview,
        ogImage: t.seo?.ogImage || t.image,
        ogType: t.seo?.ogType || 'website',
        twitterCard: t.seo?.twitterCard || 'summary_large_image',
        twitterTitle: t.seo?.twitterTitle || t.title,
        twitterDescription: t.seo?.twitterDescription || t.seo?.metaDescription,
        twitterImage: t.seo?.twitterImage || t.image,
        structuredDataType: t.seo?.structuredDataType || 'TouristTrip',
        structuredDataJson: t.seo?.structuredDataJson || '',
        seoHealthScore: t.seo?.seoHealthScore || 90
      },
      faqs: t.faqs && t.faqs.length > 0 ? t.faqs : [
        { question: `What is included in the ${t.title} package price?`, answer: 'Accommodations, internal transfers, certified captain guidance, breakfast, and permits.' }
      ]
    });
    setShowTripModal(true);
  };

  // Save Trip (Create or Edit)
  const handleSaveTrip = async (e) => {
    e.preventDefault();
    if (!tripForm.title || !tripForm.price) return;

    const cleanSlug = (tripForm.slug || tripForm.title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const cleanPageSlug = (tripForm.pageSlug || cleanSlug).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const payload = {
      title: tripForm.title.trim(),
      slug: cleanSlug,
      location: tripForm.location.trim() || 'India',
      destination: tripForm.destination || 'India',
      duration: tripForm.duration.trim() || '5N/6D',
      price: Number(tripForm.price),
      originalPrice: tripForm.originalPrice ? Number(tripForm.originalPrice) : Math.round(Number(tripForm.price) * 1.2),
      image: tripForm.image.trim() || 'https://images.pexels.com/photos/17334314/pexels-photo-17334314.jpeg',
      tags: typeof tripForm.tags === 'string' ? tripForm.tags.split(',').map(t => t.trim()).filter(Boolean) : tripForm.tags,
      nextBatch: tripForm.nextBatch || '15 Sep',
      overview: tripForm.overview || '',
      publishAsPage: Boolean(tripForm.publishAsPage),
      pageSlug: cleanPageSlug,
      pageSubtitle: tripForm.pageSubtitle || tripForm.overview,
      pageContent: tripForm.pageContent || tripForm.overview,
      customSections: tripForm.customSections || [],
      faqs: tripForm.faqs || [],
      seo: {
        ...tripForm.seo,
        seoTitle: tripForm.seo.metaTitle || tripForm.seo.seoTitle || `${tripForm.title} | WanderLuxe Expeditions`,
        metaTitle: tripForm.seo.metaTitle || tripForm.seo.seoTitle || `${tripForm.title} | WanderLuxe Expeditions`,
        metaDescription: tripForm.seo.metaDescription || tripForm.overview,
        focusKeyword: tripForm.seo.focusKeyword || '',
        keywords: tripForm.seo.keywords || '',
        canonicalUrl: tripForm.seo.canonicalUrl || `https://wanderluxe.in/trip/${cleanSlug}`,
        indexingDirective: tripForm.seo.indexingDirective || 'index, follow',
        robots: tripForm.seo.robots || tripForm.seo.indexingDirective || 'index, follow',
        ogTitle: tripForm.seo.ogTitle || tripForm.title,
        ogDescription: tripForm.seo.ogDescription || tripForm.seo.metaDescription,
        ogImage: tripForm.seo.ogImage || tripForm.image,
        ogType: tripForm.seo.ogType || 'website',
        twitterCard: tripForm.seo.twitterCard || 'summary_large_image',
        twitterTitle: tripForm.seo.twitterTitle || tripForm.title,
        twitterDescription: tripForm.seo.twitterDescription || tripForm.seo.metaDescription,
        twitterImage: tripForm.seo.twitterImage || tripForm.image,
        structuredDataType: tripForm.seo.structuredDataType || 'TouristTrip',
        structuredDataJson: tripForm.seo.structuredDataJson || '',
        seoHealthScore: computeLiveTripSeoScore(tripForm)
      }
    };

    try {
      if (editingTripId) {
        const res = await updateTripApi(editingTripId, payload);
        const updated = res.data || { ...payload, id: editingTripId, _id: editingTripId };
        setTripsList(tripsList.map(t => (t._id === editingTripId || t.id === editingTripId) ? { ...t, ...updated } : t));
        setTripFormSuccess('Trip Package & SEO Configuration updated successfully!');
      } else {
        const res = await createTripApi(payload);
        const created = res.data || { ...payload, id: Date.now(), _id: 'trip_' + Date.now() };
        setTripsList([created, ...tripsList]);
        setTripFormSuccess(payload.publishAsPage ? 'Trip created & published as Dedicated SEO Landing Page!' : 'Trip Package created successfully!');
      }

      // Refresh dynamic pages list
      try {
        const pagesData = await getAllPagesApi();
        if (Array.isArray(pagesData)) setCmsPages(pagesData);
      } catch (e) {}

      setTimeout(() => {
        setTripFormSuccess('');
        setShowTripModal(false);
      }, 1200);
    } catch (err) {
      if (editingTripId) {
        setTripsList(tripsList.map(t => (t._id === editingTripId || t.id === editingTripId) ? { ...t, ...payload } : t));
      } else {
        setTripsList([{ ...payload, id: Date.now() }, ...tripsList]);
      }
      setTripFormSuccess('Saved successfully!');
      setTimeout(() => {
        setTripFormSuccess('');
        setShowTripModal(false);
      }, 1200);
    }
  };

  const handleDeleteTrip = async (id) => {
    if (!window.confirm('Delete this trip package from catalog?')) return;
    try {
      await deleteTripApi(id);
    } catch (e) {
      console.warn('Delete trip offline mode');
    }
    setTripsList(tripsList.filter((t) => t.id !== id && t._id !== id));
  };

  const handleBookingStatus = (id, newStatus) => {
    setMasterBookings(masterBookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
  };

  const handleSelectTripSeo = (tripId) => {
    setSelectedSeoTripId(tripId);
    const target = tripsList.find((t) => t.id === Number(tripId) || t.id === tripId || t._id === tripId);
    if (target) {
      const cleanSlug = target.slug || target.title?.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
      setTripSeoForm({
        seoTitle: target.seo?.metaTitle || target.seo?.seoTitle || `${target.title} (${target.duration}) | WanderLuxe Expeditions`,
        metaTitle: target.seo?.metaTitle || target.seo?.seoTitle || `${target.title} (${target.duration}) | WanderLuxe Expeditions`,
        metaDescription: target.seo?.metaDescription || target.overview || `Book ${target.title} group departure in ${target.location}. Duration: ${target.duration}. Price: ₹${target.price?.toLocaleString()}. Certified captain inclusive.`,
        focusKeyword: target.seo?.focusKeyword || (Array.isArray(target.tags) ? target.tags[0] : 'Backpacking'),
        keywords: target.seo?.keywords || (Array.isArray(target.tags) ? target.tags.join(', ') : 'group travel, backpacking, adventure'),
        canonicalUrl: target.seo?.canonicalUrl || `https://wanderluxe.in/trip/${cleanSlug}`,
        indexingDirective: target.seo?.indexingDirective || target.seo?.robots || 'index, follow',
        robots: target.seo?.robots || target.seo?.indexingDirective || 'index, follow',
        ogTitle: target.seo?.ogTitle || target.title,
        ogDescription: target.seo?.ogDescription || target.seo?.metaDescription || `Join ${target.title} group departure in ${target.location}.`,
        ogImage: target.seo?.ogImage || target.image,
        ogType: target.seo?.ogType || 'website',
        twitterCard: target.seo?.twitterCard || 'summary_large_image',
        twitterTitle: target.seo?.twitterTitle || target.title,
        twitterDescription: target.seo?.twitterDescription || target.seo?.metaDescription,
        twitterImage: target.seo?.twitterImage || target.image,
        structuredDataType: target.seo?.structuredDataType || 'TouristTrip',
        structuredDataJson: target.seo?.structuredDataJson || '',
        seoHealthScore: target.seo?.seoHealthScore || 95
      });
    }
  };

  const handleSaveTripSeo = async (e) => {
    e.preventDefault();
    try {
      await updateTripSeoApi(selectedSeoTripId, tripSeoForm);
    } catch (e) {
      console.warn('Trip SEO save fallback');
    }
    // Update in local state
    setTripsList(tripsList.map(t => (t.id === selectedSeoTripId || t._id === selectedSeoTripId) ? { ...t, seo: { ...t.seo, ...tripSeoForm } } : t));
    setSeoSavedSuccess(true);
    setTimeout(() => setSeoSavedSuccess(false), 3000);
  };

  const handleOpenCmsModal = (page = null) => {
    if (page) {
      setEditingPageId(page._id);
      setCmsForm({
        title: page.title || '',
        slug: page.slug || '',
        heroSubtitle: page.heroSubtitle || '',
        category: page.category || 'Guides',
        content: page.content || '',
        status: page.status || 'published',
        author: page.author || 'WanderLuxe Editorial',
        seoTitle: page.seo?.metaTitle || '',
        metaDescription: page.seo?.metaDescription || '',
        keywords: page.seo?.keywords || '',
        canonicalUrl: page.seo?.canonicalUrl || '',
        robots: page.seo?.robots || 'index, follow',
        ogTitle: page.seo?.ogTitle || '',
        ogDescription: page.seo?.ogDescription || '',
        ogImage: page.seo?.ogImage || '',
        structuredDataType: page.seo?.structuredDataType || 'TouristAttraction',
        structuredDataJson: page.seo?.structuredDataJson || ''
      });
    } else {
      setEditingPageId(null);
      setCmsForm({
        title: '',
        slug: '',
        heroSubtitle: '',
        category: 'Guides',
        content: '',
        status: 'published',
        author: 'WanderLuxe Editorial',
        seoTitle: '',
        metaDescription: '',
        keywords: '',
        canonicalUrl: '',
        robots: 'index, follow',
        ogTitle: '',
        ogDescription: '',
        ogImage: '',
        structuredDataType: 'TouristAttraction',
        structuredDataJson: ''
      });
    }
    setShowCmsModal(true);
  };

  const handleSaveCmsPage = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: cmsForm.title,
        slug: cmsForm.slug || cmsForm.title.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        heroSubtitle: cmsForm.heroSubtitle,
        category: cmsForm.category,
        content: cmsForm.content,
        status: cmsForm.status,
        author: cmsForm.author,
        seo: {
          metaTitle: cmsForm.seoTitle || `${cmsForm.title} | WanderLuxe`,
          metaDescription: cmsForm.metaDescription || cmsForm.heroSubtitle || cmsForm.title,
          keywords: cmsForm.keywords,
          canonicalUrl: cmsForm.canonicalUrl || `https://wanderluxe.in/page/${cmsForm.slug}`,
          robots: cmsForm.robots,
          ogTitle: cmsForm.ogTitle || cmsForm.seoTitle || cmsForm.title,
          ogDescription: cmsForm.ogDescription || cmsForm.metaDescription,
          ogImage: cmsForm.ogImage,
          structuredDataType: cmsForm.structuredDataType,
          structuredDataJson: cmsForm.structuredDataJson
        }
      };

      if (editingPageId) {
        const updated = await updatePageApi(editingPageId, payload);
        setCmsPages(cmsPages.map(p => p._id === editingPageId ? updated.page : p));
      } else {
        const created = await createPageApi(payload);
        setCmsPages([created.page, ...cmsPages]);
      }
      setCmsFormSuccess('Page and SEO configuration saved successfully!');
      setTimeout(() => {
        setCmsFormSuccess('');
        setShowCmsModal(false);
      }, 1200);
    } catch (err) {
      alert(err.message || 'Error saving dynamic page');
    }
  };

  const handleDeleteCmsPage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this custom page?')) return;
    try {
      await deletePageApi(id);
      setCmsPages(cmsPages.filter(p => p._id !== id));
    } catch (err) {
      alert(err.message || 'Failed to delete page');
    }
  };

  // Helper to compute live SEO score for form editor (0-100%)
  const computeLiveSeoScore = () => {
    let score = 0;
    const title = cmsForm.seoTitle || cmsForm.title || '';
    const desc = cmsForm.metaDescription || cmsForm.heroSubtitle || '';
    if (title.length >= 30 && title.length <= 65) score += 25; else if (title.length > 0) score += 12;
    if (desc.length >= 110 && desc.length <= 165) score += 25; else if (desc.length > 0) score += 12;
    if (cmsForm.keywords && cmsForm.keywords.length > 3) score += 15;
    if (cmsForm.ogImage) score += 15;
    if (cmsForm.canonicalUrl && cmsForm.canonicalUrl.startsWith('http')) score += 10;
    if (cmsForm.structuredDataType) score += 10;
    return score;
  };

  return (
    <div className="min-h-screen bg-brand-light pt-24 pb-24">
      {/* Create Coupon Modal */}
      <AnimatePresence>
        {showCouponModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCouponModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl relative border border-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowCouponModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-brand-navy">
                <X size={20} />
              </button>

              <h2 className="text-xl font-extrabold text-brand-navy mb-4 flex items-center gap-2">
                <Tag size={20} className="text-brand-emerald" /> Create Coupon Code
              </h2>

              <form onSubmit={handleAddCoupon} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Coupon Code</label>
                  <input
                    type="text"
                    value={newCoupon.code}
                    onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                    placeholder="e.g. FESTIVE25"
                    className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold uppercase focus:outline-none focus:border-brand-emerald"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Discount Type</label>
                    <select
                      value={newCoupon.type}
                      onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                      className="w-full px-3 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="flat">Flat Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Discount Value</label>
                    <input
                      type="number"
                      value={newCoupon.value}
                      onChange={(e) => setNewCoupon({ ...newCoupon, value: e.target.value })}
                      placeholder="10 or 500"
                      className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-emerald text-white rounded-2xl font-extrabold text-sm hover:bg-brand-teal transition-all shadow-md mt-2"
                >
                  Create & Activate Coupon
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create / Edit Trip Package & SEO Landing Page Studio Modal */}
      <AnimatePresence>
        {showTripModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
            onClick={() => setShowTripModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl max-w-4xl w-full p-6 md:p-8 shadow-2xl relative border border-gray-100 my-8 max-h-[92vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button id="close-trip-modal" onClick={() => setShowTripModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-brand-navy">
                <X size={22} />
              </button>

              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100 mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-emerald-50 text-brand-emerald rounded-xl">
                      <Layers size={20} />
                    </span>
                    <h2 className="text-xl font-black text-brand-navy">
                      {editingTripId ? 'Edit Trip Package & SEO Settings' : 'Create New Trip Package & SEO Landing Page'}
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-1">
                    Configure trip pricing, media, search engine optimization tags, canonical URLs, and publish as a dedicated landing page.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {/* Live SEO Score Indicator */}
                  <div className="bg-brand-navy text-white px-4 py-2 rounded-2xl text-center shrink-0">
                    <span className="text-[10px] text-brand-emerald font-bold uppercase tracking-wider block">SEO Health Score</span>
                    <span className="text-lg font-black text-emerald-300">{computeLiveTripSeoScore(tripForm)}%</span>
                  </div>
                </div>
              </div>

              {tripFormSuccess && (
                <div className="mb-4 p-3.5 rounded-2xl bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-md animate-bounce">
                  <CheckCircle2 size={18} /> {tripFormSuccess}
                </div>
              )}

              {/* Sub-Tab Navigation inside Trip Modal */}
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-3 overflow-x-auto">
                {[
                  { id: 'basic', label: '1. Trip Core Details', icon: <Layers size={14} /> },
                  { id: 'landing_page', label: '2. Dedicated SEO Landing Page', icon: <FileText size={14} />, badge: tripForm.publishAsPage ? 'Enabled' : null },
                  { id: 'seo_studio', label: '3. SEO & SERP Studio', icon: <Globe size={14} />, score: `${computeLiveTripSeoScore(tripForm)}%` }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setTripModalTab(tab.id)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
                      tripModalTab === tab.id
                        ? 'bg-brand-navy text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tab.icon} {tab.label}
                    {tab.badge && (
                      <span className="bg-brand-emerald text-white text-[10px] px-2 py-0.5 rounded-full font-black">
                        {tab.badge}
                      </span>
                    )}
                    {tab.score && (
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-black">
                        {tab.score}
                      </span>
                    )}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={handleAutoGenerateSeo}
                  className="ml-auto px-3.5 py-2 bg-gradient-to-r from-amber-500 to-emerald-600 text-white rounded-2xl text-xs font-black hover:opacity-90 transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Sparkles size={14} /> Auto-Generate SEO
                </button>
              </div>

              <form onSubmit={handleSaveTrip} className="space-y-6">
                {/* TAB 1: BASIC TRIP DETAILS */}
                {tripModalTab === 'basic' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Trip Title *</label>
                        <input
                          id="trip-title-input"
                          type="text"
                          value={tripForm.title}
                          onChange={(e) => setTripForm({ ...tripForm, title: e.target.value })}
                          placeholder="e.g. Meghalaya Backpacking: Living Root Bridges"
                          className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-navy uppercase mb-1">URL Slug (/trip/your-slug)</label>
                        <input
                          type="text"
                          value={tripForm.slug}
                          onChange={(e) => setTripForm({ ...tripForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                          placeholder="e.g. meghalaya-backpacking-root-bridges"
                          className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold font-mono focus:outline-none focus:border-brand-emerald"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Location / State *</label>
                        <input
                          id="trip-location-input"
                          type="text"
                          value={tripForm.location}
                          onChange={(e) => setTripForm({ ...tripForm, location: e.target.value })}
                          placeholder="e.g. Meghalaya"
                          className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Destination / Region</label>
                        <input
                          type="text"
                          value={tripForm.destination}
                          onChange={(e) => setTripForm({ ...tripForm, destination: e.target.value })}
                          placeholder="e.g. Northeast India"
                          className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Duration *</label>
                        <input
                          id="trip-duration-input"
                          type="text"
                          value={tripForm.duration}
                          onChange={(e) => setTripForm({ ...tripForm, duration: e.target.value })}
                          placeholder="e.g. 5N/6D"
                          className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Package Price (₹) *</label>
                        <input
                          id="trip-price-input"
                          type="number"
                          value={tripForm.price}
                          onChange={(e) => setTripForm({ ...tripForm, price: e.target.value })}
                          placeholder="e.g. 18500"
                          className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Original Cut Price (₹)</label>
                        <input
                          type="number"
                          value={tripForm.originalPrice}
                          onChange={(e) => setTripForm({ ...tripForm, originalPrice: e.target.value })}
                          placeholder="e.g. 22500"
                          className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Upcoming Batch Dates</label>
                        <input
                          type="text"
                          value={tripForm.nextBatch}
                          onChange={(e) => setTripForm({ ...tripForm, nextBatch: e.target.value })}
                          placeholder="e.g. 15 Sep - 20 Sep"
                          className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Tags (Comma Separated)</label>
                      <input
                        id="trip-tags-input"
                        type="text"
                        value={tripForm.tags}
                        onChange={(e) => setTripForm({ ...tripForm, tags: e.target.value })}
                        placeholder="e.g. Trending, Adventure, Backpacking, Waterfalls"
                        className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Overview Summary</label>
                      <textarea
                        rows={3}
                        value={tripForm.overview}
                        onChange={(e) => setTripForm({ ...tripForm, overview: e.target.value })}
                        placeholder="Detailed itinerary overview, highlights, and experience description..."
                        className="w-full px-4 py-2.5 bg-brand-light border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-brand-emerald"
                      />
                    </div>

                    {/* Media Uploader */}
                    <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                      <div className="text-xs font-extrabold text-brand-navy uppercase mb-3 flex items-center gap-2">
                        <Upload size={14} className="text-brand-emerald" /> Trip Cover Image / Video
                      </div>
                      <MediaUploader
                        mode="both"
                        folder="wanderluxe/trip-covers"
                        label=""
                        compact={true}
                        onUploadSuccess={(media) => {
                          setTripForm(prev => ({ 
                            ...prev, 
                            image: media.url,
                            seo: { ...prev.seo, ogImage: media.url, twitterImage: media.url }
                          }));
                        }}
                      />
                      {tripForm.image && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-xs text-brand-emerald font-bold">✓ Media Ready</span>
                          <span className="text-[10px] text-gray-400 truncate max-w-xs font-mono">{tripForm.image}</span>
                        </div>
                      )}
                      <div className="mt-2">
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Or direct media URL</label>
                        <input
                          id="trip-image-url-input"
                          type="url"
                          value={tripForm.image}
                          onChange={(e) => setTripForm({ 
                            ...tripForm, 
                            image: e.target.value,
                            seo: { ...tripForm.seo, ogImage: e.target.value, twitterImage: e.target.value }
                          })}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-brand-emerald"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: PUBLISH AS DEDICATED SEO LANDING PAGE */}
                {tripModalTab === 'landing_page' && (
                  <div className="space-y-5 bg-teal-50/50 p-6 rounded-3xl border border-teal-200/70">
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-teal-200 shadow-sm">
                      <div>
                        <h3 className="text-sm font-black text-brand-navy flex items-center gap-2">
                          <FileText size={18} className="text-brand-emerald" /> Publish as Dedicated SEO Landing Page
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          When active, creates an SEO-indexed page accessible at <span className="font-mono text-brand-emerald font-bold">/page/{tripForm.pageSlug || tripForm.slug || 'custom-slug'}</span>
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={tripForm.publishAsPage}
                          onChange={(e) => setTripForm({ ...tripForm, publishAsPage: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-emerald"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Page Dedicated Slug (/page/slug) *</label>
                        <input
                          type="text"
                          value={tripForm.pageSlug}
                          onChange={(e) => setTripForm({ ...tripForm, pageSlug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                          placeholder="e.g. meghalaya-travel-guide-2026"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-mono font-bold focus:outline-none focus:border-brand-emerald"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Landing Page Hero Subtitle</label>
                        <input
                          type="text"
                          value={tripForm.pageSubtitle}
                          onChange={(e) => setTripForm({ ...tripForm, pageSubtitle: e.target.value })}
                          placeholder="e.g. 5 Days Curated Group Backpacking Experience in Meghalaya"
                          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-brand-navy uppercase mb-1">In-Depth Landing Page Content & Article</label>
                      <textarea
                        rows={5}
                        value={tripForm.pageContent}
                        onChange={(e) => setTripForm({ ...tripForm, pageContent: e.target.value })}
                        placeholder="Write a comprehensive guide, detailed highlights, traveler tips, weather details, and essential packing suggestions..."
                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-brand-emerald leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: SEARCH ENGINE OPTIMIZATION (SEO) STUDIO */}
                {tripModalTab === 'seo_studio' && (
                  <div className="space-y-6">
                    {/* Live SERP Google Search Snippet Preview */}
                    <div className="bg-gray-50 p-5 rounded-3xl border border-gray-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-brand-navy uppercase flex items-center gap-1.5">
                          <Search size={14} className="text-blue-500" /> Google Search SERP Result Preview
                        </span>
                        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200">
                          <button
                            type="button"
                            onClick={() => setSerpPreviewMode('desktop')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                              serpPreviewMode === 'desktop' ? 'bg-brand-navy text-white' : 'text-gray-500'
                            }`}
                          >
                            <Monitor size={12} /> Desktop
                          </button>
                          <button
                            type="button"
                            onClick={() => setSerpPreviewMode('mobile')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 ${
                              serpPreviewMode === 'mobile' ? 'bg-brand-navy text-white' : 'text-gray-500'
                            }`}
                          >
                            <Smartphone size={12} /> Mobile
                          </button>
                        </div>
                      </div>

                      {/* Google Search Card Preview */}
                      <div className={`bg-white p-4 rounded-2xl border border-gray-200 shadow-sm ${serpPreviewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                        <div className="text-[11px] text-[#202124] flex items-center gap-1.5 mb-1 font-mono">
                          <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">W</span>
                          <span className="text-gray-600 truncate">https://wanderluxe.in &gt; trip &gt; {tripForm.slug || 'meghalaya-backpacking'}</span>
                        </div>
                        <h4 className="text-[#1a0dab] hover:underline font-medium text-base sm:text-lg leading-snug cursor-pointer line-clamp-1">
                          {tripForm.seo.metaTitle || tripForm.seo.seoTitle || `${tripForm.title || 'Meghalaya Backpacking'} | WanderLuxe`}
                        </h4>
                        <p className="text-[#4d5156] text-xs leading-relaxed mt-1 line-clamp-2">
                          {tripForm.seo.metaDescription || tripForm.overview || 'Book curated group trip departures with certified captains, boutique stays, and verified safety protocols.'}
                        </p>
                      </div>
                    </div>

                    {/* SEO Metadata Form Inputs */}
                    <div className="bg-white p-5 rounded-3xl border border-gray-200 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-brand-navy uppercase mb-1 flex items-center justify-between">
                            <span>Focus Primary Keyword</span>
                            <span className="text-[10px] text-gray-400 font-normal">e.g. Meghalaya Trip</span>
                          </label>
                          <input
                            type="text"
                            value={tripForm.seo.focusKeyword}
                            onChange={(e) => setTripForm({ ...tripForm, seo: { ...tripForm.seo, focusKeyword: e.target.value } })}
                            placeholder="e.g. Meghalaya Backpacking Tour"
                            className="w-full px-4 py-2.5 bg-brand-light border border-gray-200 rounded-xl text-xs font-bold focus:border-brand-emerald focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-brand-navy uppercase mb-1">
                            Indexing Directives
                          </label>
                          <select
                            value={tripForm.seo.robots || tripForm.seo.indexingDirective}
                            onChange={(e) => setTripForm({ ...tripForm, seo: { ...tripForm.seo, robots: e.target.value, indexingDirective: e.target.value } })}
                            className="w-full px-3 py-2.5 bg-brand-light border border-gray-200 rounded-xl text-xs font-bold focus:border-brand-emerald focus:outline-none"
                          >
                            <option value="index, follow">index, follow (Public Search Indexable)</option>
                            <option value="noindex, nofollow">noindex, nofollow (Private Shielded)</option>
                            <option value="index, nofollow">index, nofollow</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-brand-navy uppercase">
                            SEO Meta Title Tag *
                          </label>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            tripForm.seo.metaTitle.length >= 40 && tripForm.seo.metaTitle.length <= 65
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {tripForm.seo.metaTitle.length} / 60 Chars (Optimal: 40-65)
                          </span>
                        </div>
                        <input
                          type="text"
                          value={tripForm.seo.metaTitle}
                          onChange={(e) => setTripForm({ ...tripForm, seo: { ...tripForm.seo, metaTitle: e.target.value, seoTitle: e.target.value } })}
                          placeholder="e.g. Meghalaya Backpacking Tour (5D/4N) | Living Root Bridges & Dawki"
                          className="w-full px-4 py-2.5 bg-brand-light border border-gray-200 rounded-xl text-xs font-bold focus:border-brand-emerald focus:outline-none"
                          required
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-bold text-brand-navy uppercase">
                            SEO Meta Description *
                          </label>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            tripForm.seo.metaDescription.length >= 100 && tripForm.seo.metaDescription.length <= 165
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {tripForm.seo.metaDescription.length} / 160 Chars (Optimal: 100-165)
                          </span>
                        </div>
                        <textarea
                          rows={3}
                          value={tripForm.seo.metaDescription}
                          onChange={(e) => setTripForm({ ...tripForm, seo: { ...tripForm.seo, metaDescription: e.target.value } })}
                          placeholder="e.g. Book 5-day curated Meghalaya backpacking tour. Visit living root bridges, Dawki crystal river, and Cherrapunji with verified captains and 0% EMI."
                          className="w-full px-4 py-2.5 bg-brand-light border border-gray-200 rounded-xl text-xs font-medium focus:border-brand-emerald focus:outline-none leading-relaxed"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Meta Keywords / Search Tags</label>
                          <input
                            type="text"
                            value={tripForm.seo.keywords}
                            onChange={(e) => setTripForm({ ...tripForm, seo: { ...tripForm.seo, keywords: e.target.value } })}
                            placeholder="meghalaya tour, root bridges, dawki boating, group trips"
                            className="w-full px-4 py-2.5 bg-brand-light border border-gray-200 rounded-xl text-xs font-bold focus:border-brand-emerald focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Canonical URL Tag</label>
                          <input
                            type="text"
                            value={tripForm.seo.canonicalUrl}
                            onChange={(e) => setTripForm({ ...tripForm, seo: { ...tripForm.seo, canonicalUrl: e.target.value } })}
                            placeholder="https://wanderluxe.in/trip/meghalaya-backpacking"
                            className="w-full px-4 py-2.5 bg-brand-light border border-gray-200 rounded-xl text-xs font-mono font-bold focus:border-brand-emerald focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Open Graph & Twitter Social Tags */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                        <div>
                          <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Open Graph / Social Title</label>
                          <input
                            type="text"
                            value={tripForm.seo.ogTitle}
                            onChange={(e) => setTripForm({ ...tripForm, seo: { ...tripForm.seo, ogTitle: e.target.value, twitterTitle: e.target.value } })}
                            placeholder="Meghalaya Backpacking Tour"
                            className="w-full px-4 py-2.5 bg-brand-light border border-gray-200 rounded-xl text-xs font-bold focus:border-brand-emerald focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Open Graph / Social Image URL</label>
                          <input
                            type="text"
                            value={tripForm.seo.ogImage}
                            onChange={(e) => setTripForm({ ...tripForm, seo: { ...tripForm.seo, ogImage: e.target.value, twitterImage: e.target.value } })}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full px-4 py-2.5 bg-brand-light border border-gray-200 rounded-xl text-xs font-mono focus:border-brand-emerald focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Schema.org Structured Data */}
                      <div className="pt-2 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-bold text-brand-navy uppercase flex items-center gap-1.5">
                            <Sparkles size={14} className="text-brand-emerald" /> Schema.org JSON-LD Structured Data
                          </label>
                          <select
                            value={tripForm.seo.structuredDataType}
                            onChange={(e) => setTripForm({ ...tripForm, seo: { ...tripForm.seo, structuredDataType: e.target.value, structuredSchemaType: e.target.value } })}
                            className="px-2.5 py-1 bg-brand-light border border-gray-200 rounded-lg text-xs font-bold"
                          >
                            <option value="TouristTrip">TouristTrip (Recommended)</option>
                            <option value="Product">Product / Tour Package</option>
                            <option value="FAQPage">FAQPage</option>
                          </select>
                        </div>
                        <textarea
                          rows={4}
                          value={tripForm.seo.structuredDataJson}
                          onChange={(e) => setTripForm({ ...tripForm, seo: { ...tripForm.seo, structuredDataJson: e.target.value } })}
                          placeholder='{"@context": "https://schema.org", "@type": "TouristTrip", ...}'
                          className="w-full px-4 py-2 bg-gray-900 text-emerald-400 font-mono text-[11px] rounded-xl focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Save Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowTripModal(false)}
                    className="px-5 py-3 rounded-2xl text-xs font-extrabold text-gray-500 hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>

                  <div className="flex items-center gap-3">
                    {tripModalTab !== 'seo_studio' && (
                      <button
                        type="button"
                        onClick={() => setTripModalTab(tripModalTab === 'basic' ? 'landing_page' : 'seo_studio')}
                        className="px-5 py-3 bg-gray-100 text-brand-navy text-xs font-extrabold rounded-2xl hover:bg-gray-200 transition-all"
                      >
                        Next Section →
                      </button>
                    )}

                    <button
                      id="submit-trip-btn"
                      type="submit"
                      className="px-6 py-3.5 bg-brand-emerald text-white rounded-2xl font-extrabold text-xs hover:bg-brand-teal transition-all shadow-md flex items-center gap-2"
                    >
                      <Save size={16} /> {editingTripId ? 'Save & Update Trip & SEO' : 'Create & Publish Trip Package'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 md:px-8">
        {/* Header Admin Banner */}
        <div className="bg-brand-navy text-white rounded-3xl p-6 md:p-8 shadow-2xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-brand-emerald/20 text-brand-emerald border border-brand-emerald/30 text-xs font-extrabold px-3 py-1 rounded-full inline-block">
                Master Admin Control Panel
              </span>
              <span className="text-xs text-white/60 font-mono">
                Admin: {user?.email || 'gaurav999@gmail.com'}
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold">System Overview & Influencer Engine</h1>
            <p className="text-white/70 text-xs md:text-sm font-medium mt-1">
              Sales revenue analytics, Influencer verification approvals, trip-level SEO configurator, and master bookings logs.
            </p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <button
              onClick={handleOpenAddTripModal}
              className="px-5 py-3 bg-brand-emerald text-white text-xs font-extrabold rounded-2xl hover:bg-brand-teal transition-all shadow-lg flex items-center gap-2"
            >
              <Plus size={16} /> Add Package & SEO Page
            </button>
            <button
              onClick={handleAdminLogout}
              className="px-4 py-3 bg-white/10 text-white hover:bg-red-600 border border-white/20 transition-all text-xs font-extrabold rounded-2xl flex items-center gap-1.5"
            >
              <LogOut size={16} /> Exit Admin
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 mb-8">
          {[
            { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={15} /> },
            { id: 'trips', label: 'Trip Catalog & SEO', icon: <Layers size={15} /> },
            { id: 'trip_seo_manager', label: 'SEO Studio', icon: <Globe size={15} /> },
            { id: 'pages_cms', label: 'Dynamic Pages CMS', icon: <FileText size={15} /> },
            { id: 'influencer_verification', label: 'Influencer Approvals', icon: <UserCheck size={15} /> },
            { id: 'influencer_plans', label: 'Influencer Plans', icon: <Sparkles size={15} /> },
            { id: 'payouts', label: 'Payout Approvals', icon: <Wallet size={15} /> },
            { id: 'coupons', label: 'Discount Engine', icon: <Tag size={15} /> },
            { id: 'users', label: 'Users & Roles', icon: <Users size={15} /> },
            { id: 'media_library', label: 'Media Library', icon: <Image size={15} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-2xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-navy text-white shadow-lg'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* FEATURE 1: INFLUENCER VERIFICATION & APPROVALS TAB */}
        {activeTab === 'influencer_verification' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
                  <UserCheck size={22} className="text-brand-emerald" /> Influencer Verification & Approval Engine
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Review applicant profile, social metrics, and approve/reject creator accounts. Approved creators gain full Influencer Portal access.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                  {influencerApplications?.filter(a => a.status === 'pending').length || 0} Pending Requests
                </span>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                  {influencerApplications?.filter(a => a.status === 'approved').length || 1} Active Creators
                </span>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-navy text-white uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Applicant</th>
                    <th className="p-4">Social Handle / Platform</th>
                    <th className="p-4">Followers</th>
                    <th className="p-4">Niche</th>
                    <th className="p-4">Applied Date</th>
                    <th className="p-4">Verification Status</th>
                    <th className="p-4 text-right">Admin Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {influencerApplications?.map((app) => (
                    <tr key={app.id || app._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-brand-navy text-sm">{app.name}</div>
                        <div className="text-[11px] text-gray-400 font-mono">{app.email}</div>
                      </td>
                      <td className="p-4 font-mono font-bold text-brand-emerald">
                        {app.socialHandle} <span className="text-gray-400 font-normal">({app.platform})</span>
                      </td>
                      <td className="p-4 font-extrabold text-brand-navy">{app.followerCount}</td>
                      <td className="p-4 text-gray-600">{app.niche}</td>
                      <td className="p-4 text-gray-500">{app.appliedAt || '12 Aug 2026'}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                          app.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          app.status === 'rejected' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        {app.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => approveInfluencerApplication(app.userId || app._id || app.id)}
                              className="px-3.5 py-1.5 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-md inline-flex items-center gap-1"
                            >
                              <UserCheck size={14} /> Approve & Activate
                            </button>
                            <button
                              onClick={() => rejectInfluencerApplication(app.userId || app._id || app.id, 'Criteria not met')}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors inline-flex items-center gap-1"
                            >
                              <UserX size={14} /> Reject
                            </button>
                          </>
                        ) : (
                          <span className="text-xs font-bold text-gray-400">Decision Finalized</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* FEATURE 2: TRIP-LEVEL SEO MANAGER TAB */}
        {activeTab === 'trip_seo_manager' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
                  <Globe size={22} className="text-brand-emerald" /> Trip SEO & SERP Optimization Studio
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Inspect and fine-tune search engine meta titles, descriptions, canonical tags, open graph attributes, and JSON-LD structured schema for each departure package.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {seoSavedSuccess && (
                  <div className="px-4 py-2 bg-emerald-500 text-white text-xs font-extrabold rounded-2xl shadow-lg flex items-center gap-1.5 animate-bounce">
                    <CheckCircle2 size={16} /> Trip SEO Saved & Deployed to Production!
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleOpenAddTripModal}
                  className="px-4 py-2.5 bg-brand-emerald text-white rounded-2xl text-xs font-extrabold hover:bg-brand-teal transition-all shadow-sm flex items-center gap-1.5"
                >
                  <Plus size={15} /> Add New Trip & SEO
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trip Package List Selector */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-brand-navy text-sm uppercase">Select Departure</h3>
                  <span className="text-[11px] text-gray-400 font-bold">{tripsList.length} Packages</span>
                </div>

                <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                  {tripsList.map((t) => {
                    const isSelected = selectedSeoTripId === t.id || selectedSeoTripId === t._id;
                    return (
                      <button
                        key={t._id || t.id}
                        onClick={() => handleSelectTripSeo(t._id || t.id)}
                        className={`w-full p-3.5 rounded-2xl text-left text-xs font-bold transition-all flex flex-col gap-1 border ${
                          isSelected
                            ? 'bg-brand-navy text-white border-brand-navy shadow-md'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate max-w-[170px] font-extrabold">{t.title}</span>
                          <span className={`text-[10px] font-mono shrink-0 ${isSelected ? 'text-emerald-300 font-black' : 'text-brand-emerald'}`}>
                            ₹{t.price?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-md ${isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 font-bold'}`}>
                            SEO {t.seo?.seoHealthScore || 92}%
                          </span>
                          {t.publishAsPage && (
                            <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-md font-bold">
                              Page Active
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Trip SEO Form & Live Google SERP Preview */}
              <div className="lg:col-span-2 space-y-6">
                {/* Live SERP Google Search Box */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-xs font-black uppercase text-brand-navy flex items-center gap-1.5">
                      <Search size={16} className="text-blue-600" /> Google Search SERP Real-Time Snippet
                    </span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-black rounded-full uppercase">
                      Score: {tripSeoForm.seoHealthScore || 95}/100
                    </span>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                    <div className="text-[11px] text-[#202124] flex items-center gap-1.5 font-mono">
                      <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">W</span>
                      <span className="text-gray-500 truncate">{tripSeoForm.canonicalUrl || 'https://wanderluxe.in/trip/...'}</span>
                    </div>
                    <h4 className="text-[#1a0dab] font-semibold text-base md:text-lg leading-snug line-clamp-1 hover:underline cursor-pointer">
                      {tripSeoForm.seoTitle || tripSeoForm.metaTitle || 'Curated Group Trip | WanderLuxe Expeditions'}
                    </h4>
                    <p className="text-[#4d5156] text-xs leading-relaxed line-clamp-2">
                      {tripSeoForm.metaDescription || 'Book group departures with certified captains, boutique stays, and verified safety protocols.'}
                    </p>
                  </div>
                </div>

                {/* Editable SEO Parameters */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-sm">
                  <form onSubmit={handleSaveTripSeo} className="space-y-4 text-xs font-bold">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-700 uppercase block mb-1">Focus Keyword</label>
                        <input
                          type="text"
                          value={tripSeoForm.focusKeyword || ''}
                          onChange={(e) => setTripSeoForm({ ...tripSeoForm, focusKeyword: e.target.value })}
                          placeholder="e.g. Meghalaya Backpacking"
                          className="w-full bg-brand-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-brand-navy focus:border-brand-emerald focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-gray-700 uppercase block mb-1">Indexing Directives</label>
                        <select
                          value={tripSeoForm.indexingDirective || tripSeoForm.robots}
                          onChange={(e) => setTripSeoForm({ ...tripSeoForm, indexingDirective: e.target.value, robots: e.target.value })}
                          className="w-full bg-brand-light border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-brand-navy focus:border-brand-emerald focus:outline-none"
                        >
                          <option value="index, follow">index, follow (Public Search Indexable)</option>
                          <option value="noindex, nofollow">noindex, nofollow (Shielded Private)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-gray-700 uppercase">SEO Page Title Tag</label>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          (tripSeoForm.seoTitle || '').length >= 40 && (tripSeoForm.seoTitle || '').length <= 65
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {(tripSeoForm.seoTitle || '').length} / 60 Chars
                        </span>
                      </div>
                      <input
                        type="text"
                        value={tripSeoForm.seoTitle}
                        onChange={(e) => setTripSeoForm({ ...tripSeoForm, seoTitle: e.target.value, metaTitle: e.target.value })}
                        className="w-full bg-brand-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-brand-navy focus:border-brand-emerald focus:outline-none"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-gray-700 uppercase">Meta Description</label>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          (tripSeoForm.metaDescription || '').length >= 100 && (tripSeoForm.metaDescription || '').length <= 165
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {(tripSeoForm.metaDescription || '').length} / 160 Chars
                        </span>
                      </div>
                      <textarea
                        rows={3}
                        value={tripSeoForm.metaDescription}
                        onChange={(e) => setTripSeoForm({ ...tripSeoForm, metaDescription: e.target.value })}
                        className="w-full bg-brand-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-brand-navy focus:border-brand-emerald focus:outline-none leading-relaxed"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-700 uppercase block mb-1">Keywords / Search Tags</label>
                        <input
                          type="text"
                          value={tripSeoForm.keywords || ''}
                          onChange={(e) => setTripSeoForm({ ...tripSeoForm, keywords: e.target.value })}
                          placeholder="comma, separated, tags"
                          className="w-full bg-brand-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-brand-navy focus:border-brand-emerald focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-gray-700 uppercase block mb-1">Canonical Tag URL</label>
                        <input
                          type="text"
                          value={tripSeoForm.canonicalUrl}
                          onChange={(e) => setTripSeoForm({ ...tripSeoForm, canonicalUrl: e.target.value })}
                          className="w-full bg-brand-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono text-brand-navy focus:border-brand-emerald focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-gray-700 uppercase block mb-1">Open Graph Title</label>
                        <input
                          type="text"
                          value={tripSeoForm.ogTitle}
                          onChange={(e) => setTripSeoForm({ ...tripSeoForm, ogTitle: e.target.value })}
                          className="w-full bg-brand-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-brand-navy focus:border-brand-emerald focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-gray-700 uppercase block mb-1">Open Graph Image URL</label>
                        <input
                          type="text"
                          value={tripSeoForm.ogImage}
                          onChange={(e) => setTripSeoForm({ ...tripSeoForm, ogImage: e.target.value })}
                          className="w-full bg-brand-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono text-brand-navy focus:border-brand-emerald focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-brand-emerald hover:bg-brand-teal text-white rounded-2xl font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-2 mt-4"
                    >
                      <Save size={16} /> Save & Deploy Trip SEO Metadata
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 1: ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/80">
                <span className="text-xs font-bold text-gray-400 uppercase">Gross Revenue</span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-brand-navy mt-1">₹48,50,000</h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-2 inline-block">
                  +24.5% vs last month
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/80">
                <span className="text-xs font-bold text-gray-400 uppercase">Total Bookings</span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-brand-navy mt-1">{stats.totalBookings}</h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-2 inline-block">
                  1,140 Confirmed
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/80">
                <span className="text-xs font-bold text-gray-400 uppercase">Active Departures</span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-brand-navy mt-1">{stats.activeTrips}</h3>
                <span className="text-xs font-bold text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded mt-2 inline-block">
                  100% On-time
                </span>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200/80">
                <span className="text-xs font-bold text-gray-400 uppercase">Lead Conversion</span>
                <h3 className="text-2xl md:text-3xl font-extrabold text-brand-navy mt-1">{stats.conversionRate}</h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mt-2 inline-block">
                  342 Leads This Month
                </span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: TRIP CATALOG */}
        {activeTab === 'trips' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
                  <Layers size={22} className="text-brand-emerald" /> Trip Package & SEO Landing Catalog ({tripsList.length})
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Manage trips, edit core pricing, review SEO health scores, and open dedicated SEO landing pages anytime.
                </p>
              </div>
              <button
                onClick={handleOpenAddTripModal}
                className="px-4 py-2.5 bg-brand-emerald text-white rounded-2xl text-xs font-bold hover:bg-brand-teal transition-all shadow-md flex items-center gap-2 shrink-0"
              >
                <Plus size={16} /> Create Trip Package & SEO Page
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tripsList.map((trip) => {
                const tripId = trip._id || trip.id;
                const cleanSlug = trip.slug || trip.title?.toLowerCase().replace(/[^a-z0-9-]+/g, '-');
                const pageSlug = trip.pageSlug || cleanSlug;
                const seoScore = trip.seo?.seoHealthScore || 92;

                return (
                  <div key={tripId} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200/80 flex flex-col justify-between hover:shadow-lg transition-all">
                    <div>
                      <div className="h-48 overflow-hidden relative">
                        <img src={trip.image} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-3 left-3 bg-brand-navy/90 text-white text-[10px] font-black px-3 py-1 rounded-full shadow">
                          {trip.duration}
                        </span>

                        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                          <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                            <Sparkles size={11} /> SEO {seoScore}%
                          </span>
                          {trip.publishAsPage && (
                            <span className="bg-teal-700/90 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow flex items-center gap-1">
                              <FileText size={11} /> Landing Page Active
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
                          <span className="flex items-center gap-1">
                            <MapPin size={14} className="text-brand-emerald" /> {trip.location}
                          </span>
                          <span className="text-gray-400 font-mono">Next: {trip.nextBatch || '15 Sep'}</span>
                        </div>

                        <h3 className="font-extrabold text-brand-navy text-base leading-snug line-clamp-2">
                          {trip.title}
                        </h3>

                        <div className="flex items-baseline gap-2">
                          <span className="text-lg font-black text-brand-emerald">₹{trip.price?.toLocaleString()}</span>
                          {trip.originalPrice && (
                            <span className="text-xs text-gray-400 line-through">₹{trip.originalPrice?.toLocaleString()}</span>
                          )}
                        </div>

                        {/* Live SEO summary */}
                        <div className="p-3 bg-gray-50 rounded-2xl text-[11px] text-gray-600 space-y-1">
                          <div className="truncate font-semibold">
                            <span className="text-gray-400 font-bold uppercase text-[9px] block">Meta Title</span>
                            {trip.seo?.metaTitle || trip.seo?.seoTitle || trip.title}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex flex-col gap-2">
                      <div className="flex items-center justify-between gap-2">
                        <button
                          onClick={() => handleOpenEditTripModal(trip)}
                          className="flex-1 px-3 py-2 bg-brand-navy text-white rounded-xl text-xs font-bold hover:bg-brand-navy/90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Edit3 size={13} /> Edit Trip & SEO
                        </button>
                        <button
                          onClick={() => handleDeleteTrip(tripId)}
                          className="p-2 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                          title="Delete trip package"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between text-[11px] font-bold text-brand-emerald pt-1">
                        <Link
                          to={`/trip/${cleanSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline flex items-center gap-1"
                        >
                          <ExternalLink size={12} /> View Trip Details
                        </Link>
                        {trip.publishAsPage && (
                          <Link
                            to={`/page/${pageSlug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-700 hover:underline flex items-center gap-1"
                          >
                            <FileText size={12} /> View Landing Page
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FEATURE: DYNAMIC PAGES & BACKEND SEO CMS TAB */}
        {activeTab === 'pages_cms' && (
          <div className="space-y-6">
            {/* Modal for Creating / Editing Dynamic Pages */}
            <AnimatePresence>
              {showCmsModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                  onClick={() => setShowCmsModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 shadow-2xl relative border border-gray-100 my-8 max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button onClick={() => setShowCmsModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-brand-navy">
                      <X size={20} />
                    </button>

                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
                      <div>
                        <h2 className="text-xl font-black text-brand-navy flex items-center gap-2">
                          <FileText className="text-brand-emerald" size={22} />
                          {editingPageId ? 'Edit Dynamic Page & SEO' : 'Create Dynamic Page directly according to Plan'}
                        </h2>
                        <p className="text-xs text-gray-500 font-medium">
                          Add custom pages anytime with complete backend SEO parameters (Meta Tags, OG Cards, JSON-LD Schema).
                        </p>
                      </div>

                      {/* Live SEO Score Gauge */}
                      <div className="bg-brand-navy text-white px-3.5 py-2 rounded-2xl text-center shrink-0">
                        <span className="text-[10px] text-brand-emerald font-bold uppercase tracking-wider block">Live SEO Audit Score</span>
                        <span className="text-lg font-black text-emerald-300">{computeLiveSeoScore()}%</span>
                      </div>
                    </div>

                    {cmsFormSuccess && (
                      <div className="mb-4 p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-2">
                        <CheckCircle2 size={16} /> {cmsFormSuccess}
                      </div>
                    )}

                    <form onSubmit={handleSaveCmsPage} className="space-y-6">
                      {/* Section 1: Page Details */}
                      <div className="space-y-4 bg-gray-50 p-5 rounded-2xl border border-gray-200/60">
                        <h3 className="text-xs font-black uppercase text-brand-navy tracking-wider">1. Page Content & Info</h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-extrabold text-brand-navy uppercase mb-1">Page Title *</label>
                            <input
                              type="text"
                              value={cmsForm.title}
                              onChange={(e) => setCmsForm({ ...cmsForm, title: e.target.value })}
                              placeholder="e.g. Complete Meghalaya Travel Guide 2026"
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-extrabold text-brand-navy uppercase mb-1">URL Slug (e.g. /page/your-slug) *</label>
                            <input
                              type="text"
                              value={cmsForm.slug}
                              onChange={(e) => setCmsForm({ ...cmsForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                              placeholder="meghalaya-travel-guide"
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-[11px] font-extrabold text-brand-navy uppercase mb-1">Category</label>
                            <select
                              value={cmsForm.category}
                              onChange={(e) => setCmsForm({ ...cmsForm, category: e.target.value })}
                              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                            >
                              <option value="Guides">Guides</option>
                              <option value="Expeditions">Expeditions</option>
                              <option value="Campaigns">Campaigns</option>
                              <option value="Company">Company</option>
                              <option value="Policy">Policy</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-extrabold text-brand-navy uppercase mb-1">Status</label>
                            <select
                              value={cmsForm.status}
                              onChange={(e) => setCmsForm({ ...cmsForm, status: e.target.value })}
                              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                            >
                              <option value="published">Published</option>
                              <option value="draft">Draft Mode</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-extrabold text-brand-navy uppercase mb-1">Author</label>
                            <input
                              type="text"
                              value={cmsForm.author}
                              onChange={(e) => setCmsForm({ ...cmsForm, author: e.target.value })}
                              placeholder="WanderLuxe Editorial"
                              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-extrabold text-brand-navy uppercase mb-1">Hero Subtitle</label>
                          <input
                            type="text"
                            value={cmsForm.heroSubtitle}
                            onChange={(e) => setCmsForm({ ...cmsForm, heroSubtitle: e.target.value })}
                            placeholder="Brief catchy summary displayed in hero banner"
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-extrabold text-brand-navy uppercase mb-1">Main Article Content</label>
                          <textarea
                            rows={4}
                            value={cmsForm.content}
                            onChange={(e) => setCmsForm({ ...cmsForm, content: e.target.value })}
                            placeholder="Detailed text content, highlights, or markdown overview..."
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                          />
                        </div>
                      </div>

                      {/* Section 2: Complete Backend SEO Suite */}
                      <div className="space-y-4 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-200/70">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xs font-black uppercase text-brand-navy tracking-wider flex items-center gap-1.5">
                            <Globe size={16} className="text-brand-emerald" /> 2. Backend SEO Parameters & Indexing
                          </h3>
                          <span className="text-[10px] text-gray-500 font-semibold">Automatic Search Engine Meta & Canonical</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-extrabold text-brand-navy uppercase mb-1">
                              Meta Title (30-65 chars)
                            </label>
                            <input
                              type="text"
                              value={cmsForm.seoTitle}
                              onChange={(e) => setCmsForm({ ...cmsForm, seoTitle: e.target.value })}
                              placeholder="Meghalaya Travel Guide 2026 | WanderLuxe"
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                            />
                            <span className="text-[10px] text-gray-400 font-semibold block mt-1">
                              Length: {cmsForm.seoTitle.length} chars
                            </span>
                          </div>

                          <div>
                            <label className="block text-[11px] font-extrabold text-brand-navy uppercase mb-1">
                              Target Keywords (comma-separated)
                            </label>
                            <input
                              type="text"
                              value={cmsForm.keywords}
                              onChange={(e) => setCmsForm({ ...cmsForm, keywords: e.target.value })}
                              placeholder="Meghalaya travel, Cherrapunji, Dawki river"
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-extrabold text-brand-navy uppercase mb-1">
                            Meta Description (110-165 chars)
                          </label>
                          <textarea
                            rows={2}
                            value={cmsForm.metaDescription}
                            onChange={(e) => setCmsForm({ ...cmsForm, metaDescription: e.target.value })}
                            placeholder="Compelling page description for search engine result snippet."
                            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-medium"
                          />
                          <span className="text-[10px] text-gray-400 font-semibold block mt-1">
                            Length: {cmsForm.metaDescription.length} chars
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-extrabold text-brand-navy uppercase mb-1">Canonical URL</label>
                            <input
                              type="url"
                              value={cmsForm.canonicalUrl}
                              onChange={(e) => setCmsForm({ ...cmsForm, canonicalUrl: e.target.value })}
                              placeholder="https://wanderluxe.in/page/meghalaya-travel-guide"
                              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-extrabold text-brand-navy uppercase mb-1">Open Graph (OG) Image</label>
                            <div className="bg-white rounded-xl border border-gray-200 p-3 space-y-2">
                              <MediaUploader
                                mode="image"
                                folder="wanderluxe/seo-og-images"
                                label=""
                                compact={true}
                                onUploadSuccess={(media) => {
                                  setCmsForm(prev => ({ ...prev, ogImage: media.url }));
                                }}
                              />
                              <input
                                type="url"
                                value={cmsForm.ogImage}
                                onChange={(e) => setCmsForm({ ...cmsForm, ogImage: e.target.value })}
                                placeholder="https://images.unsplash.com/photo-... or upload above"
                                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                              />
                            </div>
                          </div>

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-extrabold text-brand-navy uppercase mb-1">JSON-LD Schema Type</label>
                            <select
                              value={cmsForm.structuredDataType}
                              onChange={(e) => setCmsForm({ ...cmsForm, structuredDataType: e.target.value })}
                              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                            >
                              <option value="TouristAttraction">TouristAttraction Schema</option>
                              <option value="Article">Article Schema</option>
                              <option value="WebPage">WebPage Schema</option>
                              <option value="FAQPage">FAQPage Schema</option>
                              <option value="Event">Event Schema</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-extrabold text-brand-navy uppercase mb-1">Robots Directive</label>
                            <select
                              value={cmsForm.robots}
                              onChange={(e) => setCmsForm({ ...cmsForm, robots: e.target.value })}
                              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                            >
                              <option value="index, follow">index, follow (Allow Indexing)</option>
                              <option value="noindex, nofollow">noindex, nofollow (Private Page)</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setShowCmsModal(false)}
                          className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-2xl"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-6 py-3 bg-brand-emerald text-white rounded-2xl font-extrabold text-xs hover:bg-brand-teal transition-all shadow-md flex items-center gap-2"
                        >
                          <Save size={16} /> Save & Deploy Page SEO
                        </button>
                      </div>
                    </form>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Header Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
                  <FileText size={22} className="text-brand-emerald" /> Dynamic Page Builder & Backend SEO CMS
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Add dynamic pages directly according to your plan and change content/SEO parameters whenever you want.
                </p>
              </div>

              <button
                onClick={() => handleOpenCmsModal(null)}
                className="px-5 py-3 bg-brand-navy hover:bg-brand-emerald text-white text-xs font-extrabold rounded-2xl transition-all shadow-lg flex items-center gap-2 shrink-0"
              >
                <Plus size={16} /> Add New Custom Page
              </button>
            </div>

            {/* Dynamic Pages List Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-navy text-white uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Page Title & Slug</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Author</th>
                    <th className="p-4">SEO Health</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-brand-navy">
                  {cmsPages.length > 0 ? (
                    cmsPages.map((p) => (
                      <tr key={p._id || p.slug} className="hover:bg-brand-light/50 transition-colors">
                        <td className="p-4">
                          <span className="font-extrabold block text-sm">{p.title}</span>
                          <span className="font-mono text-[11px] text-gray-400 block">/page/{p.slug}</span>
                        </td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 font-bold rounded-md text-[10px]">
                            {p.category || 'General'}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-gray-600">{p.author || 'Editorial'}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full font-extrabold text-[10px] inline-flex items-center gap-1 ${
                            (p.seoHealthScore || 80) >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            <Award size={13} /> {p.seoHealthScore || 85}% Optimized
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full font-extrabold uppercase text-[10px] ${
                            p.status === 'published' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {p.status || 'published'}
                          </span>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <a
                            href={`/page/${p.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Eye size={13} /> Live View
                          </a>
                          <button
                            onClick={() => handleOpenCmsModal(p)}
                            className="px-3 py-1.5 bg-brand-navy text-white rounded-xl hover:bg-brand-emerald transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Edit3 size={13} /> Edit SEO
                          </button>
                          <button
                            onClick={() => handleDeleteCmsPage(p._id)}
                            className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors inline-flex items-center gap-1 text-[11px] font-bold"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-500 font-medium">
                        No dynamic pages found. Click "Add New Custom Page" to create your first SEO-optimized page.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* MEDIA LIBRARY TAB */}
        {activeTab === 'media_library' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold text-brand-navy flex items-center gap-2">
                  <Image size={22} className="text-brand-emerald" /> Media Library
                </h2>
                <p className="text-xs text-gray-500 font-medium mt-1">
                  Upload and manage images and videos via Cloudinary CDN. All uploaded assets are auto-optimized.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image Upload Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Image size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <div className="font-extrabold text-brand-navy text-sm">Image Upload</div>
                    <div className="text-[10px] text-gray-400 font-medium">JPG, PNG, WebP, GIF · Max 10MB</div>
                  </div>
                </div>
                <MediaUploader
                  mode="image"
                  multiple={true}
                  folder="wanderluxe/gallery"
                  label="Upload Images to Cloudinary"
                  onUploadSuccess={(media) => {
                    console.log('Image uploaded:', media.url);
                  }}
                />
              </div>

              {/* Video Upload Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Video size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <div className="font-extrabold text-brand-navy text-sm">Video Upload</div>
                    <div className="text-[10px] text-gray-400 font-medium">MP4, WebM, MOV · Max 100MB</div>
                  </div>
                </div>
                <MediaUploader
                  mode="video"
                  folder="wanderluxe/videos"
                  label="Upload Video to Cloudinary"
                  onUploadSuccess={(media) => {
                    console.log('Video uploaded:', media.url);
                  }}
                />
              </div>
            </div>

            {/* Cloudinary Setup Guide */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl p-6 border border-indigo-100">
              <h3 className="font-extrabold text-indigo-900 text-sm mb-3 flex items-center gap-2">
                <Upload size={16} className="text-indigo-600" /> Cloudinary Setup Instructions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100">
                  <div className="font-extrabold text-indigo-800 mb-1">1. Create Account</div>
                  <p className="text-gray-600">Sign up free at <span className="font-mono text-indigo-600">cloudinary.com</span></p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100">
                  <div className="font-extrabold text-indigo-800 mb-1">2. Get Credentials</div>
                  <p className="text-gray-600">Copy Cloud Name, API Key, and API Secret from your dashboard.</p>
                </div>
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-indigo-100">
                  <div className="font-extrabold text-indigo-800 mb-1">3. Add to .env</div>
                  <p className="text-gray-600 font-mono text-[10px]">CLOUDINARY_CLOUD_NAME=<br />CLOUDINARY_API_KEY=<br />CLOUDINARY_API_SECRET=</p>
                </div>
              </div>
              <p className="text-xs text-indigo-600 font-medium mt-3">
                ⚡ Without credentials, the system auto-falls back to local <span className="font-mono">/uploads</span> directory storage.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
