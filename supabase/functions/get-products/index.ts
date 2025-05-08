// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from 'std/server';
import { createClient } from '@supabase/supabase-js';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('VITE_SUPABASE_URL')!,
    Deno.env.get('VITE_SUPABASE_ANON_KEY')! // service role needed for edge
  );

  const { searchParams } = new URL(req.url);
  const maxPrice = searchParams.get('maxPrice');

  const query = supabase.from('products').select('*');

  if (maxPrice) {
    query.lte('price', parseFloat(maxPrice));
  }

  const { data, error } = await query;

  return new Response(
    JSON.stringify(error ? { error: error.message } : { products: data }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/get-products' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
