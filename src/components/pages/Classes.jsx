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
import { classService } from "@/services/api/classService";
import { studentService } from "@/services/api/studentService";
import { toast } from "react-toastify";

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredClasses, setFilteredClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    academicYear: "2023-2024",
    semester: "Fall"
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterClasses();
  }, [classes, searchTerm]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [classesData, studentsData] = await Promise.all([
        classService.getAll(),
        studentService.getAll()
      ]);
      
      setClasses(classesData);
      setStudents(studentsData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterClasses = () => {
    let filtered = classes;
    
    if (searchTerm.trim()) {
      filtered = classes.filter(classItem =>
        classItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classItem.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredClasses(filtered);
  };

  const getClassStudents = (classId) => {
    return students.filter(student => 
      student.classIds.includes(classId.toString())
    );
  };

  const handleAddClass = () => {
    setSelectedClass(null);
    setFormData({
      name: "",
      subject: "",
      academicYear: "2023-2024",
      semester: "Fall"
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEditClass = (classItem) => {
    setSelectedClass(classItem);
    setFormData({
      name: classItem.name,
      subject: classItem.subject,
      academicYear: classItem.academicYear,
      semester: classItem.semester
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDeleteClass = async (classItem) => {
    if (window.confirm(`Are you sure you want to delete ${classItem.name}?`)) {
      try {
        await classService.delete(classItem.Id);
        toast.success("Class deleted successfully!");
        loadData();
      } catch (error) {
        console.error("Error deleting class:", error);
        toast.error("Failed to delete class. Please try again.");
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
    
    if (!formData.name.trim()) errors.name = "Class name is required";
    if (!formData.subject.trim()) errors.subject = "Subject is required";
    if (!formData.academicYear.trim()) errors.academicYear = "Academic year is required";
    if (!formData.semester.trim()) errors.semester = "Semester is required";
    
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
      if (selectedClass) {
        await classService.update(selectedClass.Id, formData);
        toast.success("Class updated successfully!");
      } else {
        await classService.create(formData);
        toast.success("Class created successfully!");
      }
      
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error("Error saving class:", error);
      toast.error("Failed to save class. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Classes
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your class schedules and student assignments
          </p>
        </div>
        
        <Button onClick={handleAddClass}>
          <ApperIcon name="Plus" className="w-4 h-4" />
          Add Class
        </Button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-80">
          <SearchBar
            placeholder="Search classes by name or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <ApperIcon name="BookOpen" className="w-4 h-4" />
          <span>{filteredClasses.length} classes</span>
        </div>
      </div>

      {/* Classes Grid */}
      {filteredClasses.length === 0 && searchTerm ? (
        <Empty
          title="No classes found"
          description={`No classes match "${searchTerm}". Try adjusting your search.`}
          icon="Search"
          action={
            <Button variant="outline" onClick={() => setSearchTerm("")}>
              <ApperIcon name="X" className="w-4 h-4" />
              Clear Search
            </Button>
          }
        />
      ) : filteredClasses.length === 0 ? (
        <Empty
          title="No classes yet"
          description="Get started by creating your first class"
          icon="BookOpen"
          action={
            <Button onClick={handleAddClass}>
              <ApperIcon name="Plus" className="w-4 h-4" />
              Create First Class
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.map((classItem) => {
            const classStudents = getClassStudents(classItem.Id);
            return (
              <Card key={classItem.Id} className="p-6 group" hover>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {classItem.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-2">{classItem.subject}</p>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="primary" size="sm">
                        {classItem.academicYear}
                      </Badge>
                      <Badge variant="secondary" size="sm">
                        {classItem.semester}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleEditClass(classItem)}
                      className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-full transition-colors duration-200"
                    >
                      <ApperIcon name="Edit2" className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClass(classItem)}
                      className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-full transition-colors duration-200"
                    >
                      <ApperIcon name="Trash2" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Students Enrolled:</span>
                    <span className="font-medium text-gray-900">{classStudents.length}</span>
                  </div>
                  
                  {classStudents.length > 0 && (
                    <div className="flex -space-x-2">
                      {classStudents.slice(0, 5).map((student) => (
                        <img
                          key={student.Id}
                          src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=2563eb&color=fff`}
                          alt={`${student.firstName} ${student.lastName}`}
                          className="w-8 h-8 rounded-full border-2 border-white object-cover"
                          title={`${student.firstName} ${student.lastName}`}
                        />
                      ))}
                      {classStudents.length > 5 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                          +{classStudents.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Class Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedClass ? "Edit Class" : "Add New Class"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <ApperIcon name="X" className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-4">
                <FormField
                  label="Class Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={formErrors.name}
                  required
                  placeholder="e.g., Mathematics 9A"
                />

                <FormField
                  label="Subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  error={formErrors.subject}
                  required
                  placeholder="e.g., Mathematics"
                />

                <FormField
                  label="Academic Year"
                  name="academicYear"
                  value={formData.academicYear}
                  onChange={handleChange}
                  error={formErrors.academicYear}
                  required
                  placeholder="e.g., 2023-2024"
                />

                <FormField
                  label="Semester"
                  name="semester"
                  error={formErrors.semester}
                  required
                >
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                  >
                    <option value="Fall">Fall</option>
                    <option value="Spring">Spring</option>
                    <option value="Summer">Summer</option>
                    <option value="Winter">Winter</option>
                  </select>
                </FormField>
              </div>

              <div className="flex items-center justify-end space-x-4 mt-6">
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
                      {selectedClass ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Save" className="w-4 h-4" />
                      {selectedClass ? "Update Class" : "Create Class"}
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

export default Classes;