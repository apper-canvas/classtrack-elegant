import React from "react";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";

const StudentCard = ({ 
  student, 
  onView, 
  onEdit, 
  onDelete,
  gpa = null,
  attendanceRate = null 
}) => {
  const getGradeColor = (gpa) => {
    if (gpa >= 90) return "success";
    if (gpa >= 80) return "primary";
    if (gpa >= 70) return "warning";
    return "error";
  };

  const getAttendanceColor = (rate) => {
    if (rate >= 95) return "success";
    if (rate >= 90) return "primary";
    if (rate >= 85) return "warning";
    return "error";
  };

  return (
    <Card className="p-6 group" hover>
      <div className="flex items-start space-x-4">
        <div className="relative">
          <img 
            src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=2563eb&color=fff`}
            alt={`${student.firstName} ${student.lastName}`}
            className="w-16 h-16 rounded-full object-cover border-4 border-gray-100 group-hover:border-primary/20 transition-all duration-200"
          />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-white flex items-center justify-center">
            <ApperIcon name="Check" className="w-3 h-3 text-white" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {student.firstName} {student.lastName}
              </h3>
              <p className="text-sm text-gray-600 mb-2">{student.studentId}</p>
              <div className="flex flex-wrap gap-2 mb-3">
                {gpa !== null && (
                  <Badge variant={getGradeColor(gpa)} size="sm">
                    GPA: {gpa}%
                  </Badge>
                )}
                {attendanceRate !== null && (
                  <Badge variant={getAttendanceColor(attendanceRate)} size="sm">
                    Attendance: {attendanceRate}%
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={() => onView(student)}
                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-full transition-colors duration-200"
              >
                <ApperIcon name="Eye" className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEdit(student)}
                className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-full transition-colors duration-200"
              >
                <ApperIcon name="Edit2" className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(student)}
                className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-full transition-colors duration-200"
              >
                <ApperIcon name="Trash2" className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <ApperIcon name="Mail" className="w-4 h-4 mr-2" />
            <span className="truncate">{student.email}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StudentCard;