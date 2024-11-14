import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
require("dotenv").config();

export function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const headers = req.headers["authorization"];
  const token = headers?.split(" ")[1];

  if (!token) {
    res.status(403).json({ messge: "Unauthorized" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: string;
      type: string;
    };
    if (decoded.type !== "admin") {
      res.status(403).json({ messge: "Unauthorized" });
      return;
    }
    req.userId = decoded.userId;
    next();
  } catch (err) {
    console.log(err);
    res.status(403).json({ messge: "Unauthorized" });
    return;
  }
}
