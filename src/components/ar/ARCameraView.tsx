import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room, Rack } from '@/lib/data';

interface NearbyRack {
  rack: Rack;
  distance: number; // meters
  angle: number; // degrees from north (0-360)
}

const STATUS_LABEL: Record<string, string> = {
  normal: '정상', caution: '주의', fault: '고장', unknown: '미확인'
};

const STATUS_CLASS: Record<string, string> = {
  normal: 'badge-normal', caution: 'badge-caution', fault: 'badge-fault', unknown: 'badge-unknown'
};

const MAX_DISTANCE = 8; // meters - show racks within this range
const CAMERA_FOV = 70; // degrees - horizontal field of view

interface Props {
  room: Room;
  userX: number;
  userZ: number;
  statuses: Record<string, string>;
  onBack: () => void;
}

export default function ARCameraView({ room, userX, userZ, statuses, onBack }: Props) {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [heading, setHeading] = useState<number>(0); // compass heading in degrees
  const [hasOrientation, setHasOrientation] = useState(false);
  const [calibrationHeading, setCalibrationHeading] = useState<number | null>(null);

  // Calculate nearby racks with angles
  const nearbyRacks: NearbyRack[] = room.racks.map(rack => {
    const dx = rack.x - userX;
    const dz = rack.z - userZ;
    const distance = Math.sqrt(dx * dx + dz * dz);
    // Angle: 0 = north (+z direction), clockwise
    // atan2 gives angle from positive x axis, we convert to compass-like
    const rawAngle = Math.atan2(dx, dz) * (180 / Math.PI);
    const angle = ((rawAngle % 360) + 360) % 360;
    return { rack, distance, angle };
  }).filter(r => r.distance <= MAX_DISTANCE && r.distance > 0.3)
    .sort((a, b) => a.distance - b.distance);

  // Start camera
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

  // Device orientation for compass heading
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      // alpha = compass heading (0-360)
      if (e.alpha !== null) {
        setHeading(e.alpha);
        setHasOrientation(true);
      }
    };

    // iOS requires permission
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      (DeviceOrientationEvent as any).requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            window.addEventListener('deviceorientation', handler, true);
          }
        })
        .catch(() => {});
    } else {
      window.addEventListener('deviceorientation', handler, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handler, true);
    };
  }, []);

  // Calibrate: set current heading as "north" for the floor plan
  const calibrate = useCallback(() => {
    setCalibrationHeading(heading);
  }, [heading]);

  // Effective heading relative to floor plan
  const effectiveHeading = calibrationHeading !== null
    ? ((heading - calibrationHeading) % 360 + 360) % 360
    : heading;

  // Project rack onto screen position based on angle difference from current heading
  const getRackScreenPosition = (rackAngle: number) => {
    let angleDiff = rackAngle - effectiveHeading;
    // Normalize to -180..180
    while (angleDiff > 180) angleDiff -= 360;
    while (angleDiff < -180) angleDiff += 360;

    // Check if within camera FOV
    if (Math.abs(angleDiff) > CAMERA_FOV / 2 + 15) return null; // +15 for margin

    // Map angle to screen X percentage (0-100)
    const x = 50 + (angleDiff / (CAMERA_FOV / 2)) * 50;
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

      {/* AR Rack overlays */}
      {nearbyRacks.map(({ rack, distance, angle }) => {
        const screenX = getRackScreenPosition(angle);
        if (screenX === null) return null;

        const st = statuses[rack.id] || 'normal';
        // Scale card based on distance (closer = larger)
        const scale = Math.max(0.6, Math.min(1.2, 3 / distance));
        // Vertical position: closer racks at bottom, farther at top
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
            onClick={() => navigate(`/rack/${rack.id}`)}
          >
            {/* Distance line */}
            <div className="absolute top-full left-1/2 w-[2px] h-8 bg-primary/40 -translate-x-1/2" />

            {/* Info card */}
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

      {/* No racks visible guide */}
      {nearbyRacks.every(({ angle }) => getRackScreenPosition(angle) === null) && (
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

      {/* Top bar: AR mode + compass */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
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

      {/* Calibrate button */}
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2">
        <button
          onClick={calibrate}
          className="bg-primary/90 backdrop-blur-sm text-primary-foreground px-5 py-2.5 rounded-full text-sm font-semibold flex items-center gap-2"
        >
          <span>🧭</span>
          {calibrationHeading === null ? '방향 보정하기' : '방향 재보정'}
        </button>
      </div>

      {/* Back button */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={onBack}
          className="bg-card/80 backdrop-blur-sm text-foreground px-5 py-2 rounded-full text-sm font-semibold border border-border"
        >
          ← 위치 다시 선택
        </button>
      </div>

      {/* Nearby rack count */}
      <div className="absolute bottom-8 right-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <span className="text-white text-[11px]">📡 {nearbyRacks.length}개 감지</span>
      </div>
    </div>
  );
}
