declare global {
  namespace Express {
    export interface Request {
      type?: "admin" | "user";
      userId?: string;
    }
  }
}
