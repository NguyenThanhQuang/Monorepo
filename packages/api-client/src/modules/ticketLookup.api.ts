// src/pages/ticket-lookup/ticketLookup.api.ts

import { TicketLookupForm, TicketLookupResponse } from "@obtp/shared-types";


export async function lookupBooking(
  payload: TicketLookupForm,
): Promise<TicketLookupResponse> {
  const res = await fetch('/api/bookings/lookup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Lookup failed');
  }

  return res.json();
}
