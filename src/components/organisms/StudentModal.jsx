import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import { studentService } from "@/services/api/studentService";
import { toast } from "react-toastify";

const StudentModal = ({ 
  isOpen, 
  onClose, 
  student = null, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    studentId: "",
    email: "",
    phone: "",
    photoUrl: "",
    dateOfBirth: "",
    enrollmentDate: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        studentId: student.studentId || "",
        email: student.email || "",
        phone: student.phone || "",
        photoUrl: student.photoUrl || "",
        dateOfBirth: student.dateOfBirth || "",
        enrollmentDate: student.enrollmentDate || ""
      });
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        studentId: "",
        email: "",
        phone: "",
        photoUrl: "",
        dateOfBirth: "",
        enrollmentDate: new Date().toISOString().split('T')[0]
      });
    }
    setErrors({});
  }, [student, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    if (!formData.studentId.trim()) newErrors.studentId = "Student ID is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!formData.enrollmentDate) newErrors.enrollmentDate = "Enrollment date is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setLoading(true);

    try {
      if (student) {
        await studentService.update(student.Id, formData);
        toast.success("Student updated successfully!");
      } else {
        await studentService.create({
          ...formData,
          classIds: []
        });
        toast.success("Student created successfully!");
      }
      
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving student:", error);
      toast.error("Failed to save student. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-surface rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {student ? "Edit Student" : "Add New Student"}
            </h2>
            <p className="text-sm text-gray-500">
              {student ? "Update student information" : "Enter student details to add them to the system"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ApperIcon name="X" className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              error={errors.firstName}
              required
              placeholder="Enter first name"
            />

            <FormField
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              error={errors.lastName}
              required
              placeholder="Enter last name"
            />

            <FormField
              label="Student ID"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              error={errors.studentId}
              required
              placeholder="Enter student ID"
            />

            <FormField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              required
              placeholder="Enter email address"
            />

            <FormField
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
              placeholder="Enter phone number"
            />

            <FormField
              label="Date of Birth"
              name="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={handleChange}
              error={errors.dateOfBirth}
            />

            <FormField
              label="Enrollment Date"
              name="enrollmentDate"
              type="date"
              value={formData.enrollmentDate}
              onChange={handleChange}
              error={errors.enrollmentDate}
              required
            />

            <FormField
              label="Photo URL"
              name="photoUrl"
              type="url"
              value={formData.photoUrl}
              onChange={handleChange}
              error={errors.photoUrl}
              placeholder="Enter photo URL (optional)"
            />
          </div>

          <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              disabled={loading}
            >
              {loading ? (
                <>
                  <ApperIcon name="Loader2" className="w-4 h-4 animate-spin" />
                  {student ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  <ApperIcon name="Save" className="w-4 h-4" />
                  {student ? "Update Student" : "Create Student"}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;