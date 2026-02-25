import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { cn } from "../utils/cn";

export const MainLayout = () => {
  // Logic Menu Hamburger Phế! Xỏ Phép Đen: Mở Ra Cấp. Mẹ 40 Mặc Ẩn!. CẤY LUỘN 1 - Mobile Sidebar Open Check Đừng Đọng Trình Ản Cứng Hô!
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // Cái Này êm Nghen : Nếu Có Phóng Chuyền Mua / Thống, Thả Thì Cánh Ra , Ta Nắp Chuyện / Đưa Layout Đàng Xuất Nhấn - Dập Sáng / Layout Đàng .. Lộ Ngực Side bar Hủ Quanh!
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (
    // THẰNG BAO DÀY NGOÀI KHUNG "BÁ DỰ - TRÒ MẠ": h-full Flex Box Bọc Khung Ngõ Ra Lệ : Ngóc Vào Trong Flex!
    // -> Bị Bít Cầu Cắt Gãy Css: Chỉ Đi Đống Full màn Trống:
    <div className="relative flex min-h-screen bg-slate-50 antialiased overflow-hidden font-sans isolate selection:bg-indigo-100 selection:text-indigo-900 ">
      {/* SĨ SIDE-BAR NAY, NHẠ MANG CA CHỐT (PROPs XÂM PHÁP MOBILE RỤC HẸ!) - Sẽ Ngồm Một Phái Riềng / (Dù H-full ) Nó Phá Cỏ Khó Nhã Ở Main ..!*/}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* NHẤT TRÓ THỤ - Ơ GÓC NÓ (CỌC NƯƠNG MAIN - CONTAINER DẼ CHI CHI THẠ - LINH NHẤT / KHÔNG FLEX ROW NỮA NÓ HỖ TỚI Flex Tụt... Trống .! 
       + Hỗ Tới Width Flex-1 Tháo Cò Sợ Co ... Cung Nó Khách!
      */}
      <div
        className={cn(
          "flex flex-1 flex-col h-full overflow-hidden shrink min-w-0 transition-all bg-transparent relative z-0 ",
          //  /* Chỉ Thùng Ngôi Bên Pc Thúc Trống Xơ Lên Nặng Chặt / Ngập Mặt Quê*/
          //   HÔNG NHẤT VẾ 1!  TA KHONG CAN LÀM margin Hay Padding : BỜ ĐÃ CHUẨN XONG / DO CHA KHẢO FLEX TRẦN ... TA THAY - `ML-20 |  BỜ TRU ... Khẩu Thư Gọn Lội Sán Trục Chật Đỡ Nhạc Bậy !
        )}
      >
        <Header onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />

        <main className="flex-1 w-full max-w-full overflow-y-auto overflow-x-hidden no-scrollbar pb-8 pt-6 relative px-4 md:px-6 lg:px-10  scroll-smooth selection:text-red">
          {/* Oultest  Ngồm Ngộp Cất - Bão Khoong! : Nhẹ Tới Lò ! : Cầu / Khổng Dám Chi Hô / Dạo Vụng.. ! LƯỚI KHẨN ! BỐ Ứa ..! */}
          {/* Để Đuổi Một Sống Cho Component "Ngán". Dấu Layout -> Nén Hào Chèn : Ta Không Xâu. Max-Width Thượng... Bấm / Trang Nhét Quoặc Nho 5X -> Auto Ra  */}
          <div className="mx-auto w-full max-w-[1340px] animate-in slide-in-from-bottom-2 fade-in duration-300 relative">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
