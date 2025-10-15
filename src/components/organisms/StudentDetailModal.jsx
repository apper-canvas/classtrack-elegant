import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import { gradeService } from "@/services/api/gradeService";
import { attendanceService } from "@/services/api/attendanceService";
import { format } from "date-fns";

const StudentDetailModal = ({ 
  isOpen, 
  onClose, 
  student,
  onEdit 
}) => {
  const [activeTab, setActiveTab] = useState("info");
  const [grades, setGrades] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      loadStudentData();
    }
  }, [isOpen, student]);

  const loadStudentData = async () => {
    if (!student) return;
    
    setLoading(true);
    try {
      const [gradesData, attendanceData] = await Promise.all([
        gradeService.getByStudentId(student.Id),
        attendanceService.getByStudentId(student.Id)
      ]);
      
      setGrades(gradesData);
      setAttendance(attendanceData);
    } catch (error) {
      console.error("Error loading student data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGPA = () => {
    if (grades.length === 0) return 0;
    const total = grades.reduce((sum, grade) => sum + grade.percentage, 0);
    return Math.round(total / grades.length);
  };

  const calculateAttendanceRate = () => {
    if (attendance.length === 0) return 0;
    const presentCount = attendance.filter(record => 
      record.status === "present" || record.status === "excused"
    ).length;
    return Math.round((presentCount / attendance.length) * 100);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "present": return "success";
      case "late": return "warning";
      case "absent": return "error";
      case "excused": return "info";
      default: return "default";
    }
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "primary";
    if (percentage >= 70) return "warning";
    return "error";
  };

  const tabs = [
    { id: "info", label: "Information", icon: "User" },
    { id: "grades", label: "Grades", icon: "Award" },
    { id: "attendance", label: "Attendance", icon: "Calendar" }
  ];

  if (!isOpen || !student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-blue-600/5">
          <div className="flex items-center space-x-4">
            <img 
              src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=2563eb&color=fff`}
              alt={`${student.firstName} ${student.lastName}`}
              className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
            />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {student.firstName} {student.lastName}
              </h2>
              <p className="text-sm text-gray-600">{student.studentId}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant={getGradeColor(calculateGPA())}>
                  GPA: {calculateGPA()}%
                </Badge>
                <Badge variant={calculateAttendanceRate() >= 90 ? "success" : "warning"}>
                  Attendance: {calculateAttendanceRate()}%
                </Badge>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(student)}
            >
              <ApperIcon name="Edit2" className="w-4 h-4" />
              Edit
            </Button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <ApperIcon name="X" className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "text-primary border-b-2 border-primary bg-primary/5"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ApperIcon name={tab.icon} className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === "info" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 flex items-center">
                    <ApperIcon name="Mail" className="w-4 h-4 mr-2 text-gray-400" />
                    {student.email}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900 flex items-center">
                    <ApperIcon name="Phone" className="w-4 h-4 mr-2 text-gray-400" />
                    {student.phone || "Not provided"}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Date of Birth</label>
                  <p className="text-gray-900 flex items-center">
                    <ApperIcon name="Calendar" className="w-4 h-4 mr-2 text-gray-400" />
                    {student.dateOfBirth ? format(new Date(student.dateOfBirth), "MMM dd, yyyy") : "Not provided"}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Student ID</label>
                  <p className="text-gray-900 flex items-center">
                    <ApperIcon name="Hash" className="w-4 h-4 mr-2 text-gray-400" />
                    {student.studentId}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Enrollment Date</label>
                  <p className="text-gray-900 flex items-center">
                    <ApperIcon name="CalendarPlus" className="w-4 h-4 mr-2 text-gray-400" />
                    {format(new Date(student.enrollmentDate), "MMM dd, yyyy")}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Classes Enrolled</label>
                  <p className="text-gray-900 flex items-center">
                    <ApperIcon name="BookOpen" className="w-4 h-4 mr-2 text-gray-400" />
                    {student.classIds?.length || 0} classes
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "grades" && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <ApperIcon name="Loader2" className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : grades.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="Award" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No grades recorded yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {grades.map((grade) => (
                    <div key={grade.Id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900">{grade.assignmentName}</h4>
                          <p className="text-sm text-gray-600">{grade.category}</p>
                          {grade.notes && (
                            <p className="text-xs text-gray-500 mt-1">{grade.notes}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant={getGradeColor(grade.percentage)} size="lg">
                            {grade.score}/{grade.maxScore} ({grade.percentage}%)
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(grade.date), "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "attendance" && (
            <div className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <ApperIcon name="Loader2" className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : attendance.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ApperIcon name="Calendar" className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No attendance records yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {attendance.map((record) => (
                    <div key={record.Id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={getStatusColor(record.status)} size="sm">
                          {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {format(new Date(record.date), "MMM dd")}
                        </span>
                      </div>
                      {record.notes && (
                        <p className="text-xs text-gray-500">{record.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailModal;