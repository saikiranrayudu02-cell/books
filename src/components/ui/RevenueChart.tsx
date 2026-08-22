'use client';
import { useState, useRef, useEffect } from 'react';
import { formatPrice } from '@/lib/utils';

interface ChartDataPoint {
  label: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

export default function RevenueChart({ data, loading = false }: RevenueChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // SVG dimensions
  const width = 600;
  const height = 220;
  const paddingLeft = 50;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  if (loading || !data || data.length === 0) {
    return (
      <div className="flex h-55 w-full items-center justify-center bg-(--color-bg-card) border border-(--color-border) rounded-2xl">
        {loading ? (
          <div className="flex flex-col items-center gap-3">
            <div className="size-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-(--color-text-muted)">Loading revenue graph...</span>
          </div>
        ) : (
          <span className="text-xs font-semibold text-(--color-text-muted)">No revenue data available</span>
        )}
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 100);

  // Generate points
  const points = data.map((d, i) => {
    const x = paddingLeft + (i / (data.length - 1 || 1)) * chartWidth;
    const y = paddingTop + chartHeight - (d.revenue / maxRevenue) * chartHeight;
    return { x, y, ...d, index: i };
  });

  // SVG Line path string
  let linePath = '';
  let areaPath = '';
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map((p) => `L ${p.x} ${p.y}`).join(' ');
    areaPath = `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`;
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Map client coordinates back to SVG space coordinates
    const svgX = (mouseX / rect.width) * width;
    
    // Find closest point by X coordinate
    let closestPoint = points[0];
    let minDiff = Math.abs(points[0].x - svgX);
    
    for (let i = 1; i < points.length; i++) {
      const diff = Math.abs(points[i].x - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestPoint = points[i];
      }
    }

    setHoveredIndex(closestPoint.index);

    // Calculate tooltip coordinates relative to parent container
    const tooltipX = (closestPoint.x / width) * rect.width;
    const tooltipY = (closestPoint.y / height) * rect.height;
    
    setTooltipPos({ x: tooltipX, y: tooltipY });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  // Generate Y axis ticks
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((pct) => ({
    val: maxRevenue * pct,
    y: paddingTop + chartHeight - pct * chartHeight,
  }));

  return (
    <div ref={containerRef} className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        className="overflow-visible select-none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <defs>
          <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.00" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines and Y labels */}
        {yTicks.map((tick, idx) => (
          <g key={idx}>
            <line
              x1={paddingLeft}
              y1={tick.y}
              x2={width - paddingRight}
              y2={tick.y}
              stroke="var(--color-border)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
            <text
              x={paddingLeft - 8}
              y={tick.y + 4}
              textAnchor="end"
              className="fill-(--color-text-light) text-[10px] font-bold"
            >
              {tick.val >= 1000 ? `₹${(tick.val / 1000).toFixed(0)}k` : `₹${tick.val.toFixed(0)}`}
            </text>
          </g>
        ))}

        {/* X labels */}
        {points.map((p, idx) => {
          // Show labels depending on item density to prevent text overlap
          const skipFactor = Math.ceil(data.length / 7) || 1;
          if (idx % skipFactor !== 0) return null;

          return (
            <text
              key={idx}
              x={p.x}
              y={height - paddingBottom + 16}
              textAnchor="middle"
              className="fill-(--color-text-light) text-[10px] font-bold"
            >
              {p.label}
            </text>
          );
        })}

        {/* Area fill */}
        {areaPath && (
          <path d={areaPath} fill="url(#chartGradient)" className="transition-all duration-300" />
        )}

        {/* Line path */}
        {linePath && (
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-300"
          />
        )}

        {/* Hover vertical guide line */}
        {hoveredIndex !== null && (
          <line
            x1={points[hoveredIndex].x}
            y1={paddingTop}
            x2={points[hoveredIndex].x}
            y2={paddingTop + chartHeight}
            stroke="#3b82f6"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
        )}

        {/* Data point circle markers */}
        {points.map((p, idx) => (
          <circle
            key={idx}
            cx={p.x}
            cy={p.y}
            r={hoveredIndex === idx ? 6 : 3.5}
            fill={hoveredIndex === idx ? "#3b82f6" : "var(--color-bg-card)"}
            stroke="#3b82f6"
            strokeWidth={2.5}
            className="transition-all duration-150 cursor-pointer"
          />
        ))}
      </svg>

      {/* Interactive Tooltip Card */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div
          className="absolute z-50 pointer-events-none p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-700/50 flex flex-col gap-1 -translate-x-1/2 -translate-y-[calc(100%+12px)] transition-all duration-75 text-xs"
          style={{
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
          }}
        >
          <span className="font-bold text-[10px] uppercase tracking-wider text-slate-400">
            {points[hoveredIndex].label}
          </span>
          <span className="font-extrabold text-sm text-blue-400">
            {formatPrice(points[hoveredIndex].revenue)}
          </span>
          <span className="text-slate-300 font-semibold">
            {points[hoveredIndex].orders} {points[hoveredIndex].orders === 1 ? 'order' : 'orders'}
          </span>
        </div>
      )}
    </div>
  );
}
