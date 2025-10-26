// Deno type definitions for Supabase Edge Functions
// These files run on Deno runtime, not Node.js

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
  }
  
  export const env: Env;
  
  export interface ServeOptions {
    port?: number;
    hostname?: string;
    signal?: AbortSignal;
    onListen?: (params: { hostname: string; port: number }) => void;
  }
  
  export function serve(
    handler: (request: Request) => Response | Promise<Response>,
    options?: ServeOptions
  ): void;
}

// Module declarations for Deno-specific imports
declare module 'npm:hono' {
  export { Hono } from 'hono';
}

declare module 'npm:hono/cors' {
  export { cors } from 'hono/cors';
}

declare module 'npm:hono/logger' {
  export { logger } from 'hono/logger';
}

declare module 'jsr:@supabase/supabase-js@2' {
  export * from '@supabase/supabase-js';
}

declare module 'jsr:@supabase/supabase-js@2.49.8' {
  export * from '@supabase/supabase-js';
}

