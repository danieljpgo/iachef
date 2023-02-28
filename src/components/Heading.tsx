const tags = {
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
} as const;

const sizes = {
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
  "5xl": "text-5xl",
  "6xl": "text-6xl",
} as const;

const defaultSize = {
  h1: "text-3xl",
  h2: "text-2xl",
  h3: "text-xl",
  h4: "text-lg",
  h5: "text-base",
  h6: "text-sm",
} as const;

const colors = {
  base: "text-gray-600",
  dark: "text-gray-700",
  darker: "text-gray-800",
  blackout: "text-gray-900",
  contrast: "text-white",
} as const;

const trackings = {
  tight: "tracking-tight",
  normal: "tracking-normal",
} as const;

const weights = {
  black: "font-black",
  extrabold: "font-extrabold",
  bold: "font-bold",
  semibold: "font-semibold",
  medium: "font-medium",
  normal: "font-normal",
  light: "font-light",
} as const;

type HeadingProps = {
  children: string | React.ReactNode;
  as?: keyof typeof tags;
  weight?: keyof typeof weights;
  size?: keyof typeof sizes;
  color?: keyof typeof colors;
  tracking?: keyof typeof trackings;
};

export function Heading(props: HeadingProps) {
  const {
    children,
    size,
    as: tag = "h2",
    color = "dark",
    tracking = "normal",
    weight = "normal",
  } = props;
  const Tag = tag;

  return (
    <Tag
      className={`
        ${size ? sizes[size] : defaultSize[tag]}
        ${weights[weight]}
        ${colors[color]}
        ${trackings[tracking]}
      `}
    >
      {children}
    </Tag>
  );
}
