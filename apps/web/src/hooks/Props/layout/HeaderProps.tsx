// Trong file HeaderProps.ts hoặc types.ts
export interface HeaderProps {
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  onLoginClick?: () => void;
  onMyTripsClick?: () => void;
  onProfileClick?: () => void;
  onLogout?: () => void;
  onRoutesClick?: () => void;
  onContactClick?: () => void;
  onTicketLookupClick?: () => void;
  onHotlineClick?: () => void;
  onHomeClick?: () => void;
  onAdminAccess?: () => void;
}