import React, { useEffect } from 'react';

const SITE_NAME = 'WanderLuxe';
const DEFAULT_DOMAIN = 'https://wanderluxe.in';
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&q=80&w=1200';

const SEOHead = ({
  title = 'WanderLuxe | Experiential Small Group Expeditions & Luxury Travel',
  description = 'Curating premium travel experiences across India and international destinations. Living Root Bridges, Spiti Valley, Kashmir, Bali, and Ladakh with verified trip captains.',
  canonical,
  keywords,
  robots,
  noindex = false,
  ogTitle,
  ogDescription,
  ogImage = DEFAULT_IMAGE,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  twitterTitle,
  twitterDescription,
  twitterImage,
  jsonLd = null
}) => {
  useEffect(() => {
    // 1. Update Title
    const finalTitle = title ? (title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`) : `WanderLuxe Expeditions`;
    document.title = finalTitle;

    // 2. Helper to create or update meta/link elements
    const setMetaTag = (selector, attribute, value) => {
      if (!value) return;
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement(selector.startsWith('meta') ? 'meta' : 'link');
        document.head.appendChild(el);
      }
      if (selector.startsWith('meta')) {
        el.setAttribute(attribute, value);
      } else {
        el.setAttribute('href', value);
      }
    };

    // Meta Description
    setMetaTag('meta[name="description"]', 'content', description);

    // Meta Keywords
    if (keywords) {
      setMetaTag('meta[name="keywords"]', 'content', Array.isArray(keywords) ? keywords.join(', ') : keywords);
    }

    // Meta Robots
    const finalRobots = robots || (noindex ? 'noindex, nofollow' : 'index, follow');
    setMetaTag('meta[name="robots"]', 'content', finalRobots);

    // Canonical Link
    const currentPath = window.location.pathname;
    const canonicalUrl = canonical
      ? (canonical.startsWith('http') ? canonical : `${DEFAULT_DOMAIN}${canonical.startsWith('/') ? '' : '/'}${canonical}`)
      : `${DEFAULT_DOMAIN}${currentPath}`;
    setMetaTag('link[rel="canonical"]', 'href', canonicalUrl);

    // Open Graph Tags
    const finalOgTitle = ogTitle || finalTitle;
    const finalOgDesc = ogDescription || description;
    const finalOgImg = ogImage || DEFAULT_IMAGE;

    setMetaTag('meta[property="og:title"]', 'content', finalOgTitle);
    setMetaTag('meta[property="og:description"]', 'content', finalOgDesc);
    setMetaTag('meta[property="og:type"]', 'content', ogType);
    setMetaTag('meta[property="og:url"]', 'content', canonicalUrl);
    setMetaTag('meta[property="og:image"]', 'content', finalOgImg);
    setMetaTag('meta[property="og:site_name"]', 'content', SITE_NAME);

    // Twitter Cards
    setMetaTag('meta[name="twitter:card"]', 'content', twitterCard || 'summary_large_image');
    setMetaTag('meta[name="twitter:title"]', 'content', twitterTitle || finalOgTitle);
    setMetaTag('meta[name="twitter:description"]', 'content', twitterDescription || finalOgDesc);
    setMetaTag('meta[name="twitter:image"]', 'content', twitterImage || finalOgImg);

    // 3. Inject JSON-LD Script
    let scriptEl = document.querySelector('script[id="json-ld-seo"]');
    if (jsonLd) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.id = 'json-ld-seo';
        scriptEl.type = 'application/ld+json';
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = typeof jsonLd === 'string' ? jsonLd : JSON.stringify(jsonLd);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [
    title, description, canonical, keywords, robots, noindex, 
    ogTitle, ogDescription, ogImage, ogType, 
    twitterCard, twitterTitle, twitterDescription, twitterImage, jsonLd
  ]);

  return null;
};

export default SEOHead;
