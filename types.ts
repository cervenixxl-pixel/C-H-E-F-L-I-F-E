
export enum CuisineType {
  MODERN_EUROPEAN = 'Modern European',
  ITALIAN = 'Italian',
  JAPANESE = 'Japanese',
  FRENCH = 'French',
  MEDITERRANEAN = 'Mediterranean',
  ASIAN_FUSION = 'Asian Fusion',
  BRITISH = 'British',
  MEXICAN = 'Mexican'
}

export interface Dish {
  name: string;
  description: string;
  isSignature?: boolean;
  ingredients: string[];
  allergens: string[];
  image?: string;
  platingStyle?: string;
}

export interface Menu {
  id: string;
  name: string;
  pricePerHead: number;
  description: string;
  coverImage?: string;
  courses: {
    starter: Dish[];
    main: Dish[];
    dessert: Dish[];
    [key: string]: Dish[];
  };
  courseOrder?: string[];
}

export interface Chef {
  id: string;
  name: string;
  location: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  cuisines: string[];
  imageUrl: string;
  minPrice: number;
  minSpend: number;
  menus: Menu[];
  yearsExperience: number;
  eventsCount: number;
  badges: string[];
  tags: string[];
  teaserVideo?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  isFeatured?: boolean;
  featuredCategory?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'DINER' | 'CHEF' | 'ADMIN';
  avatar?: string;
  favoriteChefIds: string[];
  phone?: string;
  lastActive?: string;
  totalSpent?: number;
}

export interface Booking {
  id: string;
  userId: string;
  chefId: string;
  chefName: string;
  chefImage: string;
  menuName: string;
  date: string;
  time: string;
  guests: number;
  totalPrice: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
  createdAt: string;
}

export interface ChefRequest {
  id: string;
  name: string;
  email: string;
  niche: string;
  experience: number;
  portfolioUrl?: string;
  status: 'PENDING' | 'VETTING' | 'INTERVIEW' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  aiRecommendation?: string;
  notes?: string;
}

export interface EventLead {
  id: string;
  clientName: string;
  email: string;
  location: string;
  date: string;
  guests: number;
  budget: number;
  cuisinePreference: string;
  notes: string;
  status: 'NEW' | 'MATCHING' | 'SENT_TO_CHEFS' | 'BOOKED' | 'EXPIRED';
  suggestedChefIds: string[];
  createdAt: string;
}

export type ViewState = 'HOME' | 'SEARCH_RESULTS' | 'CHEF_PROFILE' | 'BOOKING_DETAILS' | 'PAYMENT' | 'BOOKING_SUCCESS' | 'USER_PROFILE' | 'INBOX' | 'BOOKING_SUMMARY' | 'ADMIN' | 'CHEF_DASHBOARD' | 'ADMIN_LOGIN' | 'VIDEO_GENERATION' | 'REQUEST_CHEF_FORM';

export type AdminTab = 
  | 'DASHBOARD' 
  | 'ANALYTICS'
  | 'FORECASTING'
  | 'TRAFFIC_HUB'
  | 'MARKET_DISCOVERY'
  | 'MARKETING'
  | 'SOCIAL_HUB'
  | 'PRINTING'
  | 'RECRUITMENT'
  | 'TALENT_PIPELINE'
  | 'CHEFS'
  | 'ORDERS'
  | 'CUSTOMERS'
  | 'FINANCE'
  | 'PROMOTIONS'
  | 'GIFT_CARDS'
  | 'SMS'
  | 'EMAILS'
  | 'DATA_MANAGEMENT'
  | 'SEO' 
  | 'SETTINGS';

export interface ImageGenConfig {
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9" | "2:3" | "3:2" | "21:9";
  imageSize: "1K" | "2K" | "4K";
}

export interface MenuRecommendation {
  chefName: string;
  chefId: string;
  chefImage: string;
  menuName: string;
  pricePerHead: number;
  description: string;
  matchReason: string;
}

export interface SearchParams {
  location: string;
  date: string;
  guests: number;
  cuisine: string;
}

export interface Promotion {
  id: string;
  code: string;
  discountType: 'PERCENT' | 'FIXED';
  value: number;
  expiry: string;
  status: 'ACTIVE' | 'PAUSED' | 'EXPIRED';
  usageCount: number;
}

export interface GiftCard {
  id: string;
  code: string;
  balance: number;
  recipientEmail: string;
  status: 'ACTIVE' | 'REDEEMED' | 'EXPIRED';
}

export interface SocialPost {
  id: string;
  targetType: 'PLATFORM' | 'CHEF' | 'EVENT';
  targetId?: string;
  targetName: string;
  platforms: ('INSTAGRAM' | 'FACEBOOK' | 'X_TWITTER')[];
  content: {
    instagram: string;
    facebook: string;
    x_twitter: string;
  };
  hashtags: string;
  visualPrompt: string;
  status: 'SCHEDULED' | 'PUBLISHED';
  scheduledAt: string; // ISO string
  publishedAt?: string; // ISO string
}
