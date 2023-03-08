/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PUBLIC_SUPABASE_URL: string
  readonly VITE_PUBLIC_SUPABASE_KEY: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
