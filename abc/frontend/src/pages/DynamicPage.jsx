import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Globe, Calendar, User, ArrowRight, ShieldCheck, Tag, Sparkles, 
  Share2, CheckCircle2, ChevronRight, FileText, Award
} from 'lucide-react';
import { getPageBySlugApi } from '../services/api';

const DynamicPage = () => {
  const { slug } = useParams();

  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getPageBySlugApi(slug);
        setPage(data);

        // Inject Dynamic Backend SEO Headers & Tags into Document Head
        if (data.seo) {
          const { metaTitle, metaDescription, keywords, canonicalUrl, ogTitle, ogDescription, ogImage, structuredDataJson } = data.seo;
          
          if (metaTitle || data.title) {
            document.title = metaTitle || `${data.title} | WanderLuxe`;
          }

          // Update Meta Description
          let descEl = document.querySelector('meta[name="description"]');
          if (!descEl) {
            descEl = document.createElement('meta');
            descEl.setAttribute('name', 'description');
            document.head.appendChild(descEl);
          }
          descEl.setAttribute('content', metaDescription || data.heroSubtitle || data.title);

          // Update Meta Keywords
          if (keywords) {
            let kwEl = document.querySelector('meta[name="keywords"]');
            if (!kwEl) {
              kwEl = document.createElement('meta');
              kwEl.setAttribute('name', 'keywords');
              document.head.appendChild(kwEl);
            }
            kwEl.setAttribute('content', keywords);
          }

          // Inject Canonical Link
          if (canonicalUrl) {
            let canEl = document.querySelector('link[rel="canonical"]');
            if (!canEl) {
              canEl = document.createElement('link');
              canEl.setAttribute('rel', 'canonical');
              document.head.appendChild(canEl);
            }
            canEl.setAttribute('href', canonicalUrl);
          }

          // Inject JSON-LD Structured Data Schema
          if (structuredDataJson) {
            let scriptEl = document.getElementById('json-ld-page-schema');
            if (!scriptEl) {
              scriptEl = document.createElement('script');
              scriptEl.id = 'json-ld-page-schema';
              scriptEl.type = 'application/ld+json';
              document.head.appendChild(scriptEl);
            }
            scriptEl.textContent = typeof structuredDataJson === 'string' ? structuredDataJson : JSON.stringify(structuredDataJson);
          }
        }
      } catch (err) {
        setError(err.message || 'Page not found');
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPageData();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-brand-light">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-emerald border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-brand-navy font-bold text-sm">Rendering Dynamic Content & SEO Metadata...</p>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className="min-h-screen pt-28 pb-16 flex items-center justify-center bg-brand-light px-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-xl border border-gray-100">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 font-black text-2xl">
            !
          </div>
          <h1 className="text-2xl font-black text-brand-navy mb-2">Page Not Found</h1>
          <p className="text-gray-500 text-sm mb-6">{error || 'This dynamic custom page does not exist or is currently in draft mode.'}</p>
          <Link
            to="/destinations"
            className="w-full py-3.5 bg-brand-navy text-white font-bold rounded-2xl inline-block hover:bg-brand-emerald transition-all"
          >
            Explore Destinations Catalog
          </Link>
        </div>
      </div>
    );
  }

  const { title, heroSubtitle, category, author, createdAt, content, sections, seoHealthScore } = page;

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gradient-to-b from-brand-light via-white to-brand-light px-4">
      <div className="max-w-5xl w-full mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
          <Link to="/" className="hover:text-brand-emerald transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-brand-emerald">{category || 'Guide'}</span>
          <ChevronRight size={14} />
          <span className="text-brand-navy truncate max-w-xs">{title}</span>
        </div>

        {/* Hero Section Banner */}
        <div className="bg-brand-navy text-white rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-emerald/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="px-3 py-1 rounded-full bg-brand-emerald/20 text-brand-emerald font-extrabold text-xs uppercase tracking-wider border border-brand-emerald/30 inline-flex items-center gap-1.5">
                <Tag size={13} /> {category || 'Custom Dynamic Page'}
              </span>

              {seoHealthScore !== undefined && (
                <span className="px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 font-extrabold text-xs inline-flex items-center gap-1.5 border border-white/20">
                  <Award size={14} /> Backend SEO Health: {seoHealthScore}%
                </span>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl font-black leading-tight tracking-tight">
              {title}
            </h1>

            {heroSubtitle && (
              <p className="text-lg md:text-xl text-white/80 font-medium max-w-3xl leading-relaxed">
                {heroSubtitle}
              </p>
            )}

            <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-white/70 font-semibold border-t border-white/10">
              <span className="flex items-center gap-1.5"><User size={14} className="text-brand-emerald" /> {author || 'WanderLuxe'}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} className="text-brand-emerald" /> Published {new Date(createdAt || Date.now()).toLocaleDateString()}</span>
              <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-brand-emerald" /> Search Engine Optimized</span>
            </div>
          </div>
        </div>

        {/* Main Content Body */}
        {content && (
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-200/80 text-gray-700 leading-relaxed space-y-4 font-medium text-base">
            <div className="flex items-center gap-2 text-xs font-black text-brand-navy uppercase tracking-wider mb-2">
              <FileText size={16} className="text-brand-emerald" /> Overview & Highlights
            </div>
            <p className="whitespace-pre-line">{content}</p>
          </div>
        )}

        {/* Dynamic Sections Grid */}
        {sections && sections.length > 0 && (
          <div className="space-y-8">
            {sections.map((sec, idx) => (
              <div 
                key={idx} 
                className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200/80 grid grid-cols-1 md:grid-cols-2 gap-8 items-center"
              >
                <div className={`space-y-4 ${idx % 2 === 1 ? 'md:order-2' : ''}`}>
                  {sec.subheading && (
                    <span className="text-xs font-extrabold text-brand-emerald uppercase tracking-wider block">
                      {sec.subheading}
                    </span>
                  )}
                  <h2 className="text-2xl font-black text-brand-navy">{sec.heading}</h2>
                  <p className="text-gray-600 text-sm leading-relaxed">{sec.body}</p>

                  {sec.ctaLabel && (
                    <Link
                      to={sec.ctaUrl || '/destinations'}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-brand-navy text-white rounded-2xl font-extrabold text-xs hover:bg-brand-emerald transition-all shadow-md mt-2"
                    >
                      {sec.ctaLabel} <ArrowRight size={15} />
                    </Link>
                  )}
                </div>

                {sec.imageUrl && (
                  <div className={`overflow-hidden rounded-2xl shadow-md ${idx % 2 === 1 ? 'md:order-1' : ''}`}>
                    <img 
                      src={sec.imageUrl} 
                      alt={sec.imageAlt || sec.heading || 'Expedition Highlight'} 
                      className="w-full h-72 object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer Explorer CTA */}
        <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-extrabold mb-1">Ready for an Unforgettable Expedition?</h3>
            <p className="text-white/80 text-xs font-medium">Browse verified itineraries with guaranteed batch departures.</p>
          </div>
          <Link
            to="/destinations"
            className="px-6 py-3.5 bg-white text-brand-navy font-black text-xs rounded-2xl hover:bg-gray-100 transition-all shrink-0 shadow-lg"
          >
            Explore Catalog <ArrowRight size={14} className="inline ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DynamicPage;
