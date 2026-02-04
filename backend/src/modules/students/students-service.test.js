jest.mock("./students-repository", () => ({
  findAllStudents: jest.fn(),
  findStudentDetail: jest.fn(),
  findStudentToSetStatus: jest.fn(),
  addOrUpdateStudent: jest.fn(),
}));

jest.mock("../../shared/repository", () => ({
  findUserById: jest.fn(),
}));

jest.mock("../../utils", () => {
  class ApiError extends Error {
    constructor(statusCode, message) {
      super(message);
      this.statusCode = statusCode;
    }
  }

  return {
    ApiError,
    sendAccountVerificationEmail: jest.fn(),
  };
});

const studentRepo = require("./students-repository");
const sharedRepo = require("../../shared/repository");
const { sendAccountVerificationEmail } = require("../../utils");
const studentService = require("./students-service");

describe("students-service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getAllStudents returns empty array when repository returns null", async () => {
    studentRepo.findAllStudents.mockResolvedValue(null);

    const result = await studentService.getAllStudents({});

    expect(result).toEqual([]);
  });

  it("getStudentDetail throws 404 when student id is missing", async () => {
    sharedRepo.findUserById.mockResolvedValue(null);

    await expect(studentService.getStudentDetail(1)).rejects.toMatchObject({
      statusCode: 404,
      message: "Student not found",
    });
  });

  it("addNewStudent returns success message when email send succeeds", async () => {
    studentRepo.addOrUpdateStudent.mockResolvedValue({
      status: true,
      userId: 10,
      message: "Student added successfully",
    });
    sendAccountVerificationEmail.mockResolvedValue(undefined);

    const result = await studentService.addNewStudent({ email: "new@school.com" });

    expect(sendAccountVerificationEmail).toHaveBeenCalledWith({
      userId: 10,
      userEmail: "new@school.com",
    });
    expect(result).toEqual({
      message: "Student added and verification email sent successfully.",
    });
  });

  it("addNewStudent returns partial success when email send fails", async () => {
    studentRepo.addOrUpdateStudent.mockResolvedValue({
      status: true,
      userId: 10,
      message: "Student added successfully",
    });
    sendAccountVerificationEmail.mockRejectedValue(new Error("mail failed"));

    const result = await studentService.addNewStudent({ email: "new@school.com" });

    expect(result).toEqual({
      message: "Student added, but failed to send verification email.",
    });
  });

  it("addNewStudent maps duplicate email to 409", async () => {
    studentRepo.addOrUpdateStudent.mockResolvedValue({
      status: false,
      message: "Email already exists",
      description: null,
    });

    await expect(studentService.addNewStudent({ email: "exists@school.com" })).rejects.toMatchObject({
      statusCode: 409,
      message: "Email already exists",
    });
  });

  it("addNewStudent maps invalid input syntax to 400", async () => {
    studentRepo.addOrUpdateStudent.mockResolvedValue({
      status: false,
      message: "Unable to add student",
      description: "invalid input syntax for type integer: \"ASA\"",
    });

    await expect(studentService.addNewStudent({ email: "a@b.com" })).rejects.toMatchObject({
      statusCode: 400,
    });
  });

  it("addNewStudent wraps unknown errors as 500", async () => {
    studentRepo.addOrUpdateStudent.mockRejectedValue(new Error("db crash"));

    await expect(studentService.addNewStudent({ email: "a@b.com" })).rejects.toMatchObject({
      statusCode: 500,
      message: "Unable to add student - db crash",
    });
  });

  it("setStudentStatus throws 500 when update affects no row", async () => {
    sharedRepo.findUserById.mockResolvedValue({ id: 1 });
    studentRepo.findStudentToSetStatus.mockResolvedValue(0);

    await expect(
      studentService.setStudentStatus({ userId: 1, reviewerId: 10, status: false })
    ).rejects.toMatchObject({
      statusCode: 500,
      message: "Unable to disable student",
    });
  });

  it("updateStudent throws 500 when addOrUpdate fails", async () => {
    studentRepo.addOrUpdateStudent.mockResolvedValue({
      status: false,
      message: "Unable to update student",
    });

    await expect(studentService.updateStudent({ userId: 1 })).rejects.toMatchObject({
      statusCode: 500,
      message: "Unable to update student",
    });
  });
});
