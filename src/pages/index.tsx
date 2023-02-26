import * as React from "react";
import Head from "next/head";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [recipe, setRecipe] = React.useState("");

  const prompt =
    "Receita usando aveia, frango, tomate, cebola, arroz e cenoura. Listar os Ingredientes e o Modo de Preparo, com menos de 1000 caracteres";

  async function handleSubmit(e: any) {
    e.preventDefault();

    console.log("entrou");
    setRecipe("");

    const response = await fetch("/api/generate-stream", {
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
    // const data = await response.json();
    // setRecipe(data.choices[0].text);

    // This data is a ReadableStream
    const data = response.body;
    if (!data) {
      return;
    }

    const reader = data.getReader();
    const decoder = new TextDecoder();
    let done = false;

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      console.log(chunkValue);

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
        <button type="button" onClick={handleSubmit}>
          gerar
        </button>

        <pre style={{ whiteSpace: "pre-wrap" }}>
          <p>{recipe}</p>
        </pre>
        {/* <p>{JSON.stringify(recipe, null, 2)}</p> */}
        <div>
          {/* {recipe
            .substring(recipe.indexOf("1") + 3)
            .split("2.")
            .map((step) => (
              <p key={step}>{step}</p>
            ))} */}
        </div>
      </main>
    </>
  );
}
