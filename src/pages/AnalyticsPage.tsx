import { useState } from 'react';
import { Download } from 'lucide-react';
import {
  ANALYTICS_30D,
  ANALYTICS_7D,
  ANALYTICS_HOURLY,
} from '../data/sectorVData';
import { useSystem } from '../context/SystemContext';

export function AnalyticsPage() {
  const { roads, parkingZones, incidents } = useSystem();
  const [timeframe, setTimeframe] = useState<'hourly' | '7d' | '30d'>('hourly');
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const series =
    timeframe === 'hourly'
      ? ANALYTICS_HOURLY
      : timeframe === '7d'
        ? ANALYTICS_7D
        : ANALYTICS_30D;

  const maxViolations = Math.max(...series.map((d) => d.violations), 1);
  const avgCongestion = Math.round(
    series.reduce((acc, d) => acc + d.congestion, 0) / series.length,
  );
  const totalCleared = series.reduce((acc, d) => acc + d.cleared, 0);
  const totalViolations = series.reduce((acc, d) => acc + d.violations, 0);
  const clearanceRate = Math.round((totalCleared / Math.max(1, totalViolations)) * 100);

  const totalBays = parkingZones.reduce((acc, z) => acc + z.totalBays, 0);
  const usedBays = parkingZones.reduce((acc, z) => acc + (z.totalBays - z.availableBays), 0);
  const occupancyPct = Math.round((usedBays / Math.max(1, totalBays)) * 100);

  const corridorStats = roads
    .map((r) => ({
      id: r.id,
      name: r.name,
      code: r.corridorCode,
      count: incidents.filter((i) => i.roadId === r.id).length,
      speed: r.avgSpeedKmh,
      freeFlow: r.freeFlowSpeedKmh,
    }))
    .sort((a, b) => b.count - a.count);

  const handleExportCsv = () => {
    const header = 'CorridorCode,CorridorName,Status,AvgSpeedKmh,ActiveObstructions\n';
    const rows = roads
      .map((r) => `${r.corridorCode},"${r.name}",${r.status},${r.avgSpeedKmh},${r.activeObstructions}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sector-v-traffic-analytics-${timeframe}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const chartWidth = 680;
  const chartHeight = 220;
  const padLeft = 36;
  const padRight = 18;
  const padTop = 18;
  const padBottom = 32;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  const polylinePoints = series
    .map((pt, idx) => {
      const x = padLeft + (idx / Math.max(1, series.length - 1)) * plotW;
      const y = padTop + plotH - (pt.congestion / 100) * plotH;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Sector V Traffic Analytics
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Peak-hour congestion correlation against illegal roadside parking, enforcement clearance rates, and authorised parking occupancy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg">
            {(
              [
                ['hourly', 'Today (Hourly)'],
                ['7d', '7 Days'],
                ['30d', '30 Days'],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setTimeframe(id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  timeframe === id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3.5 py-2 text-xs font-medium text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Download CSV
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Mean Congestion Index</p>
          <p className="font-display text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            {avgCongestion}%
          </p>
          <p className="text-xs text-slate-500 mt-1.5">Peak windows: 09–11 AM &amp; 06–08 PM</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Violation Clearance Rate</p>
          <p className="font-display text-2xl font-bold text-emerald-700 mt-1 tabular-nums">
            {clearanceRate}%
          </p>
          <p className="text-xs text-slate-500 mt-1.5 font-mono tabular-nums">
            {totalCleared} cleared / {totalViolations} logged
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Legal Parking Utilization</p>
          <p className="font-display text-2xl font-bold text-[#0F4C81] mt-1 tabular-nums">
            {occupancyPct}%
          </p>
          <p className="text-xs text-slate-500 mt-1.5 font-mono tabular-nums">
            {usedBays} / {totalBays} bays occupied
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5">
          <p className="text-xs font-medium text-slate-500">Mean Towing Response</p>
          <p className="font-display text-2xl font-bold text-slate-900 mt-1 tabular-nums">
            13.8 min
          </p>
          <p className="text-xs text-emerald-700 mt-1.5">3.2 min faster vs prior month</p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <section className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Congestion % vs. Illegal Parking Volume
              </h2>
              <p className="text-xs text-slate-500">
                Line tracks corridor congestion index; bars represent logged curb violations
              </p>
            </div>
            {hoveredIdx !== null && series[hoveredIdx] && (
              <div className="text-xs font-mono tabular-nums text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded">
                {series[hoveredIdx].label}: {series[hoveredIdx].congestion}% cong ·{' '}
                {series[hoveredIdx].violations} reports
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto min-w-[520px]">
              {[0, 25, 50, 75, 100].map((tick) => {
                const y = padTop + plotH - (tick / 100) * plotH;
                return (
                  <g key={tick}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={chartWidth - padRight}
                      y2={y}
                      stroke="#E2E8F0"
                      strokeWidth="1"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="10"
                      fill="#64748B"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {tick}
                    </text>
                  </g>
                );
              })}

              {series.map((pt, idx) => {
                const barSlot = plotW / series.length;
                const barW = Math.min(24, barSlot * 0.45);
                const cx = padLeft + (idx / Math.max(1, series.length - 1)) * plotW;
                const barH = (pt.violations / maxViolations) * (plotH * 0.72);
                const barY = padTop + plotH - barH;
                return (
                  <g
                    key={pt.label}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="cursor-pointer"
                  >
                    <rect
                      x={cx - barW / 2}
                      y={barY}
                      width={barW}
                      height={barH}
                      rx="3"
                      fill={hoveredIdx === idx ? '#F59E0B' : '#CBD5E1'}
                    />
                    <text
                      x={cx}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#475569"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {pt.label}
                    </text>
                  </g>
                );
              })}

              <polyline
                fill="none"
                stroke="#0F4C81"
                strokeWidth="2.5"
                strokeLinejoin="round"
                strokeLinecap="round"
                points={polylinePoints}
              />

              {series.map((pt, idx) => {
                const cx = padLeft + (idx / Math.max(1, series.length - 1)) * plotW;
                const cy = padTop + plotH - (pt.congestion / 100) * plotH;
                return (
                  <circle
                    key={`dot-${pt.label}`}
                    cx={cx}
                    cy={cy}
                    r={hoveredIdx === idx ? 5 : 3.5}
                    fill="#0F4C81"
                    stroke="#FFFFFF"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
          </div>
        </section>

        <section className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-900">
              Corridor Speed vs. Free-Flow Baseline
            </h2>
            <p className="text-xs text-slate-500">
              Live velocity loss caused by roadside parking bottlenecks
            </p>
          </div>

          <ul className="space-y-3.5">
            {corridorStats.map((item) => {
              const speedRatio = Math.min(100, Math.round((item.speed / item.freeFlow) * 100));
              return (
                <li key={item.id} className="space-y-1">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <span className="font-medium text-slate-800 truncate">
                      <span className="font-mono text-slate-500 mr-1.5">{item.code}</span>
                      {item.name}
                    </span>
                    <span className="font-mono tabular-nums text-slate-700 shrink-0">
                      {item.speed}/{item.freeFlow} km/h
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        speedRatio >= 75
                          ? 'bg-emerald-600'
                          : speedRatio >= 45
                            ? 'bg-amber-500'
                            : 'bg-red-600'
                      }`}
                      style={{ width: `${speedRatio}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
