import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pwhcrtiiqruvswyegdqt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB3aGNydGlpcXJ1dnN3eWVnZHF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0Mjc1MDIsImV4cCI6MjA4NzAwMzUwMn0.xQdoZetdyBUThh01a44OSpad3CKI-M08gseao8qLF3A';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
