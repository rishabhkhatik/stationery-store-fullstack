require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');

const app = express();

// Allow requests from any origin in production (Netlify frontend)
app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '10mb' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ RRS Database Connected!"))
  .catch(err => console.log("❌ DB Connection Error:", err));

const ProductSchema = new mongoose.Schema({
  id: String, name: String, slug: String, category: String,
  price: Number, originalPrice: Number, discount: String,
  image: String, inStock: { type: Boolean, default: true },
  trending: { type: Boolean, default: false },
  topSelling: { type: Boolean, default: false },
  description: String, sku: String,
}, { timestamps: true });
const Product = mongoose.model('Product', ProductSchema);

const OrderSchema = new mongoose.Schema({
  orderId: String, items: Array, customer: Object,
  subtotal: Number, discount: Number, total: Number,
  promoCode: String, status: { type: String, default: 'Pending' },
  paymentScreenshot: String,
}, { timestamps: true });
const Order = mongoose.model('Order', OrderSchema);

const ConfigSchema = new mongoose.Schema({ key: String, value: mongoose.Schema.Types.Mixed }, { timestamps: true });
const Config = mongoose.model('Config', ConfigSchema);

app.get('/api/seed', async (req, res) => {
  try {
    const rawData = fs.readFileSync('./products.json');
    const jsonData = JSON.parse(rawData);
    // Upsert mode: update existing products by id, insert new ones — nothing gets deleted
    const ops = jsonData.map(p => ({
      updateOne: {
        filter: { id: p.id },
        update: { $set: p },
        upsert: true,
      }
    }));
    const result = await Product.bulkWrite(ops);
    res.json({ message: "Seeded (upsert)!", upserted: result.upsertedCount, modified: result.modifiedCount });
  } catch (err) { res.status(500).json({ error: "Seed Error: " + err.message }); }
});

// Fix broken image URLs — replaces fake/invalid CDN URLs with real verified ones
// Call once: /api/fix-images
app.get('/api/fix-images', async (req, res) => {
  try {
    const realImages = {
      'SKU-0002': 'https://image.cdn.shpy.in/308378/1687878793631_SKU-0002_0.jpg',
      'SKU-0001': 'https://image.cdn.shpy.in/308378/1687878793631_SKU-0002_0.jpg',
      'SKU-0004': 'https://image.cdn.shpy.in/308378/1688204328823_SKU-0004_0.jpg',
      'SKU-0003': 'https://image.cdn.shpy.in/308378/1688204328823_SKU-0004_0.jpg',
      'SKU-0005': 'https://image.cdn.shpy.in/308378/1688204496073_SKU-0005_0.jpg',
      'SKU-0006': 'https://image.cdn.shpy.in/308378/1688204635152_SKU-0006_0.jpg',
      'SKU-0007': 'https://image.cdn.shpy.in/308378/1688204739462_SKU-0007_0.jpg',
      'SKU-0008': 'https://image.cdn.shpy.in/308378/1688204844808_SKU-0008_0.jpg',
      'SKU-0009': 'https://image.cdn.shpy.in/308378/1688204917041_SKU-0009_0.jpg',
      'SKU-0010': 'https://image.cdn.shpy.in/308378/1688288403797_SKU-0010_0.jpg',
      'SKU-0011': 'https://image.cdn.shpy.in/308378/1688288501165_SKU-0011_0.jpg',
      'P-001': 'https://image.cdn.shpy.in/308378/1689167641675_1.jpeg',
      'P-002': 'https://image.cdn.shpy.in/308378/1689167615548_5.jpeg',
      'P-003': 'https://image.cdn.shpy.in/308378/1689167607601_6.jpeg',
      'P-004': 'https://image.cdn.shpy.in/308378/1689167598093_11.jpeg',
      'P-005': 'https://image.cdn.shpy.in/308378/1689167590188_7.jpeg',
      'P-006': 'https://image.cdn.shpy.in/308378/1689167579835_4.jpeg',
      'P-007': 'https://image.cdn.shpy.in/308378/1689167570950_8.jpeg',
      'P-008': 'https://image.cdn.shpy.in/308378/1689167555569_9.jpeg',
      'P-009': 'https://image.cdn.shpy.in/308378/1689167547306_10.jpeg',
      'P-010': 'https://image.cdn.shpy.in/308378/1689167538098_12.jpeg',
      'P-011': 'https://image.cdn.shpy.in/308378/1689167525617_13.jpeg',
      'P-012': 'https://image.cdn.shpy.in/308378/1689167515243_14.jpeg',
      'P-013': 'https://image.cdn.shpy.in/308378/1689167506818_15.jpeg',
      'P-014': 'https://image.cdn.shpy.in/308378/1689167498063_16.jpeg',
      'P-015': 'https://image.cdn.shpy.in/308378/1689167489845_17.jpeg',
    };
    // For products NOT in realImages map, fix broken CDN paths (ones without valid timestamps)
    const allProducts = await Product.find({});
    const ops = [];
    for (const p of allProducts) {
      if (realImages[p.id]) {
        ops.push({ updateOne: { filter: { id: p.id }, update: { $set: { image: realImages[p.id] } } } });
      } else if (p.image && !p.image.match(/\/\d{13}_/)) {
        // Image URL has no valid 13-digit timestamp — likely fake, replace with category placeholder
        const catImages = {
          'slime': 'https://image.cdn.shpy.in/308378/1688204496073_SKU-0005_0.jpg',
          'pencil-eraser': 'https://image.cdn.shpy.in/308378/1689167633529_2.jpeg',
          'pencil': 'https://image.cdn.shpy.in/308378/1689167641675_1.jpeg',
          'notebook': 'https://image.cdn.shpy.in/308378/1689167615548_5.jpeg',
          'stapler': 'https://image.cdn.shpy.in/308378/1689167607601_6.jpeg',
          'geometry-box': 'https://image.cdn.shpy.in/308378/1689167598093_11.jpeg',
          'giftset': 'https://image.cdn.shpy.in/308378/1689167590188_7.jpeg',
          'pen': 'https://image.cdn.shpy.in/308378/1689167579835_4.jpeg',
          'sippers-bottles': 'https://image.cdn.shpy.in/308378/1689167570950_8.jpeg',
          'lunch-box': 'https://image.cdn.shpy.in/308378/1689167555569_9.jpeg',
          'pencil-box': 'https://image.cdn.shpy.in/308378/1689167547306_10.jpeg',
          'pouches': 'https://image.cdn.shpy.in/308378/1689167498063_16.jpeg',
          'lamp': 'https://image.cdn.shpy.in/308378/1689167489845_17.jpeg',
          'markers': 'https://image.cdn.shpy.in/308378/1689167515243_14.jpeg',
          'white-board': 'https://image.cdn.shpy.in/308378/1689167506818_15.jpeg',
          'exam-pads': 'https://image.cdn.shpy.in/308378/1689167525617_13.jpeg',
        };
        const fallback = catImages[p.category] || 'https://image.cdn.shpy.in/308378/1689167590188_7.jpeg';
        ops.push({ updateOne: { filter: { id: p.id }, update: { $set: { image: fallback } } } });
      }
    }
    if (ops.length) await Product.bulkWrite(ops);
    res.json({ message: "Images fixed!", updated: ops.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Add fixed amount to all product prices
// Call: /api/update-prices?add=5
app.get('/api/update-prices', async (req, res) => {
  try {
    const add = parseFloat(req.query.add);
    if (isNaN(add) || add <= 0) return res.status(400).json({ error: "Pass ?add=5 (positive number)" });
    const products = await Product.find({});
    const ops = products.map(p => ({
      updateOne: {
        filter: { _id: p._id },
        update: { $set: { price: Math.round((p.price || 0) + add) } }
      }
    }));
    await Product.bulkWrite(ops);
    res.json({ message: `Added ₹${add} to all product prices`, updated: ops.length });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/products', async (req, res) => {
  try { res.json(await Product.find().sort({ _id: -1 })); }
  catch (err) { res.status(500).json({ error: "Fetch error" }); }
});

app.post('/api/products', async (req, res) => {
  try {
    const body = req.body;
    if (!body.id) body.id = 'P-' + Date.now();
    if (!body.slug) body.slug = (body.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const p = new Product(body);
    await p.save();
    res.json(p);
  } catch (err) { res.status(500).json({ error: "Insert error: " + err.message }); }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await Product.findOneAndUpdate({ id: req.params.id }, { $set: req.body }, { new: true });
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: "Update error: " + err.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  try { await Product.findOneAndDelete({ id: req.params.id }); res.json({ message: "Deleted" }); }
  catch (err) { res.status(500).json({ error: "Delete error" }); }
});

app.get('/api/orders', async (req, res) => {
  try { res.json(await Order.find().sort({ createdAt: -1 })); }
  catch (err) { res.status(500).json({ error: "Fetch orders error" }); }
});

app.post('/api/orders', async (req, res) => {
  try {
    const order = new Order({ ...req.body, orderId: req.body.id || 'ORD-' + Date.now() });
    await order.save();
    res.json(order);
  } catch (err) { res.status(500).json({ error: "Create order error: " + err.message }); }
});

app.put('/api/orders/:orderId/status', async (req, res) => {
  try {
    const updated = await Order.findOneAndUpdate({ orderId: req.params.orderId }, { $set: { status: req.body.status } }, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ error: "Update order error" }); }
});

app.get('/api/config', async (req, res) => {
  try {
    const configs = await Config.find();
    const obj = {};
    configs.forEach(c => { obj[c.key] = c.value; });
    res.json(obj);
  } catch (err) { res.status(500).json({ error: "Config fetch error" }); }
});

app.post('/api/config', async (req, res) => {
  try {
    for (const [key, value] of Object.entries(req.body)) {
      await Config.findOneAndUpdate({ key }, { key, value }, { upsert: true });
    }
    res.json({ message: "Saved" });
  } catch (err) { res.status(500).json({ error: "Config save error" }); }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));
