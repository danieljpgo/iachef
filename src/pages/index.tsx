import * as React from "react";
import Head from "next/head";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  const [recipe, setRecipe] = React.useState("");
  const [status, setStatus] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setStatus("Buscando receita");
    setRecipe("");

    console.log("entrou");

    const formData = Object.fromEntries(
      new FormData(e.currentTarget).entries()
    );
    console.log(formData);

    const response = await fetch(
      "/api/recipe" +
        "?" +
        new URLSearchParams({ ingredients: Object.values(formData) as any })
    );

    const data = await response.json();
    console.log(data);

    if (data) {
      setStatus("Receita já gerada, retornando a você:");
      setRecipe(data.content);
      return;
    }

    setStatus("Receita nova, conversando com ChatGPT:");

    const prompt = `Gerar uma receita utilizando apenas os seguintes ingredientes: ${Object.keys(
      formData
    )}. Listar os ingredientes neceessários e o modo de preparo, com menos de 1000 caracteres. Por fim, com uma variação de bom apetite no final.`;

    const chatresponse = await fetch("/api/generate-stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    console.log({ chatresponse });
    console.log("Edge function returned.");

    if (!chatresponse.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const chatdata = chatresponse.body;
    if (!chatdata) {
      return;
    }

    console.log(chatdata);

    const reader = chatdata.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let content = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);

      console.log(chunkValue);
      content = content + chunkValue;
      setRecipe((prev) => prev + chunkValue);
    }
    setStatus("Receita nova gerada pelo ChatGPT");
    console.log({ recipe });
    console.log({ content });
    console.log(Object.values(formData));

    const postResponse = await fetch("/api/recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ingredients: Object.values(formData),
        content: content,
      }),
    });
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
        <form onSubmit={handleSubmit}>
          <fieldset>
            <input
              value="clelpmimw0006q33jp0jv2gwn"
              type="checkbox"
              id="rice"
              name="arroz"
            />
            <label htmlFor="scales">Arroz</label>
            <input
              value="clelpp8cc0007q33jv9uwk775"
              type="checkbox"
              id="tomato"
              name="tomate"
            />
            <label htmlFor="scales">Tomate</label>
            <input
              value="clelrjrls0000q32dvuoko4rg"
              type="checkbox"
              id="frango"
              name="frango"
            />
            <label htmlFor="scales">Peito de Frango</label>
          </fieldset>
          <button type="submit">gerar</button>
        </form>

        <pre style={{ whiteSpace: "pre-wrap" }}>
          <p>{status}</p>
        </pre>
        <pre style={{ whiteSpace: "pre-wrap" }}>
          <p>{recipe}</p>
        </pre>
      </main>
    </>
  );
}
