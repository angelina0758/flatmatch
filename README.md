# FlatMatch

FlatMatch is a roommate compatibility matrix and apartment discovery platform tailored for the Indian residential rental market. The platform focuses on enhancing rental security and tenant compatibility through statutory verification mechanisms, localized housing configurations, Indian currency handling, and an AI-driven roommate compatibility scoring system.

---

## Key Features

- **Indian Market Localization**  
  All deposits, budgets, and listings are displayed in Indian Rupees (INR) using standard `en-IN` formatting.

- **Statutory KYC Verification**  
  Simulated verification workflows for landlords and seekers using Aadhaar (12-digit OTP validation) and PAN (10-character alphanumeric validation).

- **BHK Layout Configurations**  
  Supports region-specific housing formats including 1BHK, 2BHK, 3BHK, Paying Guest (PG) accommodations, studio apartments, and independent houses.

- **AI-Based Roommate Compatibility Analysis**  
  Integrates Google Gemini to evaluate user profiles based on lifestyle attributes such as habits, cleanliness, smoking preferences, pet ownership, work routines, and sleep cycles. Generates compatibility scores and detailed match insights.

- **Geolocation-Based Filtering**  
  Enables real-time property discovery within a configurable radius (in kilometers) across key urban hubs such as Bengaluru, Kochi, Thiruvananthapuram, Kozhikode, and Thrissur.

- **Bulk Data Import (CSV/JSON)**  
  Provides a landlord portfolio ingestion system that parses structured data and maps location details such as pincodes, cities, and states into the database schema.

- **Messaging and Viewing Scheduler**  
  Includes an integrated chat system and a viewing schedule manager with real-time updates for participants.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide, Framer Motion  
- **Backend**: Express.js with `tsx` runtime  
- **Database**: Supabase PostgreSQL with Drizzle ORM  
- **AI Engine**: Google `@google/genai` (Gemini 3.5 Flash)  
- **Build Tools**: Vite, ESBuild  

---

## Installation and Setup

### Prerequisites

- Node.js (version 18 or higher)  
- A configured Supabase PostgreSQL instance  

### 1. Install Dependencies 
npm install

### 2. Configure Environment Variables

Set up the required environment variables for database connectivity and API integrations.

### 3. Push Database Schema

Execute the following command to synchronize your schema with the Supabase instance:

npm run db:push
### 4. Start Development Server
npm run dev
