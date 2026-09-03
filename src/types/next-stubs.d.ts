declare module 'next/link' {
  import { ComponentType, AnchorHTMLAttributes } from 'react';
  const Link: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }>;
  export default Link;
}
declare module 'next/navigation' {
  export function useParams<T extends Record<string, string> = Record<string, string>>(): T;
}
