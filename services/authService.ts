
import { User } from '../types';
import { db } from './databaseService';

const CURRENT_USER_KEY = 'luxeplate_current_user';

// Provision a permanent admin for development/demo
const ensureAdminExists = () => {
    const admin = db.findUserByEmail('admin@luxeplate.com');
    if (!admin) {
        db.saveUser({
            id: 'admin-id-99',
            name: 'System Director',
            email: 'admin@luxeplate.com',
            role: 'ADMIN',
            avatar: 'https://ui-avatars.com/api/?name=Admin&background=0f172a&color=d4af37',
            favoriteChefIds: [],
            totalSpent: 0
        });
    }
};

export const authService = {
  async login(email: string, password: string): Promise<User> {
    ensureAdminExists();
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const user = db.findUserByEmail(email);
    if (!user) throw new Error('Identity not recognized.');
    
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  },

  async register(name: string, email: string, password: string, role: 'DINER' | 'CHEF' = 'DINER'): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (db.findUserByEmail(email)) {
      throw new Error('Email already registered.');
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=d4af37&color=fff`,
      favoriteChefIds: []
    };

    db.saveUser(newUser);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  updateCurrentUser(user: User): void {
    db.saveUser(user);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  },

  logout(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser(): User | null {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  }
};
