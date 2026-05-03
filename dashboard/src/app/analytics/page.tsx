"use client";

export default function AnalyticsPage() {
  return (
    <div style={{ width: "100%" }} className="animate-fadeIn">
      {/* Page Header */}
      <header style={{ marginBottom: "16px" }}>
        <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-1 flex items-center gap-3">
          <span>📊</span> Analytics
        </h1>
        <p className="text-sm text-[var(--text-secondary)]">Deep dive into your content performance</p>
      </header>

      {/* Coming Soon */}
      <div className="coming-soon">
        <span className="coming-soon-icon">📊</span>
        <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Advanced Analytics Coming Soon</h3>
        <p className="text-[var(--text-secondary)] max-w-md mx-auto mb-6">
          We&apos;re building powerful analytics dashboards with real-time insights,
          audience demographics, and performance predictions.
        </p>
        <div className="flex gap-3 justify-center">
          <span className="badge badge-primary">Real-time Data</span>
          <span className="badge badge-purple">AI Insights</span>
          <span className="badge badge-cyan">Predictions</span>
        </div>
      </div>
    </div>
  );
}
