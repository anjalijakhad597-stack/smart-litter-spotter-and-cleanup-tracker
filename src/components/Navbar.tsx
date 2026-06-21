import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function Navbar() {
  const location = useLocation();

  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            initial={{ rotate: -12, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            className="grid h-9 w-9 place-items-center rounded-lg bg-primary-500 text-white shadow"
          >
            <span className="text-lg font-bold">SL</span>
          </motion.div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold leading-4">Smart Litter Spotter</p>
            <p className="text-xs text-slate-500">Detect, Clean, Inspire</p>
          </div>
        </Link>

        <nav className="flex items-center gap-3 sm:gap-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-primary-600 ${
                isActive ? 'text-primary-600' : 'text-slate-700'
              }`
            }
          >
            Home
          </NavLink>
          <button
            type="button"
            onClick={() => {
              if (!isHome) {
                window.location.href = '/#impact';
              } else {
                scrollToSection('impact');
              }
            }}
            className="hidden text-sm font-medium text-slate-700 transition-colors hover:text-primary-600 sm:inline-block"
          >
            Impact
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isHome) {
                window.location.href = '/#map-preview';
              } else {
                scrollToSection('map-preview');
              }
            }}
            className="hidden text-sm font-medium text-slate-700 transition-colors hover:text-primary-600 sm:inline-block"
          >
            Map Preview
          </button>
          <NavLink
            to="/features"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-primary-600 ${
                isActive ? 'text-primary-600' : 'text-slate-700'
              }`
            }
          >
            Features
          </NavLink>
          <NavLink
            to="/demo"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-primary-600 ${
                isActive ? 'text-primary-600' : 'text-slate-700'
              }`
            }
          >
            Demo
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `text-sm font-medium transition-colors hover:text-primary-600 ${
                isActive ? 'text-primary-600' : 'text-slate-700'
              }`
            }
          >
            About
          </NavLink>
          <a
            href="https://unsplash.com/"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-slate-800 sm:inline-block"
          >
            Unsplash Images
          </a>
        </nav>
      </div>
    </header>
  );
}


