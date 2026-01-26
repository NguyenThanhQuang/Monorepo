export interface ContactPageProps {
  onBack: () => void;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
  onMyTripsClick?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  onRoutesClick?: () => void;
  onTicketLookupClick?: () => void;
  onHotlineClick?: () => void;
}