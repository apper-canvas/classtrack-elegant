import React from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5 flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mb-6">
            <ApperIcon name="Search" className="w-16 h-16 text-primary" />
          </div>
          
          <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            404
          </h1>
          
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Page Not Found
          </h2>
          
          <p className="text-gray-600 mb-8">
            Sorry, the page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={() => navigate("/")}
            className="w-full sm:w-auto"
          >
            <ApperIcon name="Home" className="w-4 h-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => navigate("/students")}
            >
              <ApperIcon name="Users" className="w-4 h-4" />
              View Students
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              onClick={() => navigate("/classes")}
            >
              <ApperIcon name="BookOpen" className="w-4 h-4" />
              View Classes
            </Button>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-center space-x-3 text-gray-500">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <ApperIcon name="GraduationCap" className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm">ClassTrack Student Management</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;