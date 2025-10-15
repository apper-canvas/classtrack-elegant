import React from "react";
import { cn } from "@/utils/cn";

const Button = React.forwardRef(({ 
  className = "", 
  variant = "primary", 
  size = "md", 
  children, 
  disabled = false,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-blue-600 text-white hover:from-primary/90 hover:to-blue-600/90 hover:shadow-lg hover:scale-105 focus:ring-primary/50",
    secondary: "bg-gradient-to-r from-secondary to-purple-600 text-white hover:from-secondary/90 hover:to-purple-600/90 hover:shadow-lg hover:scale-105 focus:ring-secondary/50",
    outline: "border-2 border-primary text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:scale-105 focus:ring-primary/50",
    ghost: "text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-gray/50",
    danger: "bg-gradient-to-r from-error to-red-600 text-white hover:from-error/90 hover:to-red-600/90 hover:shadow-lg hover:scale-105 focus:ring-error/50"
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm gap-2",
    md: "px-6 py-3 text-base gap-2",
    lg: "px-8 py-4 text-lg gap-3"
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;