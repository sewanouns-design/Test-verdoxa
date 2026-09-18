import { createClient } from "@supabase/supabase-js";

// Ce client utilise la cle "service role" de Supabase : elle a tous les
// droits et NE DOIT JAMAIS etre envoyee au navigateur. Ce fichier n'est
// importe que par du code qui tourne sur le serveur (routes /app/api/*).
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string,
  { auth: { persistSession: false } }
);
