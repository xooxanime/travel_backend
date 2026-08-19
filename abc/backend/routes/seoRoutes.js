import express from 'express';
import { getSitemapXml, getRobotsTxt, getSeoMetadataByPath } from '../controllers/seoController.js';

const router = express.Router();

// Public Search Engine Crawler & Metadata Endpoints
router.get('/sitemap.xml', getSitemapXml);
router.get('/robots.txt', getRobotsTxt);
router.get('/metadata', getSeoMetadataByPath);

export default router;
