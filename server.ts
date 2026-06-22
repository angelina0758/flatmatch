import "dotenv/config";

// Prevent background async exceptions/rejections from crashing the dev server
process.on("unhandledRejection", (reason) => {
  console.error("Unhandled Promise Rejection caught globally:", reason);
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception caught globally:", error);
});
import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { User, UserProfile, Listing, Message, CompatibilityBreakdown, ViewingSchedule } from "./src/types";
import { Firestore } from "@google-cloud/firestore";
import { db } from "./src/db/index.ts";
import { users, userProfiles, listings, messages, schedules } from "./src/db/schema.ts";
import { eq } from "drizzle-orm";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string };
    }
  }
}

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "flatmatch_db.json");

// Define in-memory database structure
interface DatabaseSchema {
  users: Record<string, User>;
  profiles: Record<string, UserProfile>;
  listings: Record<string, Listing>;
  messages: Message[];
  schedules?: Record<string, ViewingSchedule>;
}

// Default Seed Data
const DEFAULT_DATABASE: DatabaseSchema = {
  users: {
    "user-seeker-1": {
      id: "user-seeker-1",
      email: "seeker.alex@example.com",
      password: "password123",
      full_name: "Alex Johnson",
      user_type: "seeker",
      phone_number: "+1 (555) 123-4567",
      is_verified: true,
      tier: "premium_seeker",
      created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    },
    "user-seeker-2": {
      id: "user-seeker-2",
      email: "seeker.rahul@example.com",
      password: "password123",
      full_name: "Rahul Nair",
      user_type: "seeker",
      phone_number: "+91 94470 11223",
      is_verified: true,
      tier: "premium_seeker",
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    },
    "user-seeker-3": {
      id: "user-seeker-3",
      email: "seeker.anjali@example.com",
      password: "password123",
      full_name: "Anjali Menon",
      user_type: "seeker",
      phone_number: "+91 94950 44556",
      is_verified: true,
      tier: "premium_seeker",
      created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
    },
    "user-seeker-4": {
      id: "user-seeker-4",
      email: "seeker.fahad@example.com",
      password: "password123",
      full_name: "Fahad Fazal",
      user_type: "seeker",
      phone_number: "+91 98450 77889",
      is_verified: true,
      tier: "free",
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    },
    "user-tenant-1": {
      id: "user-tenant-1",
      email: "tenant.clara@example.com",
      password: "password123",
      full_name: "Clara Mendoza",
      user_type: "tenant",
      phone_number: "+1 (555) 987-6543",
      is_verified: true,
      tier: "free",
      created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    },
    "user-tenant-2": {
      id: "user-tenant-2",
      email: "tenant.dave@example.com",
      password: "password123",
      full_name: "Dave Chen",
      user_type: "tenant",
      phone_number: "+1 (555) 246-8101",
      is_verified: false,
      tier: "free",
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    },
    "user-tenant-3": {
      id: "user-tenant-3",
      email: "tenant.gautham@example.com",
      password: "password123",
      full_name: "Gautham Krishna",
      user_type: "tenant",
      phone_number: "+91 95620 99001",
      is_verified: true,
      tier: "free",
      created_at: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(),
    },
    "user-tenant-4": {
      id: "user-tenant-4",
      email: "tenant.riya@example.com",
      password: "password123",
      full_name: "Riya George",
      user_type: "tenant",
      phone_number: "+91 97440 22334",
      is_verified: true,
      tier: "free",
      created_at: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString(),
    },
    "user-tenant-5": {
      id: "user-tenant-5",
      email: "tenant.nidhin@example.com",
      password: "password123",
      full_name: "Nidhin Joseph",
      user_type: "tenant",
      phone_number: "+91 99950 55667",
      is_verified: true,
      tier: "free",
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    },
    "user-owner-1": {
      id: "user-owner-1",
      email: "owner.marcus@example.com",
      password: "password123",
      full_name: "Marcus Sterling Properties",
      user_type: "owner",
      phone_number: "+1 (555) 369-1215",
      is_verified: true,
      tier: "owner_pro",
      created_at: new Date(Date.now() - 60 * 24 * 3600 * 1000).toISOString(),
    },
    "user-owner-2": {
      id: "user-owner-2",
      email: "owner.malabar@example.com",
      password: "password123",
      full_name: "Malabar Developers Kochi",
      user_type: "owner",
      phone_number: "+91 484 2334455",
      is_verified: true,
      tier: "owner_pro",
      created_at: new Date(Date.now() - 40 * 24 * 3600 * 1000).toISOString(),
    },
    "user-owner-3": {
      id: "user-owner-3",
      email: "owner.travancore@example.com",
      password: "password123",
      full_name: "Travancore Builders Trivandrum",
      user_type: "owner",
      phone_number: "+91 471 2722822",
      is_verified: true,
      tier: "owner_pro",
      created_at: new Date(Date.now() - 35 * 24 * 3600 * 1000).toISOString(),
    },
    "user-owner-4": {
      id: "user-owner-4",
      email: "owner.calicut@example.com",
      password: "password123",
      full_name: "Calicut Landmark Realty",
      user_type: "owner",
      phone_number: "+91 495 2445566",
      is_verified: true,
      tier: "owner_pro",
      created_at: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
    },
    "user-owner-5": {
      id: "user-owner-5",
      email: "owner.kalyan@example.com",
      password: "password123",
      full_name: "Kalyan Crest Group Thrissur",
      user_type: "owner",
      phone_number: "+91 487 2331122",
      is_verified: true,
      tier: "owner_pro",
      created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
    },
    "user-owner-6": {
      id: "user-owner-6",
      email: "owner.vembanad@example.com",
      password: "password123",
      full_name: "Vembanad Lakeside Residency",
      user_type: "owner",
      phone_number: "+91 477 2211334",
      is_verified: true,
      tier: "owner_pro",
      created_at: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(),
    }
  },
  profiles: {
    "user-seeker-1": {
      user_id: "user-seeker-1",
      bio: "Software developer working in tech. I work hybrid (mostly 3 days home, 2 days office). Clean, quiet, and friendly. I enjoy cooking Italian dishes, watching football, and hiking on weekends. Looking to move into a bright room with flatmates who appreciate cleanliness and occasional shared meals.",
      age: 26,
      gender: "Male",
      profession: "Software Engineer",
      smoker: false,
      pets_allowed: true,
      cleanliness_level: 4,
      budget_min: 700,
      budget_max: 1300,
      drinking: "socially",
      sleeping_pattern: "early_bird",
      wfh_status: "hybrid"
    },
    "user-seeker-2": {
      user_id: "user-seeker-2",
      bio: "Working professional software engineer based at Kakkanad Infopark. Very systematic, neat, loves filter coffee and late evening tea. Looking for a neat flatmate to share a flat or split a flat in Kochi.",
      age: 25,
      gender: "Male",
      profession: "Software Engineer",
      smoker: false,
      pets_allowed: true,
      cleanliness_level: 4,
      budget_min: 8000,
      budget_max: 18000,
      drinking: "never",
      sleeping_pattern: "early_bird",
      wfh_status: "hybrid"
    },
    "user-seeker-3": {
      user_id: "user-seeker-3",
      bio: "Digital designer and local content creator. Very active lifestyle, loves movies, exploring food joints around Thiruvananthapuram. Non-smoker, friendly with pets.",
      age: 24,
      gender: "Female",
      profession: "Content Creator",
      smoker: false,
      pets_allowed: true,
      cleanliness_level: 3,
      budget_min: 10000,
      budget_max: 20000,
      drinking: "socially",
      sleeping_pattern: "flexible",
      wfh_status: "wfh"
    },
    "user-seeker-4": {
      user_id: "user-seeker-4",
      bio: "Digital marketing manager stationed in Calicut / Kozhikode. Enjoys deep discussions, occasional beach walks, and light music. Open to smoking and very chill habits.",
      age: 27,
      gender: "Male",
      profession: "Digital Marketer",
      smoker: true,
      pets_allowed: false,
      cleanliness_level: 3,
      budget_min: 8000,
      budget_max: 15000,
      drinking: "socially",
      sleeping_pattern: "night_owl",
      wfh_status: "hybrid"
    },
    "user-tenant-1": {
      user_id: "user-tenant-1",
      bio: "Graphic Designer who loves plants and books! Living in a gorgeous 2BHK in Brooklyn. I have a spacious spare bedroom with its own ensuite bathroom. Looking for an open-minded, clean flatmate. I respect private space, but am always down for a glass of wine or tea and chatting about movies.",
      age: 28,
      gender: "Female",
      profession: "Graphic Designer",
      smoker: false,
      pets_allowed: true,
      cleanliness_level: 4,
      budget_min: 900,
      budget_max: 1500,
      drinking: "socially",
      sleeping_pattern: "flexible",
      wfh_status: "wfh"
    },
    "user-tenant-2": {
      user_id: "user-tenant-2",
      bio: "Medical resident at the local hospital. Usually work long hours, so sleeping patterns can be a bit nocturnal. Love to host quiet dinners now and then, but mostly need a quiet, low-key space to rest and unwind. Cleanliness is highly valued!",
      age: 30,
      gender: "Male",
      profession: "Medical Resident",
      smoker: false,
      pets_allowed: false,
      cleanliness_level: 5,
      budget_min: 1000,
      budget_max: 1800,
      drinking: "never",
      sleeping_pattern: "night_owl",
      wfh_status: "office"
    },
    "user-tenant-3": {
      user_id: "user-tenant-3",
      bio: "Work as an interface artist. We are currently 3 fun guys in this neat flat and looking for our 4th awesome roommate. Cleanliness is highly prioritized, and we divide bills evenly.",
      age: 26,
      gender: "Male",
      profession: "UI Designer",
      smoker: false,
      pets_allowed: true,
      cleanliness_level: 4,
      budget_min: 5000,
      budget_max: 10000,
      drinking: "socially",
      sleeping_pattern: "flexible",
      wfh_status: "hybrid"
    },
    "user-tenant-4": {
      user_id: "user-tenant-4",
      bio: "Registered nurse stationed at a reputed clinic in Trivandrum. Extremely systematic. There are currently 3 of us girls here in this cozy home. We are searching for an amicable 4th girl flatmate.",
      age: 25,
      gender: "Female",
      profession: "Nurse",
      smoker: false,
      pets_allowed: false,
      cleanliness_level: 5,
      budget_min: 4000,
      budget_max: 9000,
      drinking: "never",
      sleeping_pattern: "night_owl",
      wfh_status: "office"
    },
    "user-tenant-5": {
      user_id: "user-tenant-5",
      bio: "Sous chef working in Calicut. Enthusiastic about standard organization. Sharing with 3 people in Calicut town center. Looking for a neat companion.",
      age: 28,
      gender: "Male",
      profession: "Chef",
      smoker: false,
      pets_allowed: true,
      cleanliness_level: 4,
      budget_min: 5000,
      budget_max: 12000,
      drinking: "socially",
      sleeping_pattern: "flexible",
      wfh_status: "office"
    }
  },
  listings: {
    "list-stay-1": {
      id: "list-stay-1",
      owner_id: "user-tenant-1",
      title: "Spacious En-suite Room in Vibrant Brooklyn 2BHK",
      description: "Looking for an awesome flatmate to occupy the master bedroom in a fully furnished modern 2-bedroom, 2-bathroom flat in the heart of Brooklyn. The room has high ceilings, a massive built-in wardrobe, and large East-facing windows that bring in beautiful morning light. Rest of the flat is shared with Clara, a 28yo designer.",
      listing_type: "shared_stay",
      price_per_month: 1150,
      deposit: 1150,
      address: "142 Greene Ave, Brooklyn, NY 11238",
      latitude: 40.6865,
      longitude: -73.9658,
      available_from: "2026-07-01",
      is_active: true,
      is_verified: true,
      verification_status: "verified",
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      room_size: "14' x 16' (En-suite)",
      utility_split: "Split 50/50 (~₹1,500/month for high-speed fiber & electric)",
      current_flatmate_count: 1,
      gender_preference: "Girls only",
      house_restrictions: ["No smoking indoors", "No overnight partners without prior notice", "Quiet hours after 11 PM"],
      amenities: ["Gym", "Security", "High-speed Internet", "In-unit Laundry", "Rooftop Access"],
      image_urls: [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "list-stay-2": {
      id: "list-stay-2",
      owner_id: "user-tenant-2",
      title: "Cozy Bedroom in Upper West Side High-rise",
      description: "Private room available in high-end luxury building. Extremely quiet space with gorgeous views. Sharing with Dave, a medical resident who is rarely home in the daytime. Ideal for someone who wants peace, quiet, and spotless cleanliness. There is a study desk and standard furniture provided.",
      listing_type: "shared_stay",
      price_per_month: 1400,
      deposit: 1000,
      address: "320 West 86th St, New York, NY 10024",
      latitude: 40.7895,
      longitude: -73.9795,
      available_from: "2026-08-01",
      is_active: true,
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      room_size: "12' x 11'",
      utility_split: "All-inclusive (Wifi/AC included in rent)",
      current_flatmate_count: 1,
      gender_preference: "Boys only",
      house_restrictions: ["Strict quiet hours", "No pets allowed", "Exemplary kitchen cleanup after cooking"],
      amenities: ["Gym", "Pool", "Parking", "Security", "Doorman", "Elevator"],
      image_urls: [
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "list-stay-3": {
      id: "list-stay-3",
      owner_id: "user-tenant-3",
      title: "Master Room in Skylark Flat - Edappally, Kochi (3 Flatmates)",
      description: "Looking for an awesome flatmate to join us in our flat. We are 3 working professionals already occupying the apartment. The available room is spacious, with a separate balcony and attached washroom.",
      listing_type: "shared_stay",
      price_per_month: 6500,
      deposit: 15000,
      address: "Skyline Imperial, Edappally, Kochi, Kerala 682024",
      latitude: 10.0261,
      longitude: 76.3125,
      available_from: "2026-07-01",
      is_active: true,
      is_verified: true,
      verification_status: "verified",
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      room_size: "12' x 11'",
      utility_split: "Split evenly among 4 roommates",
      current_flatmate_count: 3,
      gender_preference: "Boys only",
      house_restrictions: ["No smoking in room", "No midnight heavy noise"],
      amenities: ["High-speed Internet", "Security", "In-unit Laundry", "Parking"],
      image_urls: [
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "list-stay-4": {
      id: "list-stay-4",
      owner_id: "user-tenant-4",
      title: "Cozy Shared Stay near Technopark - Trivandrum (3 Flatmates)",
      description: "A wonderful clean single bedroom available in our 4-bedroom villa. Currently there are 3 female working roommates. Safe residential colony with security and easy metro commuting.",
      listing_type: "shared_stay",
      price_per_month: 5500,
      deposit: 10000,
      address: "Technopark Phase 1 Road, Kazhakkoottam, Thiruvananthapuram, Kerala 695581",
      latitude: 8.5581,
      longitude: 76.8845,
      available_from: "2026-07-01",
      is_active: true,
      is_verified: true,
      verification_status: "verified",
      created_at: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
      room_size: "10' x 11'",
      utility_split: "Split 4 ways evenly",
      current_flatmate_count: 3,
      gender_preference: "Girls only",
      house_restrictions: ["Strict clean cleanup rules", "Quiet hours after 10 PM"],
      amenities: ["High-speed Internet", "Food Included", "Kitchen", "Security"],
      image_urls: [
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "list-stay-5": {
      id: "list-stay-5",
      owner_id: "user-tenant-5",
      title: "Single Room in Beach Road Flat - Kozhikode (3 Flatmates)",
      description: "Private third bedroom in a spacious 4BHK flat right next to Kozhikode beach. Relaxed atmosphere, sharing with 3 chill guys. Very friendly environment.",
      listing_type: "shared_stay",
      price_per_month: 6000,
      deposit: 12000,
      address: "Beach Road near Kozhikode Beach, Kozhikode, Kerala 673001",
      latitude: 11.2588,
      longitude: 75.7804,
      available_from: "2026-07-01",
      is_active: true,
      is_verified: true,
      verification_status: "verified",
      created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
      room_size: "11' x 11'",
      utility_split: "Split all bills equally",
      current_flatmate_count: 3,
      gender_preference: "No preference",
      house_restrictions: ["Clean your own plates immediately", "Restricted commercial guests"],
      amenities: ["Kitchen", "Parking", "High-speed Internet", "Rooftop Access"],
      image_urls: [
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "list-unit-1": {
      id: "list-unit-1",
      owner_id: "user-owner-1",
      title: "Modern Premium 1BHK Studio - Midtown North",
      description: "Directly from building owner. Sleek, brand new renovated 1BHK unit. Built-in high-end appliances, underfloor heating, energy-efficient triple glazed windows. Ideal for young professionals or couples who want premium independent living. No broker fee, flexible lease options available.",
      listing_type: "entire_unit",
      price_per_month: 2350,
      deposit: 2350,
      address: "240 W 54th St, New York, NY 10019",
      latitude: 40.7638,
      longitude: -73.9825,
      available_from: "2026-07-15",
      is_active: true,
      is_verified: true,
      verification_status: "verified",
      created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
      apartment_type: "1BHK",
      gender_preference: "No preference",
      house_restrictions: ["No smoking in unit", "Rent paid by 1st of month", "Quiet residential unit"],
      amenities: ["Gym", "Security", "Parking", "Elevator", "Central AC", "Common Lounge"],
      image_urls: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1502672016832-47ba6e1b73c4?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "list-unit-2": {
      id: "list-unit-2",
      owner_id: "user-owner-1",
      title: "Spacious Renovated 2BHK Near Central Park",
      description: "Fabulous location just two avenues away from Central Park! Large family-owned 2BHK apartment with open-plan kitchen, smart lockers for parcels, and fully equipped laundry in the basement. Pet-friendly building with visual intercom and 24/7 security. Contact for viewings.",
      listing_type: "entire_unit",
      price_per_month: 3100,
      deposit: 3000,
      address: "120 Central Park West, New York, NY 10023",
      latitude: 40.7766,
      longitude: -73.9772,
      available_from: "2026-07-01",
      is_active: true,
      created_at: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      apartment_type: "2BHK",
      gender_preference: "No preference",
      house_restrictions: ["No commercial events or loud parties", "Subletting strictly prohibited"],
      amenities: ["Security", "Parking", "Common Lounge", "Pets Allowed", "Bicycle Storage"],
      image_urls: [
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "list-unit-3": {
      id: "list-unit-3",
      owner_id: "user-owner-2",
      title: "Luxury 3BHK Apartment - Kakkanad InfoPark Peak",
      description: "Direct listing from Malabar Developers. Premium high-rise 3BHK with excellent natural air Flow, premium modular cupboards, 2 spacious balconies, security checkpoints, and high speed elevator tracks.",
      listing_type: "entire_unit",
      price_per_month: 32000,
      deposit: 90000,
      address: "Kakkanad InfoPark, Kochi, Kerala 682030",
      latitude: 10.0159,
      longitude: 76.3639,
      available_from: "2026-07-15",
      is_active: true,
      is_verified: true,
      verification_status: "verified",
      created_at: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString(),
      apartment_type: "3BHK",
      gender_preference: "No preference",
      house_restrictions: ["No heavy partying on premises", "Monthly rent pays on 1st of calendar"],
      amenities: ["Gym", "Security", "Parking", "Elevator", "Central AC", "Common Lounge"],
      image_urls: [
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "list-unit-4": {
      id: "list-unit-4",
      owner_id: "user-owner-3",
      title: "Prestige 2BHK Tower Flat - Kowdiar, Trivandrum",
      description: "Exclusive luxury residence offered by Travancore Builders. Prestigious high security complex, visual intercoms, dedicated security, continuous borewell/drinking water supply, and complete dual backup grids.",
      listing_type: "entire_unit",
      price_per_month: 26000,
      deposit: 75000,
      address: "Kowdiar Main Rd, Kowdiar, Thiruvananthapuram, Kerala 695003",
      latitude: 8.5241,
      longitude: 76.9536,
      available_from: "2026-07-01",
      is_active: true,
      is_verified: true,
      verification_status: "verified",
      created_at: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(),
      apartment_type: "2BHK",
      gender_preference: "No preference",
      house_restrictions: ["Quiet family-oriented building blocks", "Subletting strictly prohibited"],
      amenities: ["Security", "Parking", "Common Lounge", "Pets Allowed", "Bicycle Storage"],
      image_urls: [
        "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "list-unit-5": {
      id: "list-unit-5",
      owner_id: "user-owner-4",
      title: "Executive 1BHK Studio - Hilite City, Kozhikode",
      description: "Fabulous fully loaded executive studio suite at Hilite Mall Complex. Automated remote control blinds, complete AC, high-speed gaming fiber ready, and gym membership included.",
      listing_type: "entire_unit",
      price_per_month: 18000,
      deposit: 50000,
      address: "Hilite City, Bypass Rd, Kozhikode, Kerala 673016",
      latitude: 11.2483,
      longitude: 75.8340,
      available_from: "2026-08-01",
      is_active: true,
      is_verified: true,
      verification_status: "verified",
      created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      apartment_type: "Studio Flat",
      gender_preference: "No preference",
      house_restrictions: ["No smoking in unit", "Only registered occupants"],
      amenities: ["Gym", "Pool", "Parking", "Security", "Doorman", "Elevator"],
      image_urls: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "list-unit-6": {
      id: "list-unit-6",
      owner_id: "user-owner-5",
      title: "Elite 3BHK Family Flat - Round North, Thrissur",
      description: "Huge family layout right at Sree Vadakkumnathan temple round. Stunning design, large rooms, private service balcony, and highly secure. Perfect for families or professional flat sharers.",
      listing_type: "entire_unit",
      price_per_month: 35000,
      deposit: 100000,
      address: "Swaraj Round North, Thrissur, Kerala 680001",
      latitude: 10.5276,
      longitude: 76.2144,
      available_from: "2026-07-15",
      is_active: true,
      is_verified: true,
      verification_status: "verified",
      created_at: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
      apartment_type: "3BHK",
      gender_preference: "No preference",
      house_restrictions: ["Maintain serene temple zone quietness", "No pets allowed"],
      amenities: ["Security", "Parking", "Central AC", "Power Backup"],
      image_urls: [
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "list-unit-7": {
      id: "list-unit-7",
      owner_id: "user-owner-6",
      title: "Scenic 2BHK Lakeview Unit - Alappuzha Port",
      description: "Superb scenic apartment right at the Punnamada Lake finish line. Uninterrupted fresh breeze, customized wood furniture, completely security-monitored campus.",
      listing_type: "entire_unit",
      price_per_month: 22000,
      deposit: 60000,
      address: "Finishing Point Rd, Alappuzha, Kerala 688013",
      latitude: 9.4981,
      longitude: 76.3388,
      available_from: "2026-07-01",
      is_active: true,
      is_verified: true,
      verification_status: "verified",
      created_at: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
      apartment_type: "2BHK",
      gender_preference: "No preference",
      house_restrictions: ["No commercial event hosting", "Respect garbage segregations"],
      amenities: ["Security", "Parking", "Common Lounge", "Pets Allowed", "Bicycle Storage"],
      image_urls: [
        "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800"
      ]
    }
  },
  messages: [
    {
      id: "msg-1",
      sender_id: "user-seeker-1",
      receiver_id: "user-tenant-1",
      message_text: "Hey Clara! Your master bedroom in Brooklyn looks absolutely beautiful. I love the high ceilings and your plants! I'm a software engineer, very clean and friendly. Is it still available for viewings?",
      sent_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: "msg-2",
      sender_id: "user-tenant-1",
      receiver_id: "user-seeker-1",
      message_text: "Hi Alex! Thanks so much for reaching out. Yes, the room is still available! That's awesome that you work in tech and enjoy hiking. I'm actually hosting private viewings this Saturday afternoon. Would you be free to pop by around 2 PM?",
      sent_at: new Date(Date.now() - 90 * 60 * 1000).toISOString()
    },
    {
      id: "msg-3",
      sender_id: "user-seeker-1",
      receiver_id: "user-tenant-1",
      message_text: "Saturday at 2 PM works perfectly for me! I can send over my social links and Linkedin if you want to verify beforehand. Looking forward to meeting you!",
      sent_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    }
  ]
};

// Database persistence wrapper

let firestore: Firestore | null = null;
try {
  const fbConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
  if (fs.existsSync(fbConfigPath)) {
    const config = JSON.parse(fs.readFileSync(fbConfigPath, "utf-8"));
    firestore = new Firestore({
      projectId: config.projectId,
      databaseId: config.firestoreDatabaseId || "(default)"
    });
    console.log("Firestore initialized successfully on backend! Project ID:", config.projectId);
  } else {
    console.warn("firebase-applet-config.json not found, falling back to local file database.");
  }
} catch (e) {
  console.error("Failed to initialize Firestore:", e);
}

// Memory caches for Firestore syncing
let lastSyncedDb: DatabaseSchema | null = null;
let currentInMemoryDb: DatabaseSchema | null = null;
let isSyncing = false;
let pendingSync = false;

// Postgres syncing state
let isSyncingPg = false;
let pendingSyncPg = false;

async function seedDatabaseToPostgres(dbData: DatabaseSchema) {
  try {
    console.log("Seeding DEFAULT_DATABASE to Postgres Cloud SQL...");
    // Users
    for (const [uid, u] of Object.entries(dbData.users)) {
      await db.insert(users).values({
        id: u.id,
        email: u.email,
        password: u.password || null,
        fullName: u.full_name,
        userType: u.user_type,
        phoneNumber: u.phone_number || null,
        isVerified: u.is_verified,
        tier: u.tier,
        createdAt: u.created_at,
      }).onConflictDoUpdate({
        target: users.id,
        set: {
          email: u.email,
          password: u.password || null,
          fullName: u.full_name,
          userType: u.user_type,
          phoneNumber: u.phone_number || null,
          isVerified: u.is_verified,
          tier: u.tier,
          createdAt: u.created_at,
        }
      });
    }

    // Profiles
    for (const [pid, p] of Object.entries(dbData.profiles)) {
      await db.insert(userProfiles).values({
        userId: p.user_id,
        bio: p.bio,
        age: p.age,
        gender: p.gender,
        profession: p.profession,
        smoker: p.smoker,
        petsAllowed: p.pets_allowed,
        cleanlinessLevel: p.cleanliness_level,
        budgetMin: p.budget_min,
        budgetMax: p.budget_max,
        drinking: p.drinking,
        sleepingPattern: p.sleeping_pattern,
        wfhStatus: p.wfh_status,
      }).onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          bio: p.bio,
          age: p.age,
          gender: p.gender,
          profession: p.profession,
          smoker: p.smoker,
          petsAllowed: p.pets_allowed,
          cleanlinessLevel: p.cleanliness_level,
          budgetMin: p.budget_min,
          budgetMax: p.budget_max,
          drinking: p.drinking,
          sleepingPattern: p.sleeping_pattern,
          wfhStatus: p.wfh_status,
        }
      });
    }

    // Listings
    for (const [lid, l] of Object.entries(dbData.listings)) {
      await db.insert(listings).values({
        id: l.id,
        ownerId: l.owner_id,
        ownerName: l.owner_name || null,
        title: l.title,
        description: l.description,
        listingType: l.listing_type,
        pricePerMonth: l.price_per_month,
        deposit: l.deposit,
        address: l.address,
        latitude: l.latitude,
        longitude: l.longitude,
        availableFrom: l.available_from,
        isActive: l.is_active,
        createdAt: l.created_at,
        genderPreference: l.gender_preference,
        houseRestrictions: l.house_restrictions,
        roomSize: l.room_size || null,
        utilitySplit: l.utility_split || null,
        currentFlatmateCount: l.current_flatmate_count || null,
        apartmentType: l.apartment_type || null,
        pincode: l.pincode || null,
        state: l.state || null,
        city: l.city || null,
        amenities: l.amenities,
        imageUrls: l.image_urls,
        isVerified: l.is_verified || false,
        verificationStatus: l.verification_status || null,
        verificationDetails: l.verification_details || null,
      }).onConflictDoUpdate({
        target: listings.id,
        set: {
          ownerId: l.owner_id,
          ownerName: l.owner_name || null,
          title: l.title,
          description: l.description,
          listingType: l.listing_type,
          pricePerMonth: l.price_per_month,
          deposit: l.deposit,
          address: l.address,
          latitude: l.latitude,
          longitude: l.longitude,
          availableFrom: l.available_from,
          isActive: l.is_active,
          createdAt: l.created_at,
          genderPreference: l.gender_preference,
          houseRestrictions: l.house_restrictions,
          roomSize: l.room_size || null,
          utilitySplit: l.utility_split || null,
          currentFlatmateCount: l.current_flatmate_count || null,
          apartmentType: l.apartment_type || null,
          pincode: l.pincode || null,
          state: l.state || null,
          city: l.city || null,
          amenities: l.amenities,
          imageUrls: l.image_urls,
          isVerified: l.is_verified || false,
          verificationStatus: l.verification_status || null,
          verificationDetails: l.verification_details || null,
        }
      });
    }

    // Messages
    for (const m of dbData.messages) {
      await db.insert(messages).values({
        id: m.id,
        senderId: m.sender_id,
        receiverId: m.receiver_id,
        messageText: m.message_text,
        sentAt: m.sent_at,
      }).onConflictDoUpdate({
        target: messages.id,
        set: {
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          messageText: m.message_text,
          sentAt: m.sent_at,
        }
      });
    }

    // Schedules
    if (dbData.schedules) {
      for (const [sid, s] of Object.entries(dbData.schedules)) {
        await db.insert(schedules).values({
          id: s.id,
          listingId: s.listing_id,
          listingTitle: s.listing_title,
          listingAddress: s.listing_address,
          hostId: s.host_id,
          hostName: s.host_name,
          seekerId: s.seeker_id,
          seekerName: s.seeker_name,
          proposedTime: s.proposed_time,
          status: s.status,
          notes: s.notes || null,
          createdAt: s.created_at,
        }).onConflictDoUpdate({
          target: schedules.id,
          set: {
            listingId: s.listing_id,
            listingTitle: s.listing_title,
            listingAddress: s.listing_address,
            hostId: s.host_id,
            hostName: s.host_name,
            seekerId: s.seeker_id,
            seekerName: s.seeker_name,
            proposedTime: s.proposed_time,
            status: s.status,
            notes: s.notes || null,
            createdAt: s.created_at,
          }
        });
      }
    }
    console.log("Postgres seed complete!");
  } catch (err) {
    console.error("Error seeding DEFAULT_DATABASE to Postgres:", err);
  }
}

async function loadDatabaseFromPostgres(): Promise<DatabaseSchema | null> {
  try {
    console.log("Loading FlatMatch database from Postgres Cloud SQL...");
    const dbData: DatabaseSchema = {
      users: {},
      profiles: {},
      listings: {},
      messages: [],
      schedules: {},
    };

    // 1. Fetch Users
    const allUsers = await db.select().from(users);
    for (const u of allUsers) {
      dbData.users[u.id] = {
        id: u.id,
        email: u.email,
        password: u.password || undefined,
        full_name: u.fullName,
        user_type: u.userType as any,
        phone_number: u.phoneNumber || undefined,
        is_verified: u.isVerified,
        tier: u.tier as any,
        created_at: u.createdAt,
      };
    }

    // 2. Fetch User Profiles
    const allProfiles = await db.select().from(userProfiles);
    for (const p of allProfiles) {
      dbData.profiles[p.userId] = {
        user_id: p.userId,
        bio: p.bio,
        age: p.age,
        gender: p.gender,
        profession: p.profession,
        smoker: p.smoker,
        pets_allowed: p.petsAllowed,
        cleanliness_level: p.cleanlinessLevel,
        budget_min: p.budgetMin,
        budget_max: p.budgetMax,
        drinking: p.drinking as any,
        sleeping_pattern: p.sleepingPattern as any,
        wfh_status: p.wfhStatus as any,
      };
    }

    // 3. Fetch Listings
    const allListings = await db.select().from(listings);
    for (const l of allListings) {
      dbData.listings[l.id] = {
        id: l.id,
        owner_id: l.ownerId,
        owner_name: l.ownerName || undefined,
        title: l.title,
        description: l.description,
        listing_type: l.listingType as any,
        price_per_month: l.pricePerMonth,
        deposit: l.deposit,
        address: l.address,
        latitude: l.latitude,
        longitude: l.longitude,
        available_from: l.availableFrom,
        is_active: l.isActive,
        created_at: l.createdAt,
        gender_preference: l.genderPreference as any,
        house_restrictions: (l.houseRestrictions || []) as string[],
        room_size: l.roomSize || undefined,
        utility_split: l.utilitySplit || undefined,
        current_flatmate_count: l.currentFlatmateCount || undefined,
        apartment_type: l.apartmentType as any,
        pincode: l.pincode || undefined,
        state: l.state || undefined,
        city: l.city || undefined,
        amenities: (l.amenities || []) as string[],
        image_urls: (l.imageUrls || []) as string[],
        is_verified: l.isVerified || undefined,
        verification_status: l.verificationStatus as any,
        verification_details: (l.verificationDetails || undefined) as any,
      };
    }

    // 4. Fetch Messages
    const allMessages = await db.select().from(messages);
    dbData.messages = allMessages.map(m => ({
      id: m.id,
      sender_id: m.senderId,
      receiver_id: m.receiverId,
      message_text: m.messageText,
      sent_at: m.sentAt,
    }));
    dbData.messages.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());

    // 5. Fetch Schedules
    const allSchedules = await db.select().from(schedules);
    dbData.schedules = {};
    for (const s of allSchedules) {
      dbData.schedules[s.id] = {
        id: s.id,
        listing_id: s.listingId,
        listing_title: s.listingTitle,
        listing_address: s.listingAddress,
        host_id: s.hostId,
        host_name: s.hostName,
        seeker_id: s.seekerId,
        seeker_name: s.seekerName,
        proposed_time: s.proposedTime,
        status: s.status as any,
        notes: s.notes || undefined,
        created_at: s.createdAt,
      };
    }

    const totalUsers = Object.keys(dbData.users).length;
    if (totalUsers === 0) {
      console.log("Postgres database is empty. Seeding DEFAULT_DATABASE...");
      await seedDatabaseToPostgres(DEFAULT_DATABASE);
      return DEFAULT_DATABASE;
    }

    console.log(`Successfully loaded from Postgres: ${totalUsers} users, ${Object.keys(dbData.profiles).length} profiles, ${Object.keys(dbData.listings).length} listings, ${dbData.messages.length} messages, ${Object.keys(dbData.schedules).length} schedules.`);
    return dbData;
  } catch (error) {
    console.error("Failed to load database from Postgres:", error);
    return null;
  }
}

async function syncToPostgres(): Promise<void> {
  if (isSyncingPg) {
    pendingSyncPg = true;
    return;
  }
  isSyncingPg = true;
  pendingSyncPg = false;

  try {
    const dbData = currentInMemoryDb;
    if (!dbData) {
      isSyncingPg = false;
      return;
    }

    // 1. Users Diff
    for (const [uid, u] of Object.entries(dbData.users)) {
      if (!lastSyncedDb || JSON.stringify(lastSyncedDb.users[uid]) !== JSON.stringify(u)) {
        await db.insert(users).values({
          id: u.id,
          email: u.email,
          password: u.password || null,
          fullName: u.full_name,
          userType: u.user_type,
          phoneNumber: u.phone_number || null,
          isVerified: u.is_verified,
          tier: u.tier,
          createdAt: u.created_at,
        }).onConflictDoUpdate({
          target: users.id,
          set: {
            email: u.email,
            password: u.password || null,
            fullName: u.full_name,
            userType: u.user_type,
            phoneNumber: u.phone_number || null,
            isVerified: u.is_verified,
            tier: u.tier,
            createdAt: u.created_at,
          }
        });
      }
    }
    if (lastSyncedDb) {
      for (const uid of Object.keys(lastSyncedDb.users)) {
        if (!dbData.users[uid]) {
          await db.delete(users).where(eq(users.id, uid));
        }
      }
    }

    // 2. User Profiles Diff
    for (const [pid, p] of Object.entries(dbData.profiles)) {
      if (!lastSyncedDb || JSON.stringify(lastSyncedDb.profiles[pid]) !== JSON.stringify(p)) {
        await db.insert(userProfiles).values({
          userId: p.user_id,
          bio: p.bio,
          age: p.age,
          gender: p.gender,
          profession: p.profession,
          smoker: p.smoker,
          petsAllowed: p.pets_allowed,
          cleanlinessLevel: p.cleanliness_level,
          budgetMin: p.budget_min,
          budgetMax: p.budget_max,
          drinking: p.drinking,
          sleepingPattern: p.sleeping_pattern,
          wfhStatus: p.wfh_status,
        }).onConflictDoUpdate({
          target: userProfiles.userId,
          set: {
            bio: p.bio,
            age: p.age,
            gender: p.gender,
            profession: p.profession,
            smoker: p.smoker,
            petsAllowed: p.pets_allowed,
            cleanlinessLevel: p.cleanliness_level,
            budgetMin: p.budget_min,
            budgetMax: p.budget_max,
            drinking: p.drinking,
            sleepingPattern: p.sleeping_pattern,
            wfhStatus: p.wfh_status,
          }
        });
      }
    }
    if (lastSyncedDb) {
      for (const pid of Object.keys(lastSyncedDb.profiles)) {
        if (!dbData.profiles[pid]) {
          await db.delete(userProfiles).where(eq(userProfiles.userId, pid));
        }
      }
    }

    // 3. Listings Diff
    for (const [lid, l] of Object.entries(dbData.listings)) {
      if (!lastSyncedDb || JSON.stringify(lastSyncedDb.listings[lid]) !== JSON.stringify(l)) {
        await db.insert(listings).values({
          id: l.id,
          ownerId: l.owner_id,
          ownerName: l.owner_name || null,
          title: l.title,
          description: l.description,
          listingType: l.listing_type,
          pricePerMonth: l.price_per_month,
          deposit: l.deposit,
          address: l.address,
          latitude: l.latitude,
          longitude: l.longitude,
          availableFrom: l.available_from,
          isActive: l.is_active,
          createdAt: l.created_at,
          genderPreference: l.gender_preference,
          houseRestrictions: l.house_restrictions,
          roomSize: l.room_size || null,
          utilitySplit: l.utility_split || null,
          currentFlatmateCount: l.current_flatmate_count || null,
          apartmentType: l.apartment_type || null,
          pincode: l.pincode || null,
          state: l.state || null,
          city: l.city || null,
          amenities: l.amenities,
          imageUrls: l.image_urls,
          isVerified: l.is_verified || false,
          verificationStatus: l.verification_status || null,
          verificationDetails: l.verification_details || null,
        }).onConflictDoUpdate({
          target: listings.id,
          set: {
            ownerId: l.owner_id,
            ownerName: l.owner_name || null,
            title: l.title,
            description: l.description,
            listingType: l.listing_type,
            pricePerMonth: l.price_per_month,
            deposit: l.deposit,
            address: l.address,
            latitude: l.latitude,
            longitude: l.longitude,
            availableFrom: l.available_from,
            isActive: l.is_active,
            createdAt: l.created_at,
            genderPreference: l.gender_preference,
            houseRestrictions: l.house_restrictions,
            roomSize: l.room_size || null,
            utilitySplit: l.utility_split || null,
            currentFlatmateCount: l.current_flatmate_count || null,
            apartmentType: l.apartment_type || null,
            pincode: l.pincode || null,
            state: l.state || null,
            city: l.city || null,
            amenities: l.amenities,
            imageUrls: l.image_urls,
            isVerified: l.is_verified || false,
            verificationStatus: l.verification_status || null,
            verificationDetails: l.verification_details || null,
          }
        });
      }
    }
    if (lastSyncedDb) {
      for (const lid of Object.keys(lastSyncedDb.listings)) {
        if (!dbData.listings[lid]) {
          await db.delete(listings).where(eq(listings.id, lid));
        }
      }
    }

    // 4. Messages Diff
    const lastCount = lastSyncedDb ? lastSyncedDb.messages.length : 0;
    if (dbData.messages.length > lastCount) {
      for (let i = lastCount; i < dbData.messages.length; i++) {
        const m = dbData.messages[i];
        await db.insert(messages).values({
          id: m.id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          messageText: m.message_text,
          sentAt: m.sent_at,
        }).onConflictDoUpdate({
          target: messages.id,
          set: {
            senderId: m.sender_id,
            receiverId: m.receiver_id,
            messageText: m.message_text,
            sentAt: m.sent_at,
          }
        });
      }
    } else if (lastSyncedDb && dbData.messages.length < lastCount) {
      await db.delete(messages);
      for (const m of dbData.messages) {
        await db.insert(messages).values({
          id: m.id,
          senderId: m.sender_id,
          receiverId: m.receiver_id,
          messageText: m.message_text,
          sentAt: m.sent_at,
        });
      }
    }

    // 5. Schedules Diff
    const currentSchedules = dbData.schedules || {};
    const lastSchedules = lastSyncedDb?.schedules || {};
    for (const [sid, s] of Object.entries(currentSchedules)) {
      if (!lastSyncedDb || JSON.stringify(lastSchedules[sid]) !== JSON.stringify(s)) {
        await db.insert(schedules).values({
          id: s.id,
          listingId: s.listing_id,
          listingTitle: s.listing_title,
          listingAddress: s.listing_address,
          hostId: s.host_id,
          hostName: s.host_name,
          seekerId: s.seeker_id,
          seekerName: s.seeker_name,
          proposedTime: s.proposed_time,
          status: s.status,
          notes: s.notes || null,
          createdAt: s.created_at,
        }).onConflictDoUpdate({
          target: schedules.id,
          set: {
            listingId: s.listing_id,
            listingTitle: s.listing_title,
            listingAddress: s.listing_address,
            hostId: s.host_id,
            hostName: s.host_name,
            seekerId: s.seeker_id,
            seekerName: s.seeker_name,
            proposedTime: s.proposed_time,
            status: s.status,
            notes: s.notes || null,
            createdAt: s.created_at,
          }
        });
      }
    }
    for (const sid of Object.keys(lastSchedules)) {
      if (!currentSchedules[sid]) {
        await db.delete(schedules).where(eq(schedules.id, sid));
      }
    }

    console.log("Successfully synced in-memory database to Postgres Cloud SQL.");
  } catch (error) {
    console.error("Failed to sync database changes to Postgres:", error);
  } finally {
    isSyncingPg = false;
    if (pendingSyncPg) {
      setImmediate(() => syncToPostgres());
    }
  }
}

// Memory caches for Firestore syncing
async function loadDatabaseFromFirestore(): Promise<DatabaseSchema | null> {
  if (!firestore) return null;
  try {
    console.log("Loading FlatMatch database documents from Firestore...");
    const db: DatabaseSchema = {
      users: {},
      profiles: {},
      listings: {},
      messages: [],
      schedules: {}
    };

    // Load users
    const usersSnap = await firestore.collection("users").get();
    usersSnap.forEach(doc => {
      db.users[doc.id] = doc.data() as User;
    });

    // Load profiles
    const profilesSnap = await firestore.collection("profiles").get();
    profilesSnap.forEach(doc => {
      db.profiles[doc.id] = doc.data() as UserProfile;
    });

    // Load listings
    const listingsSnap = await firestore.collection("listings").get();
    listingsSnap.forEach(doc => {
      db.listings[doc.id] = doc.data() as Listing;
    });

    // Load messages (sort by timestamp / sent_at)
    const messagesSnap = await firestore.collection("messages").get();
    const fetchedMessages: Message[] = [];
    messagesSnap.forEach(doc => {
      fetchedMessages.push(doc.data() as Message);
    });
    // Sort in-memory to preserve chronological order
    fetchedMessages.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());
    db.messages = fetchedMessages;

    // Load schedules
    const schedulesSnap = await firestore.collection("schedules").get();
    schedulesSnap.forEach(doc => {
      if (!db.schedules) db.schedules = {};
      db.schedules[doc.id] = doc.data() as ViewingSchedule;
    });

    const totalUsers = Object.keys(db.users).length;
    if (totalUsers === 0) {
      console.log("Firestore collections are empty. Seeding DEFAULT_DATABASE...");
      await seedDatabaseToFirestore(DEFAULT_DATABASE);
      return DEFAULT_DATABASE;
    }

    console.log(`Successfully loaded from Firestore: ${totalUsers} users, ${Object.keys(db.profiles).length} profiles, ${Object.keys(db.listings).length} listings, ${db.messages.length} messages, ${Object.keys(db.schedules || {}).length} schedules.`);
    return db;
  } catch (e) {
    console.error("Error loading database from Firestore, fallback to local cache:", e);
    return null;
  }
}

async function seedDatabaseToFirestore(db: DatabaseSchema) {
  if (!firestore) return;
  try {
    console.log("Seeding DEFAULT_DATABASE collections in Firestore...");
    
    // Process collections in parallel or small batches to safely provision initial database
    // Users
    for (const [uid, user] of Object.entries(db.users)) {
      await firestore.collection("users").doc(uid).set(user);
    }
    // Profiles
    for (const [pid, profile] of Object.entries(db.profiles)) {
      await firestore.collection("profiles").doc(pid).set(profile);
    }
    // Listings
    for (const [lid, listing] of Object.entries(db.listings)) {
      await firestore.collection("listings").doc(lid).set(listing);
    }
    // Messages
    for (let i = 0; i < db.messages.length; i++) {
      const msg = db.messages[i];
      const docId = msg.id || `msg_${Date.now()}_${i}`;
      await firestore.collection("messages").doc(docId).set(msg);
    }
    // Schedules
    if (db.schedules) {
      for (const [sid, schedule] of Object.entries(db.schedules)) {
        await firestore.collection("schedules").doc(sid).set(schedule);
      }
    }
    console.log("Firestore seeding finished successfully!");
  } catch (e) {
    console.error("Error seeding to Firestore collections:", e);
  }
}

async function syncToFirestore(): Promise<void> {
  if (!firestore || isSyncing) {
    if (isSyncing) pendingSync = true;
    return;
  }

  isSyncing = true;
  pendingSync = false;

  try {
    const db = currentInMemoryDb;
    if (!db) {
      isSyncing = false;
      return;
    }

    const batch = firestore.batch();
    let operationCount = 0;

    // Helper to safely commit if batch is reaching Firestore limits (500 operations max)
    const checkCommit = async () => {
      if (operationCount >= 450) {
        await batch.commit();
        operationCount = 0;
        console.log("Committed partial sync batch to Firestore.");
      }
    };

    // 1. Users Diff
    for (const [uid, user] of Object.entries(db.users)) {
      if (!lastSyncedDb || JSON.stringify(lastSyncedDb.users[uid]) !== JSON.stringify(user)) {
        const ref = firestore.collection("users").doc(uid);
        batch.set(ref, user);
        operationCount++;
        await checkCommit();
      }
    }
    if (lastSyncedDb) {
      for (const uid of Object.keys(lastSyncedDb.users)) {
        if (!db.users[uid]) {
          const ref = firestore.collection("users").doc(uid);
          batch.delete(ref);
          operationCount++;
          await checkCommit();
        }
      }
    }

    // 2. Profiles Diff
    for (const [pid, profile] of Object.entries(db.profiles)) {
      if (!lastSyncedDb || JSON.stringify(lastSyncedDb.profiles[pid]) !== JSON.stringify(profile)) {
        const ref = firestore.collection("profiles").doc(pid);
        batch.set(ref, profile);
        operationCount++;
        await checkCommit();
      }
    }
    if (lastSyncedDb) {
      for (const pid of Object.keys(lastSyncedDb.profiles)) {
        if (!db.profiles[pid]) {
          const ref = firestore.collection("profiles").doc(pid);
          batch.delete(ref);
          operationCount++;
          await checkCommit();
        }
      }
    }

    // 3. Listings Diff
    for (const [lid, listing] of Object.entries(db.listings)) {
      if (!lastSyncedDb || JSON.stringify(lastSyncedDb.listings[lid]) !== JSON.stringify(listing)) {
        const ref = firestore.collection("listings").doc(lid);
        batch.set(ref, listing);
        operationCount++;
        await checkCommit();
      }
    }
    if (lastSyncedDb) {
      for (const lid of Object.keys(lastSyncedDb.listings)) {
        if (!db.listings[lid]) {
          const ref = firestore.collection("listings").doc(lid);
          batch.delete(ref);
          operationCount++;
          await checkCommit();
        }
      }
    }

    // 4. Messages Diff (Usually Append-Only)
    const lastCount = lastSyncedDb ? lastSyncedDb.messages.length : 0;
    if (db.messages.length > lastCount) {
      for (let i = lastCount; i < db.messages.length; i++) {
        const msg = db.messages[i];
        const docId = msg.id || `msg_${Date.now()}_${i}`;
        const ref = firestore.collection("messages").doc(docId);
        batch.set(ref, msg);
        operationCount++;
        await checkCommit();
      }
    } else if (lastSyncedDb && db.messages.length < lastCount) {
      // Re-write if messages got cleared or deleted
      const msgSnap = await firestore.collection("messages").get();
      for (const doc of msgSnap.docs) {
        await firestore.collection("messages").doc(doc.id).delete();
      }
      for (let i = 0; i < db.messages.length; i++) {
        const msg = db.messages[i];
        const docId = msg.id || `msg_${Date.now()}_${i}`;
        await firestore.collection("messages").doc(docId).set(msg);
      }
    }

    // 5. Schedules Diff
    const currentSchedules = db.schedules || {};
    const lastSchedules = lastSyncedDb?.schedules || {};
    for (const [sid, schedule] of Object.entries(currentSchedules)) {
      if (!lastSyncedDb || JSON.stringify(lastSchedules[sid]) !== JSON.stringify(schedule)) {
        const ref = firestore.collection("schedules").doc(sid);
        batch.set(ref, schedule);
        operationCount++;
        await checkCommit();
      }
    }
    for (const sid of Object.keys(lastSchedules)) {
      if (!currentSchedules[sid]) {
        const ref = firestore.collection("schedules").doc(sid);
        batch.delete(ref);
        operationCount++;
        await checkCommit();
      }
    }

    if (operationCount > 0) {
      await batch.commit();
      console.log(`Successfully synced ${operationCount} modifications to Firestore.`);
    }

    // Capture snapshot copy of synced db
    lastSyncedDb = JSON.parse(JSON.stringify(db));
  } catch (e) {
    console.error("Failed to sync database changes to Firestore:", e);
  } finally {
    isSyncing = false;
    if (pendingSync) {
      // Defer next sync pass to prevent hogging the event loop
      setImmediate(() => syncToFirestore());
    }
  }
}

function readDatabase(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, "utf-8");
      const db = JSON.parse(data);
      let altered = false;

      if (!db.users) db.users = {};
      if (!db.profiles) db.profiles = {};
      if (!db.listings) db.listings = {};

      // Auto-migrate new seekers, tenants and big apartment owners
      for (const [uid, user] of Object.entries(DEFAULT_DATABASE.users)) {
        if (!db.users[uid]) {
          db.users[uid] = user;
          altered = true;
        }
      }

      for (const [pid, profile] of Object.entries(DEFAULT_DATABASE.profiles)) {
        if (!db.profiles[pid]) {
          db.profiles[pid] = profile;
          altered = true;
        }
      }

      for (const [lid, listing] of Object.entries(DEFAULT_DATABASE.listings)) {
        if (!db.listings[lid]) {
          db.listings[lid] = listing;
          altered = true;
        }
      }

      if (altered) {
        writeDatabase(db);
      }
      return db;
    }
  } catch (err) {
    console.error("Error reading database file, loading default", err);
  }
  
  // Write default db if not found
  writeDatabase(DEFAULT_DATABASE);
  return DEFAULT_DATABASE;
}

function writeDatabase(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
    currentInMemoryDb = db;
    syncToFirestore();
    syncToPostgres();
  } catch (err) {
    console.error("Failed to persist database file to disk", err);
  }
}

// Haversine Distance Formula in Km
function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Planet Radius
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Compute compatibility score between seeker and tenant profiles
function computeProfileCompatibility(seekerProfile: UserProfile, tenantProfile: UserProfile): { score: number; match: string[]; mismatch: string[] } {
  let score = 70; // Base baseline score
  const match: string[] = [];
  const mismatch: string[] = [];

  // Budget validation: Does tenant price fit inside seeker budget?
  // (We match tenant budget limits as a general proxy)
  const seekerMax = seekerProfile.budget_max;
  const seekerMin = seekerProfile.budget_min;
  const tenantMax = tenantProfile.budget_max;
  const tenantMin = tenantProfile.budget_min;

  if (seekerMax >= tenantMin && seekerMin <= tenantMax) {
    score += 8;
    match.push("Budgets align seamlessly");
  } else {
    score -= 10;
    mismatch.push("Slight budget tier mismatch");
  }

  // Smoking habits match
  if (seekerProfile.smoker === tenantProfile.smoker) {
    score += 10;
    match.push(seekerProfile.smoker ? "Accept mutual smoking preferences" : "Shared smoke-free household values");
  } else {
    score -= 15;
    mismatch.push("Opposite smoking policies");
  }

  // Pets compatibility
  if (seekerProfile.pets_allowed && tenantProfile.pets_allowed) {
    score += 8;
    match.push("Both are animal-friendly");
  } else if (!seekerProfile.pets_allowed && !tenantProfile.pets_allowed) {
    score += 5;
    match.push("Shared quiet pet-free environment");
  } else {
    score -= 5;
    mismatch.push("Differing pet preferences");
  }

  // Cleanliness level
  const cleanDiff = Math.abs(seekerProfile.cleanliness_level - tenantProfile.cleanliness_level);
  if (cleanDiff === 0) {
    score += 10;
    match.push(`Identical cleanliness high-standards (Level ${seekerProfile.cleanliness_level}/5)`);
  } else if (cleanDiff <= 1) {
    score += 5;
    match.push("Compatible living and tidiness habits");
  } else {
    score -= 10;
    mismatch.push(`Cleanliness expectation gap (Level ${seekerProfile.cleanliness_level} vs ${tenantProfile.cleanliness_level})`);
  }

  // Improved WFH Status Matching Matrix
  if (seekerProfile.wfh_status === "wfh" && tenantProfile.wfh_status === "wfh") {
    score += 8;
    match.push("Shared 24/7 home productivity flow (Both Work-From-Home)");
  } else if (seekerProfile.wfh_status === "office" && tenantProfile.wfh_status === "office") {
    score += 8;
    match.push("Mutual quiet daytime empty-home routine (Both Office-based)");
  } else if (
    (seekerProfile.wfh_status === "wfh" && tenantProfile.wfh_status === "office") ||
    (seekerProfile.wfh_status === "office" && tenantProfile.wfh_status === "wfh")
  ) {
    score += 12;
    match.push("Alternating space usage: complementary morning/afternoon quiet slots (One WFH vs One Office)");
  } else {
    score += 6;
    match.push("Flexible weekday space routines (Blended Hybrid space usage)");
  }

  // Improved Sleeping / Biological Schedules Matching Matrix
  if (seekerProfile.sleeping_pattern === tenantProfile.sleeping_pattern) {
    if (seekerProfile.sleeping_pattern === "early_bird") {
      score += 12;
      match.push("Shared early morning rest cycles & quiet evenings");
    } else if (seekerProfile.sleeping_pattern === "night_owl") {
      score += 12;
      match.push("Shared compatible late-night schedules & productivity");
    } else {
      score += 8;
      match.push("Both follow flexible rest & waking routines");
    }
  } else if (
    (seekerProfile.sleeping_pattern === "early_bird" && tenantProfile.sleeping_pattern === "night_owl") ||
    (seekerProfile.sleeping_pattern === "night_owl" && tenantProfile.sleeping_pattern === "early_bird")
  ) {
    score -= 18;
    mismatch.push("Stark schedule gap: early bird mornings vs. active late night cycles");
  } else {
    score += 5;
    match.push("Blended sleep style: one flexible schedule limits routine friction");
  }

  // Preferred Social Activity levels (Using Drinking preference as an informative proxy indicator)
  if (seekerProfile.drinking === tenantProfile.drinking) {
    if (seekerProfile.drinking === "never") {
      score += 12;
      match.push("Mutual dry/sober home atmosphere (Quiet & relaxing environment)");
    } else if (seekerProfile.drinking === "socially") {
      score += 10;
      match.push("Aligned leisure style: mutually supportive of occasional hosting and guest stays");
    } else {
      score += 8;
      match.push("Shared energetic weekend style: outgoing hosting and entertainment habits");
    }
  } else if (
    (seekerProfile.drinking === "never" && tenantProfile.drinking === "regularly") ||
    (seekerProfile.drinking === "regularly" && tenantProfile.drinking === "never")
  ) {
    score -= 15;
    mismatch.push("Contrast in weekend styles: quiet sober sanctuary vs. high social hosting habits");
  } else {
    score += 4;
    match.push("Balanced social lifestyle blend: occasional guests but low friction");
  }

  // Bound score
  score = Math.max(10, Math.min(99, score));

  return { score, match, mismatch };
}

// Lazy Initialize Gemini SDK
let googleAi: GoogleGenAI | null = null;
function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!googleAi) {
    googleAi = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return googleAi;
}

const JWT_SECRET = process.env.JWT_SECRET || "flatmatch-super-secret-key-prod-2026";

export function generateToken(payload: { userId: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const data = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 7 * 24 * 3600 })).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${data}`).digest("base64url");
  return `${header}.${data}.${signature}`;
}

export function verifyToken(token: string): { userId: string } | null {
  try {
    const [header, data, signature] = token.split(".");
    if (!header || !data || !signature) return null;
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${data}`).digest("base64url");
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(data, "base64url").toString());
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;
    return payload;
  } catch (e) {
    return null;
  }
}

export function authenticateToken(req: any, res: any, next: any) {
  let token = "";
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const matched = cookieHeader.split("; ").find((row: string) => row.startsWith("flatmatch_token="));
    if (matched) {
      token = matched.split("=")[1];
    }
  }
  if (!token && req.headers.authorization) {
    const authHeader = req.headers.authorization;
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    }
  }
  if (!token) {
    return res.status(401).json({ error: "Access denied. Authentication token is missing." });
  }
  const parsed = verifyToken(token);
  if (!parsed || !parsed.userId) {
    return res.status(403).json({ error: "Access denied. Invalid or expired token signature." });
  }
  req.user = { id: parsed.userId };
  next();
}

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: any, res: any, next: any) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Access denied. User session unauthenticated." });
    }
    const db = readDatabase();
    const user = db.users[req.user.id];
    if (!user) {
      return res.status(404).json({ error: "Access denied. Associated user record not found in the flat indexing store." });
    }
    if (!allowedRoles.includes(user.user_type)) {
      return res.status(403).json({ 
        error: `Forbidden. Role-based privilege level violation. Your current user category (${user.user_type}) does not enjoy authorized credentials for accessing this view.` 
      });
    }
    next();
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "10mb" }));

  // Initialize DB from Postgres first, then Firestore as fallback on startup
  let dbLoaded = false;
  try {
    const dbFromPostgres = await Promise.race([
      loadDatabaseFromPostgres(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
    ]);
    if (dbFromPostgres) {
      // Hydrate local cache file for any downstream synchronous components
      fs.writeFileSync(DB_FILE, JSON.stringify(dbFromPostgres, null, 2), "utf-8");
      lastSyncedDb = JSON.parse(JSON.stringify(dbFromPostgres));
      currentInMemoryDb = JSON.parse(JSON.stringify(dbFromPostgres));
      console.log("Pre-loaded inside startServer with Postgres database state successfully!");
      dbLoaded = true;
    }
  } catch (e) {
    console.error("Failed to load records from Postgres during app startup:", e);
  }

  if (!dbLoaded && firestore) {
    try {
      const dbFromFirestore = await Promise.race([
        loadDatabaseFromFirestore(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 3000))
      ]);
      if (dbFromFirestore) {
        // Hydrate local cache file for any downstream synchronous components
        fs.writeFileSync(DB_FILE, JSON.stringify(dbFromFirestore, null, 2), "utf-8");
        lastSyncedDb = JSON.parse(JSON.stringify(dbFromFirestore));
        currentInMemoryDb = JSON.parse(JSON.stringify(dbFromFirestore));
        console.log("Pre-loaded inside startServer with Firestore database state successfully!");
        dbLoaded = true;
      }
    } catch (e) {
      console.error("Failed to load and warm cached records from Firestore during app startup:", e);
    }
  }

  // Initialize DB immediately
  readDatabase();

  // AUTH API endpoints
  app.post("/api/v1/auth/register", (req, res) => {
    const { email, password, full_name, user_type, phone_number } = req.body;
    
    if (!email || !full_name || !user_type) {
      return res.status(400).json({ error: "Missing required registration parameters." });
    }

    if (!phone_number) {
      return res.status(400).json({ error: "Mobile number with +91 country code is mandatory." });
    }

    const cleanPhone = String(phone_number).replace(/[\s-()]/g, '');
    if (!cleanPhone.startsWith('+91')) {
      return res.status(400).json({ error: "Mobile number must start with +91 country code for the Indian market." });
    }
    const mobileWithoutCode = cleanPhone.substring(3);
    if (!/^[6-9]\d{9}$/.test(mobileWithoutCode)) {
      return res.status(400).json({ error: "Please provide a valid 10-digit Indian mobile number following the +91 country code." });
    }

    const db = readDatabase();
    
    // Check if user exists
    const exists = Object.values(db.users).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return res.status(409).json({ error: "Email address is already registered." });
    }

    const userId = "user-" + Math.random().toString(36).substring(2, 11);
    
    const newUser: User = {
      id: userId,
      email,
      password: password || "password123",
      full_name,
      user_type,
      phone_number: cleanPhone,
      is_verified: user_type === "owner", // Owners can simulate quick KYC verification
      tier: user_type === "seeker" ? "premium_seeker" : user_type === "owner" ? "owner_pro" : "free", // auto-give premium for fun demo testing!
      created_at: new Date().toISOString()
    };

    // Create a scaffold empty profile
    const newProfile: UserProfile = {
      user_id: userId,
      bio: `Hello! I am ${full_name}. I just joined FlatMatch as a ${user_type}. Looking forward to connecting!`,
      age: 25,
      gender: "Not Specified",
      profession: user_type === "owner" ? "Property Manager" : "Professional",
      smoker: false,
      pets_allowed: true,
      cleanliness_level: 4,
      budget_min: 5000,
      budget_max: 20000,
      drinking: "socially",
      sleeping_pattern: "flexible",
      wfh_status: "hybrid"
    };

    db.users[userId] = newUser;
    db.profiles[userId] = newProfile;
    writeDatabase(db);

    const token = generateToken({ userId: newUser.id });
    res.setHeader("Set-Cookie", `flatmatch_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`);
    res.status(201).json({ user: newUser, profile: newProfile, token });
  });

  app.post("/api/v1/auth/login", (req, res) => {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    const db = readDatabase();
    const user = Object.values(db.users).find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(404).json({ error: "User with this email not found." });
    }

    const expectedPassword = user.password || "password123";
    const providedPassword = password || "password123";

    if (providedPassword !== expectedPassword) {
      return res.status(401).json({ error: "Invalid password. Access denied." });
    }

    const profile = db.profiles[user.id] || {
      user_id: user.id,
      bio: "No Profile Details Yet.",
      age: 25,
      gender: "Not Specified",
      profession: "Professional",
      smoker: false,
      pets_allowed: false,
      cleanliness_level: 3,
      budget_min: 800,
      budget_max: 1500,
      drinking: "socially",
      sleeping_pattern: "flexible",
      wfh_status: "hybrid"
    };

    const token = generateToken({ userId: user.id });
    res.setHeader("Set-Cookie", `flatmatch_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`);
    res.json({ user, profile, token });
  });

  // Switch simulation users easily on frontend list - still accessible for simulation UI
  app.get("/api/v1/auth/users", (req, res) => {
    const db = readDatabase();
    res.json(Object.values(db.users));
  });

  // Upgrade Plan - secured using token
  app.post("/api/v1/auth/upgrade", authenticateToken, (req, res) => {
    const { tier } = req.body;
    const userId = req.user.id;
    const db = readDatabase();
    if (!db.users[userId]) {
      return res.status(404).json({ error: "User not found." });
    }
    db.users[userId].tier = tier;
    writeDatabase(db);
    res.json({ status: "success", user: db.users[userId] });
  });

  // Parameterless profile and me endpoints (Production Grade Security Standards)
  app.get(["/api/v1/me", "/api/v1/profile"], authenticateToken, (req, res) => {
    const db = readDatabase();
    const userId = req.user.id;
    const user = db.users[userId];
    const profile = db.profiles[userId];
    
    if (!user) {
      return res.status(404).json({ error: "Authenticated user not found." });
    }
    res.json({ profile, user });
  });

  // User-initiated Self KYC Verification
  app.post("/api/v1/auth/verify-kyc", authenticateToken, (req, res) => {
    const { document_type, license_number } = req.body;
    if (!document_type || !license_number) {
      return res.status(400).json({ error: "Document type and Aadhaar/PAN sequence numbers are required." });
    }

    const cleanNum = String(license_number).replace(/[\s-]/g, '');

    if (document_type === 'Aadhaar') {
      if (!/^\d{12}$/.test(cleanNum)) {
        return res.status(400).json({ error: "Invalid Aadhaar format. Aadhaar must be a 12-digit numerical sequence (e.g., 901234567890)." });
      }
    } else if (document_type === 'PAN') {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(cleanNum)) {
        return res.status(400).json({ error: "Invalid PAN format. PAN must be a 10-character alphanumeric string (e.g., ABCDE1234F)." });
      }
    } else {
      return res.status(400).json({ error: "For Indian regulatory compliance, the verification document must be either 'Aadhaar' or 'PAN'." });
    }

    const db = readDatabase();
    const user = db.users[req.user.id];
    if (!user) {
      return res.status(404).json({ error: "User record not found." });
    }

    user.is_verified = true;
    writeDatabase(db);
    res.json({ status: "success", user });
  });

  app.put(["/api/v1/me", "/api/v1/profile"], authenticateToken, (req, res) => {
    const { bio, age, gender, profession, smoker, pets_allowed, cleanliness_level, budget_min, budget_max, drinking, sleeping_pattern, wfh_status, full_name, phone_number } = req.body;
    const db = readDatabase();
    const userId = req.user.id;

    if (!db.users[userId]) {
      return res.status(404).json({ error: "User not found" });
    }

    if (full_name) {
      db.users[userId].full_name = full_name;
    }
    if (phone_number !== undefined) {
      db.users[userId].phone_number = phone_number;
    }

    const currentProfile = db.profiles[userId] || {
      user_id: userId,
      bio: "",
      age: 25,
      gender: "Not Specified",
      profession: "",
      smoker: false,
      pets_allowed: true,
      cleanliness_level: 3,
      budget_min: 5000,
      budget_max: 20000,
      drinking: "socially" as const,
      sleeping_pattern: "flexible" as const,
      wfh_status: "hybrid" as const
    };

    const updatedProfile: UserProfile = {
      ...currentProfile,
      bio: bio ?? currentProfile.bio ?? "",
      age: Number(age ?? currentProfile.age ?? 25),
      gender: gender ?? currentProfile.gender ?? "Not Specified",
      profession: profession ?? currentProfile.profession ?? "",
      smoker: smoker !== undefined ? Boolean(smoker) : Boolean(currentProfile.smoker),
      pets_allowed: pets_allowed !== undefined ? Boolean(pets_allowed) : Boolean(currentProfile.pets_allowed),
      cleanliness_level: Number(cleanliness_level ?? currentProfile.cleanliness_level ?? 3),
      budget_min: Number(budget_min ?? currentProfile.budget_min ?? 500),
      budget_max: Number(budget_max ?? currentProfile.budget_max ?? 2000),
      drinking: drinking ?? currentProfile.drinking ?? "socially",
      sleeping_pattern: sleeping_pattern ?? currentProfile.sleeping_pattern ?? "flexible",
      wfh_status: wfh_status ?? currentProfile.wfh_status ?? "hybrid",
    };

    db.profiles[userId] = updatedProfile;
    writeDatabase(db);
    res.json({ profile: updatedProfile, user: db.users[userId] });
  });

  // PROFILES API endpoints with Token-Based authentication
  app.get("/api/v1/profiles/:id", authenticateToken, (req, res) => {
    const db = readDatabase();
    const profile = db.profiles[req.params.id];
    const user = db.users[req.params.id];
    
    if (!profile) {
      return res.status(404).json({ error: "Profile not found." });
    }
    res.json({ profile, user });
  });

  app.put("/api/v1/profiles/:id", authenticateToken, (req, res) => {
    // Strict Resource Ownership Check
    if (req.params.id !== req.user.id) {
      return res.status(403).json({ error: "Access Forbidden. You are not allowed to update other users' profile details." });
    }

    const { bio, age, gender, profession, smoker, pets_allowed, cleanliness_level, budget_min, budget_max, drinking, sleeping_pattern, wfh_status, full_name, phone_number } = req.body;
    const db = readDatabase();
    
    if (!db.users[req.params.id]) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update full name and phone number on users too if updated
    if (full_name) {
      db.users[req.params.id].full_name = full_name;
    }
    if (phone_number !== undefined) {
      db.users[req.params.id].phone_number = phone_number;
    }

    const currentProfile = db.profiles[req.params.id] || {
      user_id: req.params.id,
      bio: "",
      age: 25,
      gender: "Not Specified",
      profession: "",
      smoker: false,
      pets_allowed: true,
      cleanliness_level: 3,
      budget_min: 5000,
      budget_max: 20000,
      drinking: "socially" as const,
      sleeping_pattern: "flexible" as const,
      wfh_status: "hybrid" as const
    };

    const updatedProfile: UserProfile = {
      ...currentProfile,
      bio: bio ?? currentProfile.bio ?? "",
      age: Number(age ?? currentProfile.age ?? 25),
      gender: gender ?? currentProfile.gender ?? "Not Specified",
      profession: profession ?? currentProfile.profession ?? "",
      smoker: smoker !== undefined ? Boolean(smoker) : Boolean(currentProfile.smoker),
      pets_allowed: pets_allowed !== undefined ? Boolean(pets_allowed) : Boolean(currentProfile.pets_allowed),
      cleanliness_level: Number(cleanliness_level ?? currentProfile.cleanliness_level ?? 3),
      budget_min: Number(budget_min ?? currentProfile.budget_min ?? 500),
      budget_max: Number(budget_max ?? currentProfile.budget_max ?? 2000),
      drinking: drinking ?? currentProfile.drinking ?? "socially",
      sleeping_pattern: sleeping_pattern ?? currentProfile.sleeping_pattern ?? "flexible",
      wfh_status: wfh_status ?? currentProfile.wfh_status ?? "hybrid",
    };

    db.profiles[req.params.id] = updatedProfile;
    writeDatabase(db);
    res.json({ profile: updatedProfile, user: db.users[req.params.id] });
  });

  // LISTINGS API endpoints
  app.post("/api/v1/listings", authenticateToken, authorizeRoles("owner", "tenant"), (req, res) => {
    const owner_id = req.user.id;
    const {
      title,
      description,
      listing_type,
      price_per_month,
      deposit,
      address,
      pincode,
      state,
      city,
      latitude,
      longitude,
      available_from,
      room_size,
      utility_split,
      current_flatmate_count,
      apartment_type,
      amenities,
      image_urls,
      gender_preference,
      house_restrictions
    } = req.body;

    if (!title || !listing_type || !price_per_month || !address || !gender_preference || !house_restrictions) {
      return res.status(400).json({ error: "Missing required listing elements. Gender preference and house restrictions are mandatory." });
    }

    if (!pincode || !state || !city) {
      return res.status(400).json({ error: "Indian residential listing compliance requires mandatory City, State, and 6-digit Pincode." });
    }

    const pincodeClean = String(pincode).trim();
    if (!/^[1-9][0-9]{5}$/.test(pincodeClean)) {
      return res.status(400).json({ error: "Invalid PIN Code structure. Must be a 6-digit numerical code (e.g., 560038) not starting with 0." });
    }

    const restrictionsClean = Array.isArray(house_restrictions)
      ? house_restrictions.filter(r => r && String(r).trim() !== '')
      : (typeof house_restrictions === 'string' ? String(house_restrictions).split(',').map(r => r.trim()).filter(Boolean) : []);

    if (restrictionsClean.length === 0) {
      return res.status(400).json({ error: "At least one house restriction is mandatory." });
    }

    if (!["Girls only", "Boys only", "No preference"].includes(gender_preference)) {
      return res.status(400).json({ error: "Invalid gender preference. Choose 'Girls only', 'Boys only', or 'No preference'." });
    }

    const db = readDatabase();
    const listId = "list-" + Math.random().toString(36).substring(2, 11);

    const defaultImages = [
      listing_type === "shared_stay"
        ? "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800"
        : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800"
    ];

    const newListing: Listing = {
      id: listId,
      owner_id,
      title,
      description: description || "Gorgeous stay flat listing available in FlatMatch.",
      listing_type,
      price_per_month: Number(price_per_month),
      deposit: Number(deposit || price_per_month),
      address,
      pincode: pincodeClean,
      state,
      city,
      latitude: Number(latitude || 12.9716 + (Math.random() - 0.5) * 0.1), // Bangalore default
      longitude: Number(longitude || 77.5946 + (Math.random() - 0.5) * 0.1),
      available_from: available_from || new Date().toISOString().split("T")[0],
      is_active: true,
      created_at: new Date().toISOString(),
      room_size,
      utility_split,
      current_flatmate_count: current_flatmate_count ? Number(current_flatmate_count) : undefined,
      apartment_type,
      gender_preference,
      house_restrictions: restrictionsClean,
      amenities: Array.isArray(amenities) ? amenities : ["Gym", "Security", "High-speed Internet"],
      image_urls: Array.isArray(image_urls) && image_urls.length > 0 ? image_urls : defaultImages
    };

    db.listings[listId] = newListing;
    writeDatabase(db);
    res.status(201).json(newListing);
  });

  // Query and Search with geo spatial or matching parameters
  app.get("/api/v1/listings", (req, res) => {
    const { type, max_price, lat, lng, radius, search } = req.query;
    const db = readDatabase();
    let result = Object.values(db.listings).filter((l) => l.is_active);

    // Filter by type
    if (type) {
      result = result.filter((l) => l.listing_type === type);
    }

    // Filter by maximum pricing
    if (max_price) {
      result = result.filter((l) => l.price_per_month <= Number(max_price));
    }

    // Radius searching if lat, lng and radius (in km) are given
    if (lat && lng && radius) {
      const searchLat = Number(lat);
      const searchLng = Number(lng);
      const searchRadius = Number(radius);

      result = result.filter((l) => {
        // Calculate haversine distance
        const distance = getDistanceKm(searchLat, searchLng, l.latitude, l.longitude);
        return distance <= searchRadius;
      });
    }

    // Search query key terms
    if (search) {
      const q = String(search).toLowerCase();
      result = result.filter((l) =>
        l.title.toLowerCase().includes(q) ||
        l.description.toLowerCase().includes(q) ||
        l.address.toLowerCase().includes(q)
      );
    }

    // Include owner name info on returned list
    const enriched = result.map((item) => {
      const owner = db.users[item.owner_id];
      return {
        ...item,
        owner_name: owner ? owner.full_name : "Landlord"
      };
    });

    res.json(enriched);
  });

  app.get("/api/v1/listings/:id", (req, res) => {
    const db = readDatabase();
    const listing = db.listings[req.params.id];
    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }
    const owner = db.users[listing.owner_id];
    res.json({
      ...listing,
      owner_name: owner ? owner.full_name : "Host / Owner",
      owner_email: owner ? owner.email : ""
    });
  });

  app.delete("/api/v1/listings/:id", authenticateToken, (req, res) => {
    const db = readDatabase();
    const listing = db.listings[req.params.id];
    if (!listing) {
      return res.status(404).json({ error: "Listing file not found" });
    }
    // Strict Resource Ownership Check
    if (listing.owner_id !== req.user.id) {
      return res.status(403).json({ error: "Access Forbidden. You do not own this listing." });
    }
    listing.is_active = false; // Soft deactivate
    writeDatabase(db);
    res.json({ status: "success", id: req.params.id });
  });

  // Bulk listings uploader via Owner Pro Dashboard
  app.post("/api/v1/listings/bulk", authenticateToken, authorizeRoles("owner"), (req, res) => {
    const ownerId = req.user.id;
    const { data } = req.body;
    if (!Array.isArray(data)) {
      return res.status(400).json({ error: "Invalid data format or missing listings array." });
    }

    const db = readDatabase();
    const imported: Listing[] = [];

    data.forEach((row: any) => {
      const listId = "list-" + Math.random().toString(36).substring(2, 11);
      
      // Clean attributes
      const amenitiesClean = row.amenities
        ? typeof row.amenities === "string"
          ? row.amenities.split(",").map((a: string) => a.trim())
          : row.amenities
        : ["Gym", "Security", "Central AC"];

      const imagesClean = row.image_urls
        ? typeof row.image_urls === "string"
          ? row.image_urls.split(",").map((i: string) => i.trim())
          : row.image_urls
        : ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=800"];

      // Clean restrictions
      const restrictionsClean = row.house_restrictions
        ? typeof row.house_restrictions === "string"
          ? row.house_restrictions.split(",").map((r: string) => r.trim()).filter(Boolean)
          : row.house_restrictions
        : ["No smoking indoors", "Quiet after 11 PM"];

      const rawAddress = row.address || "100 Feet Road, Indiranagar, Bengaluru, Karnataka 560038";
      let pincodeVal = row.pincode || "";
      let stateVal = row.state || "";
      let cityVal = row.city || "";

      const pinMatch = rawAddress.match(/\b\d{6}\b/);
      if (!pincodeVal && pinMatch) {
        pincodeVal = pinMatch[0];
      }

      if (!stateVal || !cityVal) {
        const parts = rawAddress.split(",").map(p => p.trim());
        const cleanedParts = parts.map(p => p.replace(/\b\d{6}\b/g, "").trim()).filter(Boolean);
        if (cleanedParts.length >= 1) {
          if (!stateVal) {
            stateVal = cleanedParts[cleanedParts.length - 1];
          }
          if (!cityVal && cleanedParts.length >= 2) {
            cityVal = cleanedParts[cleanedParts.length - 2];
          }
        }
      }

      if (!stateVal) stateVal = "Karnataka";
      if (!cityVal) cityVal = "Bengaluru";
      if (!pincodeVal) pincodeVal = "560038";

      const newListing: Listing = {
        id: listId,
        owner_id: ownerId,
        title: row.title || "Bulk Loaded Apartment",
        description: row.description || "Freshly imported bulk unit listing.",
        listing_type: row.listing_type === "shared_stay" ? "shared_stay" : "entire_unit",
        price_per_month: Number(row.price_per_month || row.price || 15000),
        deposit: Number(row.deposit || row.price_per_month || 15000),
        address: rawAddress,
        pincode: pincodeVal,
        state: stateVal,
        city: cityVal,
        latitude: Number(row.latitude || 12.9716 + (Math.random() - 0.5) * 0.15), // Bangalore
        longitude: Number(row.longitude || 77.5946 + (Math.random() - 0.5) * 0.15),
        available_from: row.available_from || new Date().toISOString().split("T")[0],
        is_active: true,
        created_at: new Date().toISOString(),
        room_size: row.room_size,
        utility_split: row.utility_split,
        current_flatmate_count: row.current_flatmate_count ? Number(row.current_flatmate_count) : undefined,
        apartment_type: row.apartment_type || "Studio Flat",
        gender_preference: ["Girls only", "Boys only", "No preference"].includes(row.gender_preference)
          ? row.gender_preference
          : "No preference",
        house_restrictions: restrictionsClean,
        amenities: amenitiesClean,
        image_urls: imagesClean
      };

      db.listings[listId] = newListing;
      imported.push(newListing);
    });

    writeDatabase(db);
    res.status(201).json({ status: "success", count: imported.length, listings: imported });
  });

  // MATCHING ENGINE
  app.get("/api/v1/matches", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const db = readDatabase();
    const targetUser = db.users[userId];
    const targetProfile = db.profiles[userId];

    if (!targetUser || !targetProfile) {
      return res.status(404).json({ error: "User or Profile details are incomplete." });
    }

    // If target is a Roommate Seeker, we match them against Tenants with flat listings
    // If target is a Tenant, we match them with Roommate Seekers
    const result: Array<{
      user: User;
      profile: UserProfile;
      listing?: Listing;
      score: number;
      matchFactors: string[];
      mismatchFactors: string[];
    }> = [];

    // All profiles except self
    const otherProfileIds = Object.keys(db.profiles).filter((pid) => pid !== targetUser.id);

    otherProfileIds.forEach((pid) => {
      const otherUser = db.users[pid];
      const otherProfile = db.profiles[pid];

      if (!otherUser || !otherProfile) return;

      // Filter: Seeker matches with Tenants, and Tenants with Seekers
      const meetsCriteria =
        (targetUser.user_type === "seeker" && otherUser.user_type === "tenant") ||
        (targetUser.user_type === "tenant" && otherUser.user_type === "seeker");

      if (meetsCriteria) {
        // Calculate core numeric metrics
        const { score, match, mismatch } = computeProfileCompatibility(
          targetUser.user_type === "seeker" ? targetProfile : otherProfile,
          targetUser.user_type === "seeker" ? otherProfile : targetProfile
        );

        // Find if tenant has an active shared stay listing
        let tenantListing: Listing | undefined;
        if (otherUser.user_type === "tenant") {
          tenantListing = Object.values(db.listings).find(
            (l) => l.owner_id === otherUser.id && l.listing_type === "shared_stay" && l.is_active
          );
        } else if (targetUser.user_type === "tenant") {
          tenantListing = Object.values(db.listings).find(
            (l) => l.owner_id === targetUser.id && l.listing_type === "shared_stay" && l.is_active
          );
        }

        result.push({
          user: otherUser,
          profile: otherProfile,
          listing: tenantListing,
          score,
          matchFactors: match,
          mismatchFactors: mismatch
        });
      }
    });

    // Sort descending by highest percentage compatibility
    result.sort((a, b) => b.score - a.score);

    res.json(result);
  });

  // CHAT SYSTEM API
  // Get all active general conversation summaries for a user
  app.get("/api/v1/chat/conversations", authenticateToken, (req, res) => {
    const uId = req.user.id;
    const db = readDatabase();

    // Group messages by participants (where user is sender or receiver)
    const chats: Record<string, { lastMessage: Message; unreadCount: number }> = {};

    db.messages.forEach((msg) => {
      const otherId = msg.sender_id === uId ? msg.receiver_id : msg.receiver_id === uId ? msg.sender_id : null;
      if (!otherId) return;

      // Keep latest message
      if (!chats[otherId]) {
        chats[otherId] = { lastMessage: msg, unreadCount: 0 };
      } else {
        const d1 = new Date(msg.sent_at).getTime();
        const d2 = new Date(chats[otherId].lastMessage.sent_at).getTime();
        if (d1 > d2) {
          chats[otherId].lastMessage = msg;
        }
      }
    });

    const activeList = Object.keys(chats).map((otherId) => {
      const otherUser = db.users[otherId];
      return {
        id: otherId,
        participant: otherUser || { id: otherId, email: "unknown@example.com", full_name: "Deleted User", user_type: "seeker", is_verified: false, tier: "free", created_at: "" },
        lastMessage: chats[otherId].lastMessage,
        unreadCount: 0
      };
    });

    // Sort conversations by latest message timestamp
    activeList.sort((a, b) => {
      const t1 = new Date(a.lastMessage.sent_at).getTime();
      const t2 = new Date(b.lastMessage.sent_at).getTime();
      return t2 - t1;
    });

    res.json(activeList);
  });

  // Retrieve message logs for specific dialogue partners
  app.get("/api/v1/chat/conversations/:id/messages", authenticateToken, (req, res) => {
    const uId = req.user.id;
    const partnerId = req.params.id;
    const db = readDatabase();

    const thread = db.messages.filter(
      (m) =>
        (m.sender_id === uId && m.receiver_id === partnerId) ||
        (m.sender_id === partnerId && m.receiver_id === uId)
    );

    // Sort chronologically
    thread.sort((a, b) => new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime());

    res.json(thread);
  });

  // Send a chat response with automated platonic moderation guardrails
  app.post("/api/v1/chat/messages", authenticateToken, (req, res) => {
    const sender_id = req.user.id;
    const { receiver_id, message_text, media_url, file, attachment, media, asset_id } = req.body;

    // Strict messaging endpoint restriction: Reject payloads accepting files or media URLs with 400 Bad Request
    const contentType = req.headers["content-type"] || "";
    if (media_url || file || attachment || media || asset_id || contentType.includes("multipart/form-data")) {
      return res.status(400).json({
        error: "Media attachments, files, spatial assets and picture links are strictly forbidden in direct messages. Product Directive: In-app chat on FlatMatch is strictly text-only. This policy ensures high user protection, minimizes off-platform visual spam risks, and maintains platonic safety. All property and room-specific media must exclusively be viewed on verified, official listing pages."
      });
    }

    if (!receiver_id || !message_text) {
      return res.status(400).json({ error: "Receiver and message body are mandatory." });
    }

    // Automated Moderation Check for dating-focused vocabulary
    const textLower = message_text.toLowerCase();
    const datingKeywords = [
      "date", "girlfriend", "boyfriend", "sexy", "handsome", "marry me", "wanna hookup",
      "hook up", "dating", "romantic", "be my partner", "sensual", "baby, you're", "can i court", 
      "you are cute", "hot girl", "hot guy", "flirt", "sweetheart"
    ];
    let moderatedText = message_text;
    let isFlagged = false;
    for (const kw of datingKeywords) {
      if (textLower.includes(kw)) {
        isFlagged = true;
        break;
      }
    }

    if (isFlagged) {
      moderatedText = moderatedText + "\n\n⚠️ [AUTOMATED SECURITY POLICY ALERT: FlatMatch strictly prohibits dating-like activity, romance solicitation, or flirting. This platform is exclusively for professional platonical stay & roommate searches. Violations will cause immediate account suspension please keep interactions focused solely on housing.]";
    }

    const db = readDatabase();
    const msgId = "msg-" + Math.random().toString(36).substring(2, 11);

    const newMsg: Message = {
      id: msgId,
      sender_id,
      receiver_id,
      message_text: moderatedText,
      sent_at: new Date().toISOString()
    };

    db.messages.push(newMsg);
    writeDatabase(db);

    res.status(201).json(newMsg);
  });

  // Formal User Reporting Route for anti-dating community guidelines
  app.post("/api/v1/users/report", (req, res) => {
    const { reporter_id, reported_id, reason, details } = req.body;
    if (!reporter_id || !reported_id || !reason) {
      return res.status(400).json({ error: "Reporter ID, Reported ID, and Reason are mandatory." });
    }
    
    console.log(`[ANTI-DATING POLICY ENFORCEMENT] User reported: ${reported_id} by ${reporter_id} for ${reason}. Details: ${details}`);
    
    res.json({ 
      status: "success", 
      message: "report_recorded", 
      alert: "Report submitted. Our Platonic Community trust team reviews all reports inside 12 hours. We enforce a zero-tolerance policy for romantic solicitation, dating behavior, or safety breaches."
    });
  });

  // Smart Compatibility Breakdown AI Powered Endpoint
  app.post("/api/v1/ai/compatibility", async (req, res) => {
    const { seekerId, tenantId } = req.body;
    if (!seekerId || !tenantId) {
      return res.status(400).json({ error: "Missing seekerId or tenantId for AI compatibility review." });
    }

    const db = readDatabase();
    const seeker = db.users[seekerId];
    const seekerProf = db.profiles[seekerId];
    const tenant = db.users[tenantId];
    const tenantProf = db.profiles[tenantId];

    if (!seeker || !seekerProf || !tenant || !tenantProf) {
      return res.status(404).json({ error: "Required profile parameters to conduct AI review not found." });
    }

    // Compute base metrics
    const baseMetrics = computeProfileCompatibility(seekerProf, tenantProf);

    // Dynamic fallback builder to prevent hardcoded output names & ensure accuracy
    const generateDynamicFallback = (errText?: string) => {
      const matchCategory = baseMetrics.score >= 85 
        ? "Excellent Compatibility Match 🎉" 
        : baseMetrics.score >= 70 
          ? "Healthy Compatibility Match 👍" 
          : "Minor Accommodation Contrasts ⚖️";

      const cleanlinessMap: Record<number, string> = {
        1: "Relaxed / High Clutter Tolerance",
        2: "Casual Organization",
        3: "Moderate Cleanliness",
        4: "High Cleanliness",
        5: "Impeccable / Pristine Cleanliness"
      };

      const drinkingMap: Record<string, string> = {
        never: "Nondrinker",
        socially: "Socially Toasting",
        regularly: "Regular Drinker"
      };

      const sleepMap: Record<string, string> = {
        early_bird: "Early Bird",
        night_owl: "Night Owl",
        flexible: "Flexible Hours"
      };

      const wfhMap: Record<string, string> = {
        office: "Office commuter",
        hybrid: "Hybrid Routine",
        wfh: "Full WFH Desk"
      };

      let matchesList = baseMetrics.match.map((m: string) => `* **${m}**: Strong lifestyle alignment identified.`).join("\n");
      if (!matchesList) {
        matchesList = "* No direct strong lifestyle coordinates identified.";
      }

      let gapsList = baseMetrics.mismatch.map((m: string) => `* **${m}**: Suggests transparent communication and slight routine adaptation.`).join("\n");
      if (!gapsList) {
        gapsList = "* Core habits and preferences align perfectly without conflicts!";
      }

      const cleanlinessText = seekerProf.cleanliness_level === tenantProf.cleanliness_level
        ? `Both maintain a matching **${cleanlinessMap[seekerProf.cleanliness_level] || seekerProf.cleanliness_level + "/5"}** cleanliness level.`
        : `**${seeker.full_name}** values **${cleanlinessMap[seekerProf.cleanliness_level] || seekerProf.cleanliness_level + "/5"}**, while **${tenant.full_name}** values **${cleanlinessMap[tenantProf.cleanliness_level] || tenantProf.cleanliness_level + "/5"}**.`;

      const petsText = (seekerProf.pets_allowed && tenantProf.pets_allowed)
        ? "Both are pet-friendly and welcome animal companions."
        : (!seekerProf.pets_allowed && !tenantProf.pets_allowed)
          ? "Both prefer a pet-free living environment."
          : seekerProf.pets_allowed
            ? `**${seeker.full_name}** is pet-friendly, but the premises do not support pets.`
            : `Premises are pet-friendly, but **${seeker.full_name}** prefers no pets.`;

      const sleepText = seekerProf.sleeping_pattern === tenantProf.sleeping_pattern
        ? `Both share the **${sleepMap[seekerProf.sleeping_pattern] || "Flexible"}** sleep schedule.`
        : `**${seeker.full_name}** follows **${sleepMap[seekerProf.sleeping_pattern] || "Flexible"}** while **${tenant.full_name}** follows **${sleepMap[tenantProf.sleeping_pattern] || "Flexible"}** schedule.`;

      const wfhText = seekerProf.wfh_status === tenantProf.wfh_status
        ? `Both are **${wfhMap[seekerProf.wfh_status] || "Hybrid"}** workers.`
        : `**${seeker.full_name}** works as a **${wfhMap[seekerProf.wfh_status] || "commuter"}** and **${tenant.full_name}** prefers **${wfhMap[tenantProf.wfh_status] || "office commuting"}**.`;

      const budgetText = `**${seeker.full_name}**'s monthly target range is **₹${seekerProf.budget_min} - ₹${seekerProf.budget_max}**, neatly matching with **${tenant.full_name}**'s property rent parameters.`;

      const smokingText = (seekerProf.smoker === tenantProf.smoker)
        ? (seekerProf.smoker ? "Both are smokers or smoke-tolerant." : "Both prefer and maintain a smoke-free household.")
        : "There is a difference in smoking preferences — open communication or designated smoking spots would be required.";

      return `### 🤝 ${matchCategory}

Based on a detailed routine and matrix comparison, **${seeker.full_name}** (${seekerProf.profession || "Professional"}) and **${tenant.full_name}** (${tenantProf.profession || "Professional"}) show a compatibility rating of **${baseMetrics.score}%**.

#### 🔑 Key Match Elements
${matchesList}

#### ⚠️ Routine Diff Factors
${gapsList}

#### 📋 Detailed Habits Comparison
* **Tidiness Habits**: ${cleanlinessText}
* **Animal Policies**: ${petsText}
* **Rest & Schedule**: ${sleepText}
* **Workstyle Dynamics**: ${wfhText}
* **Smoking Policy**: ${smokingText}
* **Budget Compatibility**: ${budgetText}

---
*Disclaimer: Local structural analysis used as real-time fallback version${errText ? ` (${errText})` : ""}. Configure or check Gemini key services for fully personalized, AI-modeled reviews.*`;
    };

    // Attempt Gemini call
    const ai = getAiClient();
    if (!ai) {
      const breakdown: CompatibilityBreakdown = {
        score: baseMetrics.score,
        matchFactors: baseMetrics.match,
        mismatchFactors: baseMetrics.mismatch,
        aiAnalysis: generateDynamicFallback()
      };
      return res.json(breakdown);
    }

    try {
      const prompt = `Conduct a highly engaging, professional roommate compatibility review between Seeker: "${seeker.full_name}" and Existing Tenant: "${tenant.full_name}".

Seeker Profile Info:
- Name: ${seeker.full_name}
- Profession: ${seekerProf.profession}
- Age/Gender: ${seekerProf.age} / ${seekerProf.gender}
- Budget Goal: ₹${seekerProf.budget_min} - ₹${seekerProf.budget_max}
- Habits: Smoker? ${seekerProf.smoker}. Pets Allowed? ${seekerProf.pets_allowed}. Cleanliness Rating: ${seekerProf.cleanliness_level}/5. Drinking: ${seekerProf.drinking}. Sleeping: ${seekerProf.sleeping_pattern}. Job style: ${seekerProf.wfh_status}.
- Bio: "${seekerProf.bio}"

Tenant Profile Info:
- Name: ${tenant.full_name}
- Profession: ${tenantProf.profession}
- Age/Gender: ${tenantProf.age} / ${tenantProf.gender}
- Budget Max: ₹${tenantProf.budget_min} - ₹${tenantProf.budget_max}
- Habits: Smoker? ${tenantProf.smoker}. Pets Allowed? ${tenantProf.pets_allowed}. Cleanliness Rating: ${tenantProf.cleanliness_level}/5. Drinking: ${tenantProf.drinking}. Sleeping: ${tenantProf.sleeping_pattern}. Job style: ${tenantProf.wfh_status}.
- Bio: "${tenantProf.bio}"

Pre-calculated Compatibility Score: ${baseMetrics.score}%
Key Matches: ${baseMetrics.match.join(", ")}
Key Gaps: ${baseMetrics.mismatch.join(", ") || "None"}

Please analyze why they match so well or point out any light adaptation tips. Address them directly or write a friendly third-person comparative summary (approx 150-180 words, styled with elegant Markdown headers, bullet points, and high contrast typography). Highlight their common values first.`;

      let aiText = "";
      try {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: prompt
        });
        aiText = response.text || "";
      } catch (firstErr: any) {
        console.warn("Primary Gemini 3.5-flash failed or experiencing high demand, trying 3.1-flash-lite fallback...", firstErr);
        const response = await ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: prompt
        });
        aiText = response.text || "";
      }

      if (!aiText) {
        throw new Error("Unable to obtain text content from Gemini models.");
      }
      
      const breakdown: CompatibilityBreakdown = {
        score: baseMetrics.score,
        matchFactors: baseMetrics.match,
        mismatchFactors: baseMetrics.mismatch,
        aiAnalysis: aiText
      };

      res.json(breakdown);
    } catch (err: any) {
      console.error("Gemini invocation crashed completely, utilizing fallback", err);
      const explanation = generateDynamicFallback(err.message || String(err));
      
      const breakdown: CompatibilityBreakdown = {
        score: baseMetrics.score,
        matchFactors: baseMetrics.match,
        mismatchFactors: baseMetrics.mismatch,
        aiAnalysis: explanation
      };
      res.json(breakdown);
    }
  });

  // --- VERIFICATION SYSTEM ENDPOINTS ---
  // Submit a listing for verification
  app.post("/api/v1/listings/:id/verify", authenticateToken, (req, res) => {
    const { document_type, license_number, notes } = req.body;
    if (!document_type || !license_number) {
      return res.status(400).json({ error: "Document type and Aadhaar/PAN sequence numbers are required." });
    }

    const cleanNum = String(license_number).replace(/[\s-]/g, '');

    if (document_type === 'Aadhaar') {
      if (!/^\d{12}$/.test(cleanNum)) {
        return res.status(400).json({ error: "Invalid Aadhaar format. Aadhaar must be a 12-digit numerical sequence (e.g., 901234567890)." });
      }
    } else if (document_type === 'PAN') {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(cleanNum)) {
        return res.status(400).json({ error: "Invalid PAN format. PAN must be a 10-character alphanumeric string (e.g., ABCDE1234F)." });
      }
    } else {
      return res.status(400).json({ error: "For Indian regulatory compliance, the verification document must be either 'Aadhaar' or 'PAN'." });
    }

    const db = readDatabase();
    const listing = db.listings[req.params.id];
    if (!listing) {
      return res.status(404).json({ error: "Listing profile not found." });
    }

    // Strict resource ownership check
    if (listing.owner_id !== req.user.id) {
      return res.status(403).json({ error: "Access Forbidden. Only the owner of this listing can submit verification." });
    }

    listing.verification_status = 'pending';
    listing.is_verified = false;
    listing.verification_details = {
      document_type,
      license_number,
      notes: notes || "",
      submitted_at: new Date().toISOString()
    };

    writeDatabase(db);
    res.json({ status: "success", listing });
  });

  // Action to instantly approve a verification submission (for simulated admin testing!)
  app.post("/api/v1/listings/:id/approve_verification", authenticateToken, authorizeRoles("owner"), (req, res) => {
    const db = readDatabase();
    const listing = db.listings[req.params.id];
    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    // Strict resource ownership check
    if (listing.owner_id !== req.user.id) {
      return res.status(403).json({ error: "Access Forbidden. Only the owner of this listing can approve verification simulation." });
    }

    listing.verification_status = 'verified';
    listing.is_verified = true;

    writeDatabase(db);
    res.json({ status: "success", listing });
  });


  // --- VIEWINGS SCHEDULER ENDPOINTS ---
  // Retrieve viewings related to a user
  app.get("/api/v1/schedules", authenticateToken, (req, res) => {
    const userId = req.user.id;
    const db = readDatabase();
    if (!db.schedules) {
      db.schedules = {};
    }

    const searchId = String(userId);
    const bookings = Object.values(db.schedules).filter(
      (b) => b.seeker_id === searchId || b.host_id === searchId
    );

    // Sort chronologically by proposed viewing times
    bookings.sort((a, b) => new Date(a.proposed_time).getTime() - new Date(b.proposed_time).getTime());
    res.json(bookings);
  });

  // Propose a new viewing slot
  app.post("/api/v1/schedules", authenticateToken, (req, res) => {
    const seeker_id = req.user.id;
    const { listing_id, proposed_time, notes } = req.body;
    if (!listing_id || !proposed_time) {
      return res.status(400).json({ error: "Listing ID and Proposed Time are required." });
    }

    const db = readDatabase();
    const listing = db.listings[listing_id];
    if (!listing) {
      return res.status(404).json({ error: "Listing not found." });
    }

    const seeker = db.users[seeker_id];
    if (!seeker) {
      return res.status(404).json({ error: "Seeker user not found." });
    }

    const host = db.users[listing.owner_id];
    const host_name = host ? host.full_name : "Landlord";

    if (!db.schedules) {
      db.schedules = {};
    }

    const bookingId = "book-" + Math.random().toString(36).substring(2, 11);
    const newBooking: ViewingSchedule = {
      id: bookingId,
      listing_id,
      listing_title: listing.title,
      listing_address: listing.address,
      host_id: listing.owner_id,
      host_name,
      seeker_id,
      seeker_name: seeker.full_name,
      proposed_time,
      status: "proposed_by_seeker",
      notes: notes || "",
      created_at: new Date().toISOString()
    };

    db.schedules[bookingId] = newBooking;
    writeDatabase(db);
    res.status(201).json(newBooking);
  });

  // Update schedule status (Accept/Decline/Reschedule)
  app.put("/api/v1/schedules/:id", authenticateToken, (req, res) => {
    const { status, proposed_time, notes } = req.body;
    if (!status) {
      return res.status(400).json({ error: "Status update is required." });
    }

    const db = readDatabase();
    if (!db.schedules) {
      db.schedules = {};
    }

    const booking = db.schedules[req.params.id];
    if (!booking) {
      return res.status(404).json({ error: "Viewing booking file not found." });
    }

    // Strict Resource Ownership Check: authenticated caller must be seeker or host
    if (booking.seeker_id !== req.user.id && booking.host_id !== req.user.id) {
      return res.status(403).json({ error: "Access Forbidden. You are not a participant in this schedule booking." });
    }

    booking.status = status;
    if (proposed_time) {
      booking.proposed_time = proposed_time;
    }
    if (notes !== undefined) {
      booking.notes = notes;
    }

    // Auto trigger chat notice message to establish an audit log in their messages!
    const msgId = "msg-sys-" + Math.random().toString(36).substring(2, 11);
    let statusLabel = status;
    if (status === "accepted") statusLabel = "APPROVED ✅";
    if (status === "declined") statusLabel = "DECLINED ❌";
    if (status === "proposed_by_host") statusLabel = "RESCHEDULED 🔄";
    
    const auditText = `[AUTOMATED VIEWING NOTICE] Schedule Booking update: The viewing for "${booking.listing_title}" has been ${statusLabel}. Viewing Time: ${new Date(booking.proposed_time).toLocaleString()}. Notes: ${booking.notes || 'None'}`;
    
    // Auto-message sender is the one performing the status update
    db.messages.push({
      id: msgId,
      sender_id: status === "proposed_by_host" ? booking.host_id : booking.seeker_id,
      receiver_id: status === "proposed_by_host" ? booking.seeker_id : booking.host_id,
      message_text: auditText,
      sent_at: new Date().toISOString()
    });

    writeDatabase(db);
    res.json(booking);
  });

  // Vite development middleware or Production build file server setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`FlatMatch Server successfully booting and listening on port ${PORT}`);
  });
}

startServer();
