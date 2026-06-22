export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// Haversine Distance Helper for UI Distance display
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Planet radius
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

export const SAMPLE_BULK_CSV = `title,description,listing_type,price_per_month,deposit,address,latitude,longitude,apartment_type,amenities,image_urls
"Luxury Penthouse Overlooking Cubbon Park","Breathtaking views of the park. High end design with marble bathrooms, top tier gym and elevator services.","entire_unit",45000,90000,"701 MG Road, Indiranagar, Bengaluru, Karnataka 560038",12.9716,77.5946,"3BHK","Gym, Pool, Parking, Security, Power Backup","https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800"
"Modern High-Rise Indiranagar Studio Flat","A gorgeous, compact studio located right on 100 Feet Road. Rent includes high-speed fiber internet and parking space.","entire_unit",19500,30000,"350 12th Main Road, Indiranagar, Bengaluru, Karnataka 560038",12.9784,77.6408,"Studio Flat","Security, Parking, Central AC, Power Backup","https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800"
"Cozy PG Paying Guest for Students","Spacious and sunlit shared accommodation in Koramangala. Features a gorgeous shared kitchen and backyard. Hassle-free!","shared_stay",8500,15000,"104 5th Block, Koramangala, Bengaluru, Karnataka 560034",12.9348,77.6189,"PG","Security, Common Lounge, Food Included, High-speed Internet","https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800"`;

export const SAMPLE_BULK_JSON = `[
  {
    "title": "Koramangala Artsy Studio Flat",
    "description": "Charming third-floor walk-up in legendary Koramangala. Exposed brick walls, decorative bookshelves, and oversized balcony.",
    "listing_type": "entire_unit",
    "price_per_month": 18000,
    "deposit": 30000,
    "address": "210 2nd Cross, Koramangala 4th Block, Bengaluru, Karnataka 560034",
    "latitude": 12.9328,
    "longitude": 77.6245,
    "apartment_type": "Studio Flat",
    "amenities": ["Security", "Central AC", "Common Lounge", "Power Backup"],
    "image_urls": "https://images.unsplash.com/photo-1536376072261-38c75010e6c9?auto=format&fit=crop&q=80&w=800"
  },
  {
    "title": "Whitefield Spacious 2BHK Flat",
    "description": "Gigantic resident-style 2BHK just 3 minutes from the metro station. Super modern kitchen, private balcony, and state of the art gym.",
    "listing_type": "entire_unit",
    "price_per_month": 28000,
    "deposit": 60000,
    "address": "31 ITPL Main Road, Whitefield, Bengaluru, Karnataka 560066",
    "latitude": 12.9698,
    "longitude": 77.7501,
    "apartment_type": "2BHK",
    "amenities": ["Gym", "Security", "Parking", "In-unit Laundry", "Power Backup"],
    "image_urls": "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&q=80&w=800"
  }
]`;
