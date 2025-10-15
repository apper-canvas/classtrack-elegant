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
import { attendanceService } from "@/services/api/attendanceService";
import { studentService } from "@/services/api/studentService";
import { classService } from "@/services/api/classService";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks } from "date-fns";
import { toast } from "react-toastify";

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [viewMode, setViewMode] = useState("week");
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [formData, setFormData] = useState({
    studentId: "",
    classId: "",
    date: "",
    status: "present",
    notes: ""
  });
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAttendance();
  }, [attendance, searchTerm, selectedClass]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [attendanceData, studentsData, classesData] = await Promise.all([
        attendanceService.getAll(),
        studentService.getAll(),
        classService.getAll()
      ]);
      
      setAttendance(attendanceData);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (err) {
      console.error("Error loading data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterAttendance = () => {
    let filtered = attendance;
    
    if (selectedClass) {
      filtered = filtered.filter(record => record.classId === selectedClass);
    }
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(record => {
        const student = getStudentById(record.studentId);
        const studentName = student ? `${student.firstName} ${student.lastName}` : "";
        return (
          studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          record.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }
    
    setFilteredAttendance(filtered.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  const getStudentById = (studentId) => {
    return students.find(student => student.Id.toString() === studentId);
  };

  const getClassById = (classId) => {
    return classes.find(classItem => classItem.Id.toString() === classId);
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "present": return "Check";
      case "late": return "Clock";
      case "absent": return "X";
      case "excused": return "Shield";
      default: return "Circle";
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 }); // Sunday
    return eachDayOfInterval({ start, end }).slice(0, 5); // Weekdays only
  };

  const getAttendanceForStudentAndDate = (studentId, date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return filteredAttendance.find(record => 
      record.studentId === studentId.toString() && 
      record.date === dateStr &&
      (!selectedClass || record.classId === selectedClass)
    );
  };

  const handleAddRecord = () => {
    setSelectedRecord(null);
    setFormData({
      studentId: "",
      classId: selectedClass || "",
      date: new Date().toISOString().split('T')[0],
      status: "present",
      notes: ""
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleEditRecord = (record) => {
    setSelectedRecord(record);
    setFormData({
      studentId: record.studentId,
      classId: record.classId,
      date: record.date,
      status: record.status,
      notes: record.notes || ""
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleDeleteRecord = async (record) => {
    const student = getStudentById(record.studentId);
    const studentName = student ? `${student.firstName} ${student.lastName}` : "Unknown Student";
    
    if (window.confirm(`Are you sure you want to delete the attendance record for ${studentName} on ${format(new Date(record.date), "MMM dd, yyyy")}?`)) {
      try {
        await attendanceService.delete(record.Id);
        toast.success("Attendance record deleted successfully!");
        loadData();
      } catch (error) {
        console.error("Error deleting attendance record:", error);
        toast.error("Failed to delete attendance record. Please try again.");
      }
    }
  };

  const handleQuickAttendance = async (studentId, date, status) => {
    try {
      const dateStr = format(date, "yyyy-MM-dd");
      const existingRecord = getAttendanceForStudentAndDate(studentId, date);
      
      if (existingRecord) {
        await attendanceService.update(existingRecord.Id, { status });
      } else {
        await attendanceService.create({
          studentId: studentId.toString(),
          classId: selectedClass || classes[0]?.Id.toString() || "1",
          date: dateStr,
          status,
          notes: ""
        });
      }
      
      toast.success("Attendance updated!");
      loadData();
    } catch (error) {
      console.error("Error updating attendance:", error);
      toast.error("Failed to update attendance. Please try again.");
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
    if (!formData.date) errors.date = "Date is required";
    if (!formData.status) errors.status = "Status is required";
    
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
      if (selectedRecord) {
        await attendanceService.update(selectedRecord.Id, formData);
        toast.success("Attendance updated successfully!");
      } else {
        await attendanceService.create(formData);
        toast.success("Attendance recorded successfully!");
      }
      
      setShowModal(false);
      loadData();
    } catch (error) {
      console.error("Error saving attendance:", error);
      toast.error("Failed to save attendance. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getClassStudents = (classId) => {
    if (!classId) return students;
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
            Attendance
          </h1>
          <p className="text-gray-600 mt-1">
            Track daily attendance and monitor student presence
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                viewMode === "week" 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Week View
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                viewMode === "list" 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              List View
            </button>
          </div>
          
          <Button onClick={handleAddRecord}>
            <ApperIcon name="Plus" className="w-4 h-4" />
            Add Record
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-full sm:w-80">
          <SearchBar
            placeholder="Search students or status..."
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
          <ApperIcon name="Calendar" className="w-4 h-4" />
          <span>{filteredAttendance.length} records</span>
        </div>
      </div>

      {/* Week View */}
      {viewMode === "week" && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Week of {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "MMM dd, yyyy")}
            </h2>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
              >
                <ApperIcon name="ChevronLeft" className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentWeek(new Date())}
              >
                Today
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
              >
                <ApperIcon name="ChevronRight" className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {selectedClass && getClassStudents(selectedClass).length === 0 ? (
            <Empty
              title="No students in selected class"
              description="Select a class with enrolled students to track attendance"
              icon="Users"
            />
          ) : getClassStudents(selectedClass).length === 0 ? (
            <Empty
              title="No students found"
              description="Add students to start tracking attendance"
              icon="Users"
              action={
                <Button variant="outline" onClick={() => setSelectedClass("")}>
                  <ApperIcon name="Users" className="w-4 h-4" />
                  View All Students
                </Button>
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Student</th>
                    {getWeekDays().map((day) => (
                      <th key={day.toISOString()} className="text-center py-3 px-2 font-medium text-gray-900 min-w-[100px]">
                        <div className="text-sm">{format(day, "EEE")}</div>
                        <div className="text-xs text-gray-500">{format(day, "MMM d")}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {getClassStudents(selectedClass).map((student) => (
                    <tr key={student.Id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <img 
                            src={student.photoUrl || `https://ui-avatars.com/api/?name=${student.firstName}+${student.lastName}&background=2563eb&color=fff`}
                            alt={`${student.firstName} ${student.lastName}`}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {student.firstName} {student.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{student.studentId}</div>
                          </div>
                        </div>
                      </td>
                      {getWeekDays().map((day) => {
                        const record = getAttendanceForStudentAndDate(student.Id, day);
                        return (
                          <td key={day.toISOString()} className="py-4 px-2 text-center">
                            {record ? (
                              <button
                                onClick={() => handleEditRecord(record)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                                  record.status === "present" ? "bg-success text-white" :
                                  record.status === "late" ? "bg-warning text-white" :
                                  record.status === "absent" ? "bg-error text-white" :
                                  "bg-info text-white"
                                }`}
                                title={`${record.status} - Click to edit`}
                              >
                                <ApperIcon name={getStatusIcon(record.status)} className="w-4 h-4" />
                              </button>
                            ) : (
                              <div className="flex items-center justify-center space-x-1">
                                {["present", "late", "absent"].map((status) => (
                                  <button
                                    key={status}
                                    onClick={() => handleQuickAttendance(student.Id, day, status)}
                                    className={`w-6 h-6 rounded-full border-2 hover:scale-110 transition-all duration-200 ${
                                      status === "present" ? "border-success hover:bg-success hover:text-white" :
                                      status === "late" ? "border-warning hover:bg-warning hover:text-white" :
                                      "border-error hover:bg-error hover:text-white"
                                    }`}
                                    title={`Mark as ${status}`}
                                  >
                                    <ApperIcon name={getStatusIcon(status)} className="w-3 h-3" />
                                  </button>
                                ))}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredAttendance.length === 0 && (searchTerm || selectedClass) ? (
            <Empty
              title="No attendance records found"
              description="No records match your current filters. Try adjusting your search."
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
          ) : filteredAttendance.length === 0 ? (
            <Empty
              title="No attendance records yet"
              description="Start by recording attendance for your students"
              icon="Calendar"
              action={
                <Button onClick={handleAddRecord}>
                  <ApperIcon name="Plus" className="w-4 h-4" />
                  Add First Record
                </Button>
              }
            />
          ) : (
            filteredAttendance.map((record) => {
              const student = getStudentById(record.studentId);
              const classItem = getClassById(record.classId);
              
              return (
                <Card key={record.Id} className="p-6 group" hover>
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
                          <h3 className="text-lg font-semibold text-gray-900">
                            {student ? `${student.firstName} ${student.lastName}` : "Unknown Student"}
                          </h3>
                          <Badge variant={getStatusColor(record.status)} size="sm">
                            <ApperIcon name={getStatusIcon(record.status)} className="w-3 h-3 mr-1" />
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span className="flex items-center">
                            <ApperIcon name="BookOpen" className="w-4 h-4 mr-1" />
                            {classItem ? classItem.name : "Unknown Class"}
                          </span>
                          <span className="flex items-center">
                            <ApperIcon name="Calendar" className="w-4 h-4 mr-1" />
                            {format(new Date(record.date), "MMM dd, yyyy")}
                          </span>
                        </div>
                        
                        {record.notes && (
                          <p className="text-sm text-gray-600 italic">
                            "{record.notes}"
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="p-2 text-gray-400 hover:text-secondary hover:bg-secondary/10 rounded-full transition-colors duration-200"
                      >
                        <ApperIcon name="Edit2" className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record)}
                        className="p-2 text-gray-400 hover:text-error hover:bg-error/10 rounded-full transition-colors duration-200"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      )}

      {/* Add/Edit Attendance Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedRecord ? "Edit Attendance" : "Add Attendance Record"}
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
                  label="Date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  error={formErrors.date}
                  required
                />

                <FormField
                  label="Status"
                  error={formErrors.status}
                  required
                >
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                  >
                    <option value="present">Present</option>
                    <option value="late">Late</option>
                    <option value="absent">Absent</option>
                    <option value="excused">Excused</option>
                  </select>
                </FormField>

                <FormField
                  label="Notes (Optional)"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  error={formErrors.notes}
                  placeholder="Add any notes..."
                >
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white resize-none"
                    placeholder="Add any notes about this attendance record..."
                  />
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
                      {selectedRecord ? "Updating..." : "Adding..."}
                    </>
                  ) : (
                    <>
                      <ApperIcon name="Save" className="w-4 h-4" />
                      {selectedRecord ? "Update Record" : "Add Record"}
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

export default Attendance;