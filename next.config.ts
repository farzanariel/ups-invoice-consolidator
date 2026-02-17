import type { NextConfig } from "next";
import { execSync } from "child_process";

let lastUpdated = "";
try {
  lastUpdated = execSync("git log -1 --format=%ci").toString().trim();
} catch {
  // Not a git repo or git unavailable — leave empty
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_LAST_UPDATED: lastUpdated,
  },
};

export default nextConfig;
