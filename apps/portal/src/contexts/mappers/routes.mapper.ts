import type { RouteCardVM } from "../../features/RoutesPage/types";

export function mapTripsToRoutes(trips: any[]): RouteCardVM[] {
  const map = new Map<string, RouteCardVM>();

  trips.forEach((trip) => {
    const key = `${trip.fromLocation.name}-${trip.toLocation.name}`;

    if (!map.has(key)) {
      map.set(key, {
        from: trip.fromLocation.name,
        to: trip.toLocation.name,
        tripsPerDay: 1,
        minPrice: trip.price,
        durationText: '', // có thể tính sau
        image: trip.routeImage || '',
        gradient: 'from-blue-500 to-cyan-500',
      });
    } else {
      const item = map.get(key)!;
      item.tripsPerDay += 1;
      item.minPrice = Math.min(item.minPrice, trip.price);
    }
  });

  return Array.from(map.values());
}
