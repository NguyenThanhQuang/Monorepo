import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { SearchResults } from "../components/SearchResults";

export function SearchResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = location.state as {
    fromProvince: string;
    toProvince: string;
    date?: string;
  };

  if (!searchParams || !searchParams.fromProvince || !searchParams.toProvince) {
    return <Navigate to="/" replace />;
  }

  const handleBack = () => {
    navigate(-1);
  };

  const handleTripSelect = (tripId: string) => {
    navigate(`/trip/${tripId}`);
  };

  return (
    <SearchResults
      fromProvince={searchParams.fromProvince}
      toProvince={searchParams.toProvince}
      date={searchParams.date}
      onBack={handleBack}
      onTripSelect={handleTripSelect}
    />
  );
}
