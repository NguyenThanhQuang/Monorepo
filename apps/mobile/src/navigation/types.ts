export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string };
};

export type MainStackParamList = {
  MainTabs: undefined;
  SearchTrips: undefined;
  TripDetails: { trip: any };
  Booking: { trip: any };
  BookingCheckout: { trip: any; selectedSeats: string[]; totalAmount: number };
  PaymentCheckout: { bookingId: string; status?: "success" | "cancel" };
  TicketDetail: { bookingId: string };
  MyBookings: undefined;
  ChangePassword: undefined;
  Profile: undefined;
  LoyaltyProgram: undefined;
  BusTracking: { tripId?: string } | undefined;
  Drive: undefined;
  DriverHome: undefined;
  DriverScanner: undefined;
  DriverRegister: undefined;
  DriverRatings: undefined;
  ReviewDriver: { bookingId: string };
};

export type RootStackParamList = {
  ResetPassword: { token?: string };
  VerifyEmail: { token?: string };
  PaymentStatus: { bookingId?: string; status?: "success" | "cancel" };
  Main: undefined;
  Auth: undefined;
};
