import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { prisma } from "~/lib/prisma";

const querySchema = z.object({
  ingredients: z.string(),
  type: z.string(),
  size: z.string(),
});
const bodySchema = z.object({
  size: z.string(),
  type: z.string(),
  content: z.string(),
  ingredients: z.array(z.string()),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { method, body, query } = req;

    if (method === "GET") {
      const validation = querySchema.safeParse(query);
      if (!validation.success) {
        return res
          .status(400)
          .json({ statusCode: 400, message: "Invalid parameters" });
      }

      const recipes = await prisma.recipe.findMany({
        include: { ingredients: true },
        where: {
          type: validation.data.type,
          size: validation.data.size,
          ingredients: {
            every: { id: { in: validation.data.ingredients.split(",") } },
          },
        },
      });

      // @TODO: melhorar
      const selectRecipe = recipes.find((recipe) =>
        query?.ingredients
          ?.toString()
          ?.split(",")
          .every((id) =>
            recipe.ingredients.some((ingredient) => ingredient.id === id),
          ),
      );

      return res.status(200).json(selectRecipe ?? null); // todo melhorar
    }

    if (method === "POST") {
      const validation = bodySchema.safeParse(body);
      if (!validation.success) {
        return res
          .status(400)
          .json({ statusCode: 400, message: "Invalid parameters" });
      }
      if (req.headers.authorization !== process.env.AUTHORIZED_REQUEST) {
        return res
          .status(401)
          .json({ statusCode: 401, message: "Unauthorized request" });
      }

      const recipes = await prisma.recipe.create({
        data: {
          content: validation.data.content,
          size: validation.data.size,
          type: validation.data.type,
          ingredients: {
            connect: validation.data.ingredients.map((id) => ({ id })),
          },
        },
      });

      return res.status(200).json(recipes);
    }

    return res
      .setHeader("Allow", ["GET", "POST"])
      .status(405)
      .send("Method Not Allowed");
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ statusCode: 500, message: error.message });
    }
    return res.status(500).json({ statusCode: 500, message: String(error) });
  }
}
