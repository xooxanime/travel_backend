import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, TrendingUp, Users, Ticket, Tag, Plus, Trash2, 
  Edit3, ShieldCheck, CheckCircle2, XCircle, Search, RefreshCw, 
  DollarSign, MapPin, Calendar, Lock, AlertTriangle, Layers, Eye, Power, Check, X, LogOut, Sparkles, Wallet, UserCheck, UserX, Globe, Save, FileText, Award, Upload, Image, Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { UPCOMING_TRIPS } from '../constants/mockData';
import { 
  getAdminStatsApi, getCouponsApi, createCouponApi, toggleCouponApi, 
  deleteCouponApi, getAdminUsersApi, updateUserRoleApi, getAdminBookingsApi,
  getAllPagesApi, createPageApi, updatePageApi, deletePageApi
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
    metaDescription: 'Book 5-day Meghalaya group trip. Explore Dawki crystal river, Cherrapunji waterfalls, and living root bridges with top-rated trip captains.',
    canonicalUrl: 'https://wanderluxe.in/trip/1',
    indexingDirective: 'index, follow',
    ogTitle: 'Meghalaya Backpacking Living Root Bridges',
    ogDescription: 'Experience the magic of Meghalaya living root bridges and Dawki river.',
    ogImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb'
  });
  const [seoSavedSuccess, setSeoSavedSuccess] = useState(false);

  // Master Bookings Log
  const [masterBookings, setMasterBookings] = useState([
    { id: 'WL-894201', customer: 'Gaurav Kumar Yadav', email: 'kumar.gaurav.yadav2007@gmail.com', trip: 'Meghalaya Backpacking', amount: 37000, date: '2026-08-01', status: 'Confirmed' },
    { id: 'WL-782104', customer: 'Sarah Jenkins', email: 'sarah.j@gmail.com', trip: 'Spiti Valley Circuit', amount: 22000, date: '2026-08-03', status: 'Confirmed' },
    { id: 'WL-541289', customer: 'Rohit Sharma', email: 'rohit.sharma@yahoo.com', trip: 'Bali Island Escape', amount: 45000, date: '2026-08-04', status: 'Pending' }
  ]);

  // Modal States
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'percentage', value: '', expiry: '2026-12-31', maxUses: 500 });
  
  const [showTripModal, setShowTripModal] = useState(false);
  const [newTrip, setNewTrip] = useState({ title: '', location: '', price: '', duration: '5N/6D', image: '', tags: 'Trending, Adventure' });

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

  const handleAddTrip = (e) => {
    e.preventDefault();
    if (!newTrip.title || !newTrip.price) return;

    const createdTrip = {
      id: tripsList.length + 1,
      title: newTrip.title,
      shortTitle: newTrip.title.split(':')[0],
      duration: newTrip.duration,
      price: Number(newTrip.price),
      originalPrice: Math.round(Number(newTrip.price) * 1.2),
      location: newTrip.location || 'India',
      image: newTrip.image || 'https://images.pexels.com/photos/17334314/pexels-photo-17334314.jpeg',
      rating: 4.8,
      reviews: 12,
      tags: newTrip.tags.split(',').map((t) => t.trim()),
      nextBatch: '10 Sep',
      availableBatches: [{ id: 'b1', dates: '10 Sep - 15 Sep, 2026', seatsLeft: 10, status: 'Available' }]
    };

    setTripsList([createdTrip, ...tripsList]);
    setNewTrip({ title: '', location: '', price: '', duration: '5N/6D', image: '', tags: 'Trending, Adventure' });
    setShowTripModal(false);
  };

  const handleDeleteTrip = (id) => {
    if (window.confirm('Delete this trip package from catalog?')) {
      setTripsList(tripsList.filter((t) => t.id !== id));
    }
  };

  const handleBookingStatus = (id, newStatus) => {
    setMasterBookings(masterBookings.map((b) => (b.id === id ? { ...b, status: newStatus } : b)));
  };

  const handleSelectTripSeo = (tripId) => {
    setSelectedSeoTripId(tripId);
    const target = tripsList.find((t) => t.id === Number(tripId) || t.id === tripId);
    if (target) {
      setTripSeoForm({
        seoTitle: `${target.title} | WanderLuxe Expeditions`,
        metaDescription: `Book ${target.title} group departure in ${target.location}. Duration: ${target.duration}. Price: ₹${target.price.toLocaleString()}. Certified trip captain inclusive.`,
        canonicalUrl: `https://wanderluxe.in/trip/${target.id}`,
        indexingDirective: 'index, follow',
        ogTitle: target.title,
        ogDescription: `Join ${target.title} group departure in ${target.location}.`,
        ogImage: target.image
      });
    }
  };

  const handleSaveTripSeo = (e) => {
    e.preventDefault();
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

      {/* Create Trip Package Modal */}
      <AnimatePresence>
        {showTripModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowTripModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button id="close-trip-modal" onClick={() => setShowTripModal(false)} className="absolute top-5 right-5 text-gray-400 hover:text-brand-navy">
                <X size={20} />
              </button>

              <h2 className="text-xl font-extrabold text-brand-navy mb-5 flex items-center gap-2">
                <Layers size={20} className="text-brand-emerald" /> Create Trip Package
              </h2>

              <form onSubmit={handleAddTrip} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Trip Title *</label>
                  <input
                    id="trip-title-input"
                    type="text"
                    value={newTrip.title}
                    onChange={(e) => setNewTrip({ ...newTrip, title: e.target.value })}
                    placeholder="e.g. Meghalaya Backpacking: Living Root Bridges"
                    className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Location</label>
                    <input
                      id="trip-location-input"
                      type="text"
                      value={newTrip.location}
                      onChange={(e) => setNewTrip({ ...newTrip, location: e.target.value })}
                      placeholder="e.g. Meghalaya, India"
                      className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Duration</label>
                    <input
                      id="trip-duration-input"
                      type="text"
                      value={newTrip.duration}
                      onChange={(e) => setNewTrip({ ...newTrip, duration: e.target.value })}
                      placeholder="e.g. 5N/6D"
                      className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Price (₹) *</label>
                  <input
                    id="trip-price-input"
                    type="number"
                    value={newTrip.price}
                    onChange={(e) => setNewTrip({ ...newTrip, price: e.target.value })}
                    placeholder="e.g. 18500"
                    className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-brand-navy uppercase mb-1">Tags (comma separated)</label>
                  <input
                    id="trip-tags-input"
                    type="text"
                    value={newTrip.tags}
                    onChange={(e) => setNewTrip({ ...newTrip, tags: e.target.value })}
                    placeholder="e.g. Trending, Adventure, Nature"
                    className="w-full px-4 py-3 bg-brand-light border border-gray-200 rounded-2xl text-xs font-bold focus:outline-none focus:border-brand-emerald"
                  />
                </div>

                {/* Cloudinary Media Uploader for Trip Cover */}
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
                      setNewTrip(prev => ({ ...prev, image: media.url }));
                    }}
                  />
                  {newTrip.image && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-brand-emerald font-bold">✓ Media uploaded</span>
                      <span className="text-[10px] text-gray-400 truncate max-w-xs font-mono">{newTrip.image}</span>
                    </div>
                  )}
                  <div className="mt-2">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Or paste an image URL directly</label>
                    <input
                      id="trip-image-url-input"
                      type="url"
                      value={newTrip.image}
                      onChange={(e) => setNewTrip({ ...newTrip, image: e.target.value })}
                      placeholder="https://..."
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-brand-emerald"
                    />
                  </div>
                </div>

                <button
                  id="submit-trip-btn"
                  type="submit"
                  className="w-full py-3.5 bg-brand-emerald text-white rounded-2xl font-extrabold text-sm hover:bg-brand-teal transition-all shadow-md mt-2"
                >
                  <Plus size={16} className="inline mr-2" /> Create Trip Package
                </button>
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
              onClick={() => setShowTripModal(true)}
              className="px-5 py-3 bg-brand-emerald text-white text-xs font-extrabold rounded-2xl hover:bg-brand-teal transition-all shadow-lg flex items-center gap-2"
            >
              <Plus size={16} /> Add Package
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
            { id: 'pages_cms', label: 'Dynamic Pages & SEO CMS', icon: <FileText size={15} /> },
            { id: 'influencer_verification', label: 'Influencer Approvals', icon: <UserCheck size={15} /> },
            { id: 'trip_seo_manager', label: 'Trip SEO Config', icon: <Globe size={15} /> },
            { id: 'seo_health', label: 'SEO Health', icon: <Search size={15} /> },
            { id: 'influencer_plans', label: 'Influencer Plans', icon: <Sparkles size={15} /> },
            { id: 'payouts', label: 'Payout Approvals', icon: <Wallet size={15} /> },
            { id: 'trips', label: 'Trip Catalog', icon: <Layers size={15} /> },
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
                  <Globe size={22} className="text-brand-emerald" /> Trip-Level SEO & Metadata Configurator
                </h2>
                <p className="text-xs text-gray-500 font-medium">
                  Configure custom page titles, meta descriptions, canonical URLs, indexing directives, and Open Graph attributes for individual trip packages.
                </p>
              </div>

              {seoSavedSuccess && (
                <div className="px-4 py-2 bg-emerald-500 text-white text-xs font-extrabold rounded-xl shadow-lg flex items-center gap-1.5 animate-bounce">
                  <CheckCircle2 size={16} /> Trip SEO Saved & Published!
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Trip Package List Selector */}
              <div className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm space-y-4">
                <h3 className="font-extrabold text-brand-navy text-sm uppercase">Select Trip Package</h3>
                <div className="space-y-2">
                  {tripsList.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => handleSelectTripSeo(t.id)}
                      className={`w-full p-3 rounded-2xl text-left text-xs font-bold transition-all flex items-center justify-between ${
                        selectedSeoTripId === t.id
                          ? 'bg-brand-navy text-white shadow-md'
                          : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/60'
                      }`}
                    >
                      <span className="truncate max-w-[180px]">{t.title}</span>
                      <span className="text-[10px] font-mono text-brand-emerald shrink-0">₹{t.price.toLocaleString()}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Trip SEO Form */}
              <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl border border-gray-200/80 shadow-sm">
                <form onSubmit={handleSaveTripSeo} className="space-y-4 text-xs font-bold">
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="text-brand-navy font-extrabold text-sm uppercase">SEO Configuration Fields</span>
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-black rounded-full uppercase">
                      SEO Score: GOOD (95/100)
                    </span>
                  </div>

                  <div>
                    <label className="text-gray-700 uppercase block mb-1">SEO Page Title Tag ({tripSeoForm.seoTitle.length} / 60 chars)</label>
                    <input
                      type="text"
                      value={tripSeoForm.seoTitle}
                      onChange={(e) => setTripSeoForm({ ...tripSeoForm, seoTitle: e.target.value })}
                      className="w-full bg-brand-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-brand-navy focus:border-brand-emerald focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-gray-700 uppercase block mb-1">Meta Description ({tripSeoForm.metaDescription.length} / 160 chars)</label>
                    <textarea
                      rows={3}
                      value={tripSeoForm.metaDescription}
                      onChange={(e) => setTripSeoForm({ ...tripSeoForm, metaDescription: e.target.value })}
                      className="w-full bg-brand-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-brand-navy focus:border-brand-emerald focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-700 uppercase block mb-1">Canonical Tag URL</label>
                      <input
                        type="text"
                        value={tripSeoForm.canonicalUrl}
                        onChange={(e) => setTripSeoForm({ ...tripSeoForm, canonicalUrl: e.target.value })}
                        className="w-full bg-brand-light border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-mono text-brand-navy focus:border-brand-emerald focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-gray-700 uppercase block mb-1">Indexing Directive</label>
                      <select
                        value={tripSeoForm.indexingDirective}
                        onChange={(e) => setTripSeoForm({ ...tripSeoForm, indexingDirective: e.target.value })}
                        className="w-full bg-brand-light border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-brand-navy focus:border-brand-emerald focus:outline-none"
                      >
                        <option value="index, follow">index, follow (Public Search Indexable)</option>
                        <option value="noindex, nofollow">noindex, nofollow (Shielded Private)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-brand-navy">Trip Package Catalog ({tripsList.length})</h2>
              <button
                onClick={() => setShowTripModal(true)}
                className="px-4 py-2.5 bg-brand-emerald text-white rounded-2xl text-xs font-bold hover:bg-brand-teal transition-all shadow-md flex items-center gap-2"
              >
                <Plus size={16} /> Create Trip Package
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tripsList.map((trip) => (
                <div key={trip.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200/80 flex flex-col justify-between">
                  <div className="h-44 overflow-hidden relative">
                    <img src={trip.image} alt={trip.title} className="w-full h-full object-cover" />
                    <span className="absolute top-3 left-3 bg-brand-navy/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {trip.duration}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <h3 className="font-bold text-brand-navy text-base leading-snug">{trip.title}</h3>
                    <p className="text-xs text-gray-500 font-medium flex items-center gap-1">
                      <MapPin size={14} className="text-brand-emerald" /> {trip.location}
                    </p>
                    <div className="text-sm font-extrabold text-brand-emerald">₹{trip.price.toLocaleString()}</div>
                  </div>

                  <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500">Batches: {trip.availableBatches?.length || 1}</span>
                    <button
                      onClick={() => handleDeleteTrip(trip.id)}
                      className="px-3 py-1.5 bg-red-50 text-red-600 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
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
