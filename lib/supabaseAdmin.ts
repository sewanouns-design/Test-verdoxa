import { createClient } from "@supabase/supabase-js";

// Ce client utilise la cle "service role" de Supabase : elle a tous les
// droits et NE DOIT JAMAIS etre envoyee au navigateur. Ce fichier n'est
// importe que par du code qui tourne sur le serveur (routes /app/api/*).
const supabaseUrl = process.env.SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder-service-role-key";

export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseKey,
  { auth: { persistSession: false } }
);
