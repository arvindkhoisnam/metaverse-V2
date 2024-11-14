import express from "express";
import { prisma } from "@repo/db/prisma";
import {
  createSpaceSchema,
  deleteSpaceElement,
  updateSpaceShema,
} from "../../../utils/validators";
import { userMiddleware } from "../../middlewares/user";
import { user } from "../user/user.js";

const route = express.Router();

route.post("/", userMiddleware, async (req, res) => {
  const { name, dimensions, mapId } = req.body;
  const validInputs = createSpaceSchema.safeParse(req.body);

  if (!validInputs.success) {
    res.status(400).json({ message: "Invalid inputs" });
    return;
  }

  const [width, height] = dimensions.split("x");

  if (!mapId) {
    const space = await prisma.space.create({
      data: {
        name,
        height: Number(height),
        width: Number(width),
        ownerId: req.userId as string,
      },
    });
    res.status(200).json({
      spaceId: space.id,
    });
    return;
  } else {
    const map = await prisma.map.findFirst({
      where: { id: mapId },
      select: { elements: true, width: true, height: true },
    });

    if (!map) {
      res.status(400).json({ message: "Map not found." });
      return;
    }
    const space = await prisma.$transaction(async () => {
      const space = await prisma.space.create({
        data: {
          name,
          height: map.height,
          width: map.width,
          ownerId: req.userId as string,
        },
      });

      map?.elements.forEach(async (element) => {
        await prisma.spaceElements.create({
          data: {
            elementId: element.elementId,
            x: element.x!,
            y: element.y!,
            spaceId: space.id,
          },
        });
      });
      return space;
    });
    res.status(200).json({
      spaceId: space.id,
    });
  }

  //   try {
  //     const space = await prisma.space.create({
  //       data: { name, height, width, mapId, ownerId: "" },
  //     });
  //     res.status(200).json({
  //       spaceId: space.id,
  //     });
  //   } catch (err) {
  //     console.log(err);
  //     res
  //       .status(400)
  //       .json({ message: "There was an error while creating space." });
  //   }
});
route.delete("/element", userMiddleware, async (req, res) => {
  console.log("Inside delete element");
  const { id } = req.body;
  console.log(req.body);
  const validInputs = deleteSpaceElement.safeParse(req.body);

  if (!validInputs.success) {
    res.status(400).json({ message: "Invalid inputs" });
    return;
  }
  const spaceElement = await prisma.spaceElements.findUnique({
    where: { id: id },
    select: { space: true },
  });
  if (!spaceElement) {
    res.status(400).json({ message: "Element not found in space" });
    return;
  }
  if (spaceElement.space.ownerId !== req.userId) {
    res.status(403).json({ message: "Unauthorized" });
  }
  const spaceElements = await prisma.spaceElements.delete({
    where: { id: id },
  });
  res.status(200).json({ message: "Element deleted from space." });
});
route.delete("/:spaceId", userMiddleware, async (req, res) => {
  console.log("Inside delete space");
  const { spaceId } = req.params;
  const space = await prisma.space.findUnique({ where: { id: spaceId } });

  if (!space) {
    res.status(400).json({ message: "Space not found." });
    return;
  }

  if (space?.ownerId !== req.userId) {
    res.status(403).json({ message: "Unauthorized to delete space" });
    return;
  }

  await prisma.space.delete({ where: { id: spaceId } });

  res.status(200).json({ message: "Space deleted" });
});

route.get("/all", userMiddleware, async (req, res) => {
  const spaces = await prisma.space.findMany({
    where: { ownerId: req.userId },
  });
  res.status(200).json({ spaces: spaces });
});

route.get("/:spaceId", async (req, res) => {
  const { spaceId } = req.params;

  const space = await prisma.space.findFirst({
    where: { id: spaceId },
    include: {
      elements: {
        include: {
          element: true,
        },
      },
    },
  });

  if (!space) {
    res.status(400).json({ message: "No space found with this spaceId" });
    return;
  }

  res.status(200).json({
    dimensions: `${space.width}x${space.height}`,
    elements: space.elements.map((element) => ({
      id: element.id,
      element: {
        id: element.element.id,
        imageUrl: element.element.imageUrl,
        isStatic: element.element.isStatic,
        height: element.element.height,
        width: element.element.width,
      },
      x: element.x,
      y: element.y,
    })),
  });
});

route.post("/element", userMiddleware, async (req, res) => {
  const { elementId, spaceId, x, y } = req.body;
  const validInputs = updateSpaceShema.safeParse(req.body);

  if (!validInputs.success) {
    res.status(400).json({ message: "Invalid inputs" });
    return;
  }
  const space = await prisma.space.findUnique({ where: { id: spaceId } });
  if (!space) {
    res.status(200).json({ message: "Space not found" });
    return;
  }
  const isOwner = space?.ownerId === req.userId;
  if (!isOwner) {
    res.status(403).json({ message: "Unauthorized" });
    return;
  }

  await prisma.spaceElements.create({ data: { elementId, x, y, spaceId } });

  res.status(200).json({ message: "Element added" });
});

export { route as space };
