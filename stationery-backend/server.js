require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB Atlas (Reads your .env file securely)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Cloud Connected Successfully!"))
  .catch(err => console.log("❌ DB Connection Error:", err));

// --- DATABASE MODELS ---
const ProductSchema = new mongoose.Schema({
    name: String, slug: String, category: String, price: Number, 
    image: String, inStock: { type: Boolean, default: true }
});
const Product = mongoose.model('Product', ProductSchema);

// --- APIs ---
app.get('/api/products', async (req, res) => {
    const products = await Product.find().sort({ _id: -1 });
    res.json(products);
});

app.post('/api/products', async (req, res) => {
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.json(newProduct);
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 API Server running on port ${PORT}`));