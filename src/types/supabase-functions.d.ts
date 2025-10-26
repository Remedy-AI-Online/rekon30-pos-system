/**
 * Type definitions for Supabase Edge Functions
 * This file provides types for Deno runtime and Supabase Edge Functions
 */

declare global {
  namespace Deno {
    interface Env {
      get(key: string): string | undefined;
    }
    
    const env: Env;
  }
}

// Module declarations for Deno imports
declare module "https://esm.sh/hono@3.12.8" {
  export class Hono {
    constructor();
    use(path: string, middleware: any): void;
    get(path: string, handler: (c: any) => any): void;
    post(path: string, handler: (c: any) => any): void;
    put(path: string, handler: (c: any) => any): void;
    delete(path: string, handler: (c: any) => any): void;
  }
}

declare module "https://esm.sh/hono@3.12.8/cors" {
  export function cors(options: any): any;
}

declare module "https://esm.sh/hono@3.12.8/logger" {
  export function logger(fn: (message: string) => void): any;
}

declare module "https://esm.sh/@supabase/supabase-js@2.49.8" {
  export function createClient(url: string, key: string): any;
}

export {};
