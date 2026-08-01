/// <reference types="vite/client" />

/**
 * Both are optional on purpose. Without them the club table simply does not
 * exist and the game behaves exactly as it always has — which is what keeps a
 * missing key from being an outage.
 */
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
