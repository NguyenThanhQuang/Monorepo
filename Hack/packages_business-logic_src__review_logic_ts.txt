export function maskDisplayName(name: string): string {
  if (!name) return "Anonymous";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0]; // Tên 1 chữ thì giữ nguyên hoặc mask 1 phần

  const lastName = parts.pop();
  const firstName = parts[0];

  return `${firstName} ${lastName ? lastName[0] + "..." : ""}`;
}

export function getRatingLabel(rating: number): string {
  if (rating >= 5) return "Tuyệt vời";
  if (rating >= 4) return "Rất tốt";
  if (rating >= 3) return "Khá";
  if (rating >= 2) return "Trung bình";
  return "Kém";
}
