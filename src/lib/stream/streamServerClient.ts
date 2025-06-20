import { StreamClient } from "@stream-io/node-sdk";

// Server-side Stream client for backend operations
// This should only be imported in server-side code
export const getStreamClient = new StreamClient(
  process.env.NEXT_PUBLIC_STREAM_API_KEY!,
  process.env.STREAM_SECRET!
); 