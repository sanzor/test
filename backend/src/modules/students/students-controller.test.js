jest.mock("./students-service", () => ({
  getAllStudents: jest.fn(),
  addNewStudent: jest.fn(),
  getStudentDetail: jest.fn(),
  setStudentStatus: jest.fn(),
  updateStudent: jest.fn(),
}));

const studentService = require("./students-service");
const studentController = require("./students-controller");

const createRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("students-controller", () => {
  it("handleGetAllStudents maps query and returns students", async () => {
    const req = { query: { name: "John", class: "Ten", section: "A", roll: "12" } };
    const res = createRes();
    const next = jest.fn();
    studentService.getAllStudents.mockResolvedValue([{ id: 1 }]);

    await studentController.handleGetAllStudents(req, res, next);

    expect(studentService.getAllStudents).toHaveBeenCalledWith({
      name: "John",
      className: "Ten",
      section: "A",
      roll: "12",
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ students: [{ id: 1 }] });
  });

  it("handleAddStudent returns 201", async () => {
    const req = { body: { email: "a@b.com", name: "A" } };
    const res = createRes();
    const next = jest.fn();
    studentService.addNewStudent.mockResolvedValue({ message: "ok" });

    await studentController.handleAddStudent(req, res, next);

    expect(studentService.addNewStudent).toHaveBeenCalledWith(
      expect.objectContaining({ email: "a@b.com", name: "A" })
    );
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "ok" });
  });

  it("handleUpdateStudent maps id into userId", async () => {
    const req = {
      params: { id: 42 },
      body: { email: "a@b.com", name: "A" },
    };
    const res = createRes();
    const next = jest.fn();
    studentService.updateStudent.mockResolvedValue({ message: "updated" });

    await studentController.handleUpdateStudent(req, res, next);

    expect(studentService.updateStudent).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 42, email: "a@b.com" })
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "updated" });
  });

  it("handleGetStudentDetail uses params id", async () => {
    const req = { params: { id: 7 } };
    const res = createRes();
    const next = jest.fn();
    studentService.getStudentDetail.mockResolvedValue({ id: 7 });

    await studentController.handleGetStudentDetail(req, res, next);

    expect(studentService.getStudentDetail).toHaveBeenCalledWith(7);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ id: 7 });
  });

  it("handleStudentStatus maps reviewer and status payload", async () => {
    const req = { params: { id: 9 }, body: { status: false }, user: { id: 100 } };
    const res = createRes();
    const next = jest.fn();
    studentService.setStudentStatus.mockResolvedValue({ message: "done" });

    await studentController.handleStudentStatus(req, res, next);

    expect(studentService.setStudentStatus).toHaveBeenCalledWith({
      userId: 9,
      reviewerId: 100,
      status: false,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "done" });
  });
});
