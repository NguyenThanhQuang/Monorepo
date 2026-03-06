import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { VerifyEmailPage } from "@/features/auth/pages/VerifyEmailPage";
import { MyTripsPage } from "@/features/bookings/pages/MyTripsPage";
import { HomePage } from "@/features/search/pages/HomePage";
import { SearchResultsPage } from "@/features/search/pages/SearchResultsPage";
import { TripDetailPage } from "@/features/trips/pages/TripDetailPage";
import { UserProfilePage } from "@/features/users/pages/UserProfilePage";
import { AboutPage } from "@/pages/AboutPage";
import { ContactPage } from "@/pages/ContactPage";
import { FAQPage } from "@/pages/FAQPage";
import { PrivacyPage } from "@/pages/PrivacyPage";
import { TermsPage } from "@/pages/TermsPage";
import { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";

export default function App() {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setUser(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        isLoggedIn={isLoggedIn}
        onLoginClick={() => setShowAuth(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/trip/:id" element={<TripDetailPage />} />
          <Route
            path="/ticket-lookup"
            element={<div>Ticket Lookup Page Placeholder</div>}
          />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/profile" element={<UserProfilePage />} />
          <Route path="/my-trips" element={<MyTripsPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </main>

      <Footer />

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            setShowAuth(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
