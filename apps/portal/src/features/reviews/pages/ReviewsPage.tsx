import { useCompanyReviews } from "../api/useReviews";
import { ReviewTable } from "../components/ReviewTable";
import { MessageSquareQuote } from "lucide-react";

export default function ReviewsPage() {
  const { data: reviews = [], isLoading } = useCompanyReviews();

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500">
        Đang tải đánh giá...
      </div>
    );
  }

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews
        ).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Đánh giá khách hàng
          </h1>
          <p className="text-slate-500 mt-1">
            Theo dõi chất lượng dịch vụ (Chỉ xem)
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="text-3xl font-black text-amber-500">
              {avgRating}
            </div>
            <div className="text-xs text-amber-700 dark:text-amber-400 font-medium">
              Điểm trung bình <br /> trên {totalReviews} đánh giá
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800 flex items-start gap-3">
        <MessageSquareQuote className="text-blue-500 shrink-0" size={24} />
        <p className="text-sm text-blue-800 dark:text-blue-300">
          <strong>Lưu ý:</strong> Nhà xe chỉ có quyền xem đánh giá để cải thiện
          chất lượng phục vụ. Nếu phát hiện đánh giá spam hoặc dùng từ ngữ không
          hợp chuẩn, vui lòng liên hệ Admin Nền tảng để yêu cầu ẩn.
        </p>
      </div>

      <ReviewTable reviews={reviews} />
    </div>
  );
}
