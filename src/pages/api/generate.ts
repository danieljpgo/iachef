import { NextApiRequest, NextApiResponse } from "next";
import { OpenAI, OpenAIStream, OpenAIStreamPayload } from "~/lib/openia";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing env var from OpenAI");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { prompt } = req.body;
  if (!prompt) {
    return new Response("No prompt in the request", { status: 400 });
  }
  if (typeof prompt !== "string") {
    return new Response("No prompt in the request", { status: 400 });
  }

  const payload: OpenAIStreamPayload = {
    model: "text-davinci-003",
    prompt,
    temperature: 0.7,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    max_tokens: 2046,
    stream: false,
    n: 1,
  };

  const response = await OpenAI(payload);
  res.status(200).json(response);
}
