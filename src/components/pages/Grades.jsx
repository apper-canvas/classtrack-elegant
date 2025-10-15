import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import SearchBar from "@/components/molecules/SearchBar";
import FormField from "@/components/molecules/FormField";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { gradeService } from "@/services/api/gradeService";
import { studentService } from "@/services/api/studentService";
import { classService } from "@/services/api/classService";
import { format } from "date-fns";
import { toast } from "react-toastify";

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredGrades, setFilteredGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState(null);

  const [formData, setFormData] = useState({
    studentId: "",
    classId: "",
    assignmentName: "",
    score: "",
    maxScore: "100",
    date: "",
    category: "Assignment",
    notes: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterGrades();
  }, [grades, searchTerm, selectedClass]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [gradesData, studentsData, classesData] = await Promise.all([
        gradeService.getAll(),
        studentService.getAll(),
        classService.getAll()
      ]);
      
      setGrades(gradesData);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterGrades = () => {
    let filtered = grades;
    
    if (selectedClass) {
      filtered = filtered.filter(grade => grade.classId === selectedClass);
    }
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(grade => {
        const student = getStudentById(grade.studentId);
        const studentName = student ? `${student.firstName} ${student.lastName}` : "";
        return (
          grade.assignmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          grade.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    setFilteredGrades(filtered.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const getStudentById = (studentId) => {
    return students.find(student => student.Id.toString() === studentId);
  };

  const getClassById = (classId) => {
    return classes.find(classItem => classItem.Id.toString() === classId);
  };

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "success";
    if (percentage >= 80) return "primary";
    if (percentage >= 70) return "warning";
    return "error";
  };

  const handleAddGrade = () => {
    setSelectedGrade(null);
    setFormData({
      studentId: "",
      classId: selectedClass || "",
      assignmentName: "",
      score: "",
      maxScore: "100",
      date: new Date().toISOString().split('T')[0],
      category: "Assignment",
      notes: ""
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEditGrade = (grade) => {
    setSelectedGrade(grade);
    setFormData({
      studentId: grade.studentId,
      classId: grade.classId,
      assignmentName: grade.assignmentName,
      score: grade.score.toString(),
      maxScore: grade.maxScore.toString(),
      date: grade.date,
      category: grade.category,
      notes: grade.notes || ""
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDeleteGrade = async (grade) => {
    const student = getStudentById(grade.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : "Unknown Student";
    
    if (window.confirm(`Are you sure you want to delete ${grade.assignmentName} for ${studentName}?`)) {
      try {
        await gradeService.delete(grade.Id);
        toast.success("Grade deleted successfully!");
        loadData();
      } catch (error) {
        console.error("Error deleting grade:", error);
        toast.error("Failed to delete grade. Please try again.");
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.studentId) errors.studentId = "Student is required";
    if (!formData.classId) errors.classId = "Class is required";
    if (!formData.assignmentName.trim()) errors.assignmentName = "Assignment name is required";
    if (!formData.score.trim()) errors.score = "Score is required";
    if (!formData.maxScore.trim()) errors.maxScore = "Max score is required";
    if (!formData.date) errors.date = "Date is required";
    
    if (formData.score && formData.maxScore) {
      const score = parseFloat(formData.score);
      const maxScore = parseFloat(formData.maxScore);
      if (score > maxScore) {
        errors.score = "Score cannot be greater than max score";
      }
      if (score < 0) {
        errors.score = "Score cannot be negative";
      }
      if (maxScore <= 0) {
        errors.maxScore = "Max score must be greater than 0";
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setSaving(true);

    try {
      const gradeData = {
        ...formData,
        score: parseFloat(formData.score),
        maxScore: parseFloat(formData.maxScore)
      };

      if (selectedGrade) {
        await gradeService.update(selectedGrade.Id, gradeData);
        toast.success("Grade updated successfully!");
      } else {
        await gradeService.create(gradeData);
        toast.success("Grade added successfully!");
      }
      
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error("Error saving grade:", error);
      toast.error("Failed to save grade. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getClassStudents = (classId) => {
    return students.filter(student => 
      student.classIds.includes(classId.toString())
    );
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Grades
          </h1>
          <p className="text-gray-600 mt-1">
            Manage assignments and track student performance
          </p>
        </div>
        
        <Button onClick={handleAddGrade}>
          <ApperIcon name="Plus" className="w-4 h-4" />
          Add Grade
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-80">
          <SearchBar
            placeholder="Search by assignment, student, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="w-full sm:w-48">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
          >
            <option value="">All Classes</option>
            {classes.map((classItem) => (
              <option key={classItem.Id} value={classItem.Id.toString()}>
                {classItem.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ApperIcon name="Award" className="w-4 h-4" />
          <span>{filteredGrades.length} grades</span>
        </div>
      </div>

      {/* Grades List */}
      {filteredGrades.length === 0 && (searchTerm || selectedClass) ? (
        <Empty
          title="No grades found"
          description="No grades match your current filters. Try adjusting your search."
          icon="Search"
          action={
            <div className="flex gap-2">
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  <ApperIcon name="X" className="w-4 h-4" />
                  Clear Search
                </Button>
              )}
              {selectedClass && (
                <Button variant="outline" onClick={() => setSelectedClass("")}>
                  <ApperIcon name="Filter" className="w-4 h-4" />
                  Show All Classes
                </Button>
              )}
            </div>
          }
        />
      ) : filteredGrades.length === 0 ? (
        <Empty
          title="No grades yet"
          description="Start by adding grades for your students' assignments"
          icon="Award"
          action={
            <Button onClick={handleAddGrade}>
              <ApperIcon name="Plus" className="w-4 h-4" />
              Add First Grade
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredGrades.map((grade) => {
            const student = getStudentById(grade.studentId);
            const classItem = getClassById(grade.classId);
            
            return (
              <Card key={grade.Id} className="p-6 group" hover>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4 flex-1">
                    {student && (
                      <img 
                        src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=2563eb&color=fff`}
                        alt={`${student.firstName} ${student.lastName}`}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-100"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {grade.assignmentName}
                        </h3>
                        <Badge variant={getGradeColor(grade.percentage)} size="sm">
                          {grade.percentage}%
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                        <span className="flex items-center">
                          <ApperIcon name="User" className="w-4 h-4 mr-1" />
                          {student ? `${student.firstName} ${student.lastName}` : "Unknown Student"}
                        </span>
                        <span className="flex items-center">
                          <ApperIcon name="BookOpen" className="w-4 h-4 mr-1" />
                          {classItem ? classItem.name : "Unknown Class"}
                        </span>
                        <span className="flex items-center">
                          <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
                          {format(new Date(grade.date), "MMM dd, yyyy")}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="default" size="sm">
                          {grade.category}
                        </Badge>
                        <span className="text-gray-500">
                          Score: {grade.score}/{grade.maxScore}
                        </span>
                      </div>
                      
                      {grade.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">
                          "{grade.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEditGrade(grade)}
                      className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-full transition-colors duration-200"
                    >
                      <ApperIcon name="Edit2" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGrade(grade)}
                      className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-full transition-colors duration-200"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Grade Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedGrade ? "Edit Grade" : "Add New Grade"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  label="Class"
                  error={formErrors.classId}
                  required
                >
                  <select
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                  >
                    <option value="">Select a class</option>
                    {classes.map((classItem) => (
                      <option key={classItem.Id} value={classItem.Id.toString()}>
                        {classItem.name}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Student"
                  error={formErrors.studentId}
                  required
                >
                  <select
                    name="studentId"
                    value={formData.studentId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                    disabled={!formData.classId}
                  >
                    <option value="">Select a student</option>
                    {formData.classId && getClassStudents(formData.classId).map((student) => (
                      <option key={student.Id} value={student.Id.toString()}>
                        {student.firstName} {student.lastName}
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField
                  label="Assignment Name"
                  name="assignmentName"
                  value={formData.assignmentName}
                  onChange={handleChange}
                  error={formErrors.assignmentName}
                  required
                  placeholder="e.g., Math Quiz 1"
                />

                <FormField
                  label="Category"
                  error={formErrors.category}
                  required
                >
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                  >
                    <option value="Assignment">Assignment</option>
                    <option value="Quiz">Quiz</option>
                    <option value="Test">Test</option>
                    <option value="Project">Project</option>
                    <option value="Lab">Lab</option>
                    <option value="Essay">Essay</option>
                    <option value="Exam">Exam</option>
                  </select>
                </FormField>

                <FormField
                  label="Score"
                  name="score"
                  type="number"
                  value={formData.score}
                  onChange={handleChange}
                  error={formErrors.score}
                  required
                  placeholder="Points earned"
                  min="0"
                  step="0.5"
                />

                <FormField
                  label="Max Score"
                  name="maxScore"
                  type="number"
                  value={formData.maxScore}
                  onChange={handleChange}
                  error={formErrors.maxScore}
                  required
                  placeholder="Total points"
                  min="1"
                  step="0.5"
                />

                <FormField
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  error={formErrors.date}
                  required
                  className="md:col-span-2"
                />

                <FormField
                  label="Notes (Optional)"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  error={formErrors.notes}
                  placeholder="Add any notes about this grade..."
                  className="md:col-span-2"
                >
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white resize-none"
                    placeholder="Add any notes about this grade..."
                  />
                </FormField>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                      {selectedGrade ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Save" className="w-4 h-4" />
                      {selectedGrade ? "Update Grade" : "Add Grade"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Grades;