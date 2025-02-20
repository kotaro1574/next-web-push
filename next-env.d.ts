/// <reference types="next" />
/// <reference types="next/image-types/global" />

// NOTE: This file should not be edited
// see https://nextjs.org/docs/basic-features/typescript for more information.
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: string
    VAPID_PRIVATE_KEY: string
  }
}
