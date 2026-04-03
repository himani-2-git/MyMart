# MyMart - Intelligent Retail & Supermarket Management Platform

MyMart is a fully integrated, modern supermarket management and POS (Point of Sale) system built for speed, reliability, and business intelligence. It provides store managers and staff with exactly what they need to process sales, monitor inventory levels, track expenses, and forecast demand without dealing with cluttered legacy interfaces.

![Dashboard Preview](docs/images/dashboard.png)

---

## 🏗️ Architecture Design

The project employs a modular, single-server deployment structure optimized for standard cloud hosting architectures. 

- **Frontend Application** is a Single Page Application (SPA) built with React and Vite. It compiles down to highly optimized static assets (HTML/CSS/JS).
- **Backend Application** is an Express JS server acting both as a robust REST API and the static file server for the Frontend application in production environments (`NODE_ENV=production`).
- **Database** utilizes MongoDB for flexible, high-speed document storage for inventories, dynamic receipt generation, and analytical transaction histories.
- **AI Intelligence Layer** connects with the Gemini API to analyze historic inventory, sales telemetry, and overhead expenses to draft actionable daily management briefings.

---

## ⚡ Features

### 🛒 Point of Sale & Checkout
- Lightning-fast POS interface with real-time cart tallying and tax calculation.
- Support for multiple payment integrations (Cash, Card, UPI).
- Automatic database synchronization that dynamically decrements inventory stock post-purchase.

### 📦 Smart Inventory System
- Add, update, or remove stock with ease.
- Automated tracking and visual alerts for "Low Stock" items and products nearing their expiration dates.
- Advanced categorization for streamlined navigation.

### 📊 Financial Tracking & Analytics
- Complete Sales History ledger tracking individual receipts, customer details, and precise timestamps.
- Native CSV Data Exports for processing Sales and Expense tables into accounting softwares.
- Profit Margin visualizations and overhead expense tracking.

### 🤖 AI-Powered Retail Insights 
- Generates intelligent reorder recommendations pointing out items causing revenue loss.
- Predicts upcoming demand thresholds using forecasting logic.
- Creates plain-language personalized daily briefings summarizing store performance.

---

## 🔧 Tech Stack

- **Client:** React 18, React Router v6, TailwindCSS (for utility layout structure) + Native CSS (for custom glassmorphism & premium UI), Recharts.
- **Server:** Node.js (v18+), Express, Mongoose, Helmet, CORS.
- **Database:** MongoDB
- **Intelligence:** Google Generative AI (Gemini) integration.
- **Build Tools:** Vite.

---

## 🚀 Working & Getting Started

### Prerequisites
- Node.js version 18 or above.
- A running instance of MongoDB (Local or clustered e.g., MongoDB Atlas).

### Installation (Local Development)

1. Clone the repository and install dependencies concurrently:
```bash
npm run install-all
```

2. Establish your Environment setups. Configure your `.env` within the `backend` directory adapting `.env.example`:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_randomjwt_key
GEMINI_API_KEY=your_gemini_api_key
```

3. Start both the backend and frontend using concurrently:
```bash
npm run dev
```
*Note: The frontend operates at `:5173` and automatically proxies API calls to the backend on `:5000` via Vite configuration.*

### Deploying for Production (Single Server Instance)

The architecture is wired to serve everything via the Express Node application.

1. Generate the optimized frontend production assets:
```bash
npm run build
```
*(This builds the React application into the `frontend/dist` folder.)*

2. Boot the Production Server:
```bash
NODE_ENV=production npm start
```
*(The backend running on port 5000 will natively serve the REST APIs alongside the full-stack static React application, allowing unified hosting).* 

---

### UI Previews

#### Point of Sale Terminal
![POS Preview](docs/images/pos.png)

#### Live Inventory Tracking
![Inventory Preview](docs/images/inventory.png)

#### Transaction Ledgers
![Sales History Preview](docs/images/sales_history.png)
