# FlatMatch SaaS Platform Specification: India Localization Edition

This document defines the product and technical architecture specifications of **FlatMatch**, a high-density, high-match Roommate and Apartment Finder SaaS Platform localized for the Indian residential market.

---

## 1. Monetization Strategy & Financial Tiers

All platform billing, transaction ledger columns, deposit records, and subscription tiers are defined strictly in **Indian Rupees (INR / ₹)**. 

### Core Subscription Matrix

The platform monetizes flat owners, managers, and room seekers through the following localized subscription tiers:

| Plan Tier | Localized Pricing | Key Target Audience | Billing Terms | Platform Capabilities |
| :--- | :--- | :--- | :--- | :--- |
| **Free Tier** | **₹0 / Free** | Casual Seeker / First-time Owner | No charge | Max 1 stay listing active, basic roommate chat. |
| **Premium Seeker** | **₹249 / month** | High-intent Room / Co-living Seekers | Recurring 30 days | Dynamic compatibility match boost; early listings window access; verified seeker badge on chat. |
| **Owner Pro** | **₹1,499 / month** | Individual Landlords & Flat Hosts | Recurring 30 days | Up to 15 active high-density listings; bulk CSV/JSON portfolio importer access; analytics dashboard. |
| **Owner Enterprise** | **₹4,999 / month** | Large Co-living Operators & Brokers | Recurring 30 days | Unlimited active stay listings; priority administrative instant API listings sync; premium support. |

### Technical Schema Adjustments (Monetary fields)
* All database schema values storing monetary amounts (`price_per_month`, `deposit`, `budget_min`, `budget_max`) are represented as safe integers in Rupees (INR).
* UI layer currencies are formatted in the Indian Locale standard using `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`.

---

## 2. India-Specific Identity Verification & KYC Compliance

To combat rental fraud and ensure trust, FlatMatch replaces generic verification with robust Indian statutory checking protocols:

### A. Aadhaar Card Verification (Room Seekers & Flatmates)
* **Underlying Protocol:** Handled via authorized UIDAI partners or the government's **DigiLocker Integration API**.
* **Validation Pattern:**
  * Strict validation for **12-digit Aadhaar Numbers** (excluding spaces and formatting).
  * Evaluated through an OTP-based challenge-response sent to the Aadhaar-linked mobile phone number.
  * Form validation regex: `/^\d{12}$/` (or strictly `/^[2-9]\d{11}$/` checking against first-digit rules).

### B. PAN Card Validation (Property Owners & Landlords)
* **Underlying Protocol:** Handled via real-time NSDL/UTIITSL or Tax Department validation APIs.
* **Validation Pattern:**
  * Validates the 10-character alphanumeric Permanent Account Number (PAN) required for TDS deduction on high rent values in India.
  * Form validation regex: `/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i` (5 Letters, 4 Digits, 1 Letter).

### Frontend & API Verification Mappings
* Custom endpoints (`/api/v1/listings/:id/verify`) require landlords to submit their **PAN Card** or **Aadhaar details**.
* A mock verification system enables simulation of the UIDAI OTP challenge flow with success/error callbacks to demonstrate end-to-end integration.

---

## 3. Real Estate Terminology & Regional Address Schemas

### A. Flat Layout Terminology
All apartment listings are structured around terminology naturally used in Indian real estate circles rather than generic American standards:
* **1BHK, 2BHK, 3BHK** (Bedroom, Hall, Kitchen configurations)
* **Paying Guest (PG) Accommodations** (Highly popular among students and IT professionals)
* **Studio Flats** (Modern, self-contained single units)
* **Independent Houses** (Villas or standalone multi-story builds)

### B. Indian Address Format Standards
Every listing created or imported into the database must strictly conform to the Indian address schema:
* **Street Line:** Gate/Apt/Villa details, Main Road, Block, Sector, Landmark details.
* **City:** Mandatory field (e.g. `Bengaluru`, `Mumbai`, `Pune`, `Delhi NCR`, `Hyderabad`).
* **State:** Mandatory Indian State/UT field (e.g. `Karnataka`, `Maharashtra`, `Haryana`, `Delhi`).
* **Pincode:** Mandatory **6-digit Indian Postal PIN Code**.
  * Form validation regex: `/^[1-9][0-9]{5}$/` (Checks that PIN Code consists of exactly 6 digits, where the first digit is non-zero).

### C. 10-Digit Mobile +91 OTP Registration Flow
Registration must validate the mobile number under Indian standards:
* Every user must declare an Indian mobile number.
* Validation ensures the country code prefix is strictly **`+91`**, followed by a **10-digit smartphone number** (starting with 6, 7, 8, or 9 for standard mobile networks).
* Regex pattern for validation: `/^\+91\s*[6-9]\d{9}$/`

---

## 4. Implementation Checklist for FlatMatch Systems

- [x] Codebase currency helpers configured to use `en-IN` and symbol `₹`.
- [x] Pricing matrix updated across standard seeker and landlord plans.
- [x] Registration interface checks for `+91` mobile registration and validates structure.
- [x] Aadhaar and PAN Card verification options integrated inside the core identity flows.
- [x] Bulk CSV/JSON upload formats localized to Indian residential nomenclature (1BHK, 2BHK, Pincode).
