import type { Category, Ingredient } from "@prisma/client";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import * as React from "react";
import Head from "next/head";
import Balancer from "react-wrap-balancer";
import { z } from "zod";
import { items } from "~/lib/ingredients";
import { prisma } from "~/lib/prisma";
import { useDebounce } from "~/hooks";
import { Button, Checkbox, Heading, Tabs, Text } from "~/components";

const categoriesLabel: Record<string, string> = {
  vegetable: "Vegetal",
  animal: "Animal",
  cereal: "Cereal",
  fruits: "Frutas",
};

const recipeSizes = [
  { value: "1", label: "1 Pessoa" },
  { value: "2", label: "2 Pessoa" },
  { value: "4", label: "4 Pessoa" },
] as const;

const recipeTypes = [
  { value: "healthy", label: "Saudável" },
  { value: "tasty", label: "Saborosa" },
] as const;

export default function Home(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  const { categories, ingredients } = props;
  const [recipe, setRecipe] = React.useState("");
  const [type, setType] = React.useState<"idle" | "new" | "book">();
  const [status, setStatus] = React.useState<"idle" | "loading" | "success">(
    "idle",
  );

  const typeDelayed = useDebounce(type, 1000);

  async function handleSubmit(form: Form) {
    if (status === "loading") return;

    setType("idle");
    setRecipe("");
    setStatus("loading");

    const response = await fetch(
      "/api/recipe" +
        "?" +
        new URLSearchParams({
          ingredients: form.ingredients.toString(),
          size: form.size,
          type: form.type,
        }),
    );

    const data = await response.json();
    if (data) {
      setType("book");
      let content = data.content.split("\n");
      let count = 0;

      while (count < content.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setRecipe((prev) => prev + content[count] + "\n");
        count++;
      }
      console.log(count);
      setStatus("success");
      setType("idle");
      return;
    }
    // setStatus("success-new");
    setType("new");
    const prompt = `Gerar uma receita tentando utilizar apenas os seguintes ingredientes: ${ingredients
      .filter((a) => form.ingredients.includes(a.id))
      .map(
        (a) => items.find((b) => b.name === a.name)?.label,
      )}. A receita será feita para ${form.size} pessoa(s) e o seu foco será ${
      form.type === "tasty"
        ? "ser mais saborosa e não necessariamente ser saudável"
        : "ser mais saudável e não necessariamente ser saborosa"
    }. Listar os ingredientes neceessários e o modo de preparo, com menos de 1000 caracteres. Por fim, desejar um bom apetite no final.`;

    const chatresponse = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!chatresponse.ok) {
      throw new Error(response.statusText);
    }

    // This data is a ReadableStream
    const chatdata = chatresponse.body;
    if (!chatdata) {
      return;
    }

    const reader = chatdata.getReader();
    const decoder = new TextDecoder();
    let done = false;
    let content = "";

    while (!done) {
      const { value, done: doneReading } = await reader.read();
      done = doneReading;
      const chunkValue = decoder.decode(value);
      content = content + chunkValue;
      setRecipe((prev) => prev + chunkValue);
    }
    // setStatus("Receita nova gerada pelo ChatGPT");
    setStatus("success");

    const postResponse = await fetch("/api/recipe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        size: form.size,
        type: form.type,
        ingredients: Object.values(form.ingredients),
        content: content,
      }),
    });
  }

  React.useEffect(() => {
    if (recipe.length > 0) {
      window.scrollTo(0, document.body.scrollHeight);
    }
  }, [recipe]);

  return (
    <>
      <Head>
        <title>IAChef</title>
        <meta name="description" content="IA Chef" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="grid gap-16">
        <section className="max-w-md justify-self-center lg:max-w-none lg:justify-self-auto">
          <div className="grid gap-8 text-center">
            <a
              className="flex max-w-fit items-center justify-center space-x-2 justify-self-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 shadow-md transition-colors hover:bg-gray-100"
              href="https://github.com/danieljpgo/iachef"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <p>Estrela no GitHub</p>
            </a>
            <div className="hidden lg:block">
              <Heading as="h1" size="6xl" weight="bold" color="blackout">
                Gere sua próxima receita em segundos usando ChatGPT
              </Heading>
            </div>
            <div className="lg:hidden">
              <Heading as="h1" size="3xl" weight="bold" color="blackout">
                <Balancer ratio={0.8}>
                  Gere sua próxima receita em segundos usando ChatGPT
                </Balancer>
              </Heading>
            </div>
            <Text as="p" color="base">
              3.000 receitas já geradas.
            </Text>
          </div>
        </section>
        <div className="grid gap-8 lg:grid-cols-[0.75fr_min-content_1fr]">
          <section className="grid max-w-md gap-8 justify-self-center lg:max-w-none lg:justify-self-auto">
            <HomeForm
              status={status}
              categories={categories}
              ingredients={ingredients}
              onSubmit={handleSubmit}
            />
          </section>
          <hr className="h-full w-[1px] bg-gray-200" />
          <section className="mx-auto grid w-full max-w-md lg:mx-0 lg:max-w-none">
            <pre style={{ whiteSpace: "pre-wrap" }} className="w-full">
              <div className="h-full w-full rounded-xl border px-6 py-8 lg:p-8">
                <div className="text-6xl">
                  👨‍🍳
                  <span className="align-top text-5xl">
                    {(() => {
                      if (type === "book") return "📖";
                      if (type === "new") return "💬";
                      if (typeDelayed === "book") return "📖";
                      if (typeDelayed === "new") return "💬";
                      if (status === "loading") return "💭";
                      return "";
                    })()}
                  </span>
                </div>
                <p id="recipe" className="text-sm text-gray-600 lg:text-base">
                  {recipe}
                </p>
              </div>
            </pre>
          </section>
        </div>
      </div>
    </>
  );
}

const schema = z.object({
  ingredients: z.array(z.string()).min(1),
  category: z.string(),
  type: z.enum([recipeTypes[0].value, recipeTypes[1].value]),
  size: z.enum([
    recipeSizes[0].value,
    recipeSizes[1].value,
    recipeSizes[2].value,
  ]),
});

type Form = z.infer<typeof schema>;

type HomeFormProps = {
  status: "idle" | "loading" | "success";
  categories: InferGetStaticPropsType<typeof getStaticProps>["categories"];
  ingredients: InferGetStaticPropsType<typeof getStaticProps>["ingredients"];
  onSubmit: (data: Form) => void;
};

function HomeForm(props: HomeFormProps) {
  const { categories, ingredients, status, onSubmit } = props;
  const [form, setForm] = React.useState<Form>({
    size: recipeSizes[0].value,
    type: recipeTypes[0].value,
    category: categories[0].id,
    ingredients: [],
  });

  function handleTabChange(field: keyof Form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSelectIngredients(state: boolean | string, value: string) {
    setForm((prev) =>
      state
        ? { ...prev, ingredients: [...prev.ingredients, value] }
        : { ...prev, ingredients: prev.ingredients.filter((i) => i !== value) },
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validation = schema.safeParse(form);
    if (!validation.success) return;
    onSubmit(form);
  }

  const selectedIngredients = ingredients.filter(
    (ingredient) => ingredient.categoryId === form.category,
  );

  return (
    <form onSubmit={handleSubmit} className="grid auto-rows-min gap-6">
      <ol className="grid gap-4">
        <li className="grid gap-2">
          <div className="flex gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 font-semibold text-white">
              1
            </div>
            <Text weight="medium">Selecione os ingredientes desejados:</Text>
          </div>
          <Tabs
            value={form.category}
            defaultValue={categories[0].id}
            onValueChange={(value) => handleTabChange("category", value)}
          >
            <Tabs.List>
              {categories.map((category) => (
                <Tabs.Trigger key={category.id} value={category.id}>
                  {categoriesLabel[category.name]}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
          <div
            className={`${
              form.ingredients.length ? "h-[1.5rem]" : "h-0"
            } transition-all`}
          >
            {items
              .filter(({ name }) =>
                form.ingredients.includes(
                  ingredients?.find((item) => item.name === name)?.id ?? "",
                ),
              )
              .map((a) => a.emoji)}
          </div>
          <fieldset className="min-h-[130px]">
            <legend className="sr-only">
              {categories.find(({ id }) => id === form.category)?.name}
            </legend>
            <ul className="grid gap-1">
              {selectedIngredients.map(({ id, name }) => (
                <li key={id} className="flex items-center gap-2">
                  <Checkbox
                    id={name}
                    name={name}
                    checked={form.ingredients.includes(id)}
                    onCheckedChange={(state) =>
                      handleSelectIngredients(state, id)
                    }
                  />
                  <label htmlFor={name}>
                    <Text as="span">
                      {`${
                        items.find((item) => item.name === name)?.emoji ?? "?"
                      } - ${
                        items.find((item) => item.name === name)?.label ?? name
                      }`}
                    </Text>
                  </label>
                </li>
              ))}
            </ul>
          </fieldset>
        </li>
        <li className="grid gap-2">
          <div className="flex gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 font-semibold text-white">
              2
            </div>
            <Text weight="medium">Selecione para quantas pessoas:</Text>
          </div>
          <Tabs
            value={form.size}
            defaultValue={recipeSizes[0].value}
            onValueChange={(value) => handleTabChange("size", value)}
          >
            <Tabs.List>
              {recipeSizes.map((size) => (
                <Tabs.Trigger key={size.value} value={size.value}>
                  {size.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
        </li>
        <li className="grid gap-2">
          <div className="flex gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 font-semibold text-white">
              3
            </div>
            <Text weight="medium">Selecione o tipo de receita:</Text>
          </div>
          <Tabs
            value={form.type}
            defaultValue={recipeTypes[0].value}
            onValueChange={(value) => handleTabChange("type", value)}
          >
            <Tabs.List>
              {recipeTypes.map((size) => (
                <Tabs.Trigger key={size.value} value={size.value}>
                  {size.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
        </li>
      </ol>
      <Button
        type="submit"
        loading={status === "loading"}
        disabled={status === "loading"}
      >
        gerar
      </Button>
    </form>
  );
}

export const getStaticProps: GetStaticProps<{
  categories: Array<Omit<Category, "createdAt" | "updatedAt">>;
  ingredients: Array<Omit<Ingredient, "createdAt" | "updatedAt">>;
}> = async () => {
  const ingredients = await prisma.ingredient.findMany({
    select: { name: true, id: true, categoryId: true },
  });
  const categories = await prisma.category.findMany({
    select: { name: true, id: true },
  });

  if (!ingredients) {
    return {
      props: {
        ingredients: [],
        categories: [],
      },
    };
  }

  return {
    props: {
      categories: categories,
      ingredients: ingredients,
    },
  };
};
