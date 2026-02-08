// src/pages/ticket-lookup/TicketLookup.logic.ts

import { useState } from 'react';
import { lookupBooking } from './ticketLookup.api';
import type { TicketLookupResponse } from '@obtp/shared-types';

export function useTicketLookupLogic() {
  const [ticketCode, setTicketCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [result, setResult] = useState<TicketLookupResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await lookupBooking({
        identifier: ticketCode,
        contactPhone: phoneNumber,
      });
      setResult(data);
    } catch (err: any) {
      setError(err.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return {
    ticketCode,
    phoneNumber,
    setTicketCode,
    setPhoneNumber,
    onSearch,
    result,
    loading,
    error,
  };
}
