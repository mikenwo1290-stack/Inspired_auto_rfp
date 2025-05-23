'use server';

import { createClient } from '@/lib/utils/supabase/server';

export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data.user?.email || null;
  } catch (e) {
    console.error('Exception fetching user email:', e);
    return null;
  }
} 