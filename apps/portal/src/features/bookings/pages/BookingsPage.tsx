import { BookingTable } from "../components/BookingTable";
import { EditBookingModal } from "../components/EditBookingModal";
import { useBookingsViewModel } from "../hooks/useBookingsViewModel";

export default function BookingsPage() {
  const { state, modals, actions } = useBookingsViewModel();

  if (state.isLoading)
    return (
      <div className="h-96 flex flex-col items-center justify-center text-slate-500 gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-medium animate-pulse">
          Đang tải danh sách đặt vé...
        </p>
      </div>
    );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header trang */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Quản lý Đặt vé
          </h1>
          <p className="text-slate-500 mt-1">
            Theo dõi danh sách khách hàng, hỗ trợ in vé và xử lý các thay đổi
            đơn đặt.
          </p>
        </div>

        {/* Chỉ thị trạng thái background sync */}
        {state.isFetching && (
          <span className="text-[10px] bg-slate-100 text-slate-400 px-2 py-1 rounded-md flex items-center gap-1">
            <span className="w-1 h-1 bg-blue-500 rounded-full animate-ping" />
            Đang đồng bộ...
          </span>
        )}
      </div>

      {/* Bảng dữ liệu chính */}
      <BookingTable
        bookings={state.bookings}
        onEditInfo={actions.openEdit}
        onCancel={actions.cancel}
        onDownload={actions.download}
      />

      {/* Modal Popup Chỉnh sửa thông tin khách hàng */}
      <EditBookingModal
        isOpen={modals.edit.isOpen}
        booking={modals.edit.data || null}
        onClose={modals.edit.close}
        onSubmit={actions.submitEdit}
        isLoading={state.isMutating}
      />
    </div>
  );
}
