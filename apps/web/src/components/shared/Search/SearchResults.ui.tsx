import { ArrowLeft } from 'lucide-react';
import type { TripCardVM } from '../../../features/SearchResults/types';

interface Props {
  trips: TripCardVM[];
  onBack: () => void;
  onTripSelect: (id: string) => void;
}

export function SearchResultsUI({ trips, onBack, onTripSelect }: Props) {
  return (
    <div>
      <button onClick={onBack}>
        <ArrowLeft />
      </button>

      {trips.map((trip) => (
        <div key={trip.id} onClick={() => onTripSelect(trip.id)}>
          <h3>{trip.companyName}</h3>
          <p>{trip.from} → {trip.to}</p>
          <p>{trip.departureTime} - {trip.arrivalTime}</p>
          <p>{trip.price.toLocaleString()}đ</p>
        </div>
      ))}
    </div>
  );
}
