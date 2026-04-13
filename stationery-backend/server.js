require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs'); // JSON file padhne ke liye zaroori hai

const app = express();
app.use(cors());
app.use(express.json());

// --- DATABASE CONNECTION ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ RRS Database Connected!"))
  .catch(err => console.log("❌ DB Connection Error:", err));

// --- PRODUCT SCHEMA ---
const ProductSchema = new mongoose.Schema({
    id: String,
    name: String, 
    slug: String, 
    category: String, 
    price: Number, 
    originalPrice: Number,
    discount: Number, // Percent mein
    image: String, 
    inStock: { type: Boolean, default: true },
    trending: { type: Boolean, default: false },
    description: String
});
const Product = mongoose.model('Product', ProductSchema);

// --- 1. SEED API (JSON file se 200+ products load karne ke liye) ---
app.get('/api/seed', async (req, res) => {
    try {
        // Aapki banayi hui products.json file ko read karega
        const rawData = fs.readFileSync('./products.json');
        const jsonData = JSON.parse(rawData);
        
        await Product.deleteMany({}); // Purana data saaf karega
        const products = await Product.insertMany(jsonData);
        
        res.json({ 
            message: "Sari photos aur data MongoDB mein bhej diya gaya hai!", 
            count: products.length 
        });
    } catch (err) {
        res.status(500).json({ error: "Seed Error: " + err.message });
    }
});

// --- 2. GET ALL PRODUCTS ---
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ _id: -1 });
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Fetch error" });
    }
});

// --- 3. ADMIN: ADD PRODUCT ---
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.json(newProduct);
    } catch (err) {
        res.status(500).json({ error: "Insert error" });
    }
});

// --- 4. ADMIN: DELETE PRODUCT ---
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Product deleted from DB" });
    } catch (err) {
        res.status(500).json({ error: "Delete error" });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));