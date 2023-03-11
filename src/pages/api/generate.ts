import { z } from "zod";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import { env } from "~/lib/env.mjs";

const schema = z.object({
  prompt: z.string(),
  size: z.string(),
  type: z.string(),
  ingredients: z.array(z.string()),
});

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const validation = schema.safeParse(await req.json());

    if (!process.env.AUTHORIZED_REQUEST) {
      return new Response("AUTHORIZED_REQUEST not found", { status: 400 });
    }

    if (!validation.success) {
      return new Response("Prompt não informado", { status: 400 });
    }

    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: validation.data.prompt }],
        temperature: 0.6,
        stream: true,
      }),
    });

    // https://beta.openai.com/docs/api-reference/completions/create#completions/create-stream
    const stream = new ReadableStream({
      async start(controller) {
        let content = "";

        async function streamParser(event: ParsedEvent | ReconnectInterval) {
          if (event.type === "event") {
            const data = event.data;
            if (data === "[DONE]") {
              if (!validation.success) {
                return new Response("Prompt não informado", { status: 400 });
              }

              const url = process.env.VERCEL_URL
                ? `http://${process.env.VERCEL_URL}/api/recipe`
                : "http://localhost:3000/api/recipe";
              // : "https://iachef-git-feature-env-on-edge-danieljpgo.vercel.app/api/recipe";

              const response = await fetch(url, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: String(process.env.AUTHORIZED_REQUEST),
                },
                body: JSON.stringify({
                  authorization: process.env.AUTHORIZED_REQUEST,
                  size: validation.data.size,
                  type: validation.data.type,
                  ingredients: validation.data.ingredients,
                  content: content,
                }),
              }).catch((error) => {
                return new Response(error, { status: 400 });
              });

              if (!response.ok) {
                return new Response(url, { status: 400 });
              }
              // .then(async (a) => console.log(await a.json()))
              // .catch((error) => console.log(error));
              // }
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const text = json.choices[0].delta?.content;
              const queue = encoder.encode(text);

              if (text) {
                content = content + text;
              }

              controller.enqueue(queue);
            } catch (e) {
              controller.error(e);
            }
          }
        }
        const parser = createParser(streamParser);
        for await (const chunk of response.body as any) {
          parser.feed(decoder.decode(chunk));
        }
      },
    });
    return new Response(stream);
  } catch (error) {
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 });
    }
    return new Response(String(error), { status: 500 });
  }
}
