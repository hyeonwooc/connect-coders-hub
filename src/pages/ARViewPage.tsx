import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { stopCamera } from '@/lib/camera';
import { qrToRackId, findRack } from '@/lib/data';
import { useAppState } from '@/hooks/useAppState';
import jsQR from 'jsqr';

interface DetectedRack {
  rackId: string;
  name: string;
  no: string;
  row: string;
  status: string;
  // Position on screen (percentage-based)
  x: number;
  y: number;
  width: number;
  height: number;
}

const STATUS_LABEL: Record<string, string> = {
  normal: '정상', caution: '주의', fault: '고장', unknown: '미확인'
};

const STATUS_CLASS: Record<string, string> = {
  normal: 'badge-normal', caution: 'badge-caution', fault: 'badge-fault', unknown: 'badge-unknown'
};

export default function ARViewPage() {
  const navigate = useNavigate();
  const { statuses } = useAppState();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [detected, setDetected] = useState<DetectedRack[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const stopAll = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    let running = true;
    const ctx = canvas.getContext('2d')!;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        if (!running) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        video.srcObject = stream;
        await video.play();

        function scan() {
          if (!running) return;
          if (video!.readyState === video!.HAVE_ENOUGH_DATA) {
            canvas!.width = video!.videoWidth;
            canvas!.height = video!.videoHeight;
            ctx.drawImage(video!, 0, 0);
            const img = ctx.getImageData(0, 0, canvas!.width, canvas!.height);
            const code = jsQR(img.data, img.width, img.height, { inversionAttempts: 'dontInvert' });

            if (code && code.data) {
              const rackId = qrToRackId(code.data);
              if (rackId) {
                const found = findRack(rackId);
                if (found) {
                  const loc = code.location;
                  const minX = Math.min(loc.topLeftCorner.x, loc.bottomLeftCorner.x);
                  const maxX = Math.max(loc.topRightCorner.x, loc.bottomRightCorner.x);
                  const minY = Math.min(loc.topLeftCorner.y, loc.topRightCorner.y);
                  const maxY = Math.max(loc.bottomLeftCorner.y, loc.bottomRightCorner.y);

                  const vw = video!.videoWidth;
                  const vh = video!.videoHeight;

                  setDetected([{
                    rackId,
                    name: found.rack.name,
                    no: found.rack.no,
                    row: found.rack.row,
                    status: 'normal',
                    x: (minX / vw) * 100,
                    y: (minY / vh) * 100,
                    width: ((maxX - minX) / vw) * 100,
                    height: ((maxY - minY) / vh) * 100,
                  }]);
                }
              }
            } else {
              setDetected(prev => prev.length ? [] : prev);
            }
          }
          rafRef.current = requestAnimationFrame(scan);
        }
        scan();
      } catch (err: any) {
        setError(err.message);
      }
    })();

    return () => {
      running = false;
      stopAll();
    };
  }, [stopAll]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-8">
        <span className="text-5xl">🚫</span>
        <p className="text-muted-foreground text-center">카메라에 접근할 수 없습니다</p>
        <p className="text-xs text-muted-foreground">{error}</p>
        <button onClick={() => navigate('/')} className="px-6 py-2.5 rounded-[var(--radius)] bg-primary text-primary-foreground font-semibold text-sm">
          홈으로
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative w-full h-full bg-black overflow-hidden">
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="hidden" />

      {/* AR Overlays */}
      {detected.map((rack) => {
        const st = statuses[rack.rackId] || rack.status;
        return (
          <div
            key={rack.rackId}
            className="absolute pointer-events-auto cursor-pointer animate-in fade-in duration-200"
            style={{
              left: `${rack.x}%`,
              top: `${rack.y}%`,
              width: `${Math.max(rack.width, 20)}%`,
            }}
            onClick={() => navigate(`/rack/${rack.rackId}`)}
          >
            {/* Marker highlight box */}
            <div
              className="absolute border-2 border-primary rounded-lg"
              style={{
                left: 0,
                top: 0,
                width: `${rack.width}%`,
                height: `${rack.height}%`,
                minWidth: 40,
                minHeight: 40,
                boxShadow: '0 0 20px rgba(0,212,255,0.4)',
              }}
            />

            {/* Info card - positioned above the QR code */}
            <div
              className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-[200px]"
              style={{ filter: 'drop-shadow(0 4px 20px rgba(0,0,0,0.6))' }}
            >
              <div className="bg-card/95 backdrop-blur-md border border-border rounded-xl p-3">
                {/* Arrow */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-border" />

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🖥️</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-foreground truncate">{rack.no}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{rack.name}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">{rack.row}</span>
                  <span className={`badge text-[11px] ${STATUS_CLASS[st]}`}>
                    {STATUS_LABEL[st]}
                  </span>
                </div>

                <div className="mt-2 text-center">
                  <span className="text-[10px] text-primary font-semibold">탭하여 상세보기 →</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Guide overlay when nothing detected */}
      {detected.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="w-[220px] h-[220px] border-2 border-primary/50 rounded-2xl relative">
            {/* Corner accents */}
            <div className="absolute -top-[2px] -left-[2px] w-8 h-8 border-t-[3px] border-l-[3px] border-primary rounded-tl-2xl" />
            <div className="absolute -top-[2px] -right-[2px] w-8 h-8 border-t-[3px] border-r-[3px] border-primary rounded-tr-2xl" />
            <div className="absolute -bottom-[2px] -left-[2px] w-8 h-8 border-b-[3px] border-l-[3px] border-primary rounded-bl-2xl" />
            <div className="absolute -bottom-[2px] -right-[2px] w-8 h-8 border-b-[3px] border-r-[3px] border-primary rounded-br-2xl" />
          </div>
          <div className="mt-5 bg-black/60 backdrop-blur-sm px-5 py-2.5 rounded-full flex items-center gap-2">
            <span className="text-lg">📡</span>
            <span className="text-white text-sm font-medium">장비 QR 마커를 비춰주세요</span>
          </div>
          <div className="mt-2 text-[11px] text-white/50">랙의 QR 코드를 인식하면 장비 정보가 표시됩니다</div>
        </div>
      )}

      {/* AR mode indicator */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-white text-xs font-semibold">AR 모드</span>
      </div>
    </div>
  );
}
