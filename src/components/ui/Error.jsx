import React from "react";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ 
  message = "Something went wrong", 
  onRetry = null,
  className = "" 
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      <div className="bg-gradient-to-br from-error/10 to-error/20 rounded-full p-6 mb-6">
        <ApperIcon 
          name="AlertTriangle" 
          className="w-12 h-12 text-error"
        />
      </div>
      
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>
      
      <p className="text-gray-600 text-center mb-6 max-w-md">
        {message}
      </p>
      
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-blue-600 text-white font-medium rounded-lg hover:from-primary/90 hover:to-blue-600/90 transition-all duration-200 transform hover:scale-105 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2"
        >
          <ApperIcon name="RefreshCw" className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
};

export default Error;