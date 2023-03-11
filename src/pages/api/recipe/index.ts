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
  authorization: z.string(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { method, body, query } = req;
    if (method === "GET") {
      const validation = querySchema.safeParse(query);
      if (!validation.success) throw new Error("");

      const recipes = await prisma.recipe.findMany({
        include: { ingredients: true },
        where: {
          type: validation.data.type,
          size: validation.data.size,
          ingredients: {
            every: { id: { in: validation.data.ingredients.split(",") } },
          },
        },
      }); // @TODO: melhorar

      const selectRecipe = recipes.find((recipe) =>
        query?.ingredients
          ?.toString()
          ?.split(",")
          .every((id) =>
            recipe.ingredients.some((ingredient) => ingredient.id === id),
          ),
      );

      if (selectRecipe) {
        return res.status(200).json(selectRecipe);
      }
      return res.status(200).json(null);
    }
    if (method === "POST") {
      const validation = bodySchema.safeParse(body);
      if (!validation.success) throw new Error(""); // TODO melhorar aqui

      if (validation.data.authorization !== process.env.AUTHORIZED_REQUEST) {
        throw new Error("wrong AUTHORIZED_REQUEST"); // TODO melhorar aqui
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

    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).send("Method Not Allowed");
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ statusCode: 500, message: error.message });
    }
    return res.status(500).json({ statusCode: 500, message: String(error) });
  }
}

// @TODO: fix type
