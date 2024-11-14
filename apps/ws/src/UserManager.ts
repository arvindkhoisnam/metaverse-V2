import { prisma } from "@repo/db/prisma";
import { WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { SpaceManager } from "./SpaceManager";

export class User {
  id: string;
  userId?: string;
  spaceId?: string;
  x: number;
  y: number;
  spaceHeight?: number;
  spaceWidth?: number;
  ws: WebSocket;

  constructor(ws: WebSocket) {
    this.id = this.generateId();
    this.x = 0;
    this.y = 0;
    this.ws = ws;
    this.initHandlers();
  }

  initHandlers() {
    this.ws.on("message", async (msg) => {
      const parsedData = JSON.parse(msg as unknown as string);
      switch (parsedData.type) {
        case "join":
          // check if user exists
          const user = jwt.verify(
            parsedData.payload.token,
            "JWT_SECRET"
          ) as JwtPayload;
          if (!user) {
            this.ws.close();
            return;
          }
          this.userId = user.userId;

          //check if space exists
          const space = await prisma.space.findFirst({
            where: { id: parsedData.payload.spaceId },
          });

          if (!space) {
            this.ws.close();
            return;
          }
          this.spaceId = space.id;
          this.spaceHeight = space.height;
          this.spaceWidth = space.width;
          SpaceManager.getInstance().addUser(parsedData.payload.spaceId, this);
          this.x = Math.floor(Math.random() * space?.width);
          this.y = Math.floor(Math.random() * space?.height);
          this.ws.send(
            JSON.stringify({
              type: "space-joined",
              payload: {
                spawn: {
                  x: this.x,
                  y: this.y,
                },
                users:
                  SpaceManager.getInstance()
                    .rooms.get(this.spaceId)
                    ?.filter((u) => u.id !== this.id)
                    .map((u) => ({ id: u.id })) ?? [],
              },
            })
          );

          SpaceManager.getInstance().broadcast(
            {
              type: "user-join",
              payload: {
                userId: this.userId,
                x: this.x,
                y: this.y,
              },
            },
            this,
            this.spaceId!
          );
          break;

        case "move":
          const XDisplacement = Math.abs(this.x - parsedData.payload.x);
          const YDisplacement = Math.abs(this.y - parsedData.payload.y);

          // not allowing user not move diagonally and letting user move only one unit
          if (
            (XDisplacement == 1 && YDisplacement == 0) ||
            (XDisplacement == 0 && YDisplacement == 1)
          ) {
            this.x = parsedData.payload.x;
            this.y = parsedData.payload.y;

            console.log(this.spaceHeight, this.spaceWidth);
            SpaceManager.getInstance().broadcast(
              {
                type: "movement",
                payload: {
                  x: this.x,
                  y: this.y,
                  userId: this.userId,
                },
              },
              this,
              this.spaceId!
            );
          } else {
            this.ws.send(
              JSON.stringify({
                type: "movement-rejected",
                payload: {
                  x: this.x,
                  y: this.y,
                },
              })
            );
          }
          break;
      }
    });
  }

  destroy() {
    SpaceManager.getInstance().broadcast(
      {
        type: "user-left",
        payload: {
          userId: this.userId,
        },
      },
      this,
      this.spaceId!
    );

    SpaceManager.getInstance().removeUser(this, this.spaceId!);
  }

  generateId() {
    return Math.random().toString(36);
  }
}
