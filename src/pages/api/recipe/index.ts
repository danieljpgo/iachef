import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method, body, query } = req;

    console.log({ body, query });

    if (method === "GET") {
      const recipes = await prisma.recipe.findFirst({
        where: {
          ingredients: {
            every: {
              id: {
                in: query?.ingredients?.split(","),
                // in: ["clelpmimw0006q33jp0jv2gwn", "clelpp8cc0007q33jv9uwk775"],
              },
            },
          },
        },
      }); // @TODO: melhorar
      return res.status(200).json(recipes);
    }
    if (method === "POST") {
      const recipes = await prisma.recipe.create({
        data: {
          ingredients: {
            connect: body.ingredients.map((id: any) => ({
              id,
            })),
          },
          content: body.content,
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
