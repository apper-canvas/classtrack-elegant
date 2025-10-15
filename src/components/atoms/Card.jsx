import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({ 
  className = "", 
  children,
  hover = false,
  ...props 
}, ref) => {
  const baseStyles = "bg-surface rounded-xl border border-gray-100 shadow-lg transition-all duration-200";
  const hoverStyles = hover ? "hover:shadow-xl hover:scale-[1.02] hover:-translate-y-1" : "";

  return (
    <div
      ref={ref}
      className={cn(
        baseStyles,
        hoverStyles,
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;