import { defineMiddleware } from 'astro:middleware';
import { jwtVerify } from 'jose';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, locals, redirect } = context;
  
  if (url.pathname.startsWith('/admin') && url.pathname !== '/admin/login') {
    const token = cookies.get('auth_token')?.value;
    if (!token) return redirect('/admin/login');
    
    try {
      const secret = new TextEncoder().encode(locals.runtime.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);
      const session = await locals.runtime.env.SESSION_KV.get(payload.sessionId as string);
      if (!session || payload.role !== 'admin') throw new Error();
    } catch {
      return redirect('/admin/login?error=unauthorized');
    }
  }
  return next();
});
