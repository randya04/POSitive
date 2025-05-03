import { supabase } from '@/lib/supabaseClient';

console.log('test-supabase: start');

supabase.auth.getSession()
  .then(({ data }) => {
    console.log('test-supabase: getSession result', data);
  })
  .catch((err) => {
    console.error('test-supabase: getSession error', err);
  })
  .finally(() => {
    console.log('test-supabase: getSession finally');
  });
