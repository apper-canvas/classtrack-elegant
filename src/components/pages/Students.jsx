import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import StudentCard from "@/components/molecules/StudentCard";
import StudentModal from "@/components/organisms/StudentModal";
import StudentDetailModal from "@/components/organisms/StudentDetailModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { studentService } from "@/services/api/studentService";
import { gradeService } from "@/services/api/gradeService";
import { attendanceService } from "@/services/api/attendanceService";
import { toast } from "react-toastify";

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

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm]);

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
    
    if (searchTerm.trim()) {
      filtered = students.filter(student =>
        `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-80">
          <SearchBar
            placeholder="Search students by name, ID, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ApperIcon name="Users" className="w-4 h-4" />
          <span>{filteredStudents.length} students</span>
        </div>
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