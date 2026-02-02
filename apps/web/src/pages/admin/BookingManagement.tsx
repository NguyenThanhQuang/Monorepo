import { useState } from 'react';
import { useBookings } from '../../hooks/Logic/useBookings';
import { BookingStats } from '../../components/shared/booking/BookingStats';
import { BookingTable } from '../../components/shared/booking/BookingTable';
import { BookingDetailModal } from '../../components/shared/booking/BookingDetailModal';
import type { BookingUI } from '@obtp/shared-types';


export function BookingManagement() {
  const { data, loading } = useBookings();
  const [selected, setSelected] = useState<BookingUI | null>(null);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 p-6">
      <BookingStats bookings={data} />

      <div className="bg-white rounded-2xl border">
        <BookingTable data={data} onView={setSelected} />
      </div>

      {selected && (
        <BookingDetailModal booking={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
