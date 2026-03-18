import { useParams, useNavigate } from 'react-router-dom';
import { SKYLIFE_DATA } from '@/lib/data';
import { useAppState } from '@/hooks/useAppState';
import { statusLabel } from '@/lib/helpers';
import { DB } from '@/lib/db';
import { capturePhoto, pickFromGallery } from '@/lib/camera';
import { useEffect, useState } from 'react';

export default function RoomDetailPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { statuses, photoIds, refresh } = useAppState();
  const room = SKYLIFE_DATA.rooms.find(r => r.id === roomId);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!room) return;
    room.racks.forEach(rack => {
      if (photoIds.has(rack.id)) {
        DB.getPhoto(rack.id).then(b64 => {
          if (b64) setThumbs(prev => ({ ...prev, [rack.id]: b64 }));
        });
      }
    });
  }, [room, photoIds]);

  if (!room) return <div className="p-4 text-muted-foreground">장비실을 찾을 수 없습니다</div>;

  const unregCount = room.racks.filter(r => !photoIds.has(r.id)).length;

  const handleBulkRegister = async () => {
    const unreg = room.racks.filter(r => !photoIds.has(r.id));
    for (const rack of unreg) {
      const b64 = await capturePhoto();
      if (b64) {
        await DB.savePhoto(rack.id, b64);
      }
    }
    refresh();
  };

  return (
    <div className="pb-24">
      {/* Unregistered banner */}
      {unregCount > 0 ? (
        <div className="mx-4 mt-4 p-4 rounded-[var(--radius)] bg-card border border-border">
          <div className="font-semibold">📷 미등록 사진 {unregCount}개</div>
          <div className="text-xs text-muted-foreground mt-1">앱에서 바로 촬영할 수 있습니다</div>
          <button onClick={handleBulkRegister} className="mt-3 w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm">
            등록 시작
          </button>
        </div>
      ) : (
        <div className="mx-4 mt-4 p-4 rounded-[var(--radius)] bg-card border border-border text-center">
          <span className="text-sm">✅ 모든 랙 사진 등록 완료</span>
        </div>
      )}

      {/* Rack List */}
      <div className="mt-4">
        {room.racks.map(rack => {
          const status = statuses[rack.id] || 'normal';
          const hasPhoto = photoIds.has(rack.id);
          const badgeClass = status === 'normal' ? 'bg-green-500/15 text-green-400' 
            : status === 'caution' ? 'bg-orange-500/15 text-orange-400' 
            : status === 'fault' ? 'bg-red-500/15 text-red-400' 
            : 'bg-gray-500/15 text-gray-400';

          return (
            <button
              key={rack.id}
              onClick={() => navigate(`/rack/${rack.id}`)}
              className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-border hover:bg-accent/30 transition-colors text-left"
            >
              {hasPhoto && thumbs[rack.id] ? (
                <img src={thumbs[rack.id]} className="w-[52px] h-[52px] rounded-xl object-cover border border-border flex-shrink-0" />
              ) : (
                <div className="w-[52px] h-[52px] rounded-xl bg-secondary border border-border flex items-center justify-center text-xl flex-shrink-0">🗄️</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] truncate">{rack.no} {rack.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeClass}`}>
                    {statusLabel(status)}
                  </span>
                  <span className="text-xs text-muted-foreground">{hasPhoto ? '📷' : '📷 미등록'}</span>
                </div>
              </div>
              <span className="text-muted-foreground text-sm">›</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
