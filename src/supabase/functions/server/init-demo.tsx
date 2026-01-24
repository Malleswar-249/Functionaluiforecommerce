import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

/**
 * Initialize demo accounts
 * This function should be called once to set up demo admin and user accounts
 * 
 * Admin: admin@demo.com / admin123
 * User: user@demo.com / user123
 */

export async function initDemoAccounts() {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  try {
    // Create admin account
    const adminEmail = 'admin@demo.com';
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: 'admin123',
      user_metadata: { name: 'Admin User', phone: '+1 (555) 000-0001', role: 'admin' },
      email_confirm: true
    });

    if (!adminError && adminData.user) {
      await kv.set(`user:${adminData.user.id}`, {
        id: adminData.user.id,
        email: adminEmail,
        name: 'Admin User',
        phone: '+1 (555) 000-0001',
        role: 'admin',
        address: '123 Admin Street, Admin City, AC 12345',
        createdAt: new Date().toISOString()
      });
      console.log('Admin account created successfully');
    } else if (adminError && !adminError.message.includes('already registered')) {
      console.error('Admin account error:', adminError);
    }

    // Create regular user account
    const userEmail = 'user@demo.com';
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: userEmail,
      password: 'user123',
      user_metadata: { name: 'Demo User', phone: '+1 (555) 000-0002', role: 'user' },
      email_confirm: true
    });

    if (!userError && userData.user) {
      await kv.set(`user:${userData.user.id}`, {
        id: userData.user.id,
        email: userEmail,
        name: 'Demo User',
        phone: '+1 (555) 000-0002',
        role: 'user',
        address: '456 User Avenue, User Town, UT 67890',
        createdAt: new Date().toISOString()
      });
      console.log('User account created successfully');
    } else if (userError && !userError.message.includes('already registered')) {
      console.error('User account error:', userError);
    }

    return { success: true, message: 'Demo accounts initialized' };
  } catch (error) {
    console.error('Init demo accounts error:', error);
    return { success: false, error: 'Failed to initialize demo accounts' };
  }
}
