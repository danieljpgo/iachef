import * as React from "react";
import { Spinner } from "~/components";
import { cn } from "~/lib/tailwindcss";

const variants = {
  primary: "bg-orange-500 hover:bg-orange-400 focus:border-orange-400",
  secondary:
    "bg-amber-400 hover:bg-amber-300 focus:border-amber-400 focus:bg-amber-300",
};

const sizes = {
  sm: "px-3 py-1.5",
  md: "px-4 py-2",
  lg: "px-6 py-3",
};

type ButtonProps = {
  loading?: boolean;
  children: string;
  size?: keyof typeof sizes;
  variant?: keyof typeof variants;
  disabled?: React.ButtonHTMLAttributes<HTMLButtonElement>["disabled"];
  name?: React.ButtonHTMLAttributes<HTMLButtonElement>["name"];
  value?: React.ButtonHTMLAttributes<HTMLButtonElement>["value"];
  type?: React.ButtonHTMLAttributes<HTMLButtonElement>["type"];
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
};

export function Button(props: ButtonProps) {
  const {
    children,
    type = "button",
    name,
    value,
    disabled,
    loading,
    size = "md",
    variant = "primary",
    onClick,
  } = props;

  return (
    <button
      name={name}
      value={value}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "transform rounded-md text-sm font-medium capitalize tracking-wide text-white transition-all duration-200",
        "focus:outline-none focus:ring focus:ring-orange-300 focus:ring-opacity-50",
        "disabled:cursor-not-allowed disabled:bg-opacity-70",
        variants[variant],
        sizes[size],
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-center gap-2">
        <span>{children}</span>
        {loading && <Spinner variant="contrast" />}
      </div>
    </button>
  );
}
