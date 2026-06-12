import bcrypt from "bcryptjs";

interface User {
  id: number;
  openId: string;
  name: string | null;
  email: string;
  password?: string;
}

interface Friendship {
  id: number;
  userId: number;
  friendId: number;
  createdAt: Date;
}

interface FriendRequest {
  id: number;
  senderId: number;
  receiverId: number;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
  updatedAt: Date;
}

interface Message {
  id: number;
  senderId: number;
  receiverId: number;
  content: string;
  isRead: boolean;
  createdAt: Date;
}

interface BlockedUser {
  id: number;
  blockerId: number;
  blockedId: number;
  createdAt: Date;
}

interface UserStatus {
  id: number;
  userId: number;
  isOnline: boolean;
  lastSeen: Date;
  updatedAt: Date;
}

class MockDatabase {
  private users: Map<number, User> = new Map();
  private friendships: Map<number, Friendship> = new Map();
  private friendRequests: Map<number, FriendRequest> = new Map();
  private messages: Map<number, Message> = new Map();
  private blockedUsers: Map<number, BlockedUser> = new Map();
  private userStatus: Map<number, UserStatus> = new Map();

  private nextUserId = 1;
  private nextFriendshipId = 1;
  private nextRequestId = 1;
  private nextMessageId = 1;
  private nextBlockedId = 1;
  private nextStatusId = 1;

  // Users
  async createUser(name: string, email: string, password: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user: User = {
      id: this.nextUserId++,
      openId: `email_${this.nextUserId}`,
      name,
      email,
      password: hashedPassword,
    };
    this.users.set(user.id, user);
    this.userStatus.set(user.id, {
      id: this.nextStatusId++,
      userId: user.id,
      isOnline: false,
      lastSeen: new Date(),
      updatedAt: new Date(),
    });
    return user;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  }

  async getUserById(id: number): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async verifyPassword(user: User, password: string): Promise<boolean> {
    if (!user.password) return false;
    return bcrypt.compare(password, user.password);
  }

  // Friends
  async addFriend(userId: number, friendId: number): Promise<Friendship> {
    const friendship: Friendship = {
      id: this.nextFriendshipId++,
      userId: Math.min(userId, friendId),
      friendId: Math.max(userId, friendId),
      createdAt: new Date(),
    };
    this.friendships.set(friendship.id, friendship);
    return friendship;
  }

  async getFriends(userId: number): Promise<User[]> {
    const friends: User[] = [];
    for (const friendship of this.friendships.values()) {
      if (friendship.userId === userId) {
        const friend = this.users.get(friendship.friendId);
        if (friend) friends.push(friend);
      } else if (friendship.friendId === userId) {
        const friend = this.users.get(friendship.userId);
        if (friend) friends.push(friend);
      }
    }
    return friends;
  }

  async removeFriend(userId: number, friendId: number): Promise<void> {
    for (const [id, friendship] of this.friendships.entries()) {
      if (
        (friendship.userId === userId && friendship.friendId === friendId) ||
        (friendship.userId === friendId && friendship.friendId === userId)
      ) {
        this.friendships.delete(id);
      }
    }
  }

  // Friend Requests
  async sendFriendRequest(senderId: number, receiverId: number): Promise<FriendRequest> {
    const request: FriendRequest = {
      id: this.nextRequestId++,
      senderId,
      receiverId,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.friendRequests.set(request.id, request);
    return request;
  }

  async getPendingRequests(userId: number): Promise<FriendRequest[]> {
    const requests: FriendRequest[] = [];
    for (const request of this.friendRequests.values()) {
      if (request.receiverId === userId && request.status === "pending") {
        requests.push(request);
      }
    }
    return requests;
  }

  async respondToRequest(requestId: number, action: "accepted" | "declined"): Promise<void> {
    const request = this.friendRequests.get(requestId);
    if (request) {
      request.status = action;
      request.updatedAt = new Date();
      if (action === "accepted") {
        await this.addFriend(request.senderId, request.receiverId);
      }
    }
  }

  // Messages
  async sendMessage(senderId: number, receiverId: number, content: string): Promise<Message> {
    const message: Message = {
      id: this.nextMessageId++,
      senderId,
      receiverId,
      content,
      isRead: false,
      createdAt: new Date(),
    };
    this.messages.set(message.id, message);
    return message;
  }

  async getMessages(userId: number, friendId: number): Promise<Message[]> {
    const messages: Message[] = [];
    for (const msg of this.messages.values()) {
      if (
        (msg.senderId === userId && msg.receiverId === friendId) ||
        (msg.senderId === friendId && msg.receiverId === userId)
      ) {
        messages.push(msg);
        if (msg.receiverId === userId) {
          msg.isRead = true;
        }
      }
    }
    return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async getUnreadCounts(userId: number): Promise<Record<number, number>> {
    const counts: Record<number, number> = {};
    for (const msg of this.messages.values()) {
      if (msg.receiverId === userId && !msg.isRead) {
        counts[msg.senderId] = (counts[msg.senderId] || 0) + 1;
      }
    }
    return counts;
  }

  // Blocked Users
  async blockUser(blockerId: number, blockedId: number): Promise<void> {
    const blocked: BlockedUser = {
      id: this.nextBlockedId++,
      blockerId,
      blockedId,
      createdAt: new Date(),
    };
    this.blockedUsers.set(blocked.id, blocked);
    await this.removeFriend(blockerId, blockedId);
  }

  async unblockUser(blockerId: number, blockedId: number): Promise<void> {
    for (const [id, blocked] of this.blockedUsers.entries()) {
      if (blocked.blockerId === blockerId && blocked.blockedId === blockedId) {
        this.blockedUsers.delete(id);
      }
    }
  }

  async getBlockedUsers(userId: number): Promise<User[]> {
    const blocked: User[] = [];
    for (const b of this.blockedUsers.values()) {
      if (b.blockerId === userId) {
        const user = this.users.get(b.blockedId);
        if (user) blocked.push(user);
      }
    }
    return blocked;
  }

  // User Status
  async setUserOnline(userId: number, isOnline: boolean): Promise<void> {
    for (const status of this.userStatus.values()) {
      if (status.userId === userId) {
        status.isOnline = isOnline;
        status.updatedAt = new Date();
        if (!isOnline) {
          status.lastSeen = new Date();
        }
        return;
      }
    }
  }

  async getUserStatus(userId: number): Promise<{ isOnline: boolean; lastSeen: Date } | null> {
    for (const status of this.userStatus.values()) {
      if (status.userId === userId) {
        return { isOnline: status.isOnline, lastSeen: status.lastSeen };
      }
    }
    return null;
  }

  async getFriendsStatus(userId: number): Promise<Record<number, boolean>> {
    const friends = await this.getFriends(userId);
    const status: Record<number, boolean> = {};
    for (const friend of friends) {
      const friendStatus = await this.getUserStatus(friend.id);
      status[friend.id] = friendStatus?.isOnline || false;
    }
    return status;
  }
}

export const mockDb = new MockDatabase();
