// src/pages/trip-detail/TripDetail.page.tsx

import { ArrowLeft, Armchair } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTripDetailLogic } from '../hooks/Logic/TripDetail.logic';

interface Props {
  tripId: string;
  onBack: () => void;
  onBooking: (seats: string[]) => void;
}

export function TripDetailPage({ tripId, onBack, onBooking }: Props) {
  const { t } = useLanguage();
  const {
    trip,
    activeFloor,
    setActiveFloor,
    seatsByFloor,
    selectedSeats,
    toggleSeat,
    totalAmount,
  } = useTripDetailLogic(tripId);

  if (!trip) return null;

  const seatClass = (seat: any) => {
    if (selectedSeats.includes(seat.seatNumber))
      return 'bg-blue-600 text-white';
    if (seat.status === 'BOOKED')
      return 'bg-gray-400 text-white cursor-not-allowed';
    if (seat.status === 'HELD')
      return 'bg-orange-400 text-white cursor-not-allowed';
    return 'bg-white border';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <button onClick={onBack} className="p-4">
          <ArrowLeft />
        </button>
      </header>

      <div className="p-6 max-w-6xl mx-auto">
        <h1 className="text-xl mb-4">
          {trip.route.fromLocationId.name} →{' '}
          {trip.route.toLocationId.name}
        </h1>

        {/* Floor */}
        <div className="flex gap-2 mb-6">
          {[1, 2].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFloor(f)}
              className={`flex-1 py-2 rounded ${
                activeFloor === f ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {t('floor')} {f}
            </button>
          ))}
        </div>

        {/* Seat Map */}
        <div className="space-y-3">
          {seatsByFloor.left.map((left, idx) => {
            const right = seatsByFloor.right[idx];
            return (
              <div key={left.seatNumber} className="flex gap-4">
                <button
                  onClick={() => toggleSeat(left)}
                  className={`flex-1 h-14 rounded ${seatClass(left)}`}
                >
                  <Armchair /> {left.seatNumber}
                </button>

                <div className="w-10" />

                {right && (
                  <button
                    onClick={() => toggleSeat(right)}
                    className={`flex-1 h-14 rounded ${seatClass(right)}`}
                  >
                    <Armchair /> {right.seatNumber}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="max-w-6xl mx-auto flex justify-between">
          <div>
            {selectedSeats.join(', ')}
            <div className="text-xl">{totalAmount.toLocaleString()}đ</div>
          </div>
          <button
            disabled={!selectedSeats.length}
            onClick={() => onBooking(selectedSeats)}
            className="px-6 py-3 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            {t('bookNow')}
          </button>
        </div>
      </div>
    </div>
  );
}
