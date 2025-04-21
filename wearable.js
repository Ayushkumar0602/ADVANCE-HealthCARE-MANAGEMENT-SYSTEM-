
export function getWearableData() {
  const now = new Date().toISOString().split("T")[0];
  return {
    bp: Math.floor(Math.random() * 30) + 100,
    heartRate: Math.floor(Math.random() * 30) + 70,
    sugar: Math.floor(Math.random() * 30) + 90,
    date: now
  };
}
