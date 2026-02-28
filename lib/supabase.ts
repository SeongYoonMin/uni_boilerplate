import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// 클라이언트 사이드 (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서버 사이드 전용 (service role key — 절대 클라이언트에 노출 금지)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);
