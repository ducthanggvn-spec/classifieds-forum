import { createClient } from './supabase/client';

export async function authFetch(url: string, options: RequestInit = {}) {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  const headers = new Headers(options.headers || {});
  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  // Nếu API URL không có schema (vd: /api/posts), tự động ghép với NEXT_PUBLIC_API_URL
  const API_URL = process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? "/api" : "http://127.0.0.1:5000/api");
  const finalUrl = url.startsWith('/') && !url.startsWith('/api') 
    ? `${API_URL}${url}` 
    : (url.startsWith('/api') && !API_URL.endsWith('/api') ? `${API_URL.replace(/\/api$/, '')}${url}` : url);

  return fetch(finalUrl, {
    ...options,
    headers,
  });
}
