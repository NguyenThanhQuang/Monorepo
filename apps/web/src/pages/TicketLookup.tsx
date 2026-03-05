// src/pages/ticket-lookup/TicketLookup.page.tsx

import { Search, Ticket, Phone, MapPin, Clock, User, CreditCard } from 'lucide-react';
import { useTicketLookupLogic } from '../hooks/Logic/TicketLookup.logic';
import { useLanguage } from '../contexts/LanguageContext';
import { Header } from '../components/layout/Header/Header';

export function TicketLookupPage(props: any) {
  const { t } = useLanguage();
  const {
    ticketCode,
    phoneNumber,
    setTicketCode,
    setPhoneNumber,
    onSearch,
    result,
    loading,
    error,
  } = useTicketLookupLogic();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header {...props} />

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={onSearch} className="bg-white p-6 rounded-2xl mb-6">
          <input
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value)}
            placeholder="Mã vé"
            className="w-full mb-3 p-3 border rounded-xl"
          />

          <input
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="Số điện thoại"
            className="w-full mb-3 p-3 border rounded-xl"
          />

          <button
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl"
          >
            {loading ? 'Đang tra cứu...' : 'Tra cứu vé'}
          </button>

          {error && <p className="text-red-500 mt-3">{error}</p>}
        </form>

        {result && (
          <div className="bg-white p-6 rounded-2xl">
            <h2 className="text-xl mb-4">{result.ticketCode}</h2>

            <div className="flex items-center mb-2">
              <MapPin className="w-4 h-4 mr-2" />
              {result.tripId.route.fromLocationId.name} →{' '}
              {result.tripId.route.toLocationId.name}
            </div>

            <div className="flex items-center mb-2">
              <Clock className="w-4 h-4 mr-2" />
              {new Date(result.tripId.departureTime).toLocaleString()}
            </div>

            <div className="flex items-center mb-2">
              <User className="w-4 h-4 mr-2" />
              {result.contactName} ({result.contactPhone})
            </div>

            <div className="flex items-center">
              <CreditCard className="w-4 h-4 mr-2" />
              {result.totalAmount.toLocaleString()}đ
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
