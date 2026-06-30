import { forwardRef } from "react";
import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "dark" | "ghost";
type ButtonSize = "md" | "sm";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn btn-primary",
  dark: "btn btn-dark",
  ghost: "btn btn-ghost",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "",
  sm: "px-4 py-2.5 text-sm",
};

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type ButtonProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonLinkProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { children, className, variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </button>
  );
});

export function ButtonLink({
  children,
  className,
  variant = "primary",
  size = "md",
  href,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(variantClasses[variant], sizeClasses[size], className)}
      {...props}
    >
      {children}
    </Link>
  );
}
