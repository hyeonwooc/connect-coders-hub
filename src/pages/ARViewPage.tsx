import { useState } from 'react';
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
  const { statuses } = useAppState();
  const [position, setPosition] = useState<UserPosition | null>(null);

  if (position) {
    return (
      <ARCameraView
        room={position.room}
        userX={position.x}
        userZ={position.z}
        statuses={statuses}
        onBack={() => setPosition(null)}
      />
    );
  }

  return (
    <ARPositionPicker
      statuses={statuses}
      onPositionSelect={(room, x, z) => setPosition({ room, x, z })}
    />
  );
}
