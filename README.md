# 🏢 FlatMatch (India Localization Edition)

FlatMatch is a roommate compatibility matrix and apartment discovery platform localized for the Indian residential rental market. The platform addresses rental security and compatibility using statutory verification checks, localized BHK layouts, Indian Rupee calculations, and an AI-driven roommate compatibility scoring engine.

---

## ✨ Key Features

* **🇮🇳 Indian Market Localization**: All deposits, budgets, and listings are displayed in Indian Rupees (INR / ₹) with standard `en-IN` formatting.
* **🛡️ Statutory KYC Verification**: Simulated verification for Landlord and Seeker profiles using Aadhaar Card (12-digit OTP challenge checks) and PAN Card (10-character alphanumeric checks).
* **🏠 BHK Layout Configurations**: Supports localized configurations such as 1BHK, 2BHK, 3BHK, Paying Guest (PG) student accommodations, Studio Flats, and Independent Houses.
* **🧠 AI roommate Match Analysis**: Utilizes Google Gemini to compare user profile habits, bio descriptions, cleanliness values, smoking preferences, pets, work-from-home routines, and sleeping cycles to generate match ratings and lifestyle compatibility breakdowns.
* **📍 Geolocation Filters**: Displays properties in real-time within an adjustable search radius (in kilometers) around major metropolitan IT/educational hubs: Bengaluru, Kochi, Trivandrum, Kozhikode, and Thrissur.
* **📥 Bulk Importer (CSV/JSON)**: Landlord portfolio loader that parses raw address layouts, automatically mapping pincodes, cities, and states into the database schema.
* **💬 Messaging & Viewings Scheduler**: Built-in chat client combined with a viewing schedule manager that updates participants in real-time.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide icons, Motion (Framer Motion)
* **Backend**: Express Server, tsx Node loader
* **Database**: Supabase PostgreSQL + Drizzle ORM
* **AI Engine**: Google `@google/genai` (Gemini 3.5 Flash)
* **Bundler & Build Tool**: Vite, ESBuild

---

## ⚙️ Installation & Setup

### Prerequisites
* Node.js (v18 or higher)
* A Supabase Database instance

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the project root directory and add the following keys with your credentials:
```env
# Gemini API Key
GEMINI_API_KEY=""

# Application URL
APP_URL="http://localhost:3000"

# Supabase PostgreSQL connection details
SQL_HOST=""
SQL_DB_NAME=""
SQL_USER=""
SQL_PASSWORD=""

# Drizzle admin connection details
SQL_ADMIN_USER=""
SQL_ADMIN_PASSWORD=""
```

### 3. Push Database Schema to Supabase
Run the following script to create the necessary tables on your Supabase remote instance:
```bash
npm run db:push
```

### 4. Run Development Server
Start the local development server:
```bash
npm run dev
```

---

## 📁 Repository Structure

```text
├── src/
│   ├── db/
│   │   ├── drizzle.config.ts  # Drizzle migration and connection settings
│   │   ├── index.ts           # PostgreSQL pool initiator & drizzle client
│   │   └── schema.ts          # Database tables
│   ├── App.tsx                # Main SPA dashboard router
│   ├── index.css              # Custom styling
│   ├── main.tsx               # Frontend client bootstrapping entrypoint
│   ├── types.ts               # Core TypeScript interface typings
│   └── utils.ts               # Local currency formatters & mock data structures
├── package.json               # Scripts & dependencies registry
├── server.ts                  # Express Application server (REST APIs, HTTP services)
└── vite.config.ts             # Bundler options
```
