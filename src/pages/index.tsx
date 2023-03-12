import type { Category, Ingredient } from "@prisma/client";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import * as React from "react";
import Head from "next/head";
import useSWR from "swr";
import Balancer from "react-wrap-balancer";
import { z } from "zod";
import * as recipes from "~/lib/recipe";
import { prisma } from "~/lib/prisma";
import { generatePrompt } from "~/lib/prompt";
import { useDebounce } from "~/hooks";
import { Button, Checkbox, Heading, Tabs, Text, OGTags } from "~/components";
import { cn } from "~/lib/tailwindcss";

export default function Home(
  props: InferGetStaticPropsType<typeof getStaticProps>,
) {
  const { categories, ingredients } = props;
  const [recipe, setRecipe] = React.useState("");
  const [type, setType] = React.useState<"idle" | "new" | "book">("idle");
  const [status, setStatus] = React.useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const query = useSWR<{ count: number }>(
    "/api/recipe/count",
    (key) => fetch(key).then((res) => res.json()),
    {
      fallback: props.fallback,
      refreshInterval: 1000 * 60,
      dedupingInterval: 1000 * 60,
    },
  );
  const typeDelayed = useDebounce(type, 1000);
  const amountDelayed = useDebounce(query.data.count, 3000);

  async function handleSubmit(form: Form) {
    if (status === "loading") return;

    setRecipe("");
    setType("idle");
    setStatus("loading");

    const recipeResponse = await fetch(
      "/api/recipe?" +
        new URLSearchParams({
          ingredients: form.ingredients.toString(),
          size: form.size,
          type: form.type,
        }),
    );

    const recipeData = await recipeResponse.json();
    if (recipeData) {
      setType("book");
      const content = recipeData.content.split("\n");
      let count = 0;
      while (count < content.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        setRecipe((prev) => prev + content[count] + "\n");
        count++;
      }

      setStatus("success");
      setType("idle");
      return;
    }

    setType("new");
    const prompt = generatePrompt(
      ingredients
        .filter(({ id }) => form.ingredients.includes(id))
        .map(
          ({ name }) =>
            recipes.ingredients.find((b) => b.name === name)?.label ?? "",
        ),
      form.type,
      form.size,
    );

    const openIAResponse = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt,
        size: form.size,
        type: form.type,
        ingredients: form.ingredients,
      }),
    });
    if (openIAResponse.status === 429) {
      setRecipe("\nNúmero de receitas excedidos, espere alguns minutos.");
      setType("idle");
      setStatus("error");
      return;
    }
    if (!openIAResponse.ok || !openIAResponse.body) {
      setRecipe("\nAlgo de errado aconteceu, tente novamente.");
      setType("idle");
      setStatus("error");
      return;
    }

    const reader = openIAResponse.body.getReader();
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
    setType("idle");
    setStatus("success");
    query.mutate({ count: query.data.count + 1 });
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
        <meta
          name="description"
          content="O seu chef pessoal power by ChatGPT"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <OGTags
          title="IAChef 👨‍🍳"
          description="Gere sua próxima receita em segundos usando ChatGPT"
        />
      </Head>
      <div className="grid gap-14 lg:gap-24">
        <section className="max-w-md justify-self-center lg:max-w-none lg:justify-self-auto">
          <div className="grid gap-8 text-center">
            <a
              className="flex max-w-fit items-center justify-center space-x-2 justify-self-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-600 shadow-md transition-colors hover:bg-gray-100 focus-visible:outline-orange-500"
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
                <Balancer>
                  Gere sua próxima receita em segundos usando{" "}
                  <span className="text-orange-500">ChatGPT</span>
                </Balancer>
              </Heading>
            </div>
            <div className="lg:hidden">
              <Heading as="h1" size="3xl" weight="bold" color="blackout">
                <Balancer>
                  Gere sua próxima receita em segundos usando{" "}
                  <span className="text-orange-500">ChatGPT</span>
                </Balancer>
              </Heading>
            </div>
            <div className="flex w-max justify-self-center">
              <Text as="p" color="base">
                {query.data.count} receitas já geradas.
              </Text>
              <div
                className={cn(
                  "relative h-2 w-2 rounded-full bg-orange-500 transition-opacity",
                  amountDelayed !== query.data.count ? "" : "opacity-0",
                )}
              >
                <span className="absolute -ml-1 h-2 w-2 animate-ping rounded-full bg-orange-500 opacity-50" />
              </div>
            </div>
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
          <hr className="mx-auto h-full w-full max-w-md bg-gray-200 lg:w-[1px]" />
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
                      if (status === "error") return "🚧";
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
  type: z.enum([recipes.types[0].value, recipes.types[1].value]),
  size: z.enum([
    recipes.sizes[0].value,
    recipes.sizes[1].value,
    recipes.sizes[2].value,
  ]),
});

type Form = z.infer<typeof schema>;

type HomeFormProps = {
  status: "idle" | "loading" | "success" | "error";
  categories: InferGetStaticPropsType<typeof getStaticProps>["categories"];
  ingredients: InferGetStaticPropsType<typeof getStaticProps>["ingredients"];
  onSubmit: (data: Form) => void;
};

function HomeForm(props: HomeFormProps) {
  const { categories, ingredients, status, onSubmit } = props;
  const [form, setForm] = React.useState<Form>({
    size: recipes.sizes[0].value,
    type: recipes.types[0].value,
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

  function handleCleanUp() {
    setForm({
      size: recipes.sizes[0].value,
      type: recipes.types[0].value,
      category: categories[0].id,
      ingredients: [],
    });
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
      <ol className="grid gap-4" aria-label="Etapas para criar uma receita">
        <li className="grid gap-2">
          <div className="flex gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 font-semibold text-white">
              1
            </div>
            <Text weight="medium">Selecione os ingredientes desejados:</Text>
          </div>
          <Tabs
            value={form.category}
            onValueChange={(value) => handleTabChange("category", value)}
          >
            <Tabs.List>
              {categories.map((category) => (
                <Tabs.Trigger key={category.id} value={category.id}>
                  {recipes.categories[category.name]}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
          <div className="max-w-[300px]">
            {recipes.ingredients
              .filter(({ name }) =>
                form.ingredients.includes(
                  ingredients?.find((item) => item.name === name)?.id ?? "",
                ),
              )
              .map((a) => a.emoji)}
          </div>
          <fieldset className="min-h-[130px]">
            <legend className="sr-only">
              {
                recipes.categories[
                  categories.find(({ id }) => id === form.category)?.name ?? ""
                ]
              }
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
                  <label htmlFor={name} className="w-full">
                    <Text as="span">
                      {`${
                        recipes.ingredients.find((item) => item.name === name)
                          ?.emoji ?? "?"
                      } - ${
                        recipes.ingredients.find((item) => item.name === name)
                          ?.label ?? name
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
            onValueChange={(value) => handleTabChange("size", value)}
          >
            <Tabs.List>
              {recipes.sizes.map((size) => (
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
            onValueChange={(value) => handleTabChange("type", value)}
          >
            <Tabs.List>
              {recipes.types.map((size) => (
                <Tabs.Trigger key={size.value} value={size.value}>
                  {size.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs>
        </li>
      </ol>
      <div className="grid grid-cols-[1fr_auto] gap-4">
        <Button
          type="submit"
          loading={status === "loading"}
          disabled={status === "loading"}
          aria-label="Gerar receita"
        >
          gerar
        </Button>
        <Button
          type="button"
          variant="secondary"
          aria-label="Limpar campos"
          onClick={handleCleanUp}
        >
          ✕
        </Button>
      </div>
    </form>
  );
}

export const getStaticProps: GetStaticProps<{
  categories: Array<Omit<Category, "createdAt" | "updatedAt">>;
  ingredients: Array<Omit<Ingredient, "createdAt" | "updatedAt">>;
  fallback: { "/api/recipe/count": { count: number } };
}> = async () => {
  const ingredients = await prisma.ingredient.findMany({
    select: { name: true, id: true, categoryId: true },
  });
  const categories = await prisma.category.findMany({
    select: { name: true, id: true },
  });
  const count = await prisma.recipe.count();

  return {
    props: {
      categories: categories,
      ingredients: ingredients,
      fallback: {
        "/api/recipe/count": { count },
      },
    },
    revalidate: 60 * 60 * 24,
  };
};
