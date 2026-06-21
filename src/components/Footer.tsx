export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-slate-600 sm:px-6 lg:px-8">
        <p>
          © {new Date().getFullYear()} Smart Litter Spotter & Community Cleanup Tracker. All rights reserved.
        </p>
      </div>
    </footer>
  );
}


