// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://scjwymsygllanubzfbok.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjand5bXN5Z2xsYW51YnpmYm9rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwMTMzNzEsImV4cCI6MjA2ODU4OTM3MX0.JQBPlDP8fxDVSde5sJJysmy7hUsH4HUwuu3EFnNDYAs";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});