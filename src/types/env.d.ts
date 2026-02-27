/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_REPO_URL?: string;
  readonly VITE_REPO_API_URL?: string;
  readonly VITE_CONTACT_EMAIL?: string;
  readonly VITE_LEGAL_NOTICE_URL?: string;
  readonly VITE_PRIVACY_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
