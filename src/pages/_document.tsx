import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en" className="h-full bg-gray-50">
      <Head>
        <meta
          name="description"
          content="Real time results made easy"
          key="desc"
        />
        <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
      </Head>
      <body className="h-full overflow-hidden">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}