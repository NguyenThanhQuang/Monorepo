import { Link } from "react-router-dom";

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow p-6 space-y-4">
        <h1 className="text-xl font-semibold">404 - Not found</h1>
        <p className="text-gray-600">Trang bạn tìm không tồn tại.</p>
        <Link className="inline-block px-4 py-2 rounded-xl bg-slate-700 text-white" to="/admin">
          Về trang Admin
        </Link>
      </div>
    </div>
  );
}
