import React, { useEffect, useState } from "react";
import { studentService } from "@/services/api/studentService";
import { gradeService } from "@/services/api/gradeService";
import { attendanceService } from "@/services/api/attendanceService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Loading from "@/components/ui/Loading";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Classes from "@/components/pages/Classes";
import Attendance from "@/components/pages/Attendance";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import StudentCard from "@/components/molecules/StudentCard";
import StudentModal from "@/components/organisms/StudentModal";
import StudentDetailModal from "@/components/organisms/StudentDetailModal";

const Students = () => {
const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [studentStats, setStudentStats] = useState({});
  const [sortBy, setSortBy] = useState("none");
  const [sortDirection, setSortDirection] = useState("asc");
  const [selectedClass, setSelectedClass] = useState("");
  const [dateRange, setDateRange] = useState({ startDate: "", endDate: "" });
  const [showFilters, setShowFilters] = useState(false);
  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
filterStudents();
  }, [students, searchTerm, sortBy, sortDirection, selectedClass, dateRange]);

  const loadStudents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [studentsData, gradesData, attendanceData] = await Promise.all([
        studentService.getAll(),
        gradeService.getAll(),
        attendanceService.getAll()
      ]);
      
      // Calculate stats for each student
      const stats = {};
      studentsData.forEach(student => {
        const studentId = student.Id.toString();
        const studentGrades = gradesData.filter(grade => grade.studentId === studentId);
        const studentAttendance = attendanceData.filter(record => record.studentId === studentId);
        
        const gpa = studentGrades.length > 0 
          ? Math.round(studentGrades.reduce((sum, grade) => sum + grade.percentage, 0) / studentGrades.length)
          : null;
        
        const attendanceRate = studentAttendance.length > 0
          ? Math.round((studentAttendance.filter(record => 
              record.status === "present" || record.status === "excused"
            ).length / studentAttendance.length) * 100)
          : null;
        
        stats[studentId] = { gpa, attendanceRate };
      });
      
      setStudents(studentsData);
      setStudentStats(stats);
    } catch (err) {
      console.error("Error loading students:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const filterStudents = () => {
    let filtered = students;
    
    // Apply class filter
    if (selectedClass) {
      filtered = filtered.filter(student => 
        student.classIds.includes(selectedClass.toString())
      );
    }
    
    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date range filter (affects which records are counted in stats)
    // Note: This doesn't filter students, but could be used to recalculate stats
    // based on date range if needed in future enhancement
    
    // Apply sorting
    if (sortBy !== "none") {
      filtered = [...filtered].sort((a, b) => {
        let compareValue = 0;
        
        if (sortBy === "performance") {
          const aGpa = studentStats[a.Id.toString()]?.gpa ?? -1;
          const bGpa = studentStats[b.Id.toString()]?.gpa ?? -1;
          compareValue = aGpa - bGpa;
        } else if (sortBy === "attendance") {
          const aRate = studentStats[a.Id.toString()]?.attendanceRate ?? -1;
          const bRate = studentStats[b.Id.toString()]?.attendanceRate ?? -1;
          compareValue = aRate - bRate;
        } else if (sortBy === "name") {
          const aName = `${a.firstName} ${a.lastName}`.toLowerCase();
          const bName = `${b.firstName} ${b.lastName}`.toLowerCase();
          compareValue = aName.localeCompare(bName);
        }
        
        return sortDirection === "asc" ? compareValue : -compareValue;
      });
    }
    
    setFilteredStudents(filtered);
  };

  const handleAddStudent = () => {
    setSelectedStudent(null);
    setShowModal(true);
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setShowModal(true);
  };

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setShowDetailModal(true);
  };

  const handleDeleteStudent = async (student) => {
    if (window.confirm(`Are you sure you want to delete ${student.firstName} ${student.lastName}?`)) {
      try {
        await studentService.delete(student.Id);
        toast.success("Student deleted successfully!");
        loadStudents();
      } catch (error) {
        console.error("Error deleting student:", error);
        toast.error("Failed to delete student. Please try again.");
      }
    }
  };

  const handleModalSave = () => {
    loadStudents();
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadStudents} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Students
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your student roster and track their progress
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === "grid" 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ApperIcon name="Grid3X3" className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors duration-200 ${
                viewMode === "list" 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <ApperIcon name="List" className="w-4 h-4" />
            </button>
          </div>
          
          <Button onClick={handleAddStudent}>
            <ApperIcon name="UserPlus" className="w-4 h-4" />
            Add Student
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
<div className="space-y-4">
        {/* Search Bar and Quick Actions */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-full sm:w-80">
            <SearchBar
              placeholder="Search students by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="whitespace-nowrap"
          >
            <ApperIcon name="Filter" className="w-4 h-4" />
            Filters
            {(sortBy !== "none" || selectedClass || dateRange.startDate || dateRange.endDate) && (
              <Badge variant="primary" size="sm" className="ml-2">
                {[
                  sortBy !== "none" ? 1 : 0,
                  selectedClass ? 1 : 0,
                  dateRange.startDate ? 1 : 0,
                  dateRange.endDate ? 1 : 0
                ].reduce((a, b) => a + b, 0)}
              </Badge>
            )}
          </Button>
          
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ApperIcon name="Users" className="w-4 h-4" />
            <span>{filteredStudents.length} students</span>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-gray-900">Filter & Sort Options</h3>
              {(sortBy !== "none" || selectedClass || dateRange.startDate || dateRange.endDate) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSortBy("none");
                    setSortDirection("asc");
                    setSelectedClass("");
                    setDateRange({ startDate: "", endDate: "" });
                    toast.success("All filters cleared");
                  }}
                >
                  <ApperIcon name="X" className="w-4 h-4" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                >
                  <option value="none">Default Order</option>
                  <option value="name">Name</option>
                  <option value="performance">Performance (GPA)</option>
                  <option value="attendance">Attendance Rate</option>
                </select>
              </div>

              {/* Sort Direction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort Direction
                </label>
                <button
                  onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
                  disabled={sortBy === "none"}
                  className={`w-full px-4 py-2 border rounded-lg flex items-center justify-center gap-2 transition-colors duration-200 ${
                    sortBy === "none"
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50"
                  }`}
                >
                  <ApperIcon 
                    name={sortDirection === "asc" ? "ArrowUp" : "ArrowDown"} 
                    className="w-4 h-4" 
                  />
                  {sortDirection === "asc" ? "Ascending" : "Descending"}
                </button>
              </div>

              {/* Class Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Class
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                >
                  <option value="">All Classes</option>
                  {students.reduce((classes, student) => {
                    student.classIds.forEach(classId => {
                      if (!classes.includes(classId)) {
                        classes.push(classId);
                      }
                    });
                    return classes;
                  }, []).map((classId) => (
                    <option key={classId} value={classId}>
                      Class {classId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Range (for future enhancement) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white text-sm"
                    placeholder="Start"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white text-sm"
                    placeholder="End"
                  />
                </div>
              </div>
            </div>

            {/* Active Filters Summary */}
            {(sortBy !== "none" || selectedClass || dateRange.startDate || dateRange.endDate) && (
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-500">Active filters:</span>
                {sortBy !== "none" && (
                  <Badge variant="primary" size="sm" className="flex items-center gap-1">
                    Sort: {sortBy === "name" ? "Name" : sortBy === "performance" ? "Performance" : "Attendance"}
                    <button
                      onClick={() => setSortBy("none")}
                      className="ml-1 hover:text-white/80"
                    >
                      <ApperIcon name="X" className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedClass && (
                  <Badge variant="primary" size="sm" className="flex items-center gap-1">
                    Class: {selectedClass}
                    <button
                      onClick={() => setSelectedClass("")}
                      className="ml-1 hover:text-white/80"
                    >
                      <ApperIcon name="X" className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {(dateRange.startDate || dateRange.endDate) && (
                  <Badge variant="primary" size="sm" className="flex items-center gap-1">
                    Date Range
                    <button
                      onClick={() => setDateRange({ startDate: "", endDate: "" })}
                      className="ml-1 hover:text-white/80"
                    >
                      <ApperIcon name="X" className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </div>
            )}
</div>
        )}
      </div>

      {/* Students Grid/List */}
      {filteredStudents.length === 0 && searchTerm ? (
        <Empty
          title="No students found"
          description={`No students match "${searchTerm}". Try adjusting your search.`}
          icon="Search"
          action={
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              <ApperIcon name="X" className="w-4 h-4" />
              Clear Search
            </Button>
          }
        />
      ) : filteredStudents.length === 0 ? (
        <Empty
          title="No students yet"
          description="Get started by adding your first student to the system"
          icon="Users"
          action={
            <Button onClick={handleAddStudent}>
              <ApperIcon name="UserPlus" className="w-4 h-4" />
              Add First Student
            </Button>
          }
        />
      ) : (
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.Id}
              student={student}
              gpa={studentStats[student.Id.toString()]?.gpa}
              attendanceRate={studentStats[student.Id.toString()]?.attendanceRate}
              onView={handleViewStudent}
              onEdit={handleEditStudent}
              onDelete={handleDeleteStudent}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <StudentModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        student={selectedStudent}
        onSave={handleModalSave}
      />

      <StudentDetailModal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        student={selectedStudent}
        onEdit={(student) => {
          setShowDetailModal(false);
          handleEditStudent(student);
        }}
      />
    </div>
  );
};

export default Students;