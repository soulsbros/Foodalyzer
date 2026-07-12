import mongoose from "mongoose";

const URI = process.env.MONGODB_URI;

if (!URI) {
  console.error("Please define MONGODB_URI in environment variables");
}

interface Cached {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: Cached | undefined;
}

let cached: Cached = globalThis.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = globalThis.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  cached.promise ??= mongoose.connect(URI!, {
    bufferCommands: false,
  });

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
