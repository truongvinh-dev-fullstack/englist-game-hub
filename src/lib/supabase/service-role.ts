import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database.types";

/**
 * Creates an administrative Supabase client using the service-role key.
 *
 * CRITICAL SECURITY INVARIANT:
 * - NEVER import or execute this file in client-side code.
 * - Used exclusively on the server for privileged operations (e.g. answer evaluation,
 *   admin migrations, internal transactional score persistence).
 */
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "SECURITY VIOLATION: createAdminClient() cannot be invoked in the browser environment."
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase admin environment variables: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured."
    );
  }

  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

