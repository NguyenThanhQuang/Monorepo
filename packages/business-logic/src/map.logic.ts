/**
 * Chuyển đổi mét sang chuỗi hiển thị
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Chuyển đổi giây sang chuỗi giờ phút
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes} phút`;
  return `${hours} giờ ${minutes} phút`;
}
