import './globals.css';
export const metadata = { title: 'SiteSnap · Site photo records', description: 'Professional site photo records for small construction teams.', manifest: '/manifest.webmanifest' };
export const viewport = { themeColor: '#10251f', width: 'device-width', initialScale: 1 };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en-GB"><body>{children}</body></html>; }
