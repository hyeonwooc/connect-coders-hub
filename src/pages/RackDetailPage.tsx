import { useParams, useNavigate } from 'react-router-dom';
import { findRack } from '@/lib/data';
import { useAppState } from '@/hooks/useAppState';
import { statusLabel, fmt } from '@/lib/helpers';
import { DB, InspectionRecord } from '@/lib/db';
import { capturePhoto, pickFromGallery } from '@/lib/camera';
import { useEffect, useState } from 'react';

export default function RackDetailPage() {
  const { rackId } = useParams();
  const navigate = useNavigate();
  const { statuses, photoIds, refresh } = useAppState();
  const [photo, setPhoto] = useState<string | null>(null);
  const [records, setRecords] = useState<InspectionRecord[]>([]);
  const found = findRack(rackId || '');

  useEffect(() => {
    if (!rackId) return;
    DB.getPhoto(rackId).then(setPhoto);
    DB.getInspections(rackId).then(setRecords);
  }, [rackId]);

  if (!found) return <div className="p-4 text-muted-foreground">랙을 찾을 수 없습니다</div>;
  const { room, rack } = found;
  const status = statuses[rackId!] || 'normal';

  const handlePhotoRegister = async () => {
    const b64 = await capturePhoto();
    if (b64) {
      await DB.savePhoto(rackId!, b64);
      setPhoto(b64);
      refresh();
    }
  };

  const handleSetStatus = async (s: string) => {
    await DB.setRackStatus(rackId!, s);
    refresh();
  };

  const badgeClass = (s: string) => s === 'normal' ? 'bg-green-500/15 text-green-400' 
    : s === 'caution' ? 'bg-orange-500/15 text-orange-400' 
    : s === 'fault' ? 'bg-red-500/15 text-red-400' : 'bg-gray-500/15 text-gray-400';

  return (
    <div className="pb-24 space-y-4">
      {/* Photo */}
      <div className="relative">
        {photo ? (
          <img src={photo} className="w-full max-h-[260px] object-contain bg-black rounded-b-[var(--radius)]" />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 bg-card">
            <span className="text-5xl opacity-40">📷</span>
            <span className="text-muted-foreground text-sm mt-2">사진 미등록</span>
          </div>
        )}
      </div>

      <div className="px-4 space-y-4">
        {/* Status & Info */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badgeClass(status)}`}>
            {statusLabel(status)}
          </span>
          <span className="text-xs text-muted-foreground">{rack.row} · 장비 {rack.equipments.length}개</span>
        </div>

        <button onClick={handlePhotoRegister} className="w-full py-3 rounded-[var(--radius)] bg-primary text-primary-foreground font-semibold text-sm">
          {photo ? '📷 재촬영' : '📷 사진 등록'}
        </button>

        {/* Rack Name */}
        <div className="p-4 rounded-[var(--radius)] bg-card border border-border">
          <div className="text-xs text-muted-foreground mb-1">랙 이름</div>
          <div className="font-semibold">{rack.name}</div>
        </div>

        {/* Status Change */}
        <div className="p-4 rounded-[var(--radius)] bg-card border border-border">
          <div className="text-xs text-muted-foreground mb-3">상태 변경</div>
          <div className="flex rounded-xl bg-secondary border border-border overflow-hidden">
            {['normal', 'caution', 'fault'].map(s => (
              <button
                key={s}
                onClick={() => handleSetStatus(s)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  status === s ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                }`}
              >
                {statusLabel(s)}
              </button>
            ))}
          </div>
        </div>

        {/* Equipments */}
        <div className="p-4 rounded-[var(--radius)] bg-card border border-border">
          <div className="text-xs text-muted-foreground mb-3">수납 장비 ({rack.equipments.length}개)</div>
          <div className="space-y-2">
            {rack.equipments.sort((a, b) => b.u - a.u).map((eq, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-0.5 rounded">U{eq.u}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{eq.name}</div>
                  {eq.model && <div className="text-xs text-muted-foreground">{eq.model}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inspection History */}
        <div className="p-4 rounded-[var(--radius)] bg-card border border-border">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">점검 이력</span>
            <button onClick={() => navigate(`/inspect/${rackId}`)} className="text-xs text-primary font-semibold">+ 새 점검</button>
          </div>
          {records.length === 0 ? (
            <div className="flex flex-col items-center py-8 gap-2">
              <span className="text-4xl opacity-40">📋</span>
              <span className="text-muted-foreground text-sm">점검 이력이 없습니다</span>
            </div>
          ) : (
            <div className="space-y-2">
              {records.map(r => (
                <button
                  key={r.id}
                  onClick={() => navigate(`/inspection/${r.id}`)}
                  className="w-full flex items-center gap-3 py-3 border-b border-border last:border-0 text-left hover:bg-accent/30 transition-colors"
                >
                  {r.photoData ? (
                    <img src={r.photoData} className="w-[52px] h-[52px] rounded-xl object-cover border border-border flex-shrink-0" />
                  ) : (
                    <div className="w-[52px] h-[52px] rounded-xl bg-secondary border border-border flex items-center justify-center text-xl flex-shrink-0">📋</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground">{fmt(r.date)}</div>
                    <div className="text-sm">{r.inspector || '점검자 미입력'}</div>
                  </div>
                  <span className="text-muted-foreground text-sm">›</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
