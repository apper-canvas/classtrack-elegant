import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found",
  description = "Get started by adding your first item",
  icon = "Database",
  action = null,
  className = ""
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-8 mb-6">
        <ApperIcon 
          name={icon} 
          className="w-16 h-16 text-gray-400"
        />
      </div>
      
      <h3 className="text-2xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
        {title}
      </h3>
      
      <p className="text-gray-600 text-center mb-8 max-w-md text-lg">
        {description}
      </p>
      
      {action && (
        <div className="flex flex-col sm:flex-row gap-4">
          {action}
        </div>
      )}
    </div>
  );
};

export default Empty;