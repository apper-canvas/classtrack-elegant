import attendanceData from "@/services/mockData/attendance.json";

let attendance = [...attendanceData];

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const attendanceService = {
  async getAll() {
    await delay(300);
    return [...attendance];
  },

  async getById(id) {
    await delay(200);
    const record = attendance.find(a => a.Id === parseInt(id));
    if (!record) {
      throw new Error("Attendance record not found");
    }
    return { ...record };
  },

  async create(attendanceData) {
    await delay(400);
    const newRecord = {
      ...attendanceData,
      Id: Math.max(...attendance.map(a => a.Id)) + 1,
      recordedAt: new Date().toISOString()
    };
    attendance.push(newRecord);
    return { ...newRecord };
  },

  async update(id, attendanceData) {
    await delay(350);
    const index = attendance.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Attendance record not found");
    }
    attendance[index] = { ...attendance[index], ...attendanceData };
    return { ...attendance[index] };
  },

  async delete(id) {
    await delay(250);
    const index = attendance.findIndex(a => a.Id === parseInt(id));
    if (index === -1) {
      throw new Error("Attendance record not found");
    }
    const deleted = attendance.splice(index, 1)[0];
    return { ...deleted };
  },

  async getByStudentId(studentId) {
    await delay(300);
    return attendance.filter(record => 
      record.studentId === studentId.toString()
    ).map(record => ({ ...record }));
  },

  async getByClassId(classId) {
    await delay(300);
    return attendance.filter(record => 
      record.classId === classId.toString()
    ).map(record => ({ ...record }));
  },

  async getByDate(date) {
    await delay(300);
    return attendance.filter(record => 
      record.date === date
    ).map(record => ({ ...record }));
  }
};