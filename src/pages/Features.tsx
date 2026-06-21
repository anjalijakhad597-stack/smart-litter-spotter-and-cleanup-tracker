import FeatureCard from '../components/FeatureCard';

// Logical SVG icons for each feature
const icons = {
  litterDetection: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
      <path d="M24 40h16v4H24z" fill="currentColor" opacity="0.7" />
      <path d="M26 24v16M30 24v16M34 24v16M38 24v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 22c0-4-3-6-8-6s-8 2-8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  ),
  geoReports: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 12c-8 0-14 6-14 14 0 10 14 24 14 24s14-14 14-24c0-8-6-14-14-14z" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="32" cy="26" r="5" fill="currentColor" />
      <path d="M20 52l12-12 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  cleanupTracker: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="10" width="28" height="40" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M24 10V8a2 2 0 012-2h12a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 22h20M22 30h20M22 38h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 22l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M24 30l2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  ),
  leaderboard: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8l6 12 14 2-10 10 2 14-12-6-12 6 2-14-10-10 14-2L32 8z" fill="currentColor" opacity="0.9" />
      <rect x="26" y="36" width="12" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="14" y="44" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7" />
      <rect x="38" y="44" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.7" />
    </svg>
  ),
  adminDashboard: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="34" y="10" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="10" y="34" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <rect x="34" y="34" width="20" height="20" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M18 22h4M18 26h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M42 22h4M42 26h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  ),
};

const features = [
  {
    title: 'AI-Based Litter Detection',
    description: 'Upload images and detect plastic bottles, cans, cigarette butts, and more.',
    icon: icons.litterDetection,
  },
  {
    title: 'Geo-Tagged Reports',
    description: 'Pin litter hotspots on the map to inform local cleanup activities.',
    icon: icons.geoReports,
  },
  {
    title: 'Cleanup Tracker',
    description: 'Create events, track attendance, and measure bags collected.',
    icon: icons.cleanupTracker,
  },
  {
    title: 'Leaderboard & Rewards',
    description: 'Gamified points for reports and participation. Top volunteers shine!',
    icon: icons.leaderboard,
  },
  {
    title: 'Admin Dashboard',
    description: 'Moderate reports, approve events, and monitor community impact.',
    icon: icons.adminDashboard,
  },
];

const leaderboard = [
  { name: 'Ava Green', points: 920 },
  { name: 'Leo Rivers', points: 880 },
  { name: 'Maya Lake', points: 845 },
  { name: 'Kai Stone', points: 790 },
];

export default function Features() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-6 text-3xl font-extrabold text-slate-900">Features</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <FeatureCard key={f.title} title={f.title} description={f.description} icon={f.icon} />
        ))}
      </div>

      <section className="mt-12 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-bold text-slate-900">Leaderboard & Rewards</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {leaderboard.map((p, idx) => (
                <li key={p.name} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-primary-100 text-sm font-bold text-primary-700">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-medium text-slate-800">{p.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{p.points} pts</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-slate-600">
            Earn points by uploading accurate reports (+10), joining events (+50), and leading cleanups (+100). Redeem for badges and eco-perks.
          </div>
        </div>
      </section>
    </div>
  );
}
