import { User } from "./UserManager";

export class SpaceManager {
  static instance: SpaceManager;
  rooms: Map<string, User[]> = new Map();

  private constructor() {
    this.rooms = new Map();
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new SpaceManager();
    }
    return this.instance;
  }

  addUser(spaceId: string, user: User) {
    if (this.rooms.get(spaceId)) {
      this.rooms.set(spaceId, [...(this.rooms.get(spaceId) ?? []), user]);
    } else {
      this.rooms.set(spaceId, [user]);
    }
  }
  broadcast(data: any, user: User, spaceId: string) {
    if (!this.rooms.has(spaceId)) {
      return;
    }
    this.rooms.get(spaceId)?.forEach((u) => {
      if (u.id !== user.id) {
        u.ws.send(JSON.stringify(data));
      }
    });
  }

  removeUser(user: User, spaceId: string) {
    this.rooms.set(
      spaceId,
      this.rooms.get(spaceId)?.filter((u) => u.id! == user.id) || []
    );
  }
}
