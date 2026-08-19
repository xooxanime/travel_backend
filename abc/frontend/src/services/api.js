const API_BASE_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('wanderluxe_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const registerApi = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(userData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Registration failed');
  }
  return data;
};

export const loginApi = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Invalid email or password');
  }
  return data;
};

export const influencerLoginApi = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/auth/influencer-login`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(credentials)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Invalid creator credentials or unapproved status.');
  }
  return data;
};

export const influencerApplyApi = async (applicationData) => {
  const response = await fetch(`${API_BASE_URL}/auth/influencer-apply`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(applicationData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit influencer application');
  }
  return data;
};

export const getMeApi = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch session');
  }
  return data;
};

export const updateProfileApi = async (profileData) => {
  const response = await fetch(`${API_BASE_URL}/auth/profile`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(profileData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update profile');
  }
  return data;
};

export const addBookingApi = async (bookingData) => {
  const response = await fetch(`${API_BASE_URL}/auth/booking`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(bookingData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create booking');
  }
  return data;
};

export const cancelBookingApi = async (bookingId) => {
  const response = await fetch(`${API_BASE_URL}/auth/booking/cancel`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ bookingId })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to cancel booking');
  }
  return data;
};

// Admin Endpoints
export const getAdminStatsApi = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/stats`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch admin stats');
  }
  return data;
};

export const getCouponsApi = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch coupons');
  }
  return data;
};

export const createCouponApi = async (couponData) => {
  const response = await fetch(`${API_BASE_URL}/admin/coupons`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(couponData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to create coupon');
  }
  return data;
};

export const toggleCouponApi = async (couponId) => {
  const response = await fetch(`${API_BASE_URL}/admin/coupons/${couponId}/toggle`, {
    method: 'PUT',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to toggle coupon status');
  }
  return data;
};

export const deleteCouponApi = async (couponId) => {
  const response = await fetch(`${API_BASE_URL}/admin/coupons/${couponId}`, {
    method: 'DELETE',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to delete coupon');
  }
  return data;
};

export const getAdminUsersApi = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch users');
  }
  return data;
};

export const updateUserRoleApi = async (userId, role) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ role })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update user role');
  }
  return data;
};

export const getAdminBookingsApi = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch admin bookings');
  }
  return data;
};

// Influencer Verification Endpoints (Database-Driven)
export const getInfluencerApplicationsApi = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/influencer-applications`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch influencer applications');
  }
  return data;
};

export const approveInfluencerApplicationApi = async (userId) => {
  const response = await fetch(`${API_BASE_URL}/admin/influencer-applications/${userId}/approve`, {
    method: 'PUT',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to approve application');
  }
  return data;
};

export const rejectInfluencerApplicationApi = async (userId, reason) => {
  const response = await fetch(`${API_BASE_URL}/admin/influencer-applications/${userId}/reject`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify({ reason })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to reject application');
  }
  return data;
};

// Trip SEO API
export const updateTripSeoApi = async (tripId, seoData) => {
  const response = await fetch(`${API_BASE_URL}/admin/trips/${tripId}/seo`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(seoData)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to update trip SEO');
  }
  return data;
};

// Influencer & Checkout Server APIs
export const validateCouponServerApi = async (code, bookingAmount, planId) => {
  const response = await fetch(`${API_BASE_URL}/checkout/coupon/validate`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ code, bookingAmount, planId })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Coupon validation failed');
  }
  return data;
};

export const getInfluencerPlansApi = async () => {
  const response = await fetch(`${API_BASE_URL}/influencer/plans`, {
    method: 'GET',
    headers: getHeaders()
  });
  return response.json();
};

export const generateCouponApi = async (planData) => {
  const response = await fetch(`${API_BASE_URL}/influencer/coupons`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(planData)
  });
  return response.json();
};

export const getWalletSummaryApi = async () => {
  const response = await fetch(`${API_BASE_URL}/influencer/wallet`, {
    method: 'GET',
    headers: getHeaders()
  });
  return response.json();
};

export const requestPayoutApi = async (amount, destination) => {
  const response = await fetch(`${API_BASE_URL}/influencer/payouts`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ amount, destination })
  });
  return response.json();
};

// ==========================================
// REAL BOOKING & RAZORPAY TEST PAYMENT APIS
// ==========================================

export const createBookingOrderApi = async (bookingPayload) => {
  const response = await fetch(`${API_BASE_URL}/bookings/create-order`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(bookingPayload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to initialize booking order');
  }
  return data;
};

export const verifyBookingPaymentApi = async (verificationPayload) => {
  const response = await fetch(`${API_BASE_URL}/bookings/verify-payment`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(verificationPayload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Payment verification failed');
  }
  return data;
};

export const getMyBookingsApi = async () => {
  const response = await fetch(`${API_BASE_URL}/bookings/my-bookings`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch user bookings');
  }
  return data;
};

export const getBookingByIdApi = async (bookingId) => {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
    method: 'GET',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to fetch booking details');
  }
  return data;
};

export const resendWhatsAppTicketApi = async (bookingId) => {
  const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/send-whatsapp`, {
    method: 'POST',
    headers: getHeaders()
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to send WhatsApp notification');
  }
  return data;
};

export const verifyBookingTokenApi = async (token) => {
  const response = await fetch(`${API_BASE_URL}/bookings/verify/${token}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to verify booking token');
  }
  return data;
};

// ==========================================
// TRIPS, LEADS, REVIEWS & HEALTH APIS
// ==========================================

export const getTripsApi = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await fetch(`${API_BASE_URL}/trips${queryString ? `?${queryString}` : ''}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return response.json();
};

export const getTripByIdApi = async (idOrSlug) => {
  const response = await fetch(`${API_BASE_URL}/trips/${idOrSlug}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return response.json();
};

export const submitLeadApi = async (leadData) => {
  const response = await fetch(`${API_BASE_URL}/leads`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(leadData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit inquiry');
  }
  return data;
};

export const getLeadsApi = async () => {
  const response = await fetch(`${API_BASE_URL}/leads`, {
    method: 'GET',
    headers: getHeaders()
  });
  return response.json();
};

export const getReviewsApi = async (tripId) => {
  const response = await fetch(`${API_BASE_URL}/reviews/trip/${tripId}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return response.json();
};

export const submitReviewApi = async (reviewData) => {
  const response = await fetch(`${API_BASE_URL}/reviews`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(reviewData)
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Failed to submit review');
  }
  return data;
};

export const checkHealthApi = async () => {
  const response = await fetch(`${API_BASE_URL}/health`, {
    method: 'GET'
  });
  return response.json();
};

// ==========================================
// DYNAMIC PAGE CMS & SEO INFRASTRUCTURE APIS
// ==========================================

export const getAllPagesApi = async () => {
  const response = await fetch(`${API_BASE_URL}/pages`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to fetch dynamic pages');
  return data;
};

export const getPageBySlugApi = async (slug) => {
  const response = await fetch(`${API_BASE_URL}/pages/${slug}`, {
    method: 'GET',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Page not found');
  return data;
};

export const createPageApi = async (pageData) => {
  const response = await fetch(`${API_BASE_URL}/pages`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(pageData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to create page');
  return data;
};

export const updatePageApi = async (id, pageData) => {
  const response = await fetch(`${API_BASE_URL}/pages/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(pageData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to update page');
  return data;
};

export const deletePageApi = async (id) => {
  const response = await fetch(`${API_BASE_URL}/pages/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to delete page');
  return data;
};

export const getSeoMetadataByPathApi = async (path) => {
  const response = await fetch(`${API_BASE_URL}/seo/metadata?path=${encodeURIComponent(path)}`, {
    method: 'GET',
    headers: getHeaders()
  });
  return response.json();
};

// ─── Cloudinary / Media Upload APIs ─────────────────────────────────────────

// Helper: get auth headers WITHOUT Content-Type (let browser set multipart boundary)
const getMultipartHeaders = () => {
  const token = localStorage.getItem('wanderluxe_token');
  return { ...(token ? { Authorization: `Bearer ${token}` } : {}) };
};

export const uploadImageApi = async (file, folder = 'wanderluxe/images') => {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('folder', folder);
  const response = await fetch(`${API_BASE_URL}/upload/image`, {
    method: 'POST',
    headers: getMultipartHeaders(),
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Image upload failed');
  return data;
};

export const uploadImagesApi = async (files, folder = 'wanderluxe/images') => {
  const formData = new FormData();
  Array.from(files).forEach(file => formData.append('images', file));
  formData.append('folder', folder);
  const response = await fetch(`${API_BASE_URL}/upload/images`, {
    method: 'POST',
    headers: getMultipartHeaders(),
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Images upload failed');
  return data;
};

export const uploadVideoApi = async (file, folder = 'wanderluxe/videos') => {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('folder', folder);
  const response = await fetch(`${API_BASE_URL}/upload/video`, {
    method: 'POST',
    headers: getMultipartHeaders(),
    body: formData
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Video upload failed');
  return data;
};

export const uploadBase64Api = async (base64Data, resourceType = 'image', folder = 'wanderluxe/misc') => {
  const response = await fetch(`${API_BASE_URL}/upload/base64`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ base64Data, folder, resourceType })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Base64 upload failed');
  return data;
};

export const deleteMediaApi = async (publicId, resourceType = 'image') => {
  const response = await fetch(`${API_BASE_URL}/upload/media`, {
    method: 'DELETE',
    headers: getHeaders(),
    body: JSON.stringify({ publicId, resourceType })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Media deletion failed');
  return data;
};



