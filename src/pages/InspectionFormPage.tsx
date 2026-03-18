import { useParams, useNavigate } from 'react-router-dom';
import { findRack } from '@/lib/data';
import { DB, InspectionRecord, HpaUnit } from '@/lib/db';
import { capturePhoto } from '@/lib/camera';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function InspectionFormPage() {
  const { rackId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const found = findRack(rackId || '');

  const rack = found?.rack;
  const isHPA = rack?.isHPA === true;

  const [photoData, setPhotoData] = useState<string | null>(null);
  const [inspector, setInspector] = useState('');
  const [notes, setNotes] = useState('');
  const [units, setUnits] = useState<HpaUnit[]>(
    isHPA
      ? [
          { unitName: 'HPA#1 (M)', lcd: { state: 'TRANSMIT', rfOutput: '', powerMode: 'MANUAL' }, measurement: {} },
          { unitName: 'HPA#2 (B)', lcd: { state: 'TRANSMIT', rfOutput: '', powerMode: 'MANUAL' }, measurement: {} },
        ]
      : [{ unitName: rack?.no || '', lcd: { state: 'TRANSMIT', rfOutput: '', powerMode: 'MANUAL' }, measurement: {} }]
  );

  if (!found || !rack) return <div className="p-4 text-muted-foreground">랙을 찾을 수 없습니다</div>;

  const handleCapture = async () => {
    const b64 = await capturePhoto();
    if (b64) setPhotoData(b64);
  };

  const updateUnit = (idx: number, path: string, value: string) => {
    setUnits(prev => {
      const next = [...prev];
      const u = { ...next[idx] };
      const [section, field] = path.split('.');
      if (section === 'lcd') u.lcd = { ...u.lcd, [field]: value };
      else if (section === 'measurement') u.measurement = { ...u.measurement, [field]: parseFloat(value) || 0 };
      next[idx] = u;
      return next;
    });
  };

  const handleSave = async () => {
    const record: InspectionRecord = {
      id: crypto.randomUUID(),
      rackId: rackId!,
      rackName: rack.name,
      date: Date.now(),
      inspector,
      notes,
      photoData,
      hpaUnits: units,
    };
    await DB.saveInspection(record);
    toast({ title: '✅ 점검이 저장되었습니다' });
    navigate(`/rack/${rackId}`, { replace: true });
  };

  const measureFields = [
    { key: 'rfPower', label: 'RF Power', unit: 'W' },
    { key: 'upcAtt', label: 'UPC ATT', unit: 'dB' },
    { key: 'helixCurrent', label: 'Helix Current', unit: 'mA' },
    { key: 'reflectedPower', label: 'Reflected Power', unit: 'W' },
    { key: 'temperature', label: 'Temperature', unit: '°C' },
  ];

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Photo */}
      <div className="p-4 rounded-[var(--radius)] bg-card border border-border">
        <div className="text-xs text-muted-foreground mb-3">점검 사진</div>
        <button onClick={handleCapture} className="w-full">
          {photoData ? (
            <img src={photoData} className="w-full max-h-[200px] object-contain rounded-xl" />
          ) : (
            <div className="flex flex-col items-center py-10 rounded-xl border-2 border-dashed border-border">
              <span className="text-4xl">📷</span>
              <span className="text-sm text-muted-foreground mt-2">탭하여 현재 상태 촬영</span>
            </div>
          )}
        </button>
      </div>

      {/* HPA Units */}
      {units.map((u, i) => (
        <div key={i} className="p-4 rounded-[var(--radius)] bg-card border border-border space-y-3">
          <div className="font-semibold text-sm">⚡ {u.unitName}</div>

          {/* LCD State */}
          <div>
            <div className="text-xs text-muted-foreground mb-2">LCD 화면 상태</div>
            <div className="text-xs text-muted-foreground mb-1">State</div>
            <div className="flex rounded-xl bg-secondary border border-border overflow-hidden">
              {['TRANSMIT', 'STANDBY', 'FAULT'].map(v => (
                <button key={v} onClick={() => updateUnit(i, 'lcd.state', v)}
                  className={`flex-1 py-2 text-xs font-semibold ${u.lcd.state === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">RF Output (W)</div>
            <input value={u.lcd.rfOutput} onChange={e => updateUnit(i, 'lcd.rfOutput', e.target.value)}
              className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary" placeholder="0" />
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-1">Power Mode</div>
            <div className="flex rounded-xl bg-secondary border border-border overflow-hidden">
              {['MANUAL', 'AUTO'].map(v => (
                <button key={v} onClick={() => updateUnit(i, 'lcd.powerMode', v)}
                  className={`flex-1 py-2 text-xs font-semibold ${u.lcd.powerMode === v ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-border" />

          <div className="text-xs text-muted-foreground mb-2">점검 측정값</div>
          {measureFields.map(f => (
            <div key={f.key} className="flex items-center gap-3">
              <span className="text-sm flex-1">{f.label}<span className="text-muted-foreground ml-1">{f.unit}</span></span>
              <input onChange={e => updateUnit(i, `measurement.${f.key}`, e.target.value)}
                className="w-24 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-foreground text-right focus:outline-none focus:border-primary" 
                type="number" placeholder="0" />
            </div>
          ))}
        </div>
      ))}

      {/* Inspector */}
      <div className="p-4 rounded-[var(--radius)] bg-card border border-border space-y-3">
        <div className="text-xs text-muted-foreground">점검자 정보</div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">점검자 이름</div>
          <input value={inspector} onChange={e => setInspector(e.target.value)}
            className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">비고 / 특이사항</div>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            className="w-full bg-secondary border border-border rounded-xl px-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-primary resize-none" />
        </div>
      </div>

      <button onClick={handleSave} className="w-full py-3.5 rounded-[var(--radius)] bg-primary text-primary-foreground font-semibold text-[15px]">
        💾 점검 저장
      </button>
    </div>
  );
}
