import express from "express";
// import { userSigninShema, userSignupSchema } from "@repo/validators/schema";
import { userSigninShema, userSignupSchema } from "../../utils/validators";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { admin } from "./admin/admin";
import { user } from "./user/user";
import { space } from "./space/space";
import { prisma } from "@repo/db/prisma";

require("dotenv").config();
const route = express.Router();
const saltRounds = 10;

route.use("/admin", admin);
route.use("/user", user);
route.use("/space", space);

route.get("/", (req, res) => {
  res.send("Healthy Server");
});

route.post("/signin", async (req, res) => {
  const { username, password } = req.body;
  const validInputs = userSigninShema.safeParse(req.body);

  if (!validInputs.success) {
    res.status(403).json({ message: "Invalid inputs" });
  }

  try {
    const userFound = await prisma.user.findFirst({
      where: {
        username,
      },
    });
    if (!userFound) {
      res.status(403).json({ message: "Incorrect username or password." });
      return;
    }
    const correctPassword = await bcrypt.compare(password, userFound.password);

    if (correctPassword) {
      const token = jwt.sign(
        { userId: userFound.id, type: userFound.type },
        process.env.JWT_SECRET as string
      );
      res.status(200).json({ message: "Login successful", token });
      return;
    } else {
      res.status(403).json({ message: "Incorrect username or password." });
    }
  } catch (err) {
    console.log(err);
  }
});

route.post("/signup", async (req, res) => {
  const { username, password, type } = req.body;
  const validInputs = userSignupSchema.safeParse(req.body);

  if (!validInputs.success) {
    res.status(400).json({ message: "Invalid inputs." });
    return;
  }

  try {
    const hashedPassword = bcrypt.hashSync(password, saltRounds);
    const newUser = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        type,
      },
    });
    res.status(200).json({ userId: newUser.id });
  } catch (err) {
    res
      .status(400)
      .json({ message: "User with the same username already exists." });
  }
});

route.get("/avatars", async (req, res) => {
  const avatars = await prisma.avatar.findMany();
  res.status(200).json({ avatars: avatars });
});

route.get("/elements", async (req, res) => {
  const elements = await prisma.element.findMany();
  res.status(200).json({
    elements: elements.map((element) => ({
      id: element.id,
      imageUrl: element.imageUrl,
      height: element.height,
      width: element.width,
      isStatic: element.isStatic,
    })),
  });
});
export { route };
