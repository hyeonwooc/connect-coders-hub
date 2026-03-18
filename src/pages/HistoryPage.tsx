import { useNavigate } from 'react-router-dom';
import { DB, InspectionRecord } from '@/lib/db';
import { fmt } from '@/lib/helpers';
import { useEffect, useState } from 'react';

export default function HistoryPage() {
  const navigate = useNavigate();
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DB.getAllInspections().then(r => { setRecords(r); setLoading(false); });
  }, []);

  if (loading) return <div className="flex items-center justify-center h-full"><span className="text-muted-foreground">로딩 중...</span></div>;

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <span className="text-5xl opacity-40">📋</span>
        <p className="text-muted-foreground">점검 이력이 없습니다</p>
        <p className="text-xs text-muted-foreground">랙 상세에서 점검을 입력하세요</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {records.map(r => (
        <button
          key={r.id}
          onClick={() => navigate(`/inspection/${r.id}`)}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-border hover:bg-accent/30 transition-colors text-left"
        >
          {r.photoData ? (
            <img src={r.photoData} className="w-[52px] h-[52px] rounded-xl object-cover border border-border flex-shrink-0" />
          ) : (
            <div className="w-[52px] h-[52px] rounded-xl bg-secondary border border-border flex items-center justify-center text-xl flex-shrink-0">📋</div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs text-muted-foreground">{fmt(r.date)}</div>
            <div className="text-sm font-semibold truncate">{r.rackName}</div>
            <div className="text-xs text-muted-foreground">{r.inspector || '점검자 미입력'}</div>
          </div>
          <span className="text-muted-foreground text-sm">›</span>
        </button>
      ))}
    </div>
  );
}
