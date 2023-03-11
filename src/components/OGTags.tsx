import { env } from "~/lib/env.mjs";

type OGTagsProps = {
  title: string;
  description: string;
};

export default function OGTags(props: OGTagsProps) {
  const { description = "", title = "" } = props;
  const url =
    process.env.NODE_ENV === "production"
      ? `https://${process.env.VERCEL_URL}`
      : "";

  const image = `${url}/og.png`;
  const domain = env.NODE_ENV === "development" ? "" : process.env.VERCEL_URL;

  return (
    <>
      <meta name="og:description" content={description} />
      <meta name="og:image" content={image} />
      <meta name="og:title" content={title} />
      <meta property="author" content="Daniel Jorge" />
      <meta property="og:description" content={description} />
      <meta property="og:image" itemProp="image" content={image} />
      <meta property="og:image:alt" content="IAChef" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:site_name" content={title} />
      <meta property="og:title" content={title} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="twitter:domain" content={domain} />
      <meta property="twitter:url" content={url} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content="@danieljpgo" />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:domain" content={domain} />
      <meta name="twitter:image" content={image} />
      <meta name="twitter:site" content="@danieljpgo" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:url" content={url} />
    </>
  );
}
