import { useState } from 'react';
import { SKYLIFE_DATA, Room } from '@/lib/data';

const PX = 90;
const PAD = 40;
const RACK_W = 0.55 * PX;
const RACK_H = 0.9 * PX;

const STATUS_COLOR: Record<string, string> = {
  normal: '#22c55e', caution: '#f59e0b', fault: '#ef4444', unknown: '#6b7280'
};

interface Props {
  statuses: Record<string, string>;
  onPositionSelect: (room: Room, x: number, z: number) => void;
}

export default function ARPositionPicker({ statuses, onPositionSelect }: Props) {
  const [selectedRoom, setSelectedRoom] = useState<Room>(SKYLIFE_DATA.rooms[0]);

  const W = selectedRoom.floorW * PX + PAD * 2;
  const H = selectedRoom.floorD * PX + PAD * 2;

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const svgX = (e.clientX - rect.left) * scaleX;
    const svgY = (e.clientY - rect.top) * scaleY;
    // Convert to meters
    const mx = (svgX - PAD) / PX;
    const mz = (svgY - PAD) / PX;
    onPositionSelect(selectedRoom, mx, mz);
  };

  const gridLines: JSX.Element[] = [];
  for (let x = 0; x <= selectedRoom.floorW + 1; x += 1) {
    const px = PAD + x * PX;
    gridLines.push(<line key={`gx${x}`} x1={px} y1={PAD} x2={px} y2={H - PAD} stroke="#1e2d45" strokeWidth={1} />);
  }
  for (let z = 0; z <= selectedRoom.floorD + 1; z += 1) {
    const pz = PAD + z * PX;
    gridLines.push(<line key={`gz${z}`} x1={PAD} y1={pz} x2={W - PAD} y2={pz} stroke="#1e2d45" strokeWidth={1} />);
  }

  const rows = [...new Map(selectedRoom.racks.map(r => [r.row, r.z])).entries()];

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

      <div className="px-4 pb-2">
        <div className="bg-primary/10 border border-primary/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-2xl">📍</span>
          <div>
            <div className="text-sm font-bold text-foreground">현재 위치를 선택하세요</div>
            <div className="text-xs text-muted-foreground">도면 위에서 본인이 서 있는 위치를 탭하세요</div>
          </div>
        </div>
      </div>

      {/* SVG Floor Plan */}
      <div className="flex-1 overflow-auto p-4">
        <svg
          width={W} height={H}
          style={{ background: '#0d1321', borderRadius: '8px', display: 'block', cursor: 'crosshair' }}
          onClick={handleSvgClick}
        >
          {gridLines}
          <circle cx={PAD} cy={PAD} r={6} fill="hsl(var(--primary))" />
          <text x={PAD + 10} y={PAD + 5} fill="hsl(var(--primary))" fontSize={11}>원점</text>

          {selectedRoom.racks.map(rack => {
            const cx = PAD + rack.x * PX + RACK_W / 2;
            const cy = PAD + rack.z * PX + RACK_H / 2;
            const rx = PAD + rack.x * PX;
            const ry = PAD + rack.z * PX;
            const col = STATUS_COLOR[statuses[rack.id] || 'normal'];

            return (
              <g key={rack.id}>
                <rect x={rx} y={ry} width={RACK_W} height={RACK_H} rx={6} ry={6}
                  fill={col + '22'} stroke={col} strokeWidth={2} />
                <text x={cx} y={cy - 4} textAnchor="middle" fill={col} fontSize={12} fontWeight={700}>{rack.no}</text>
                <text x={cx} y={cy + 13} textAnchor="middle" fontSize={9} fill="#4a6080">{rack.row}</text>
              </g>
            );
          })}

          {rows.map(([row, z]) => (
            <text key={row} x={PAD - 6} y={PAD + z * PX + RACK_H / 2 + 4}
              textAnchor="end" fill="#4a6080" fontSize={11}>{row}</text>
          ))}
        </svg>
      </div>
    </div>
  );
}
