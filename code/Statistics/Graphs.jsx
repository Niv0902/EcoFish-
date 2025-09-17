import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../firebase.js';
import { ref as dbRef, onValue, off } from 'firebase/database';

const Graphs = ({  dbPath="https://ecofish-7d154-default-rtdb.firebaseio.com/"}) => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Subscribe to RTDB and keep each row's key
  useEffect(() => {
    const r = dbRef(db, dbPath);
    const unsubscribe = onValue(
      r,
      (snap) => {
        const out = [];
        snap.forEach((child) => out.push({ id: child.key, ...child.val() }));
        setRows(out);
        setLoading(false);
      },
      (err) => {
        console.error('RTDB read error:', err);
        setLoading(false);
      }
    );
    return () => off(r, 'value', unsubscribe);
  }, [dbPath]);

  // Helpers
  const parseDate = (d) => {
    if (!d) return null;
    if (typeof d === 'number') return new Date(d);
    const t = Date.parse(d);
    return Number.isNaN(t) ? null : new Date(t);
  };

  // Chlorophyll time series (sorted by date)
  const chlSeries = useMemo(() => {
    return rows
      .filter((r) => r.chlorophyll != null && r.date)
      .map((r) => ({ t: parseDate(r.date), v: Number(r.chlorophyll) }))
      .filter((p) => p.t && Number.isFinite(p.v))
      .sort((a, b) => a.t - b.t);
  }, [rows]);

  // E.coli average by site
  const eColiBySite = useMemo(() => {
    const by = new Map();
    rows.forEach((r) => {
      if (!r.site || r.eColi == null) return;
      const site = String(r.site);
      const v = Number(r.eColi);
      if (!Number.isFinite(v)) return;
      const cur = by.get(site) || { sum: 0, n: 0 };
      cur.sum += v; cur.n += 1;
      by.set(site, cur);
    });
    return [...by.entries()]
      .map(([site, { sum, n }]) => ({ site, value: sum / (n || 1) }))
      .sort((a, b) => b.value - a.value);
  }, [rows]);

  // Latest chloride (for gauge)
  const chlorideLatest = useMemo(() => {
    const list = rows
      .filter((r) => r.chloride != null && r.date)
      .map((r) => ({ t: parseDate(r.date), v: Number(r.chloride) }))
      .filter((p) => p.t && Number.isFinite(p.v))
      .sort((a, b) => b.t - a.t);
    return list[0]?.v ?? null;
  }, [rows]);

  // Nitrate simple average
  const nitrateAvg = useMemo(() => {
    const vals = rows.map((r) => Number(r.nitrate)).filter(Number.isFinite);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  }, [rows]);

  // SVG helpers
  const makeLinePath = (values, w = 360, h = 120, pad = 12) => {
    if (!values?.length) return '';
    const minV = Math.min(...values);
    const maxV = Math.max(...values);
    const sx = (i) => pad + (i * (w - 2 * pad)) / Math.max(1, values.length - 1);
    const sy = (v) => h - pad - ((v - minV) * (h - 2 * pad)) / Math.max(1, maxV - minV);
    return values.map((v, i) => `${i === 0 ? 'M' : 'L'} ${sx(i)} ${sy(v)}`).join(' ');
  };
  const chlValues = chlSeries.map((p) => p.v);
  const chlPath = makeLinePath(chlValues);

  const maxBar = Math.max(1, ...eColiBySite.map((d) => d.value));
  const barHeight = (v) => 12 + (v / maxBar) * 160;

  // Gauge math
  const gauge = (() => {
    const min = 0, max = 400; // demo scale; adjust to your ranges
    const pct = chlorideLatest == null ? 0 : Math.max(0, Math.min(1, chlorideLatest / max));
    const start = Math.PI, end = 0;
    const angle = start + (end - start) * pct;
    const r = 60, cx = 80, cy = 80;
    return { cx, cy, r, x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  })();

  if (loading) return <div className="text-center py-12 animate-pulse">Loading statistics…</div>;

  return (
    <div className="space-y-8">
      {/* table preview (keeps keys) */}
      <section className="rounded-2xl border bg-white p-4">
        <h3 className="text-lg font-bold mb-3">Sample rows (with keys)</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-gray-600">
              <tr>
                <th className="py-2 pr-4">key</th>
                <th className="py-2 pr-4">date</th>
                <th className="py-2 pr-4">site</th>
                <th className="py-2 pr-4">eColi</th>
                <th className="py-2 pr-4">nitrate</th>
                <th className="py-2 pr-4">chlorophyll</th>
                <th className="py-2 pr-4">chloride</th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 8).map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="py-2 pr-4 font-mono text-xs">{r.id}</td>
                  <td className="py-2 pr-4">{String(r.date ?? '')}</td>
                  <td className="py-2 pr-4">{String(r.site ?? '')}</td>
                  <td className="py-2 pr-4">{r.eColi ?? ''}</td>
                  <td className="py-2 pr-4">{r.nitrate ?? ''}</td>
                  <td className="py-2 pr-4">{r.chlorophyll ?? ''}</td>
                  <td className="py-2 pr-4">{r.chloride ?? ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* chlorophyll line */}
      <section className="rounded-2xl border bg-white p-6">
        <h4 className="text-lg font-bold mb-4">Chlorophyll (µg/L) – Trend</h4>
        <svg viewBox="0 0 380 140" className="w-full h-40">
          <line x1="12" y1="128" x2="368" y2="128" stroke="#e5e7eb" strokeWidth="1" />
          <line x1="12" y1="12"  x2="12"  y2="128" stroke="#e5e7eb" strokeWidth="1" />
          <path d={`${chlPath} L 368 128 L 12 128 Z`} fill="rgba(34,197,94,0.12)" />
          <path d={chlPath} fill="none" stroke="rgb(34,197,94)" strokeWidth="2.5" />
        </svg>
      </section>

      {/* E.coli by site bars */}
      <section className="rounded-2xl border bg-white p-6">
        <h4 className="text-lg font-bold mb-4">E.coli by Site (avg CFU/100ml)</h4>
        <div className="grid grid-cols-12 gap-4 items-end h-48">
          {eColiBySite.map((s) => (
            <div key={s.site} className="col-span-3 flex flex-col items-center">
              <div
                className="w-8 rounded-t-lg bg-gradient-to-t from-cyan-600 to-blue-400"
                style={{ height: `${barHeight(s.value)}px` }}
                title={`${s.site}: ${s.value.toFixed(1)}`}
              />
              <span className="text-xs text-gray-600 mt-2">{s.site}</span>
              <span className="text-xs font-semibold text-gray-800">
                {s.value.toFixed(1)}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Chloride gauge */}
      <section className="rounded-2xl border bg-white p-6">
        <h4 className="text-lg font-bold mb-4">Chloride (mg/L) – Latest</h4>
        <div className="flex items-center justify-center">
          <svg viewBox="0 0 160 100" className="w-52 h-32">
            <path d="M20 80 A60 60 0 0 1 140 80" fill="none" stroke="#e5e7eb" strokeWidth="12" strokeLinecap="round" />
            <path d="M20 80 A60 60 0 0 1 140 80" fill="none" stroke="#60a5fa" strokeWidth="12" strokeLinecap="round"
                  strokeDasharray="180"
                  strokeDashoffset={chlorideLatest == null ? 180 : Math.max(0, 180 - (chlorideLatest / 400) * 180)} />
            <circle cx={gauge.cx} cy={gauge.cy} r="4" fill="#111827" />
            <line x1={gauge.cx} y1={gauge.cy} x2={gauge.x} y2={gauge.y} stroke="#111827" strokeWidth="3" strokeLinecap="round" />
            <text x="80" y="95" textAnchor="middle" className="fill-gray-700" fontSize="12">
              {chlorideLatest == null ? '—' : `${chlorideLatest.toFixed(0)} mg/L`}
            </text>
          </svg>
        </div>
      </section>
    </div>
  );
};

export default Graphs;
