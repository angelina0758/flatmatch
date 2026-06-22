export type UserType = 'seeker' | 'tenant' | 'owner';

export interface User {
  id: string;
  email: string;
  password?: string;
  full_name: string;
  user_type: UserType;
  phone_number?: string;
  is_verified: boolean;
  tier: 'free' | 'premium_seeker' | 'owner_pro' | 'owner_enterprise';
  created_at: string;
}

export interface UserProfile {
  user_id: string;
  bio: string;
  age: number;
  gender: string;
  profession: string;
  // Preferences matrix
  smoker: boolean;
  pets_allowed: boolean;
  cleanliness_level: number; // 1 to 5
  budget_min: number;
  budget_max: number;
  drinking: 'never' | 'socially' | 'regularly';
  sleeping_pattern: 'early_bird' | 'night_owl' | 'flexible';
  wfh_status: 'office' | 'hybrid' | 'wfh';
}

export type ListingType = 'shared_stay' | 'entire_unit';

export type GenderPreference = 'Girls only' | 'Boys only' | 'No preference';

export interface Listing {
  id: string;
  owner_id: string;
  owner_name?: string; // Derived
  title: string;
  description: string;
  listing_type: ListingType;
  price_per_month: number;
  deposit: number;
  address: string;
  latitude: number;
  longitude: number;
  available_from: string;
  is_active: boolean;
  created_at: string;
  
  gender_preference: GenderPreference;
  house_restrictions: string[]; // e.g. ["No smoking", "No pets", "No overnight guests", "Quiet hours after 10PM"]

  // Existing tenant features
  room_size?: string; // e.g. "12' x 14'"
  utility_split?: string; // e.g. "Equally divided (~$50)"
  current_flatmate_count?: number;
  
  // Apartment owner features
  apartment_type?: 'Studio' | '1BHK' | '2BHK' | '3BHK' | 'PG' | 'Paying Guest' | 'Studio Flat' | 'Independent House';
  pincode?: string;
  state?: string;
  city?: string;
  amenities: string[]; // e.g. ['Gym', 'Pool', 'Parking', 'Security']
  image_urls: string[];
  is_verified?: boolean;
  verification_status?: 'unverified' | 'pending' | 'verified';
  verification_details?: {
    document_type: string;
    license_number: string;
    notes?: string;
    submitted_at: string;
  };
}

export interface ViewingSchedule {
  id: string;
  listing_id: string;
  listing_title: string;
  listing_address: string;
  host_id: string;
  host_name: string;
  seeker_id: string;
  seeker_name: string;
  proposed_time: string; // ISO or date-time string
  status: 'proposed_by_seeker' | 'proposed_by_host' | 'accepted' | 'declined' | 'completed';
  notes?: string;
  created_at: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  message_text: string;
  sent_at: string;
}

export interface Conversation {
  id: string;
  participant: User;
  lastMessage?: Message;
  unreadCount: number;
}

export interface CompatibilityBreakdown {
  score: number;
  matchFactors: string[];
  mismatchFactors: string[];
  aiAnalysis: string;
}
