import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-canvas px-5 py-8 text-navy sm:grid sm:place-items-center">
      <article className="mx-auto w-full max-w-2xl rounded-3xl border border-line bg-white p-6 shadow-xl shadow-navy/5 sm:p-10">
        <Link href="/" className="text-xs font-black text-blue transition hover:text-navy">← Back to SiteSnap</Link>
        <p className="mt-8 text-xs font-black uppercase tracking-[0.16em] text-blue">Pilot privacy notice</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">SiteSnap privacy</h1>
        <p className="mt-3 text-sm leading-6 text-navy/60">Last updated 4 September 2026. This notice describes the current SiteSnap pilot and will be reviewed before a wider commercial release.</p>

        <div className="mt-8 space-y-7 text-sm leading-6 text-navy/70">
          <section><h2 className="text-base font-black text-navy">What we use</h2><p className="mt-2">SiteSnap uses the account email address and basic profile information returned by your chosen sign-in method. When you use a workspace, it also processes the sites, photos, notes, tags, dates and team details you add there.</p></section>
          <section><h2 className="text-base font-black text-navy">Why we use it</h2><p className="mt-2">We use this information to let you sign in, show the same authorised workspace on your phone and computer, keep your construction photo records organised, and provide support and service security.</p></section>
          <section><h2 className="text-base font-black text-navy">Who can see it</h2><p className="mt-2">Records are available to authorised members of the workspace where they were saved. We do not sell SiteSnap account or construction-record information.</p></section>
          <section><h2 className="text-base font-black text-navy">Pilot storage</h2><p className="mt-2">Cloud-enabled pilot workspaces use SiteSnap’s configured service providers to store and synchronise records. Some screens or data may still be clearly labelled as demo-only or local-only; those records are not cloud-synchronised until the screen says they are saved to the cloud.</p></section>
          <section><h2 className="text-base font-black text-navy">Your choices</h2><p className="mt-2">Use only site records you are authorised to upload. To ask about access, correction or deletion of your account data, contact <a className="font-bold text-blue hover:underline" href="mailto:wachaexperience@gmail.com">wachaexperience@gmail.com</a>. Workspace administrators may also need to help with records held in their workspace.</p></section>
        </div>
      </article>
    </main>
  );
}
