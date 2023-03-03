import { z } from "zod";
import {
  createParser,
  ParsedEvent,
  ReconnectInterval,
} from "eventsource-parser";
import { env } from "~/lib/env.mjs";

const schema = z.object({
  prompt: z.string(),
});

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request) {
  try {
    const validation = schema.safeParse(await req.json());
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
        function streamParser(event: ParsedEvent | ReconnectInterval) {
          if (event.type === "event") {
            const data = event.data;
            if (data === "[DONE]") {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const text = json.choices[0].delta?.content;
              const queue = encoder.encode(text);
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
