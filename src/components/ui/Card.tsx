import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  className = "",
  children,
  interactive = false,
  ...props
}) => {
  const baseStyles =
    "bg-card border border-card-border rounded-3xl p-6 backdrop-blur-sm shadow-xl";
  const interactiveStyles = interactive
    ? "cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(56,189,248,0.15)] hover:border-primary/30"
    : "";

  return (
    <div
      className={`${baseStyles} ${interactiveStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
