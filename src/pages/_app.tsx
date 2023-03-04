import "~/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { cn } from "~/lib/tailwindcss";
import { Heading, Text } from "~/components";

const inter = Inter({ subsets: ["latin"] });

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <header className="mx-auto w-full max-w-2xl px-6">
        <div className="flex border-b py-4">
          <Heading as="h1" size="3xl" tracking="tight" color="blackout">
            👨‍🍳&nbsp;
          </Heading>
          <Heading
            as="h1"
            size="3xl"
            color="blackout"
            weight="semibold"
            tracking="tight"
          >
            IA
          </Heading>
          <Heading as="h1" size="3xl" tracking="tight" color="blackout">
            Chef
          </Heading>
        </div>
      </header>
      <main className={cn(inter.className, "mx-auto w-full max-w-5xl px-6")}>
        <Component {...pageProps} />
      </main>
      <footer className="mx-auto w-full max-w-2xl px-6">
        <div className="flex justify-center gap-1 border-t py-4">
          <Text size="base" color="light">
            <b>IA</b>Cheft
          </Text>
          <Text size="base" color="light">
            -
          </Text>
          <a
            href="https://twitter.com/danieljpgo"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            @danieljpgo
          </a>
        </div>
      </footer>
    </>
  );
}
