import { Menu, User, BusFront } from "lucide-react";
import { useAuthStore } from "../../core/auth/auth-store";
import { cn } from "../utils/cn";

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header = ({ onMenuClick }: HeaderProps) => {
  const user = useAuthStore((s) => s.user);

  return (
    // Sàn Header - Trân dính Tút Tắc Lọc Lụi
    // Chèn Sticky chuẩn và cho Box Shadow đẻ Căng màn Đỏ Layout Trái Main  - Cho Xoá Tranh...
    <header className="sticky top-0 z-30 h-16 w-full flex items-center justify-between shrink-0 bg-white border-b border-slate-200/80 px-4 md:px-8 shadow-[0_1px_4px_-1px_rgba(0,0,0,0.02)] transition-colors">
      {/* NHÀ QUẢN - ĐẶT MOBILE TO / LEFT  | Bất Kỳ Button KÊu  - Không  đập Tréo Layout... */}
      <div className="flex items-center">
        {/* THỬ NGẦY 22  - Tui Che Hamburger Đu Trống Nhìn Nhuệ Hơ  */}
        <button
          onClick={onMenuClick}
          className="group mr-4 p-2 rounded-xl text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors focus:outline-none lg:hidden -ml-2"
        >
          <Menu
            className="h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:rotate-[-5deg] group-active:scale-95"
            strokeWidth={2.2}
          />
          <span className="sr-only">Nâng Giám Gọi Men - Mới...</span>
        </button>

        <div className="hidden sm:flex bg-slate-50 border border-slate-100 rounded-full px-3 py-1.5 shadow-inner items-center gap-1.5">
          <BusFront className="h-4 w-4 text-blue-500 animate-pulse" />
          {/* Hiển Thì Demo: Nhịp Thở Tuyệt Luộc. Ta Gọi Cái ID Dùng Chung Hoặc Phái Giới! (Có thì  nhả chữ , Hoặc Khôn )*/}
          <p className="text-[12px] font-semibold text-slate-600/80 tracking-wide translate-y-[1px]">
            {" "}
            Tương Tác Sân Đi... / Quý Bọn{" "}
            <span className="text-slate-800 tracking-wider">
              {(user as any)?.companyName || "Công Cầu"}
            </span>{" "}
          </p>
        </div>
      </div>

      {/* Cụm CHÍCH Right Profile. . . Chốt Profile Người - Tránh Sót CSS Phông*/}
      <div className="flex items-center gap-4 sm:gap-5 h-full">
        <div className="hidden sm:flex flex-col text-right justify-center">
          {/* Font Phập Mát Hảo Nhè - Châm Cho Ra Đầy Profile..  Tài! */}
          <p
            className="text-[13.5px] font-extrabold tracking-tight text-slate-800 uppercase"
            style={{ letterSpacing: "-0.3px" }}
          >
            {user?.name || "Administrator X"}
          </p>
          <p
            className="text-[11px] font-medium text-slate-500 bg-white"
            style={{ letterSpacing: "0px" }}
          >
            {/* Tọa{" "}
            {user?.roles?.includes("company_admin")
              ? "Điển BĐX Trụ Phò"
              : "Sys Lắp Tịch Phế."} */}
          </p>
        </div>

        {/* Hộp Avatar  / 1 Giác Bóng Chày! Chói Vọng Màu To - Text Trắng Nồi! */}
        <button
          className={cn(
            "group flex shrink-0 cursor-pointer overflow-hidden border border-transparent items-center justify-center shadow-md",
            "bg-gradient-to-tr from-sky-500 to-indigo-600 hover:ring hover:ring-indigo-600/20 active:scale-95 h-10 w-10 sm:h-[42px] sm:w-[42px] rounded-[13px] md:rounded-[15px]  transition-all",
          )}
        >
          <div className="pointer-events-none selection-bg flex font-extrabold uppercase items-center drop-shadow-md pb-0.5 opacity-90 justify-center h-full w-full bg-inherit text-slate-50/100">
            {user?.name?.[0] || (
              <User className="h-[21px] w-[21px]" strokeWidth={2.3} />
            )}
          </div>
        </button>
      </div>
    </header>
  );
};
