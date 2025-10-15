import React from "react";
import Input from "@/components/atoms/Input";
import { cn } from "@/utils/cn";

const FormField = ({ 
  label, 
  error = null, 
  required = false, 
  className = "",
  children,
  ...props 
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}
      
      {children || <Input error={!!error} {...props} />}
      
      {error && (
        <p className="text-sm text-error animate-shake">
          {error}
        </p>
      )}
    </div>
  );
};

export default FormField;