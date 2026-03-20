import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { findRack, SKYLIFE_DATA } from '@/lib/data';

const TABS = [
  { id: 'home', path: '/', icon: '🏠', label: '홈' },
  { id: 'floorplan', path: '/floorplan', icon: '🗺️', label: '도면' },
  { id: 'ar', path: '/ar', icon: '📡', label: 'AR' },
  { id: 'scan', path: '/scan', icon: '📷', label: '스캔' },
  { id: 'history', path: '/history', icon: '📋', label: '이력' },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine title and back button based on route
  const getNavConfig = () => {
    const path = location.pathname;
    if (path.startsWith('/room/')) {
      const roomId = path.split('/')[2];
      const room = SKYLIFE_DATA.rooms.find(r => r.id === roomId);
      return { title: room?.name || '장비실', back: () => navigate('/') };
    }
    if (path.startsWith('/rack/')) {
      const rackId = path.split('/')[2];
      const found = findRack(rackId);
      return { title: found?.rack.no || '랙', back: () => found ? navigate(`/room/${found.room.id}`) : navigate('/') };
    }
    if (path.startsWith('/inspect/')) {
      const rackId = path.split('/')[2];
      return { title: '점검 입력', back: () => navigate(`/rack/${rackId}`) };
    }
    if (path.startsWith('/inspection/')) {
      return { title: '점검 상세', back: () => navigate(-1) };
    }
    if (path === '/floorplan') return { title: '장비 도면', back: null };
    if (path === '/ar') return { title: '📡 AR 뷰', back: null };
    if (path === '/scan') return { title: '📷 QR 스캔', back: null };
    if (path === '/history') return { title: '점검 이력', back: null };
    return { title: 'Skylife AR 장비관리', back: null };
  };

  const { title, back } = getNavConfig();
  const activeTab = TABS.find(t => location.pathname === t.path)?.id || '';

  return (
    <div className="flex flex-col h-screen h-[100dvh]">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-4 py-3 bg-background/92 backdrop-blur-xl border-b border-border z-50"
        style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)' }}>
        <button onClick={() => back?.()} className={`text-primary text-[17px] min-w-[60px] ${!back ? 'invisible' : ''}`}>
          ← 
        </button>
        <h1 className="text-[17px] font-bold truncate">{title}</h1>
        <div className="min-w-[60px]" />
      </nav>

      {/* Page Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </main>

      {/* Tabbar */}
      <div className="flex bg-background/95 border-t border-border"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => navigate(tab.path)}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] transition-colors ${
              activeTab === tab.id ? 'text-primary' : 'text-muted-foreground'
            }`}>
            <span className="text-[22px]">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
