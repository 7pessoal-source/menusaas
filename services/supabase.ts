
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://rhheregmvexxgqmegqoq.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoaGVyZWdtdmV4eGdxbWVncW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAzOTk1ODQsImV4cCI6MjA4NTk3NTU4NH0.J08qxjW69sH66pB6x2Jgg-k2_MzKmJ7avakgNacQVc8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
