export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-6 py-16 sm:px-10">
      <section
        className="w-full rounded-3xl border border-border bg-surface px-6 py-12 shadow-sm sm:px-10 sm:py-16"
        aria-labelledby="page-title"
      >
        <p className="mb-5 inline-flex rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-accent">
          Local Dashboard
        </p>
        <h1
          id="page-title"
          className="max-w-2xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl"
        >
          CDN Access Log Explorer
        </h1>
        <p className="mt-5 max-w-xl text-base leading-7 text-muted sm:text-lg">
          Explore, filter and export Parspack CDN access logs.
        </p>
      </section>
    </main>
  );
}
