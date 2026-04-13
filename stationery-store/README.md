# 🛍️ Stationery Store — Full E-Commerce Website

A complete, production-ready React stationery e-commerce store built for **Netlify deployment**.  
No backend server needed — runs entirely as a static SPA with localStorage persistence.

---

## 🚀 Quick Deploy to Netlify (3 steps)

### Step 1 — Upload to GitHub
```bash
git init
git add .
git commit -m "Initial commit - stationery store"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/stationery-store.git
git push -u origin main
```

### Step 2 — Deploy on Netlify
1. Go to [netlify.com](https://netlify.com) → **Add new site** → **Import from Git**
2. Connect your GitHub repo
3. Build settings (auto-detected from `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Click **Deploy site** ✅

### Step 3 — Your site is live!
Netlify gives you a URL like `https://your-store.netlify.app`

---

## 🔐 Admin Login

| Field    | Value              |
|----------|--------------------|
| URL      | `/admin`           |
| Email    | `admin@store.com`  |
| Password | `admin123`         |

**⚠️ Change the password immediately** from Admin Panel → Site Settings → Change Password

---

## 📋 Features

### Customer-Facing
- ✅ Homepage with hero banner slider (show/hide from admin)
- ✅ Category grid with 50+ categories (all from sanddinternational.in)
- ✅ Latest Trending & Top Selling product sliders
- ✅ Global search (works from any page, shows results instantly)
- ✅ Global price range filter on homepage + all listing pages
- ✅ Category pages with sort + filter
- ✅ Product detail page with image gallery
- ✅ Cart with quantity management + promo codes
- ✅ **Registration required before adding to cart**
- ✅ **hCaptcha (free)** on checkout form — no paid tier
- ✅ Order placement with success page
- ✅ My Orders page
- ✅ About Us with dynamic team members (max 2/row, Load More)
- ✅ Contact page with WhatsApp integration
- ✅ Policy pages (Terms, Privacy, Refund, Shipping)

### Admin Panel (`/admin`)
- ✅ Dashboard with live stats
- ✅ **Logo upload** (PNG/SVG, shown in header + footer)
- ✅ **Banner manager** — add/remove/reorder banners with image upload
- ✅ **Section show/hide toggle** — Hero Banner, Admin Login section
- ✅ **Product manager** — add/edit/delete, upload images, tag Trending/Top Selling
- ✅ **Category manager** — add/edit/delete with image upload
- ✅ **Team Members manager** — add/edit/delete team cards (shown on About Us)
- ✅ **CMS editor** — About Us, Mission, Vision, all policy page content
- ✅ **Order manager** — view all orders, update status, export CSV
- ✅ **User manager** — view customers, block/unblock
- ✅ **Site Settings** — store name, tagline, contact, WhatsApp, social links
- ✅ **Change Password** — secure admin password update
- ✅ **Free notifications** — WhatsApp (wa.me) + EmailJS (200/month free)

---

## 📱 Order Notifications (100% Free)

### WhatsApp Notifications (free, no setup needed)
When an order is placed, a pre-filled WhatsApp message opens automatically to your number.  
Set your WhatsApp number in **Admin → Site Settings → WhatsApp Number**  
Format: `919876543210` (country code + number, no + or spaces)

### Email Notifications via EmailJS (free — 200 emails/month)
1. Sign up free at [emailjs.com](https://emailjs.com)
2. Create an Email Service (Gmail works)
3. Create an Email Template with these variables:
   ```
   Order ID: {{order_id}}
   Customer: {{customer_name}}
   Phone: {{customer_phone}}
   Email: {{customer_email}}
   Address: {{customer_address}}
   Items: {{order_items}}
   Total: {{order_total}}
   Date: {{order_date}}
   ```
4. Copy your **Service ID**, **Template ID**, **Public Key**
5. Paste them in **Admin → Site Settings → Order Notifications**

---

## 🔒 hCaptcha on Checkout (Free)

The checkout form uses **hCaptcha** (completely free, no account needed for testing).  
The site key `10000000-ffff-ffff-ffff-000000000001` is hCaptcha's **official test key** — always passes.

To use in production with real CAPTCHA challenges:
1. Sign up free at [hcaptcha.com](https://hcaptcha.com)
2. Add your site, get a **site key**
3. Replace the `data-sitekey` value in `src/pages/Cart.jsx`:
   ```jsx
   data-sitekey="YOUR_REAL_SITE_KEY_HERE"
   ```

---

## 🖼️ Adding Your Logo

**Option A — Admin Panel (easiest):**
1. Go to `/admin` → Site Settings → Branding
2. Upload your PNG or SVG logo
3. Saves instantly — appears in header and footer

**Option B — File:**
Drop your logo file as `public/logo.png` and paste the path in admin.

---

## 📂 Project Structure

```
stationery-store/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx        ← Sticky header, search, cart, nav
│   │   │   └── Footer.jsx        ← Footer with CMS content
│   │   └── ui/
│   │       └── ProductCard.jsx   ← Reusable product card
│   ├── data/
│   │   └── products.js           ← All categories + products extracted from reference site
│   ├── pages/
│   │   ├── Home.jsx              ← Homepage with sliders + price filter
│   │   ├── Auth.jsx              ← Login + Registration
│   │   ├── Categories.jsx        ← All categories listing + filters
│   │   ├── CategoryPage.jsx      ← Single category page
│   │   ├── ProductDetail.jsx     ← Product detail + add to cart
│   │   ├── Cart.jsx              ← Cart + checkout + hCaptcha
│   │   ├── SearchResults.jsx     ← Global search results
│   │   ├── AboutUs.jsx           ← About with dynamic team members
│   │   ├── Admin.jsx             ← Full admin panel
│   │   └── OtherPages.jsx        ← Contact, Orders, Policy pages
│   ├── styles/
│   │   └── index.css             ← Global styles + CSS variables
│   ├── utils/
│   │   └── notifications.js      ← WhatsApp + EmailJS order notifications
│   ├── store.js                  ← Zustand global state (auth, cart, admin)
│   ├── App.jsx                   ← Router + all routes
│   └── main.jsx                  ← Entry point
├── index.html                    ← Entry HTML + hCaptcha script
├── vite.config.js
├── netlify.toml                  ← Netlify SPA redirect config
└── package.json
```

---

## ⚙️ Local Development

```bash
npm install
npm run dev
```
Open `http://localhost:5173`

---

## 🌐 All Routes

| Route | Page |
|-------|------|
| `/` | Homepage |
| `/login` | Login / Register |
| `/categories` | All products + filters |
| `/category/:slug` | Single category |
| `/product/:slug` | Product detail |
| `/cart` | Cart + Checkout (login required) |
| `/search?q=term` | Search results |
| `/orders` | My orders (login required) |
| `/about` | About Us + Team |
| `/contact` | Contact page |
| `/admin` | Admin panel (admin only) |
| `/terms` | Terms & Conditions |
| `/privacy` | Privacy Policy |
| `/refund` | Return & Refund Policy |
| `/shipping` | Shipping Policy |

---

## 💡 Customisation Tips

1. **Change brand color:** Edit `--primary: #e84393` in `src/styles/index.css`
2. **Add products:** Admin Panel → Products → Add Product
3. **Add categories:** Admin Panel → Categories → Add Category
4. **Edit homepage banners:** Admin Panel → Banners
5. **Update policies:** Admin Panel → Content / CMS
6. **Add team members:** Admin Panel → Team Members

---

## 📝 Netlify Deployment Prompt

Use this prompt when talking to any AI to get help deploying:

> "I have a React + Vite stationery e-commerce store. It uses react-router-dom v6 for routing, zustand for state, react-slick for sliders, and hCaptcha for bot protection. It is deployed on Netlify as a static SPA. The netlify.toml has a redirect rule `/* → /index.html` with status 200 for SPA routing. Build command is `npm run build`, publish dir is `dist`. All data is stored in localStorage via zustand/middleware persist. No backend. Admin login at /admin with email admin@store.com and default password admin123. Order notifications go via hCaptcha-verified checkout → WhatsApp wa.me link (free) and optionally EmailJS free tier. Please help me with: [YOUR QUESTION]"

---

## 🆓 All Free Services Used

| Service | Purpose | Free Tier |
|---------|---------|-----------|
| Netlify | Hosting | 100GB bandwidth/month |
| hCaptcha | Checkout bot protection | Unlimited |
| EmailJS | Email notifications | 200 emails/month |
| WhatsApp wa.me | Order alerts | Unlimited |
| Zustand persist | Data storage | localStorage (unlimited) |

**Total monthly cost: ₹0** ✅
