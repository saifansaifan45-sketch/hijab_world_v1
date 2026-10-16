require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Products API
app.get('/api/products', (req, res) => {
  const { category, search, shade } = req.query;
  let products = db.getProducts();

  if (category && category !== 'all') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }
  if (search) {
    const s = search.toLowerCase();
    products = products.filter(p => 
      p.title.toLowerCase().includes(s) || 
      p.subShade.toLowerCase().includes(s) ||
      p.description.toLowerCase().includes(s) ||
      p.category.toLowerCase().includes(s)
    );
  }
  if (shade) {
    products = products.filter(p => p.shades && p.shades.some(sh => sh.name.toLowerCase().includes(shade.toLowerCase())));
  }

  res.json({ success: true, count: products.length, data: products });
});

app.get('/api/products/:id', (req, res) => {
  const products = db.getProducts();
  const product = products.find(p => p.id === req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  res.json({ success: true, data: product });
});

// Admin Add Product
app.post('/api/products', (req, res) => {
  const products = db.getProducts();
  const newProduct = {
    id: req.body.id || 'product-' + Date.now(),
    title: req.body.title || 'Untitled Piece',
    subShade: req.body.subShade || 'Natural',
    category: req.body.category || 'silk',
    badge: req.body.badge || 'New Arrival',
    editionTag: req.body.editionTag || 'LIMITED ATELIER BATCH',
    orderTag: req.body.orderTag || 'Private Order Only',
    description: req.body.description || '',
    highlights: req.body.highlights || ['Hand-Rolled Hem', 'Artisanal Craft'],
    dimensions: req.body.dimensions || '185 cm x 70 cm',
    tactility: req.body.tactility || 'Soft fluid drape',
    stylistRecommendation: req.body.stylistRecommendation || 'Tailored modest elegance',
    careInstructions: req.body.careInstructions || 'Dry clean or gentle hand wash',
    image: req.body.image || '/assets/images/madinah_silk_desert_rose.jpg',
    gallery: req.body.gallery || ['/assets/images/madinah_silk_desert_rose.jpg'],
    shades: req.body.shades || [
      { name: "Desert Rose", hex: "#B7756B", selected: true },
      { name: "Pearl Ivory", hex: "#EBE5DF", selected: false }
    ],
    featured: req.body.featured ?? true,
    capsuleHighlight: req.body.capsuleHighlight ?? false,
    companionId: req.body.companionId || ''
  };

  products.unshift(newProduct);
  db.saveProducts(products);
  res.status(201).json({ success: true, data: newProduct });
});

// Admin Update Product
app.put('/api/products/:id', (req, res) => {
  let products = db.getProducts();
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }
  products[idx] = { ...products[idx], ...req.body };
  db.saveProducts(products);
  res.json({ success: true, data: products[idx] });
});

// Admin Delete Product
app.delete('/api/products/:id', (req, res) => {
  let products = db.getProducts();
  products = products.filter(p => p.id !== req.params.id);
  db.saveProducts(products);
  res.json({ success: true, message: 'Product deleted successfully' });
});

// Settings API
app.get('/api/settings', (req, res) => {
  res.json({ success: true, data: db.getSettings() });
});

app.put('/api/settings', (req, res) => {
  const current = db.getSettings();
  const updated = { ...current, ...req.body };
  db.saveSettings(updated);
  res.json({ success: true, data: updated });
});

// Analytics Tracking
app.get('/api/analytics', (req, res) => {
  res.json({ success: true, data: db.getAnalytics() });
});

app.post('/api/track', (req, res) => {
  const { type, detail } = req.body; // type: 'whatsapp', 'instagram', 'call', 'email', 'inquiry'
  const analytics = db.getAnalytics();
  
  if (type === 'whatsapp') analytics.whatsappClicks = (analytics.whatsappClicks || 0) + 1;
  else if (type === 'instagram') analytics.instagramClicks = (analytics.instagramClicks || 0) + 1;
  else if (type === 'call') analytics.callClicks = (analytics.callClicks || 0) + 1;
  else if (type === 'email') analytics.emailClicks = (analytics.emailClicks || 0) + 1;
  else if (type === 'inquiry') analytics.productInquiries = (analytics.productInquiries || 0) + 1;

  if (detail) {
    if (!analytics.recentActivity) analytics.recentActivity = [];
    analytics.recentActivity.unshift({
      type: type || 'click',
      product: detail,
      time: 'Just now'
    });
    if (analytics.recentActivity.length > 20) {
      analytics.recentActivity = analytics.recentActivity.slice(0, 20);
    }
  }

  db.saveAnalytics(analytics);
  res.json({ success: true, data: analytics });
});

// Fallback HTML routing for Single Page Application
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Hijab World Haute Modesty Server running at http://localhost:${PORT}`);
});
