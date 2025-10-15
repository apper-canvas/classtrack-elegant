import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

const TABLE_NAME = "student_c";

export const studentService = {
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
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "student_id_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "photo_url_c" } },
          { field: { Name: "date_of_birth_c" } },
          { field: { Name: "enrollment_date_c" } },
          { field: { Name: "class_ids_c" } }
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
      console.error("Error fetching students:", error);
      toast.error("Failed to fetch students");
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
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "student_id_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "photo_url_c" } },
          { field: { Name: "date_of_birth_c" } },
          { field: { Name: "enrollment_date_c" } },
          { field: { Name: "class_ids_c" } }
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);

      if (!response.success || !response.data) {
        throw new Error("Student not found");
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      throw error;
    }
  },

  async create(studentData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const recordData = {
        Name: `${studentData.first_name_c} ${studentData.last_name_c}`,
        first_name_c: studentData.first_name_c,
        last_name_c: studentData.last_name_c,
        student_id_c: studentData.student_id_c,
        email_c: studentData.email_c,
        phone_c: studentData.phone_c || "",
        photo_url_c: studentData.photo_url_c || "",
        date_of_birth_c: studentData.date_of_birth_c || "",
        enrollment_date_c: studentData.enrollment_date_c,
        class_ids_c: studentData.class_ids_c || ""
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
      console.error("Error creating student:", error);
      toast.error("Failed to create student");
      return null;
    }
  },

  async update(id, studentData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const recordData = {
        Id: parseInt(id),
        Name: studentData.first_name_c && studentData.last_name_c 
          ? `${studentData.first_name_c} ${studentData.last_name_c}`
          : undefined
      };

      if (studentData.first_name_c !== undefined) recordData.first_name_c = studentData.first_name_c;
      if (studentData.last_name_c !== undefined) recordData.last_name_c = studentData.last_name_c;
      if (studentData.student_id_c !== undefined) recordData.student_id_c = studentData.student_id_c;
      if (studentData.email_c !== undefined) recordData.email_c = studentData.email_c;
      if (studentData.phone_c !== undefined) recordData.phone_c = studentData.phone_c;
      if (studentData.photo_url_c !== undefined) recordData.photo_url_c = studentData.photo_url_c;
      if (studentData.date_of_birth_c !== undefined) recordData.date_of_birth_c = studentData.date_of_birth_c;
      if (studentData.enrollment_date_c !== undefined) recordData.enrollment_date_c = studentData.enrollment_date_c;
      if (studentData.class_ids_c !== undefined) recordData.class_ids_c = studentData.class_ids_c;

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
      console.error("Error updating student:", error);
      toast.error("Failed to update student");
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
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
      return false;
    }
  },

  async getByClassId(classId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "first_name_c" } },
          { field: { Name: "last_name_c" } },
          { field: { Name: "student_id_c" } },
          { field: { Name: "email_c" } },
          { field: { Name: "phone_c" } },
          { field: { Name: "photo_url_c" } },
          { field: { Name: "class_ids_c" } }
        ],
        where: [
          {
            FieldName: "class_ids_c",
            Operator: "Contains",
            Values: [classId.toString()]
          }
        ]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching students by class:", error);
      return [];
    }
  }
};