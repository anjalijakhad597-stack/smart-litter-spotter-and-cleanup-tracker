export default function About() {
  const team = [
    { name: 'Saurabh Naulakha', role: 'Backend & AI' },
    { name: 'Sumit Sharma', role: 'Frontend Developer' },
    { name: 'Anjali Jakhad', role: 'UI/UX Designer' },
    { name: 'Komal Sharma', role: 'Research' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-4 text-3xl font-extrabold text-slate-900">About</h1>
      <p className="mb-8 max-w-3xl text-slate-700">
        Our mission is to empower communities to keep public spaces clean by combining AI-powered litter detection with grassroots action. We believe that small, consistent efforts can create big change.
      </p>

      <h2 className="mb-3 text-xl font-bold text-slate-900">Team</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {team.map((m) => (
          <div key={m.name} className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
            <img
              src={`https://source.unsplash.com/collection/895539/200x200?sig=${encodeURIComponent(m.name)}`}
              alt={m.name}
              className="mx-auto mb-3 h-24 w-24 rounded-full object-cover"
            />
            <p className="text-sm font-semibold text-slate-900">{m.name}</p>
            <p className="text-xs text-slate-600">{m.role}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-3 text-xl font-bold text-slate-900">Contact</h2>
      <p className="text-sm text-slate-700">
        Reach us at <a href="mailto:hello@smartlitter.app" className="font-semibold text-primary-700 underline">hello@smartlitter.app</a>
      </p>
    </div>
  );
}


