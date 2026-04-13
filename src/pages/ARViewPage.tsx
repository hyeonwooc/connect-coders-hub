import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Room } from '@/lib/data';
import { useAppState } from '@/hooks/useAppState';
import ARPositionPicker from '@/components/ar/ARPositionPicker';
import ARCameraView from '@/components/ar/ARCameraView';

interface UserPosition {
  room: Room;
  x: number;
  z: number;
}

export default function ARViewPage() {
  const navigate = useNavigate();
  const { statuses } = useAppState();
  const [position, setPosition] = useState<UserPosition | null>(null);

  // 카메라 AR 뷰 — 완전 전체화면
  if (position) {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <ARCameraView
          room={position.room}
          userX={position.x}
          userZ={position.z}
          statuses={statuses}
          onBack={() => setPosition(null)}
        />
      </div>
    );
  }

  // 위치 선택 화면 — 자체 네비게이션 포함
  return (
    <div className="flex flex-col bg-background"
      style={{ height: '100dvh' }}>

      {/* 상단 네비게이션 */}
      <nav
        className="flex items-center px-4 bg-background/95 backdrop-blur-xl border-b border-border flex-shrink-0"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)', paddingBottom: '12px' }}
      >
        <button
          onClick={() => navigate(-1)}
          className="text-primary text-[17px] min-w-[60px]"
        >
          ←
        </button>
        <h1 className="text-[17px] font-bold flex-1 text-center">📡 AR 뷰</h1>
        <div className="min-w-[60px]" />
      </nav>

      {/* 위치 선택기 */}
      <div className="flex-1 overflow-hidden">
        <ARPositionPicker
          statuses={statuses}
          onPositionSelect={(room, x, z) => setPosition({ room, x, z })}
        />
      </div>
    </div>
  );
}
