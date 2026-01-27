export interface AboutPageProps {
  onBack: () => void;
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
  onMyTripsClick?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  onRoutesClick?: () => void;
  onContactClick?: () => void;
  onTicketLookupClick?: () => void;
  onHotlineClick?: () => void;
}