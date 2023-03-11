import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "~/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method === "GET") {
      const count = await prisma.recipe.count();
      return res.status(200).json({ count });
    }

    return res
      .setHeader("Allow", ["GET"])
      .status(405)
      .send("Method Not Allowed");
  } catch (error) {
    if (error instanceof Error) {
      return res.status(500).json({ statusCode: 500, message: error.message });
    }
    return res.status(500).json({ statusCode: 500, message: String(error) });
  }
}
