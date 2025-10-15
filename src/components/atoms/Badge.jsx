import React from "react";
import { cn } from "@/utils/cn";

const Badge = ({ 
  children, 
  variant = "default", 
  size = "sm",
  className = "",
  ...props 
}) => {
  const baseStyles = "inline-flex items-center font-medium rounded-full transition-all duration-200";
  
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-gradient-to-r from-primary/10 to-blue-600/10 text-primary border border-primary/20",
    success: "bg-gradient-to-r from-success/10 to-green-600/10 text-success border border-success/20",
    warning: "bg-gradient-to-r from-warning/10 to-yellow-600/10 text-warning border border-warning/20",
    error: "bg-gradient-to-r from-error/10 to-red-600/10 text-error border border-error/20",
    info: "bg-gradient-to-r from-info/10 to-blue-600/10 text-info border border-info/20"
  };
  
  const sizes = {
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base"
  };

  return (
    <span
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;