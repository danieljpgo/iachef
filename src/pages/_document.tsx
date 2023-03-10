import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    // scroll-smooth
    <Html lang="en" className="h-full antialiased ">
      <Head />
      <body className="h-full caret-orange-500 accent-orange-500 selection:bg-orange-200 [&>div]:grid [&>div]:content-between [&>div]:gap-4">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
