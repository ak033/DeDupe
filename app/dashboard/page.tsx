'use client';

export default function Dashboard() {
  async function startScan() {
    const res = await fetch('/api/scans', { method: 'POST' });
    const { id } = await res.json();
    alert('Scan started: ' + id);
  }
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 text-white">
      <button
        onClick={startScan}
        className="rounded bg-blue-600 px-6 py-3 hover:bg-blue-700"
      >
        Start Google Drive Scan
      </button>
    </main>
  );
}