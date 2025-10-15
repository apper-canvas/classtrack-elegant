import React from "react";
import { cn } from "@/utils/cn";

const Input = React.forwardRef(({ 
  className = "", 
  type = "text",
  error = false,
  ...props 
}, ref) => {
  const baseStyles = "w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed bg-white";
  
  const errorStyles = error 
    ? "border-error focus:border-error focus:ring-error/50" 
    : "border-gray-300 focus:border-primary focus:ring-primary/50 hover:border-gray-400";

  return (
    <input
      ref={ref}
      type={type}
      className={cn(
        baseStyles,
        errorStyles,
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";

export default Input;