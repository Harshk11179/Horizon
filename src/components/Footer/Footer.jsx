export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] px-6 py-8 mt-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-display text-sm text-mist-dim tracking-wide">EcoSentinel</span>
        <span className="font-mono text-[11px] text-mist-dim/60 tracking-wide">
          Environmental data shown is placeholder — powered by NASA, NOAA &amp; CPCB data sources
        </span>
      </div>
    </footer>
  );
}
