import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @napi-rs/canvas ships a native binary and pdfjs-dist relies on Node-only
  // APIs (used by app/api/pdf-thumbnail) — both need to stay out of the
  // Server Components bundle and be require()'d natively at runtime instead.
  serverExternalPackages: ["@napi-rs/canvas", "pdfjs-dist"],
};

export default nextConfig;
