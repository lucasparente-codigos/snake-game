/// <reference types="vite/client" />

declare module '*.css' {
  const css: string;
  export default css;
}

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
