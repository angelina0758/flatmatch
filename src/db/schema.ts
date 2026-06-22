import { pgTable, text, integer, boolean, doublePrecision, jsonb } from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(), // We use standard string UIDs (both simulated and Firebase uids)
  email: text("email").notNull(),
  password: text("password"),
  fullName: text("full_name").notNull(),
  userType: text("user_type").notNull(),
  phoneNumber: text("phone_number"),
  isVerified: boolean("is_verified").notNull().default(false),
  tier: text("tier").notNull().default("free"),
  createdAt: text("created_at").notNull(),
});

// User Profiles table
export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  bio: text("bio").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  profession: text("profession").notNull(),
  smoker: boolean("smoker").notNull().default(false),
  petsAllowed: boolean("pets_allowed").notNull().default(false),
  cleanlinessLevel: integer("cleanliness_level").notNull(),
  budgetMin: integer("budget_min").notNull(),
  budgetMax: integer("budget_max").notNull(),
  drinking: text("drinking").notNull(),
  sleepingPattern: text("sleeping_pattern").notNull(),
  wfhStatus: text("wfh_status").notNull(),
});

// Listings table
export const listings = pgTable("listings", {
  id: text("id").primaryKey(),
  ownerId: text("owner_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ownerName: text("owner_name"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  listingType: text("listing_type").notNull(),
  pricePerMonth: integer("price_per_month").notNull(),
  deposit: integer("deposit").notNull(),
  address: text("address").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  availableFrom: text("available_from").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull(),
  genderPreference: text("gender_preference").notNull(),
  houseRestrictions: jsonb("house_restrictions").notNull(), // string[] JSON array
  roomSize: text("room_size"),
  utilitySplit: text("utility_split"),
  currentFlatmateCount: integer("current_flatmate_count"),
  apartmentType: text("apartment_type"),
  pincode: text("pincode"),
  state: text("state"),
  city: text("city"),
  amenities: jsonb("amenities").notNull(), // string[] JSON array
  imageUrls: jsonb("image_urls").notNull(), // string[] JSON array
  isVerified: boolean("is_verified").default(false),
  verificationStatus: text("verification_status"),
  verificationDetails: jsonb("verification_details"), // object JSON
});

// Messages table
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  receiverId: text("receiver_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  messageText: text("message_text").notNull(),
  sentAt: text("sent_at").notNull(),
});

// Viewing Schedules table
export const schedules = pgTable("schedules", {
  id: text("id").primaryKey(),
  listingId: text("listing_id")
    .notNull()
    .references(() => listings.id, { onDelete: "cascade" }),
  listingTitle: text("listing_title").notNull(),
  listingAddress: text("listing_address").notNull(),
  hostId: text("host_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  hostName: text("host_name").notNull(),
  seekerId: text("seeker_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  seekerName: text("seeker_name").notNull(),
  proposedTime: text("proposed_time").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
});
