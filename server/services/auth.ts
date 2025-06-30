import { createClient } from '@supabase/supabase-js';
import { storage } from '../storage';
import { generateSecurePassword } from './excel-processor';

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Initialize Supabase client if credentials are available
const supabase = (supabaseUrl && supabaseServiceKey) ? createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
}) : null;

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  user_metadata: any;
}

export class AuthService {
  async createUserAccount(email: string, fullName: string, userData: any): Promise<{ user: AuthUser; password: string }> {
    const password = generateSecurePassword();
    
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'employee',
        ...userData
      }
    });

    if (authError) {
      throw new Error(`Failed to create auth user: ${authError.message}`);
    }

    // Create user in our database
    const dbUser = await storage.createUser({
      supabaseId: authData.user.id,
      email,
      fullName,
      role: 'employee',
      office: userData.office,
      position: userData.position,
      department: userData.department,
      phoneNumber: userData.phoneNumber,
      isOnboarded: false
    });

    return {
      user: {
        id: authData.user.id,
        email: authData.user.email || email,
        role: 'employee',
        user_metadata: authData.user.user_metadata
      },
      password
    };
  }

  async getUserFromToken(accessToken: string): Promise<AuthUser | null> {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      role: user.user_metadata?.role || 'employee',
      user_metadata: user.user_metadata
    };
  }

  async updateUserPassword(userId: string, newPassword: string): Promise<void> {
    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });

    if (error) {
      throw new Error(`Failed to update password: ${error.message}`);
    }
  }

  async verifyUserSession(accessToken: string): Promise<boolean> {
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    return !error && !!user;
  }
}

export const authService = new AuthService();
