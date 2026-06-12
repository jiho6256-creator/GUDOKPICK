function generateTrend(serviceId, score) {
  const seed = serviceId * 37;
  return Array.from({ length: 30 }, (_, i) => {
    const noise = ((seed * (i + 1) * 13) % 20) - 10;
    const trend = i * (score > 4 ? 1.2 : 0.6);
    return Math.max(10, Math.min(100, 40 + trend + noise));
  });
}

export default function Sparkline({ serviceId, score, width = 80, height = 32 }) {
  const data = generateTrend(serviceId, score);
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const x = (i) => (i / (data.length - 1)) * width;
  const y = (v) => height - ((v - min) / range) * (height - 4) - 2;

  const today = data[data.length - 1];
  const yesterday = data[data.length - 2];
  const color = today >= yesterday ? '#F0383A' : '#3B82F6';

  const linePath = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(' ');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <path d={linePath} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(data.length - 1)} cy={y(today)} r="2.2" fill={color} />
    </svg>
  );
}
