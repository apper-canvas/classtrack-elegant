import { getApperClient } from "@/services/apperClient";
import { toast } from "react-toastify";

const TABLE_NAME = "grade_c";

export const gradeService = {
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
          { field: { Name: "student_id_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "assignment_name_c" } },
          { field: { Name: "score_c" } },
          { field: { Name: "max_score_c" } },
          { field: { Name: "percentage_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "notes_c" } }
        ],
        orderBy: [{ fieldName: "date_c", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        toast.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching grades:", error);
      toast.error("Failed to fetch grades");
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
          { field: { Name: "student_id_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "assignment_name_c" } },
          { field: { Name: "score_c" } },
          { field: { Name: "max_score_c" } },
          { field: { Name: "percentage_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "notes_c" } }
        ]
      };

      const response = await apperClient.getRecordById(TABLE_NAME, parseInt(id), params);

      if (!response.success || !response.data) {
        throw new Error("Grade not found");
      }

      return response.data;
    } catch (error) {
      console.error(`Error fetching grade ${id}:`, error);
      throw error;
    }
  },

  async create(gradeData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const percentage = Math.round((gradeData.score_c / gradeData.max_score_c) * 100);

      const recordData = {
        Name: gradeData.assignment_name_c,
        student_id_c: parseInt(gradeData.student_id_c),
        class_id_c: parseInt(gradeData.class_id_c),
        assignment_name_c: gradeData.assignment_name_c,
        score_c: parseFloat(gradeData.score_c),
        max_score_c: parseFloat(gradeData.max_score_c),
        percentage_c: percentage,
        date_c: gradeData.date_c,
        category_c: gradeData.category_c,
        notes_c: gradeData.notes_c || ""
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
      console.error("Error creating grade:", error);
      toast.error("Failed to create grade");
      return null;
    }
  },

  async update(id, gradeData) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const recordData = {
        Id: parseInt(id)
      };

      if (gradeData.assignment_name_c !== undefined) {
        recordData.Name = gradeData.assignment_name_c;
        recordData.assignment_name_c = gradeData.assignment_name_c;
      }
      if (gradeData.student_id_c !== undefined) recordData.student_id_c = parseInt(gradeData.student_id_c);
      if (gradeData.class_id_c !== undefined) recordData.class_id_c = parseInt(gradeData.class_id_c);
      if (gradeData.score_c !== undefined) recordData.score_c = parseFloat(gradeData.score_c);
      if (gradeData.max_score_c !== undefined) recordData.max_score_c = parseFloat(gradeData.max_score_c);
      if (gradeData.score_c !== undefined && gradeData.max_score_c !== undefined) {
        recordData.percentage_c = Math.round((parseFloat(gradeData.score_c) / parseFloat(gradeData.max_score_c)) * 100);
      }
      if (gradeData.date_c !== undefined) recordData.date_c = gradeData.date_c;
      if (gradeData.category_c !== undefined) recordData.category_c = gradeData.category_c;
      if (gradeData.notes_c !== undefined) recordData.notes_c = gradeData.notes_c;

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
      console.error("Error updating grade:", error);
      toast.error("Failed to update grade");
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
      console.error("Error deleting grade:", error);
      toast.error("Failed to delete grade");
      return false;
    }
  },

  async getByStudentId(studentId) {
    try {
      const apperClient = getApperClient();
      if (!apperClient) {
        throw new Error("ApperClient not initialized");
      }

      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "student_id_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "assignment_name_c" } },
          { field: { Name: "score_c" } },
          { field: { Name: "max_score_c" } },
          { field: { Name: "percentage_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "notes_c" } }
        ],
        where: [
          {
            FieldName: "student_id_c",
            Operator: "EqualTo",
            Values: [parseInt(studentId)]
          }
        ],
        orderBy: [{ fieldName: "date_c", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching grades by student:", error);
      return [];
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
          { field: { Name: "student_id_c" } },
          { field: { Name: "class_id_c" } },
          { field: { Name: "assignment_name_c" } },
          { field: { Name: "score_c" } },
          { field: { Name: "max_score_c" } },
          { field: { Name: "percentage_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "category_c" } },
          { field: { Name: "notes_c" } }
        ],
        where: [
          {
            FieldName: "class_id_c",
            Operator: "EqualTo",
            Values: [parseInt(classId)]
          }
        ],
        orderBy: [{ fieldName: "date_c", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords(TABLE_NAME, params);

      if (!response.success) {
        console.error(response.message);
        return [];
      }

      return response.data || [];
    } catch (error) {
      console.error("Error fetching grades by class:", error);
      return [];
    }
  }
};