export interface HeaderProps {
  isLoggedIn?: boolean;
  onLoginClick?: () => void;
  onMyTripsClick?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  onContactClick?: () => void;
  onTicketLookupClick?: () => void;
  onHotlineClick?: () => void;
  onHomeClick?: () => void;

  /* ADMIN */
  onAdminAccess?: () => void;

  /* COMPANY */
  onCompanyDashboard?: () => void;
  onCompanyTrips?: () => void;
}
