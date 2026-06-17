/// <reference types="astro/client" />

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    user?: {
      id: string;
      username: string;
      role: string;
    };
  }
}

interface Env {
  DB: D1Database;
  SESSION_KV: KVNamespace;
  GITHUB_QUEUE_DO: DurableObjectNamespace;
  GITHUB_TOKEN: string;
  GITHUB_REPO_OWNER: string;
  GITHUB_REPO_NAME: string;
  JWT_SECRET: string;
  DISCORD_WEBHOOK_URL: string;
  PUBLIC_DATA_API_KEY: string;
}
