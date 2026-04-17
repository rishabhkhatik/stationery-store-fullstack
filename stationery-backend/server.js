require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
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
    await Product.deleteMany({});
    const products = await Product.insertMany(jsonData);
    res.json({ message: "Seeded!", count: products.length });
  } catch (err) { res.status(500).json({ error: "Seed Error: " + err.message }); }
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
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`));
