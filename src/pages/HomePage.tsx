import { useNavigate } from 'react-router-dom';
import { SKYLIFE_DATA } from '@/lib/data';
import { useAppState } from '@/hooks/useAppState';

export default function HomePage() {
  const navigate = useNavigate();
  const { statuses, photoIds, loading } = useAppState();

  if (loading) return <div className="flex items-center justify-center h-full"><span className="text-muted-foreground">로딩 중...</span></div>;

  const totalRacks = SKYLIFE_DATA.rooms.reduce((s, r) => s + r.racks.length, 0);
  const photoCount = photoIds.size;
  const faultCount = Object.values(statuses).filter(s => s === 'fault').length;
  const cautionCount = Object.values(statuses).filter(s => s === 'caution').length;

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard icon="🗄️" label="전체 랙" value={`${totalRacks}개`} color="hsl(var(--skylife-cyan))" />
        <SummaryCard icon="📷" label="사진 등록" value={`${photoCount}/${totalRacks}`} color="#a855f7" />
        <SummaryCard icon="⚠️" label="주의" value={`${cautionCount}개`} color="hsl(var(--skylife-orange))" />
        <SummaryCard icon="🔴" label="불량" value={`${faultCount}개`} color="hsl(var(--skylife-red))" />
      </div>

      {/* Room Selection */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">장비실 선택</h2>
        <div className="space-y-2">
          {SKYLIFE_DATA.rooms.map(room => {
            const reg = room.racks.filter(r => photoIds.has(r.id)).length;
            const total = room.racks.length;
            return (
              <button
                key={room.id}
                onClick={() => navigate(`/room/${room.id}`)}
                className="w-full flex items-center gap-3 p-4 rounded-[var(--radius)] bg-card border border-border hover:bg-accent/50 transition-colors"
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl" style={{ background: `${room.color}20` }}>
                  {room.icon}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="font-semibold text-[15px]">{room.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">랙 {total}개 · 사진 {reg}/{total}</div>
                </div>
                <span className="text-muted-foreground text-sm">›</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">빠른 액션</h2>
        <div className="flex gap-3">
          <button onClick={() => navigate('/scan')} className="flex-1 py-3.5 rounded-[var(--radius)] bg-primary text-primary-foreground font-semibold text-[15px]">
            📷 QR 스캔
          </button>
          <button onClick={() => navigate('/floorplan')} className="flex-1 py-3.5 rounded-[var(--radius)] bg-secondary text-secondary-foreground font-semibold text-[15px] border border-border">
            🗺️ 도면 보기
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div className="p-4 rounded-[var(--radius)] bg-card border border-border">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-bold mt-1" style={{ color }}>{value}</div>
    </div>
  );
}
