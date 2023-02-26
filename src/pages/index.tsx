import * as React from "react";
import Head from "next/head";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [recipe, setRecipe] = React.useState("");

  const prompt =
    "Receita para duas pessoas, usando aveia, frango, tomate, cebola e cenoura";

  async function handleSubmit() {
    console.log("entrou");
    setRecipe("");

    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    console.log({ response });
    console.log("Edge function returned.");

    if (!response.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const data = response.body;
    if (!data) return;

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      // console.log(doneReading, value);
      done = doneReading;
      const chunkValue = decoder.decode(value);
      // console.log(chunkValue);
      setRecipe((prev) => prev + chunkValue);
    }
  }

  return (
    <>
      <Head>
        <title>IA Chef</title>
        <meta name="description" content="IA Chef" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <button onClick={handleSubmit}>gerar</button>

        <p>{JSON.stringify(recipe, null, 2)}</p>
      </main>
    </>
  );
}

/* <div>
          {recipe
            .substring(recipe.indexOf("1") + 3)
            .split("2.")
            .map((step) => (
              <p key={step}>{step}</p>
            ))}
        </div> */
