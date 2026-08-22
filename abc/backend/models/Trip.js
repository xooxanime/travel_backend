import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    location: {
      type: String,
      required: true
    },
    destination: {
      type: String,
      default: 'India'
    },
    duration: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    originalPrice: {
      type: Number
    },
    image: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      default: 4.8
    },
    reviews: {
      type: Number,
      default: 12
    },
    tags: {
      type: [String],
      default: ['Backpacking', 'Adventure']
    },
    nextBatch: {
      type: String,
      default: '15 Sep'
    },
    overview: {
      type: String,
      default: ''
    },
    itinerary: {
      type: Array,
      default: []
    },
    inclusions: {
      type: [String],
      default: []
    },
    exclusions: {
      type: [String],
      default: []
    },
    faqs: {
      type: Array,
      default: []
    },
    // Dedicated Landing Page & Content Options
    publishAsPage: {
      type: Boolean,
      default: false
    },
    pageSlug: {
      type: String,
      lowercase: true,
      trim: true,
      default: ''
    },
    pageSubtitle: {
      type: String,
      default: ''
    },
    pageContent: {
      type: String,
      default: ''
    },
    customSections: [
      {
        heading: { type: String, default: '' },
        subheading: { type: String, default: '' },
        body: { type: String, default: '' },
        imageUrl: { type: String, default: '' },
        imageAlt: { type: String, default: '' },
        ctaLabel: { type: String, default: '' },
        ctaUrl: { type: String, default: '' }
      }
    ],
    // Trip-Level Comprehensive SEO Configuration Schema
    seo: {
      seoTitle: {
        type: String,
        default: ''
      },
      metaTitle: {
        type: String,
        default: ''
      },
      metaDescription: {
        type: String,
        default: ''
      },
      focusKeyword: {
        type: String,
        default: ''
      },
      keywords: {
        type: String,
        default: ''
      },
      canonicalUrl: {
        type: String,
        default: ''
      },
      indexingDirective: {
        type: String,
        default: 'index, follow'
      },
      robots: {
        type: String,
        default: 'index, follow'
      },
      ogTitle: {
        type: String,
        default: ''
      },
      ogDescription: {
        type: String,
        default: ''
      },
      ogImage: {
        type: String,
        default: ''
      },
      ogType: {
        type: String,
        default: 'website'
      },
      twitterCard: {
        type: String,
        default: 'summary_large_image'
      },
      twitterTitle: {
        type: String,
        default: ''
      },
      twitterDescription: {
        type: String,
        default: ''
      },
      twitterImage: {
        type: String,
        default: ''
      },
      structuredDataType: {
        type: String,
        default: 'TouristTrip'
      },
      structuredSchemaType: {
        type: String,
        default: 'TouristTrip'
      },
      structuredDataJson: {
        type: String,
        default: ''
      },
      seoHealthScore: {
        type: Number,
        default: 85
      }
    }
  },
  { timestamps: true }
);

export default mongoose.model('Trip', tripSchema);
