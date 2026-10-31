import { createClient } from '@supabase/supabase-js';
import { PUBLIC_SRIRADHAS_SUPABASE_URL, PUBLIC_SRIRADHAS_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';

export const supabase = createClient(PUBLIC_SRIRADHAS_SUPABASE_URL, PUBLIC_SRIRADHAS_SUPABASE_PUBLISHABLE_KEY);

