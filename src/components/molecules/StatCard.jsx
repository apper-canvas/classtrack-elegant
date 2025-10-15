import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend = null,
  color = "primary",
  subtitle = null 
}) => {
  const colorVariants = {
    primary: "from-primary/10 to-blue-600/10 text-primary",
    secondary: "from-secondary/10 to-purple-600/10 text-secondary",
    success: "from-success/10 to-green-600/10 text-success",
    warning: "from-warning/10 to-yellow-600/10 text-warning",
    error: "from-error/10 to-red-600/10 text-error"
  };

  return (
    <Card className="p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-1" hover>
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {trend && (
            <div className={`flex items-center text-sm ${
              trend.positive ? 'text-success' : 'text-error'
            }`}>
              <ApperIcon 
                name={trend.positive ? "TrendingUp" : "TrendingDown"} 
                className="w-4 h-4 mr-1" 
              />
              {trend.value}
            </div>
          )}
        </div>
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${colorVariants[color]} flex items-center justify-center backdrop-blur-sm`}>
          <ApperIcon name={icon} className="w-8 h-8" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;