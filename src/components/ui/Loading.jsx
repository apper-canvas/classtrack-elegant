import React from "react";

const Loading = ({ className = "" }) => {
  return (
    <div className={`animate-pulse space-y-6 ${className}`}>
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-48"></div>
        <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-32"></div>
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-surface rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-20"></div>
                <div className="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-16"></div>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Content cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="bg-surface rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="space-y-4">
              <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-32"></div>
              {[...Array(3)].map((_, itemIndex) => (
                <div key={itemIndex} className="flex items-center space-x-4 p-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-3/4"></div>
                    <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Loading;