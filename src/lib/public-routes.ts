const publicPaths = new Set(['/login', '/privacy', '/terms']);

export function requiresAuthentication(pathname: string) {
  return !publicPaths.has(pathname) && !pathname.startsWith('/auth');
}
