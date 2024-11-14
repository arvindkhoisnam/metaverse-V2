import { prisma } from "@repo/db/prisma";
import {
  createAvatarSchema,
  createElementSchema,
  createMapSchema,
} from "../../../utils/validators";
import express from "express";
import { adminMiddleware } from "../../middlewares/admin";

const route = express.Router();

route.post("/avatar", adminMiddleware, async (req, res) => {
  const { imageUrl, name } = req.body;
  const validInputs = createAvatarSchema.safeParse(req.body);

  if (!validInputs) {
    res.status(400).json({ message: "Please provide valid inputs." });
    return;
  }

  try {
    const avatar = await prisma.avatar.create({
      data: {
        imageUrl,
        name,
      },
    });
    res.status(200).json({ avatarId: avatar.id });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .json({ avatarId: "There was an error while creating avatar." });
  }
});

route.post("/element", adminMiddleware, async (req, res) => {
  const { imageUrl, width, height, isStatic } = req.body;
  const validInputs = createElementSchema.safeParse(req.body);

  if (!validInputs) {
    res.status(400).json({ message: "Please provide valid inputs." });
    return;
  }

  try {
    const newElement = await prisma.element.create({
      data: {
        imageUrl,
        width,
        height,
        isStatic,
      },
    });

    res.status(200).json({ id: newElement.id });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .json({ message: "There was an error while creating element." });
  }
});

route.put("/element/:elementId", adminMiddleware, async (req, res) => {
  const { elementId } = req.params;
  const { imageUrl } = req.body;

  try {
    const element = await prisma.element.update({
      where: { id: elementId },
      data: {
        imageUrl: imageUrl,
      },
    });
    res.status(200).json({ message: "Element successfully updated." });
  } catch (err) {
    res.status(400).json({ message: "There was an error" });
  }
});
route.post("/map", adminMiddleware, async (req, res) => {
  const { thumbnail, name, dimensions, defaultElements } = req.body;

  const validInputs = createMapSchema.safeParse(req.body);

  if (!validInputs) {
    res.status(400).json({ message: "Please provide valid inputs." });
    return;
  }
  try {
    const [width, height] = dimensions.split("x");
    const map = await prisma.map.create({
      data: {
        thumbnail,
        name,
        height: Number(height),
        width: Number(width),
      },
    });

    defaultElements.forEach(
      async (element: { elementId: string; x: number; y: number }) => {
        await prisma.mapElements.create({
          data: {
            elementId: element.elementId,
            x: element.x,
            y: element.y,
            mapId: map.id,
          },
        });
      }
    );

    res.status(200).json({ id: map.id });
  } catch (err) {
    console.log(err);
    res
      .status(400)
      .json({ avatarId: "There was an error while creating map." });
  }
});
export { route as admin };
