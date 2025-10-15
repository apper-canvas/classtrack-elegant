import React from "react";
import { NavLink } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const Sidebar = ({ isOpen, onClose, className = "" }) => {
  const navigation = [
    { name: "Dashboard", path: "", icon: "Home" },
    { name: "Students", path: "students", icon: "Users" },
    { name: "Classes", path: "classes", icon: "BookOpen" },
    { name: "Grades", path: "grades", icon: "Award" },
    { name: "Attendance", path: "attendance", icon: "Calendar" }
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
            <ApperIcon name="GraduationCap" className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              ClassTrack
            </h1>
            <p className="text-xs text-gray-500">Student Management</p>
          </div>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={`/${item.path}`}
            onClick={() => onClose && onClose()}
            className={({ isActive }) =>
              cn(
                "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-primary/10 to-blue-600/10 text-primary border-l-4 border-primary"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )
            }
          >
            {({ isActive }) => (
              <>
                <ApperIcon 
                  name={item.icon} 
                  className={cn(
                    "w-5 h-5 mr-3 transition-colors duration-200",
                    isActive ? "text-primary" : "text-gray-400 group-hover:text-gray-600"
                  )} 
                />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
          <div className="w-8 h-8 bg-gradient-to-br from-secondary to-purple-600 rounded-full flex items-center justify-center">
            <ApperIcon name="User" className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">Teacher Account</p>
            <p className="text-xs text-gray-500">Educator Portal</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn("hidden lg:flex lg:flex-col lg:w-64 lg:bg-surface lg:border-r lg:border-gray-200", className)}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-64 bg-surface shadow-xl transform transition-transform duration-200 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <ApperIcon name="GraduationCap" className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-gray-900">ClassTrack</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;