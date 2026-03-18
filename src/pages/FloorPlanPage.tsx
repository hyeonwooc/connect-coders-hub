import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SKYLIFE_DATA, Room } from '@/lib/data';
import { useAppState } from '@/hooks/useAppState';

const PX = 90;
const PAD = 40;
const RACK_W = 0.55 * PX;
const RACK_H = 0.9 * PX;

const STATUS_COLOR: Record<string, string> = {
  normal: '#22c55e', caution: '#f59e0b', fault: '#ef4444', unknown: '#6b7280'
};

export default function FloorPlanPage() {
  const navigate = useNavigate();
  const { statuses, photoIds } = useAppState();
  const [selectedRoom, setSelectedRoom] = useState<Room>(SKYLIFE_DATA.rooms[0]);

  return (
    <div className="flex flex-col h-full">
      {/* Room selector */}
      <div className="flex gap-2 p-4 overflow-x-auto">
        {SKYLIFE_DATA.rooms.map(r => (
          <button key={r.id} onClick={() => setSelectedRoom(r)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              selectedRoom.id === r.id ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}>
            {r.icon} {r.name}
          </button>
        ))}
      </div>

      <div className="text-xs text-muted-foreground text-center mb-2">랙을 탭하면 상세정보를 볼 수 있습니다</div>

      {/* SVG Floor Plan */}
      <div className="flex-1 overflow-auto p-4">
        <FloorPlanSVG room={selectedRoom} statuses={statuses} photoIds={photoIds} 
          onRackClick={(id) => navigate(`/rack/${id}`)} />
      </div>
    </div>
  );
}

function FloorPlanSVG({ room, statuses, photoIds, onRackClick }: {
  room: Room; statuses: Record<string, string>; photoIds: Set<string>; onRackClick: (id: string) => void;
}) {
  const W = room.floorW * PX + PAD * 2;
  const H = room.floorD * PX + PAD * 2;

  const gridLines: JSX.Element[] = [];
  for (let x = 0; x <= room.floorW + 1; x += 1) {
    const px = PAD + x * PX;
    gridLines.push(<line key={`gx${x}`} x1={px} y1={PAD} x2={px} y2={H - PAD} stroke="#1e2d45" strokeWidth={1} />);
  }
  for (let z = 0; z <= room.floorD + 1; z += 1) {
    const pz = PAD + z * PX;
    gridLines.push(<line key={`gz${z}`} x1={PAD} y1={pz} x2={W - PAD} y2={pz} stroke="#1e2d45" strokeWidth={1} />);
  }

  const rows = [...new Map(room.racks.map(r => [r.row, r.z])).entries()];

  return (
    <svg width={W} height={H} style={{ background: '#0d1321', borderRadius: '8px', display: 'block' }}>
      {gridLines}
      <circle cx={PAD} cy={PAD} r={6} fill="#00d4ff" />
      <text x={PAD + 10} y={PAD + 5} fill="#00d4ff" fontSize={11}>원점</text>

      {room.racks.map(rack => {
        const cx = PAD + rack.x * PX + RACK_W / 2;
        const cy = PAD + rack.z * PX + RACK_H / 2;
        const rx = PAD + rack.x * PX;
        const ry = PAD + rack.z * PX;
        const col = STATUS_COLOR[statuses[rack.id] || 'normal'];
        const hasPhoto = photoIds.has(rack.id);

        return (
          <g key={rack.id} onClick={() => onRackClick(rack.id)} className="cursor-pointer hover:opacity-70 transition-opacity">
            <rect x={rx} y={ry} width={RACK_W} height={RACK_H} rx={6} ry={6}
              fill={col + '22'} stroke={col} strokeWidth={2} />
            <text x={cx} y={cy - 4} textAnchor="middle" fill={col} fontSize={12} fontWeight={700}>{rack.no}</text>
            <text x={cx} y={cy + 13} textAnchor="middle" fontSize={12} fill={hasPhoto ? '#fff' : '#444'}>
              {hasPhoto ? '📷' : '○'}
            </text>
          </g>
        );
      })}

      {rows.map(([row, z]) => (
        <text key={row} x={PAD - 6} y={PAD + z * PX + RACK_H / 2 + 4}
          textAnchor="end" fill="#4a6080" fontSize={11}>{row}</text>
      ))}
    </svg>
  );
}
