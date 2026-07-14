import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://oxvhxnhbhidizcrtzfad.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_eOMDjbmpFM6nCF1ElBr1zw_MAbDhZ0v';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// For server-side operations (requires SERVICE_ROLE_KEY)
export const getServerSupabase = () => {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_KEY not configured');
  }
  return createClient(supabaseUrl, serviceKey);
};
