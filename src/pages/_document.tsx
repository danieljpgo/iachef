import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="h-full antialiased">
      <Head />
      {/* [&>div]:place-content-center */}
      <body className="h-full [&>div]:grid [&>div]:content-between [&>div]:gap-4">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
