import {
  LayoutDashboard,
  Bus,
  Users,
  ClipboardList,
  Route,
  Ticket,
  Settings,
  LogOut,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { Page } from '../../App';

interface Props {
  children: ReactNode;
  onNavigate: (page: Page) => void;
  active: Page;
}

export function CompanyLayout({
  children,
  onNavigate,
  active,
}: Props) {
  return (
    <div className="flex h-screen bg-[#0B1220] text-white">
      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-[#0F172A] flex flex-col border-r border-white/10">
        <div className="h-16 flex items-center gap-3 px-6 font-semibold text-lg">
          🚌 Company
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <Item
            label="Bảng điều khiển"
            icon={<LayoutDashboard size={18} />}
            active={active === 'company-dashboard'}
            onClick={() => onNavigate('company-dashboard')}
          />
          <Item
            label="Quản lý xe"
            icon={<Bus size={18} />}
            active={active === 'company-vehicle'}
            onClick={() => onNavigate('company-vehicle')}
          />
          <Item
            label="Tài xế"
            icon={<Users size={18} />}
            onClick={() => {}}
          />
          <Item
            label="Đơn đăng ký"
            icon={<ClipboardList size={18} />}
            onClick={() => {}}
          />
          <Item
            label="Chuyến đi"
            icon={<Route size={18} />}
            active={active === 'company-route'}
            onClick={() => onNavigate('company-route')}
          />
          <Item
            label="Đặt vé"
            icon={<Ticket size={18} />}
            onClick={() => {}}
          />
          <Item
            label="Cài đặt"
            icon={<Settings size={18} />}
            onClick={() => {}}
          />
        </nav>

        <button className="flex items-center gap-3 px-6 py-4 text-red-400 hover:bg-red-500/10">
          <LogOut size={18} />
          Đăng xuất
        </button>
      </aside>

      {/* ===== CONTENT ===== */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

function Item({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition
        ${active ? 'bg-blue-600' : 'hover:bg-white/10'}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
