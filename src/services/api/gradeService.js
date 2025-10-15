import gradesData from "@/services/mockData/grades.json";

let grades = [...gradesData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const gradeService = {
  async getAll() {
    await delay(300);
    return [...grades];
  },

  async getById(id) {
    await delay(200);
    const grade = grades.find(g => g.Id === parseInt(id));
    if (!grade) {
      throw new Error("Grade not found");
    }
    return { ...grade };
  },

  async create(gradeData) {
    await delay(400);
    const newGrade = {
      ...gradeData,
      Id: Math.max(...grades.map(g => g.Id)) + 1,
      percentage: Math.round((gradeData.score / gradeData.maxScore) * 100)
    };
    grades.push(newGrade);
    return { ...newGrade };
  },

  async update(id, gradeData) {
    await delay(350);
    const index = grades.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Grade not found");
    }
    const updatedGrade = {
      ...grades[index],
      ...gradeData,
      percentage: Math.round((gradeData.score / gradeData.maxScore) * 100)
    };
    grades[index] = updatedGrade;
    return { ...updatedGrade };
  },

  async delete(id) {
    await delay(250);
    const index = grades.findIndex(g => g.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Grade not found");
    }
    const deleted = grades.splice(index, 1)[0];
    return { ...deleted };
  },

  async getByStudentId(studentId) {
    await delay(300);
    return grades.filter(grade => 
      grade.studentId === studentId.toString()
    ).map(grade => ({ ...grade }));
  },

  async getByClassId(classId) {
    await delay(300);
    return grades.filter(grade => 
      grade.classId === classId.toString()
    ).map(grade => ({ ...grade }));
  }
};