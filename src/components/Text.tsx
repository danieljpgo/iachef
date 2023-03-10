import { cn } from "~/lib/tailwindcss";

const styles = {
  italic: "italic",
  "not-italic": "not-italic",
} as const;

const colors = {
  lighter: "text-gray-400",
  light: "text-gray-500",
  base: "text-gray-600",
  dark: "text-gray-700",
  darker: "text-gray-800",
  contrast: "text-white",
  error: "text-red-400",
  success: "text-green-500",
  secondary: "text-orange-500",
} as const;

const sizes = {
  "2xs": "text-[10px]",
  xs: "text-xs",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
} as const;

const tags = {
  span: "span",
  p: "p",
  b: "b",
  i: "i",
  strong: "strong",
  em: "em",
  small: "small",
} as const;

const weights = {
  black: "font-black",
  extrabold: "font-extrabold",
  bold: "font-bold",
  semibold: "font-semibold",
  medium: "font-medium",
  normal: "font-normal",
  light: "font-light",
  "extra-light": "font-extralight",
  thin: "font-thin",
} as const;

type TextProps = {
  children: string | React.ReactNode;
  size?: keyof typeof sizes;
  color?: keyof typeof colors;
  as?: keyof typeof tags;
  weight?: keyof typeof weights;
  style?: keyof typeof styles;
};

export function Text(props: TextProps) {
  const {
    children,
    color = "base",
    as = "p",
    size = "base",
    weight,
    style,
  } = props;
  const Tag = as;

  return (
    <Tag
      className={cn(
        sizes[size],
        colors[color],
        weight ? weights[weight] : "",
        style ? styles[style] : "",
      )}
    >
      {children}
    </Tag>
  );
}
