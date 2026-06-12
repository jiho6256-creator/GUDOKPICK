const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

// 서비스 id 기반으로 시드값 생성해 일관된 트렌드 데이터 만들기
function generateTrend(serviceId, baseScore) {
  const seed = serviceId * 37;
  return MONTHS.map((_, i) => {
    const noise = ((seed * (i + 1) * 13) % 20) - 10;
    const trend = i * (baseScore > 4 ? 1.5 : 0.8);
    return Math.max(20, Math.min(100, 40 + trend + noise));
  });
}

export default function UsageTrendChart({ serviceId, color, score }) {
  const data = generateTrend(serviceId, score);
  const W = 540, H = 120, PAD = { top: 10, right: 10, bottom: 24, left: 32 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const x = (i) => PAD.left + (i / (data.length - 1)) * innerW;
  const y = (v) => PAD.top + innerH - ((v - min) / range) * innerH;

  const linePath = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(v)}`).join(' ');
  const areaPath = `${linePath} L ${x(data.length - 1)} ${PAD.top + innerH} L ${x(0)} ${PAD.top + innerH} Z`;

  const gradId = `grad-${serviceId}`;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>사용량 추이 (2025)</span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>최근 12개월</span>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.5, 1].map((t, i) => (
          <line key={i}
            x1={PAD.left} y1={PAD.top + innerH * (1 - t)}
            x2={PAD.left + innerW} y2={PAD.top + innerH * (1 - t)}
            stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4"
          />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#${gradId})`} />

        {/* Line */}
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Dots + month labels */}
        {data.map((v, i) => (
          <g key={i}>
            <circle cx={x(i)} cy={y(v)} r="3.5" fill="#fff" stroke={color} strokeWidth="2" />
            {(i % 2 === 0) && (
              <text x={x(i)} y={H - 4} textAnchor="middle" fontSize="10" fill="var(--text-tertiary)">{MONTHS[i]}</text>
            )}
          </g>
        ))}

        {/* Y axis label */}
        <text x={PAD.left - 6} y={PAD.top + innerH} textAnchor="end" fontSize="10" fill="var(--text-tertiary)">낮음</text>
        <text x={PAD.left - 6} y={PAD.top + 4} textAnchor="end" fontSize="10" fill="var(--text-tertiary)">높음</text>
      </svg>
    </div>
  );
}
