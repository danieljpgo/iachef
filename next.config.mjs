// @ts-check
!process.env.SKIP_ENV_VALIDATION && (await import("./lib/env.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
};

export default config;
