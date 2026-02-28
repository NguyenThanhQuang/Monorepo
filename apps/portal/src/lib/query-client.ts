import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Dữ liệu được coi là "fresh" trong 1 phút (không fetch lại khi focus window)
      staleTime: 1000 * 60,
      // Thử lại 1 lần nếu API lỗi
      retry: 1,
      // Không tự động fetch lại khi cửa sổ focus (tránh lag khi alt-tab liên tục)
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false, // Không retry khi POST/PUT/DELETE lỗi
    },
  },
});
