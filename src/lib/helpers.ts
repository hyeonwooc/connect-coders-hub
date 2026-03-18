export const statusLabel = (s: string) => 
  ({ normal: '✅ 정상', caution: '⚠️ 주의', fault: '🔴 불량', unknown: '❓ 미확인' }[s] || '❓');

export const statusVariant = (s: string) => 
  ({ normal: 'normal', caution: 'caution', fault: 'fault' }[s] || 'unknown') as string;

export const fmt = (ts: number) => 
  new Date(ts).toLocaleString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
