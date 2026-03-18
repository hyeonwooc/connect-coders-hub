import { useParams, useNavigate } from 'react-router-dom';
import { DB, InspectionRecord } from '@/lib/db';
import { fmt } from '@/lib/helpers';
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function InspectionDetailPage() {
  const { recordId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [record, setRecord] = useState<InspectionRecord | null>(null);

  useEffect(() => {
    DB.getAllInspections().then(all => {
      const r = all.find(r => r.id === recordId);
      if (r) setRecord(r);
    });
  }, [recordId]);

  if (!record) return <div className="p-4 text-muted-foreground">로딩 중...</div>;

  const handleDelete = async () => {
    if (!confirm('이 점검 기록을 삭제하시겠습니까?')) return;
    await DB.deleteInspection(record.id);
    toast({ title: '삭제되었습니다' });
    navigate(`/rack/${record.rackId}`, { replace: true });
  };

  return (
    <div className="pb-24 space-y-4">
      {record.photoData && (
        <img src={record.photoData} className="w-full max-h-[260px] object-contain bg-black" />
      )}

      <div className="px-4 space-y-4">
        <div className="p-4 rounded-[var(--radius)] bg-card border border-border space-y-2">
          <Row label="일시" value={fmt(record.date)} />
          <Row label="점검자" value={record.inspector || '미입력'} />
          <Row label="랙" value={record.rackName} />
        </div>

        {record.notes && (
          <div className="p-4 rounded-[var(--radius)] bg-card border border-border">
            <div className="text-xs text-muted-foreground mb-1">비고</div>
            <div className="text-sm">{record.notes}</div>
          </div>
        )}

        {(record.hpaUnits || []).map((u, i) => (
          <div key={i} className="p-4 rounded-[var(--radius)] bg-card border border-border space-y-2">
            <div className="font-semibold text-sm">⚡ {u.unitName}</div>
            <Row label="State" value={u.lcd?.state || '-'} />
            <Row label="RF Output" value={`${u.lcd?.rfOutput || '-'} W`} />
            <Row label="Power Mode" value={u.lcd?.powerMode || '-'} />
            <hr className="border-border" />
            <Row label="RF Power" value={u.measurement?.rfPower != null ? `${u.measurement.rfPower} W` : '-'} />
            <Row label="UPC ATT" value={u.measurement?.upcAtt != null ? `${u.measurement.upcAtt} dB` : '-'} />
            <Row label="Helix Current" value={u.measurement?.helixCurrent != null ? `${u.measurement.helixCurrent} mA` : '-'} />
            <Row label="Reflected Power" value={u.measurement?.reflectedPower != null ? `${u.measurement.reflectedPower} W` : '-'} 
              alert={(u.measurement?.reflectedPower || 0) > 0} />
            <Row label="Temperature" value={u.measurement?.temperature != null ? `${u.measurement.temperature} °C` : '-'}
              alert={(u.measurement?.temperature || 0) > 70} />
          </div>
        ))}

        <button onClick={handleDelete} className="w-full py-3 rounded-[var(--radius)] bg-destructive text-destructive-foreground font-semibold text-sm">
          🗑️ 이 점검 삭제
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, alert = false }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${alert ? 'text-orange-400' : ''}`}>{value}</span>
    </div>
  );
}
