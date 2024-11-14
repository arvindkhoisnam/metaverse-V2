import { z } from "zod";

const userSignupSchema = z.object({
  username: z.string(),
  password: z.string(),
  avatarId: z.string().optional(),
  type: z.enum(["admin", "user"]),
});

const userSigninShema = z.object({
  username: z.string(),
  password: z.string(),
});

const createAvatarSchema = z.object({
  imageUrl: z.string(),
  name: z.string(),
});

const updateMetadataSchema = z.object({
  avatarId: z.string(),
});

const createElementSchema = z.object({
  imageUrl: z.string(),
  width: z.number(),
  height: z.number(),
  isStatic: z.boolean().optional(),
});

const defaultElementsSchema = z.object({
  elementId: z.string(),
  x: z.number(),
  y: z.number(),
});

const createMapSchema = z.object({
  thumbnail: z.string(),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}/),
  name: z.string(),
  defaultElements: z.array(defaultElementsSchema),
});

const createSpaceSchema = z.object({
  name: z.string(),
  dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}/),
  mapId: z.string().optional(),
});

const updateSpaceShema = z.object({
  elementId: z.string(),
  spaceId: z.string(),
  x: z.number().max(1000),
  y: z.number().max(1000),
});

const deleteSpaceElement = z.object({
  id: z.string(),
});
type UserSignupType = z.infer<typeof userSignupSchema>;
type UserSigninType = z.infer<typeof userSigninShema>;
type createAvatarType = z.infer<typeof createAvatarSchema>;
type createElementType = z.infer<typeof createElementSchema>;
type createMapType = z.infer<typeof createMapSchema>;

export {
  userSignupSchema,
  // UserSignupType,
  userSigninShema,
  // UserSigninType,
  createAvatarSchema,
  // createAvatarType,
  updateMetadataSchema,
  createElementSchema,
  // createElementType,
  createMapSchema,
  // createMapType,
  createSpaceSchema,
  updateSpaceShema,
  deleteSpaceElement,
};
