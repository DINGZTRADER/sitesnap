import './globals.css';
export const metadata = { title: 'SiteSnap · Site photo records', description: 'Site photo records for small construction teams, with local demo mode and optional cloud sync.', manifest: '/manifest.webmanifest' };
export const viewport = { themeColor: '#10251f', width: 'device-width', initialScale: 1 };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en-GB"><body>{children}</body></html>; }
