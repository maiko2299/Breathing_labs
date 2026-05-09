import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button: React.FC<ButtonProps> = ({
  className = "",
  variant = "primary",
  children,
  ...props
}) => {
  const baseStyles =
    "px-6 py-3 rounded-full font-medium transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-opacity-50 active:scale-95";

  const variants = {
    primary:
      "bg-primary text-background hover:bg-primary-light shadow-[0_0_15px_rgba(56,189,248,0.4)] hover:shadow-[0_0_25px_rgba(125,211,252,0.6)]",
    secondary:
      "bg-card text-primary hover:bg-card-border border border-card-border shadow-sm hover:shadow-[0_0_15px_rgba(56,189,248,0.2)]",
    ghost: "bg-transparent text-foreground hover:text-primary hover:bg-white/5",
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
