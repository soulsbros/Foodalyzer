// Helper to serialize Mongoose documents to plain objects
export function serialize<T>(data: T): T {
  return JSON.parse(JSON.stringify(data));
}
