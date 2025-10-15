import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import StatCard from "@/components/molecules/StatCard";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { studentService } from "@/services/api/studentService";
import { classService } from "@/services/api/classService";
import { gradeService } from "@/services/api/gradeService";
import { attendanceService } from "@/services/api/attendanceService";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [data, setData] = useState({
    students: [],
    classes: [],
    grades: [],
    attendance: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
try {
      const [studentsData, classesData, gradesData, attendanceData] = await Promise.all([
        studentService.getAll(),
        classService.getAll(),
        gradeService.getAll(),
        attendanceService.getAll()
      ]);
      
      const processedStudents = studentsData.map(s => ({
        ...s,
        first_name_c: s.first_name_c || "",
        last_name_c: s.last_name_c || "",
        student_id_c: s.student_id_c || "",
        class_ids_c: s.class_ids_c || ""
      }));

      const processedGrades = gradesData.map(g => ({
        ...g,
        student_id_c: g.student_id_c?.Id || g.student_id_c,
        class_id_c: g.class_id_c?.Id || g.class_id_c,
        assignment_name_c: g.assignment_name_c || "",
        percentage_c: g.percentage_c || 0,
        date_c: g.date_c || ""
      }));

      const processedAttendance = attendanceData.map(a => ({
        ...a,
        student_id_c: a.student_id_c?.Id || a.student_id_c,
        status_c: a.status_c || "absent",
        date_c: a.date_c || ""
      }));
      
      setData({
        students: processedStudents,
        classes: classesData,
        grades: processedGrades,
        attendance: processedAttendance
      });
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageGPA = () => {
    if (data.grades.length === 0) return 0;
const total = data.grades.reduce((sum, grade) => sum + (grade.percentage_c || 0), 0);
    return Math.round(total / data.grades.length);
  };

const calculateAttendanceRate = () => {
    if (data.attendance.length === 0) return 0;
    const presentCount = data.attendance.filter(record => 
      record.status_c === "present" || record.status_c === "excused"
    ).length;
    return Math.round((presentCount / data.attendance.length) * 100);
  };
const getAtRiskStudents = () => {
    const studentGrades = {};
    data.grades.forEach(grade => {
      const studentId = grade.student_id_c?.Id || grade.student_id_c;
      if (!studentGrades[studentId]) {
        studentGrades[studentId] = [];
      }
      studentGrades[studentId].push(grade.percentage_c || 0);
    });

    const atRiskStudents = [];
    Object.entries(studentGrades).forEach(([studentId, grades]) => {
      const avgGrade = grades.reduce((sum, grade) => sum + grade, 0) / grades.length;
      if (avgGrade < 75) {
        const student = data.students.find(s => s.Id.toString() === studentId);
        if (student) {
          atRiskStudents.push({
            ...student,
            avgGrade: Math.round(avgGrade)
          });
        }
      }
    });

    return atRiskStudents;
  };

  const getRecentActivity = () => {
const activities = [];
    
    // Recent grades
    data.grades
      .sort((a, b) => new Date(b.date_c) - new Date(a.date_c))
      .slice(0, 3)
      .forEach(grade => {
        const studentId = grade.student_id_c?.Id || grade.student_id_c;
        const student = data.students.find(s => s.Id.toString() === studentId.toString());
        if (student) {
          activities.push({
            id: `grade-${grade.Id}`,
            type: "grade",
            message: `${student.first_name_c} ${student.last_name_c} scored ${grade.percentage_c}% on ${grade.assignment_name_c}`,
            time: grade.date_c,
            icon: "Award",
            color: grade.percentage_c >= 80 ? "success" : grade.percentage_c >= 70 ? "warning" : "error"
          });
        }
      });

    // Recent attendance
    data.attendance
      .sort((a, b) => new Date(b.date_c) - new Date(a.date_c))
      .slice(0, 2)
      .forEach(record => {
        const studentId = record.student_id_c?.Id || record.student_id_c;
        const student = data.students.find(s => s.Id.toString() === studentId.toString());
        if (student && record.status_c !== "present") {
          activities.push({
            id: `attendance-${record.Id}`,
            type: "attendance",
            message: `${student.first_name_c} ${student.last_name_c} was ${record.status_c}`,
            time: record.date_c,
            icon: "Calendar",
            color: record.status_c === "late" ? "warning" : record.status_c === "absent" ? "error" : "info"
          });
        }
      });

    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const atRiskStudents = getAtRiskStudents();
  const recentActivity = getRecentActivity();

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 via-blue-600/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Welcome to ClassTrack!</h2>
            <p className="text-gray-600 mt-1">Here's what's happening in your classes today.</p>
          </div>
          <div className="hidden sm:block">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
              <ApperIcon name="GraduationCap" className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Students"
          value={data.students.length}
          icon="Users"
          color="primary"
          subtitle="Active enrollments"
        />
        
        <StatCard
          title="Active Classes"
          value={data.classes.length}
          icon="BookOpen"
          color="secondary"
          subtitle="This semester"
        />
        
        <StatCard
          title="Average GPA"
          value={`${calculateAverageGPA()}%`}
          icon="Award"
          color={calculateAverageGPA() >= 85 ? "success" : calculateAverageGPA() >= 75 ? "warning" : "error"}
          subtitle="Class performance"
        />
        
        <StatCard
          title="Attendance Rate"
          value={`${calculateAttendanceRate()}%`}
          icon="Calendar"
          color={calculateAttendanceRate() >= 90 ? "success" : "warning"}
          subtitle="Overall attendance"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* At-Risk Students */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Students Needing Attention</h3>
              <p className="text-sm text-gray-500">Students with grades below 75%</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-warning/10 to-orange-600/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="AlertTriangle" className="w-5 h-5 text-warning" />
            </div>
          </div>
          
          <div className="space-y-4">
            {atRiskStudents.length === 0 ? (
              <Empty
                title="Great news!"
                description="All students are performing well"
                icon="CheckCircle"
                className="py-6"
              />
            ) : (
              atRiskStudents.map((student) => (
<div key={student.Id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <img 
                    src={student.photo_url_c || `https://ui-avatars.com/api/?name=${student.first_name_c}+${student.last_name_c}&background=f59e0b&color=fff`}
                    alt={`${student.first_name_c} ${student.last_name_c}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {student.first_name_c} {student.last_name_c}
                    </p>
                    <p className="text-xs text-gray-500">{student.student_id_c}</p>
                  </div>
                  <Badge variant="warning" size="sm">
                    {student.avgGrade}% avg
                  </Badge>
                </div>
              ))
            )}
          </div>
          
          {atRiskStudents.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/students")}
                className="w-full"
              >
                <ApperIcon name="Users" className="w-4 h-4" />
                View All Students
              </Button>
            </div>
          )}
        </Card>

        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              <p className="text-sm text-gray-500">Latest grades and attendance updates</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-info/10 to-blue-600/10 rounded-lg flex items-center justify-center">
              <ApperIcon name="Activity" className="w-5 h-5 text-info" />
            </div>
          </div>
          
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <Empty
                title="No recent activity"
                description="Activity will appear here as students interact with the system"
                icon="Activity"
                className="py-6"
              />
            ) : (
recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br ${
                    activity.color === "success" ? "from-success/10 to-green-600/10" :
                    activity.color === "warning" ? "from-warning/10 to-yellow-600/10" :
                    activity.color === "error" ? "from-error/10 to-red-600/10" :
                    "from-info/10 to-blue-600/10"
                  }`}>
                    <ApperIcon 
                      name={activity.icon} 
                      className={`w-4 h-4 ${
                        activity.color === "success" ? "text-success" :
                        activity.color === "warning" ? "text-warning" :
                        activity.color === "error" ? "text-error" :
                        "text-info"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(activity.time), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {recentActivity.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/grades")}
                >
                  <ApperIcon name="Award" className="w-4 h-4" />
                  Grades
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/attendance")}
                >
                  <ApperIcon name="Calendar" className="w-4 h-4" />
                  Attendance
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            onClick={() => navigate("/students")}
            className="h-20 flex-col"
          >
            <ApperIcon name="UserPlus" className="w-6 h-6 mb-2" />
            Add Student
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate("/classes")}
            className="h-20 flex-col"
          >
            <ApperIcon name="BookOpen" className="w-6 h-6 mb-2" />
            Manage Classes
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate("/grades")}
            className="h-20 flex-col"
          >
            <ApperIcon name="Award" className="w-6 h-6 mb-2" />
            Enter Grades
          </Button>
          
          <Button
            variant="outline"
            onClick={() => navigate("/attendance")}
            className="h-20 flex-col"
          >
            <ApperIcon name="Calendar" className="w-6 h-6 mb-2" />
            Take Attendance
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;