// Helper to serialize Mongoose documents to plain objects
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}

export function guessMealType() {
  const hoursNow = new Date().getHours();

  if (hoursNow > 6 && hoursNow < 11) {
    return "breakfast";
  }
  if (hoursNow > 11 && hoursNow < 15) {
    return "lunch";
  }
  if (hoursNow > 17 && hoursNow < 23) {
    return "dinner";
  }

  return "snack";
}
