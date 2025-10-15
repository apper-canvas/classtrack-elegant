import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

const TABLE_NAME = "class_c";

export const classService = {
  async getAll() {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "subject_c" } },
          { field: { Name: "academic_year_c" } },
          { field: { Name: "semester_c" } },
          { field: { Name: "student_ids_c" } },
          { field: { Name: "created_at_c" } }
        ],
        orderBy: [{ fieldName: "Id", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Failed to fetch classes");
      return [];
    }
  },

  async getById(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "subject_c" } },
          { field: { Name: "academic_year_c" } },
          { field: { Name: "semester_c" } },
          { field: { Name: "student_ids_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);

      if (!response.success || !response.data) {
        throw new Error("Class not found");
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching class ${id}:`, error);
      throw error;
    }
  },

  async create(classData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const recordData = {
        Name: classData.name_c,
        name_c: classData.name_c,
        subject_c: classData.subject_c,
        academic_year_c: classData.academic_year_c,
        semester_c: classData.semester_c,
        student_ids_c: classData.student_ids_c || "",
        created_at_c: new Date().toISOString()
      };

      const params = {
        records: [recordData]
      };

      const response = await apperClient.createRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error creating class:", error);
      toast.error("Failed to create class");
      return null;
    }
  },

  async update(id, classData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const recordData = {
        Id: parseInt(id)
      };

      if (classData.name_c !== undefined) {
        recordData.Name = classData.name_c;
        recordData.name_c = classData.name_c;
      }
      if (classData.subject_c !== undefined) recordData.subject_c = classData.subject_c;
      if (classData.academic_year_c !== undefined) recordData.academic_year_c = classData.academic_year_c;
      if (classData.semester_c !== undefined) recordData.semester_c = classData.semester_c;
      if (classData.student_ids_c !== undefined) recordData.student_ids_c = classData.student_ids_c;
      if (classData.created_at_c !== undefined) recordData.created_at_c = classData.created_at_c;

      const params = {
        records: [recordData]
      };

      const response = await apperClient.updateRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return null;
      }

      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
        }

        if (successful.length > 0) {
          return successful[0].data;
        }
      }

      return null;
    } catch (error) {
      console.error("Error updating class:", error);
      toast.error("Failed to update class");
      return null;
    }
  },

  async delete(id) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return false;
      }

      if (response.results) {
        const failed = response.results.filter(r => !r.success);

        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records: ${JSON.stringify(failed)}`);
          failed.forEach(record => {
            if (record.message) toast.error(record.message);
          });
          return false;
        }

        return true;
      }

      return true;
    } catch (error) {
      console.error("Error deleting class:", error);
      toast.error("Failed to delete class");
      return false;
    }
  }
};