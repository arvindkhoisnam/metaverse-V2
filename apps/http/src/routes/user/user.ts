import express from "express";
import { prisma } from "@repo/db/prisma";
import { updateMetadataSchema } from "../../../utils/validators";
import { userMiddleware } from "../../middlewares/user";

const route = express.Router();
route.get("/", (req, res) => {
  res.send("user route");
});
route.post("/metadata", userMiddleware, async (req, res) => {
  const { avatarId } = req.body;
  const validInputs = updateMetadataSchema.safeParse(req.body);
  if (!validInputs.success) {
    res.status(400).json({ messge: "Invalid Inputs" });
    return;
  }
  const avatar = await prisma.avatar.findFirst({ where: { id: avatarId } });

  if (!avatar) {
    res.status(400).json({ message: "No such avatar found." });
    return;
  }

  try {
    await prisma.user.update({
      where: { id: req.userId },
      data: {
        avatarId: avatar?.id,
      },
    });
    res.status(200).json({ message: "Avatar successfully updated." });
  } catch (err) {
    console.log(err);
  }
});

// route.get("/metadata/bulk", async (req, res) => {
//   const ids = req.query.ids;
//   const parsedIds = JSON.parse(ids as unknown as string);

//   //   const avatarsPromises = parsedIds.map(async (id: string) => {
//   //     const user = await prisma.user.findFirst({ where: { id } });
//   //     if (!user) {
//   //     }
//   //     const imageUrl = await prisma.avatar.findFirst({
//   //       where: { id: user?.avatarId as string },
//   //       select: { imageUrl: true, name: true },
//   //     });
//   //     return {
//   //       userId: user?.id,
//   //       imageUrl: imageUrl?.imageUrl,
//   //       name: imageUrl?.name,
//   //     };
//   //   });
//   //   // Wait for all promises to resolve
//   //   const avatars = await Promise.all(avatarsPromises);
//   res.status(200).send("fadfads");
//   //   res.status(200).json({ avatars });
// });
route.get("/metadata/bulk", async (req, res) => {
  const userIdString = (req.query.ids ?? "[]") as string;
  const userIds = userIdString.slice(1, userIdString?.length - 1).split(",");
  const metadata = await prisma.user.findMany({
    where: {
      id: {
        in: userIds,
      },
    },
    select: {
      avatar: true,
      id: true,
    },
  });

  res.json({
    avatars: metadata.map((m) => ({
      userId: m.id,
      avatarId: m.avatar?.imageUrl,
    })),
  });
});
export { route as user };
