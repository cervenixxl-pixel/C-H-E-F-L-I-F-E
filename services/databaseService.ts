
import { User, Booking, Chef, Promotion, GiftCard, ChefRequest, EventLead, SocialPost } from '../types';

const STORAGE_KEYS = {
  USERS: 'luxeplate_users',
  BOOKINGS: 'luxeplate_bookings',
  CHEFS: 'luxeplate_chefs_cache', 
  CURRENT_USER: 'luxeplate_current_user',
  SETTINGS: 'luxeplate_platform_settings',
  PRINT_DESIGNS: 'luxeplate_print_designs',
  PROMOTIONS: 'luxeplate_promotions',
  GIFT_CARDS: 'luxeplate_gift_cards',
  COMM_LOGS: 'luxeplate_communication_logs',
  RECRUITMENT_LEADS: 'luxeplate_recruitment_leads',
  CHEF_REQUESTS: 'luxeplate_chef_requests',
  EVENT_LEADS: 'luxeplate_event_leads',
  SYSTEM_LOGS: 'luxeplate_system_logs',
  SOCIAL_POSTS: 'luxeplate_social_posts',
};

export interface SEOPageConfig {
  title: string;
  description: string;
  keywords: string;
}

export interface PlatformSettings {
  commissionRate: number;
  currency: string;
  maintenanceMode: boolean;
  supportEmail: string;
  autoApproveChefs: boolean;
  minBookingValue: number;
  seoConfig: {
    home: SEOPageConfig;
    search: SEOPageConfig;
    portfolios: SEOPageConfig;
  };
}

export interface RecruitmentLead {
  id: string;
  name: string;
  niche: string;
  status: 'IDENTIFIED' | 'CONTACTED' | 'VETTING' | 'SIGNED' | 'REJECTED';
  source: string;
  notes: string;
  createdAt: string;
}

const DEFAULT_SETTINGS: PlatformSettings = {
  commissionRate: 15,
  currency: 'GBP',
  maintenanceMode: false,
  supportEmail: 'concierge@luxeplate.com',
  autoApproveChefs: false,
  minBookingValue: 250,
  seoConfig: {
    home: { title: 'LuxePlate | Luxury Private Chefs', description: 'The worlds finest culinary talent at home.', keywords: 'private chef, michelin' },
    search: { title: 'Find Your Chef | LuxePlate', description: 'Curated culinary discovery.', keywords: 'hire chef' },
    portfolios: { title: 'Chef Portfolios | Excellence Revealed', description: 'Explore signature menus.', keywords: 'menus' }
  }
};

const INITIAL_CHEF_REQUESTS: ChefRequest[] = [
    { id: 'req-1', name: 'Alain Ducasse Jr.', email: 'alain@cuisine.fr', niche: 'Haute French Gastronomy', experience: 12, status: 'PENDING', appliedAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'req-2', name: 'Yuki Tanaka', email: 'yuki@sushimaster.jp', niche: 'Omakase Experience', experience: 8, status: 'VETTING', appliedAt: new Date(Date.now() - 172800000).toISOString() }
];

const INITIAL_EVENT_LEADS: EventLead[] = [
  { id: 'lead-1', clientName: 'James Sterling', email: 'j.sterling@estate.com', location: 'Mayfair, London', date: '2024-12-15', guests: 12, budget: 2500, cuisinePreference: 'Modern British', notes: 'Birthday celebration. Requires white glove service.', status: 'NEW', suggestedChefIds: [], createdAt: new Date().toISOString() }
];

class DatabaseService {
  getSettings(): PlatformSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  }

  updateSettings(settings: PlatformSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  getUsers(): User[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : [];
  }

  saveUser(user: User): void {
    const users = this.getUsers();
    const existingIdx = users.findIndex(u => u.id === user.id);
    if (existingIdx !== -1) users[existingIdx] = user;
    else users.push(user);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  }

  getCachedChefs(): Chef[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHEFS);
    return data ? JSON.parse(data) : [];
  }

  saveChef(chef: Chef): void {
    const chefs = this.getCachedChefs();
    const index = chefs.findIndex(c => c.id === chef.id);
    if (index !== -1) chefs[index] = chef;
    else chefs.push(chef);
    localStorage.setItem(STORAGE_KEYS.CHEFS, JSON.stringify(chefs));
  }

  cacheChefs(chefs: Chef[]): void {
    localStorage.setItem(STORAGE_KEYS.CHEFS, JSON.stringify(chefs));
  }

  getBookings(): Booking[] {
    const data = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    return data ? JSON.parse(data) : [];
  }

  async createBooking(booking: Booking): Promise<void> {
    const bookings = this.getBookings();
    bookings.push(booking);
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  }

  async updateBooking(booking: Booking): Promise<void> {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === booking.id);
    if (index !== -1) {
      bookings[index] = booking;
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    }
  }

  getPromotions(): Promotion[] {
    const data = localStorage.getItem(STORAGE_KEYS.PROMOTIONS);
    return data ? JSON.parse(data) : [];
  }

  savePromotion(promo: Promotion): void {
    const promos = this.getPromotions();
    const idx = promos.findIndex(p => p.id === promo.id);
    if (idx !== -1) promos[idx] = promo;
    else promos.unshift(promo);
    localStorage.setItem(STORAGE_KEYS.PROMOTIONS, JSON.stringify(promos));
  }

  getGiftCards(): GiftCard[] {
    const data = localStorage.getItem(STORAGE_KEYS.GIFT_CARDS);
    return data ? JSON.parse(data) : [];
  }

  saveGiftCard(card: GiftCard): void {
    const cards = this.getGiftCards();
    const idx = cards.findIndex(c => c.id === card.id);
    if (idx !== -1) cards[idx] = card;
    else cards.unshift(card);
    localStorage.setItem(STORAGE_KEYS.GIFT_CARDS, JSON.stringify(cards));
  }

  getChefRequests(): ChefRequest[] {
    const data = localStorage.getItem(STORAGE_KEYS.CHEF_REQUESTS);
    return data ? JSON.parse(data) : INITIAL_CHEF_REQUESTS;
  }

  saveChefRequest(req: ChefRequest): void {
    const reqs = this.getChefRequests();
    const idx = reqs.findIndex(r => r.id === req.id);
    if (idx !== -1) reqs[idx] = req;
    else reqs.unshift(req);
    localStorage.setItem(STORAGE_KEYS.CHEF_REQUESTS, JSON.stringify(reqs));
  }

  getEventLeads(): EventLead[] {
    const data = localStorage.getItem(STORAGE_KEYS.EVENT_LEADS);
    return data ? JSON.parse(data) : INITIAL_EVENT_LEADS;
  }

  saveEventLead(lead: EventLead): void {
    const leads = this.getEventLeads();
    const idx = leads.findIndex(l => l.id === lead.id);
    if (idx !== -1) leads[idx] = lead;
    else leads.unshift(lead);
    localStorage.setItem(STORAGE_KEYS.EVENT_LEADS, JSON.stringify(leads));
  }

  getRecruitmentLeads(): RecruitmentLead[] {
    const data = localStorage.getItem(STORAGE_KEYS.RECRUITMENT_LEADS);
    return data ? JSON.parse(data) : [];
  }

  saveRecruitmentLead(lead: RecruitmentLead): void {
    const leads = this.getRecruitmentLeads();
    const idx = leads.findIndex(l => l.id === lead.id);
    if (idx !== -1) leads[idx] = lead;
    else leads.unshift(lead);
    localStorage.setItem(STORAGE_KEYS.RECRUITMENT_LEADS, JSON.stringify(leads));
  }

  getSystemLogs(): string[] {
    const data = localStorage.getItem(STORAGE_KEYS.SYSTEM_LOGS);
    return data ? JSON.parse(data) : [];
  }

  addSystemLog(message: string): void {
    const logs = this.getSystemLogs();
    const timestamp = new Date().toLocaleTimeString();
    logs.unshift(`[${timestamp}] ${message}`);
    localStorage.setItem(STORAGE_KEYS.SYSTEM_LOGS, JSON.stringify(logs.slice(0, 100)));
  }
  
  getSocialPosts(): SocialPost[] {
    const data = localStorage.getItem(STORAGE_KEYS.SOCIAL_POSTS);
    const posts = data ? (JSON.parse(data) as SocialPost[]) : [];
    return posts.sort((a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime());
  }

  saveSocialPost(post: SocialPost): void {
    let posts = this.getSocialPosts();
    const idx = posts.findIndex(p => p.id === post.id);
    if (idx !== -1) {
      posts[idx] = post;
    } else {
      posts.push(post);
    }
    localStorage.setItem(STORAGE_KEYS.SOCIAL_POSTS, JSON.stringify(posts));
  }

  updateSocialPost(post: SocialPost): void {
    this.saveSocialPost(post);
  }

  findUserByEmail(email: string): User | undefined {
    return this.getUsers().find(u => u.email === email);
  }

  getBookingsByUserId(userId: string): Booking[] {
    return this.getBookings().filter(b => b.userId === userId);
  }

  getBookingsByChefId(chefId: string): Booking[] {
    return this.getBookings().filter(b => b.chefId === chefId);
  }
}

export const db = new DatabaseService();