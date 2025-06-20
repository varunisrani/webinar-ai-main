import { StreamChat } from "stream-chat";

class StreamChatClientManager {
  private static clientInstances: Map<string, StreamChat> = new Map();
  private static connectedUsers: Set<string> = new Set();

  static getInstance(apiKey: string, userId: string): StreamChat {
    const clientKey = `${userId}-${apiKey}`;
    
    // Check if we already have a client for this user
    if (this.clientInstances.has(clientKey)) {
      return this.clientInstances.get(clientKey)!;
    }

    // Create new client instance
    const client = StreamChat.getInstance(apiKey);

    // Store the client instance
    this.clientInstances.set(clientKey, client);
    
    return client;
  }

  static async connectUser(
    apiKey: string, 
    user: { id: string; name: string; image?: string }, 
    token: string
  ): Promise<StreamChat> {
    const client = this.getInstance(apiKey, user.id);
    
    // Check if user is already connected
    if (this.connectedUsers.has(user.id)) {
      return client;
    }

    try {
      await client.connectUser(user, token);
      this.connectedUsers.add(user.id);
    } catch (error) {
      console.warn("Error connecting user to chat:", error);
      // If connection fails but user might already be connected, just return the client
    }
    
    return client;
  }

  static async disconnectUser(userId: string, apiKey: string) {
    const clientKey = `${userId}-${apiKey}`;
    const client = this.clientInstances.get(clientKey);
    
    if (client && this.connectedUsers.has(userId)) {
      try {
        await client.disconnectUser();
        this.connectedUsers.delete(userId);
        this.clientInstances.delete(clientKey);
      } catch (error) {
        console.warn("Error disconnecting user from chat:", error);
      }
    }
  }

  static async disconnectAllUsers() {
    const disconnectPromises = Array.from(this.clientInstances.entries()).map(
      async ([clientKey, client]) => {
        const userId = clientKey.split('-')[0];
        if (this.connectedUsers.has(userId)) {
          try {
            await client.disconnectUser();
            this.connectedUsers.delete(userId);
          } catch (error) {
            console.warn("Error disconnecting user:", error);
          }
        }
      }
    );

    await Promise.all(disconnectPromises);
    this.clientInstances.clear();
  }

  static isUserConnected(userId: string): boolean {
    return this.connectedUsers.has(userId);
  }
}

export { StreamChatClientManager };