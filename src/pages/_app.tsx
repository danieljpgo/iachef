import "~/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { cn } from "~/lib/tailwindcss";
import { Heading, Text } from "~/components";
import { Analytics } from "@vercel/analytics/react";

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
        <div className="flex items-center justify-between gap-1 border-t py-4">
          <Text size="base" color="light">
            <b>IA</b>Cheft
          </Text>
          <a
            href="https://danieljorge.me/"
            target="_blank"
            rel="noreferrer"
            className="text-blue-400 hover:underline"
          >
            danieljorge.me
          </a>
          <div className="flex items-center gap-2">
            <a
              aria-label="Github"
              href="https://github.com/danieljpgo"
              target="_blank"
              rel="noreferrer"
              className="text-gray-700 transition-colors duration-200 hover:text-gray-400 active:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
              </svg>
            </a>
            <a
              aria-label="Twitter"
              href="https://twitter.com/danieljpgo"
              target="_blank"
              rel="noreferrer"
              className="text-gray-700 transition-colors duration-200 hover:text-gray-400 active:text-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
              </svg>
            </a>
          </div>
        </div>
      </footer>
      <Analytics />
    </>
  );
}
