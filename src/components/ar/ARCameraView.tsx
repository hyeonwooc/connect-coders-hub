import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room, Rack } from '@/lib/data';
import { DB, InspectionRecord } from '@/lib/db';
import { fmt } from '@/lib/helpers';

interface NearbyRack {
  rack: Rack;
  distance: number;
  angle: number;
}

const STATUS_LABEL: Record<string, string> = {
  normal: '정상', caution: '주의', fault: '고장', unknown: '미확인'
};

const STATUS_CLASS: Record<string, string> = {
  normal: 'badge-normal', caution: 'badge-caution', fault: 'badge-fault', unknown: 'badge-unknown'
};

const STATUS_COLOR: Record<string, string> = {
  normal: '#22c55e', caution: '#f59e0b', fault: '#ef4444', unknown: '#6b7280'
};

const MAX_DISTANCE = 8;
const CAMERA_FOV = 70;
// 낮을수록 부드럽지만 반응이 느림 (0.1~0.2 권장)
const HEADING_SMOOTH = 0.15;

interface Props {
  room: Room;
  userX: number;
  userZ: number;
  statuses: Record<string, string>;
  onBack: () => void;
}

interface SelectedRack {
  rack: Rack;
  distance: number;
}

// ─── 미니맵 ──────────────────────────────────────────────
interface MinimapProps {
  room: Room;
  userX: number;
  userZ: number;
  effectiveHeading: number;
  statuses: Record<string, string>;
}

function MinimapOverlay({ room, userX, userZ, effectiveHeading, statuses }: MinimapProps) {
  const MMAP_W = 140;
  const PAD = 8;
  const scale = (MMAP_W - PAD * 2) / room.floorW;
  const MMAP_H = Math.round(room.floorD * scale) + PAD * 2;

  const toX = (x: number) => PAD + x * scale;
  const toY = (z: number) => PAD + z * scale;

  // 사용자 위치 (도면 범위 클램핑)
  const ux = toX(Math.max(0, Math.min(room.floorW, userX)));
  const uz = toY(Math.max(0, Math.min(room.floorD, userZ)));

  // 시야각 콘 (heading 기준 FOV/2 양쪽)
  const coneLen = 26;
  const headRad = (effectiveHeading * Math.PI) / 180;
  const fovRad = (CAMERA_FOV / 2) * Math.PI / 180;
  const lx = ux + Math.sin(headRad - fovRad) * coneLen;
  const ly = uz + Math.cos(headRad - fovRad) * coneLen;
  const rx = ux + Math.sin(headRad + fovRad) * coneLen;
  const ry = uz + Math.cos(headRad + fovRad) * coneLen;

  // 방향 화살표 끝점
  const ax = ux + Math.sin(headRad) * 16;
  const ay = uz + Math.cos(headRad) * 16;

  const rackW = Math.max(0.45 * scale, 3);
  const rackH = Math.max(0.85 * scale, 3);

  return (
    <div
      className="absolute top-20 right-3 rounded-xl overflow-hidden border border-white/20 pointer-events-none"
      style={{ background: 'rgba(10, 16, 28, 0.88)', backdropFilter: 'blur(8px)' }}
    >
      <div className="px-2.5 py-1 text-[9px] text-white/40 font-semibold tracking-wider border-b border-white/10 uppercase">
        {room.name}
      </div>
      <svg width={MMAP_W} height={MMAP_H} style={{ display: 'block' }}>
        {/* 랙 */}
        {room.racks.map(rack => {
          const col = STATUS_COLOR[statuses[rack.id] || 'normal'];
          return (
            <rect
              key={rack.id}
              x={toX(rack.x)}
              y={toY(rack.z)}
              width={rackW}
              height={rackH}
              rx={1}
              fill={col + '33'}
              stroke={col}
              strokeWidth={1}
            />
          );
        })}

        {/* FOV 콘 */}
        <path
          d={`M ${ux} ${uz} L ${lx} ${ly} L ${rx} ${ry} Z`}
          fill="rgba(255,255,255,0.07)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={0.5}
        />

        {/* 방향 화살표 */}
        <line
          x1={ux} y1={uz}
          x2={ax} y2={ay}
          stroke="white"
          strokeWidth={1.5}
          strokeLinecap="round"
        />

        {/* 사용자 위치 */}
        <circle cx={ux} cy={uz} r={3.5} fill="#60a5fa" />
        <circle cx={ux} cy={uz} r={6} fill="none" stroke="#60a5fa" strokeWidth={0.8} opacity={0.5} />
      </svg>
    </div>
  );
}

// ─── 랙 상세 모달 ─────────────────────────────────────────
interface RackModalProps {
  rack: Rack;
  distance: number;
  status: string;
  inspections: InspectionRecord[];
  loading: boolean;
  onClose: () => void;
  onNavigate: () => void;
  onInspect: () => void;
}

function RackModal({ rack, distance, status, inspections, loading, onClose, onNavigate, onInspect }: RackModalProps) {
  const lastInspection = inspections[0];
  const topEquipments = [...rack.equipments].sort((a, b) => b.u - a.u).slice(0, 3);

  return (
    <>
      {/* 백드롭 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* 바텀 시트 */}
      <div className="absolute bottom-0 left-0 right-0 bg-card rounded-t-2xl border-t border-border animate-in slide-in-from-bottom duration-300">
        {/* 핸들 */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        <div className="px-5 pb-8 space-y-4">
          {/* 헤더 */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-lg font-bold">{rack.no}</div>
              <div className="text-sm text-muted-foreground leading-snug truncate">{rack.name}</div>
            </div>
            <button onClick={onClose} className="text-muted-foreground text-lg leading-none p-1 flex-shrink-0">
              ✕
            </button>
          </div>

          {/* 상태 + 거리 */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`badge ${STATUS_CLASS[status]}`}>{STATUS_LABEL[status]}</span>
            <span className="text-sm text-muted-foreground">📡 {distance.toFixed(1)}m</span>
            <span className="text-sm text-muted-foreground">🖥️ 장비 {rack.equipments.length}개</span>
          </div>

          {/* 최근 점검 */}
          <div className="bg-secondary/50 rounded-xl p-3">
            <div className="text-xs text-muted-foreground mb-1.5">최근 점검</div>
            {loading ? (
              <div className="text-sm text-muted-foreground">불러오는 중...</div>
            ) : lastInspection ? (
              <div>
                <div className="text-sm font-medium">{lastInspection.inspector || '점검자 미입력'}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{fmt(lastInspection.date)}</div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">점검 이력 없음</div>
            )}
          </div>

          {/* 주요 장비 */}
          {topEquipments.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs text-muted-foreground">주요 장비</div>
              {topEquipments.map((eq, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[10px] font-mono bg-primary/20 text-primary px-1.5 py-0.5 rounded flex-shrink-0">
                    U{eq.u}
                  </span>
                  <span className="text-sm truncate text-foreground/80">{eq.name}</span>
                </div>
              ))}
              {rack.equipments.length > 3 && (
                <div className="text-xs text-muted-foreground pl-0.5">
                  + {rack.equipments.length - 3}개 더...
                </div>
              )}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onInspect}
              className="flex-1 py-3 rounded-xl bg-secondary text-foreground font-semibold text-sm"
            >
              📋 점검하기
            </button>
            <button
              onClick={onNavigate}
              className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
            >
              상세보기 →
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── 메인 컴포넌트 ────────────────────────────────────────
export default function ARCameraView({ room, userX, userZ, statuses, onBack }: Props) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number>(0);
  const [hasOrientation, setHasOrientation] = useState(false);
  const [calibrationHeading, setCalibrationHeading] = useState<number | null>(null);
  const [selectedRack, setSelectedRack] = useState<SelectedRack | null>(null);
  const [rackInspections, setRackInspections] = useState<InspectionRecord[]>([]);
  const [loadingInspections, setLoadingInspections] = useState(false);

  // 근처 랙 계산
  const nearbyRacks: NearbyRack[] = room.racks.map(rack => {
    const dx = rack.x - userX;
    const dz = rack.z - userZ;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const rawAngle = Math.atan2(dx, dz) * (180 / Math.PI);
    const angle = ((rawAngle % 360) + 360) % 360;
    return { rack, distance, angle };
  }).filter(r => r.distance <= MAX_DISTANCE && r.distance > 0.3)
    .sort((a, b) => a.distance - b.distance);

  // 카메라 시작
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    let cancelled = false;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();
      } catch (err: any) {
        setError(err.message);
      }
    })();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // 방향 센서 (circular exponential smoothing 적용)
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      if (e.alpha === null) return;
      const raw = e.alpha;
      setHasOrientation(true);
      setHeading(prev => {
        // 0-360 경계 처리: 최단 경로로 보간
        const diff = ((raw - prev + 540) % 360) - 180;
        return ((prev + diff * HEADING_SMOOTH) + 360) % 360;
      });
    };

    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') window.addEventListener('deviceorientation', handler, true);
        })
        .catch(() => {});
    } else {
      window.addEventListener('deviceorientation', handler, true);
    }

    return () => window.removeEventListener('deviceorientation', handler, true);
  }, []);

  // 랙 선택 시 점검 이력 로드
  useEffect(() => {
    if (!selectedRack) { setRackInspections([]); return; }
    setLoadingInspections(true);
    DB.getInspections(selectedRack.rack.id).then(records => {
      setRackInspections(records);
      setLoadingInspections(false);
    });
  }, [selectedRack]);

  const calibrate = useCallback(() => {
    setCalibrationHeading(heading);
  }, [heading]);

  const effectiveHeading = calibrationHeading !== null
    ? ((heading - calibrationHeading) % 360 + 360) % 360
    : heading;

  const getRackScreenX = (rackAngle: number) => {
    let diff = rackAngle - effectiveHeading;
    while (diff > 180) diff -= 360;
    while (diff < -180) diff += 360;
    if (Math.abs(diff) > CAMERA_FOV / 2 + 15) return null;
    const x = 50 + (diff / (CAMERA_FOV / 2)) * 50;
    return Math.max(5, Math.min(95, x));
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <span className="text-5xl">🚫</span>
        <p className="text-muted-foreground text-center">카메라에 접근할 수 없습니다</p>
        <p className="text-xs text-muted-foreground">{error}</p>
        <button onClick={onBack} className="px-6 py-2.5 rounded-[var(--radius)] bg-primary text-primary-foreground font-semibold text-sm">
          뒤로가기
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />

      {/* AR 랙 오버레이 */}
      {nearbyRacks.map(({ rack, distance, angle }) => {
        const screenX = getRackScreenX(angle);
        if (screenX === null) return null;

        const st = statuses[rack.id] || 'normal';
        const scale = Math.max(0.6, Math.min(1.2, 3 / distance));
        const screenY = Math.max(15, Math.min(75, 30 + (distance / MAX_DISTANCE) * 40));

        return (
          <div
            key={rack.id}
            className="absolute pointer-events-auto cursor-pointer animate-in fade-in duration-300"
            style={{
              left: `${screenX}%`,
              top: `${screenY}%`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              zIndex: Math.round(100 - distance * 10),
            }}
            onClick={() => setSelectedRack({ rack, distance })}
          >
            <div className="absolute top-full left-1/2 w-[2px] h-8 bg-primary/40 -translate-x-1/2" />
            <div
              className="w-[160px] bg-card/90 backdrop-blur-md border border-border rounded-xl p-3"
              style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.6))' }}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">🖥️</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-foreground truncate">{rack.no}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{rack.name}</div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">{distance.toFixed(1)}m</span>
                <span className={`badge text-[10px] ${STATUS_CLASS[st]}`}>
                  {STATUS_LABEL[st]}
                </span>
              </div>
              <div className="mt-1.5 text-center">
                <span className="text-[9px] text-primary font-semibold">탭하여 상세보기 →</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* 시야각 내 랙 없을 때 안내 */}
      {nearbyRacks.every(({ angle }) => getRackScreenX(angle) === null) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-black/60 backdrop-blur-sm px-5 py-3 rounded-full flex items-center gap-2">
            <span className="text-lg">🔄</span>
            <span className="text-white text-sm font-medium">
              카메라를 돌려 주변 장비를 찾아보세요
            </span>
          </div>
          <div className="mt-2 text-[11px] text-white/50">
            {nearbyRacks.length}개 장비가 {MAX_DISTANCE}m 내에 있습니다
          </div>
        </div>
      )}

      {/* 상단 바 */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-white text-xs font-semibold">AR 위치모드</span>
        </div>
        <div className="flex items-center gap-2">
          {!hasOrientation && (
            <div className="bg-orange-500/80 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <span className="text-white text-[10px] font-semibold">자이로 미지원</span>
            </div>
          )}
          <div className="bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
            <span className="text-white text-xs font-mono">{Math.round(effectiveHeading)}°</span>
          </div>
        </div>
      </div>

      {/* 미니맵 */}
      <MinimapOverlay
        room={room}
        userX={userX}
        userZ={userZ}
        effectiveHeading={effectiveHeading}
        statuses={statuses}
      />

      {/* 방향 보정 버튼 */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
        <button
          onClick={calibrate}
          className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"
        >
          <span>🧭</span>
          {calibrationHeading === null ? '방향 보정하기' : '방향 재보정'}
        </button>
      </div>

      {/* 뒤로가기 */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={onBack}
          className="bg-card/80 backdrop-blur-sm text-foreground px-5 py-2 rounded-full text-sm font-semibold border border-border"
        >
          ← 위치 다시 선택
        </button>
      </div>

      {/* 감지된 랙 수 */}
      <div className="absolute bottom-8 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full pointer-events-none">
        <span className="text-white text-[11px]">📡 {nearbyRacks.length}개 감지</span>
      </div>

      {/* 랙 상세 모달 */}
      {selectedRack && (
        <RackModal
          rack={selectedRack.rack}
          distance={selectedRack.distance}
          status={statuses[selectedRack.rack.id] || 'normal'}
          inspections={rackInspections}
          loading={loadingInspections}
          onClose={() => setSelectedRack(null)}
          onNavigate={() => navigate(`/rack/${selectedRack.rack.id}`)}
          onInspect={() => navigate(`/inspect/${selectedRack.rack.id}`)}
        />
      )}
    </div>
  );
}
