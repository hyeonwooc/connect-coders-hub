import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { startQRScanner, stopCamera } from '@/lib/camera';
import { qrToRackId, findRack } from '@/lib/data';

export default function ScanPage() {
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ rackId: string | null; raw: string } | null>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;
    startQRScanner(videoRef.current, canvasRef.current, (data) => {
      const rackId = qrToRackId(data);
      setResult({ rackId, raw: data });
      setTimeout(() => setResult(null), 4000);
    }).catch(err => {
      setError(err.message);
    });
    return () => stopCamera();
  }, []);

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

  const found = result?.rackId ? findRack(result.rackId) : null;

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">
      <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Scan overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="w-[200px] h-[200px] border-[3px] border-primary rounded-[20px]" 
          style={{ boxShadow: '0 0 0 2000px rgba(0,0,0,0.45)' }} />
        <span className="text-white text-sm mt-5 bg-black/60 px-4 py-2 rounded-full">
          랙의 QR 코드를 네모 안에 위치시켜주세요
        </span>
      </div>

      {/* Result popup */}
      {result && (
        <div className="absolute bottom-0 left-0 right-0 bg-background/95 border-t border-border p-4 animate-in slide-in-from-bottom">
          {found ? (
            <div>
              <div className="font-semibold">{found.rack.no} {found.rack.name}</div>
              <div className="text-xs text-muted-foreground mt-1">{found.rack.row} · QR: {result.raw}</div>
              <button onClick={() => navigate(`/rack/${result.rackId}`)} 
                className="mt-3 w-full py-2.5 rounded-[var(--radius)] bg-primary text-primary-foreground font-semibold text-sm">
                상세 보기
              </button>
            </div>
          ) : (
            <div>
              <div className="font-semibold">⚠️ 알 수 없는 QR</div>
              <div className="text-xs text-muted-foreground mt-1">{result.raw}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
