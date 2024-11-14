import { WebSocketServer, WebSocket } from "ws";
import { prisma } from "@repo/db/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";
import { SpaceManager } from "./SpaceManager";
import { User } from "./UserManager";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws) => {
  const user = new User(ws);
  ws.on("close", () => {
    user.destroy();
  });
});
