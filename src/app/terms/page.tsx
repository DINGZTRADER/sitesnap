import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-navy sm:grid sm:place-items-center">
      <article className="mx-auto w-full max-w-2xl rounded-3xl border border-line bg-white p-6 shadow-xl shadow-navy/5 sm:p-10">
        <Link href="/" className="text-xs font-black text-blue transition hover:text-navy">← Back to SiteSnap</Link>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.16em] text-blue">Pilot terms</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Using SiteSnap</h1>
        <p className="mt-3 text-sm leading-6 text-navy/60">Last updated 4 September 2026. These terms apply to the current SiteSnap pilot.</p>

        <div className="mt-8 space-y-7 text-sm leading-6 text-navy/70">
          <section><h2 className="text-base font-black text-navy">Purpose</h2><p className="mt-2">SiteSnap helps small construction teams document site work with project-based photos, notes and tags. It is not a substitute for professional, legal, health-and-safety, contractual or regulatory advice.</p></section>
          <section><h2 className="text-base font-black text-navy">Your records</h2><p className="mt-2">You are responsible for ensuring that you have permission to upload and share every photo, note and other record in your workspace. Do not use SiteSnap to upload unlawful content or information that you are not authorised to handle.</p></section>
          <section><h2 className="text-base font-black text-navy">Pilot service</h2><p className="mt-2">This is an early pilot. Features, availability and storage behaviour may change as the service is improved. Any screen labelled local, demo-only or unavailable is not a commitment that it will provide cloud backup, offline synchronisation, compliance evidence, export or other production-service capability.</p></section>
          <section><h2 className="text-base font-black text-navy">Access</h2><p className="mt-2">Keep your sign-in method secure and use the same authorised email address when accessing your workspace from another device. A workspace administrator can control who is invited to that workspace.</p></section>
          <section><h2 className="text-base font-black text-navy">Questions</h2><p className="mt-2">For questions about this pilot, contact <a className="font-bold text-blue hover:underline" href="mailto:wachaexperience@gmail.com">wachaexperience@gmail.com</a>.</p></section>
        </div>
      </article>
    </main>
  );
}
