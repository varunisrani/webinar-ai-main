import { StreamVideoClient } from "@stream-io/video-react-sdk";

// Client-side video client manager to prevent multiple instances
class StreamVideoClientManager {
  private static clientInstances: Map<string, StreamVideoClient> = new Map();

  static getInstance(apiKey: string, user: any, token: string): StreamVideoClient {
    const clientKey = `${user.id}-${apiKey}`;
    
    // Check if we already have a client for this user
    if (this.clientInstances.has(clientKey)) {
      return this.clientInstances.get(clientKey)!;
    }

    // Create new client instance
    const client = new StreamVideoClient({
      apiKey,
      user,
      token,
    });

    // Store the client instance
    this.clientInstances.set(clientKey, client);
    
    return client;
  }

  static getOrCreateInstance(apiKey: string, user: any, token: string): StreamVideoClient {
    return this.getInstance(apiKey, user, token);
  }

  static disconnectClient(userId: string, apiKey: string) {
    const clientKey = `${userId}-${apiKey}`;
    const client = this.clientInstances.get(clientKey);
    
    if (client) {
      try {
        // Disconnect the client
        client.disconnectUser();
        this.clientInstances.delete(clientKey);
      } catch (error) {
        console.warn("Error disconnecting client:", error);
      }
    }
  }

  static disconnectAllClients() {
    this.clientInstances.forEach((client, key) => {
      try {
        client.disconnectUser();
      } catch (error) {
        console.warn("Error disconnecting client:", error);
      }
    });
    this.clientInstances.clear();
  }
}

export { StreamVideoClientManager };

