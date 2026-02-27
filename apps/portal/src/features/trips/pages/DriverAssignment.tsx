// src/features/trips/DriverAssignment.tsx
import React from 'react';

interface DriverAssignmentProps {
  tripId: string;
  onClose: () => void;
  onAssign: (driverId: string) => void;
}

export const DriverAssignment: React.FC<DriverAssignmentProps> = ({
  tripId,
  onClose,
  onAssign
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Phân công tài xế cho chuyến đi</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Chức năng đang được phát triển. Vui lòng quay lại sau.
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};