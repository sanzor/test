const express = require("express");
const router = express.Router();
const studentController = require("./students-controller");
const { validateRequest } = require("../../utils");
const {
  GetStudentsSchema,
  AddStudentSchema,
  UpdateStudentSchema,
  StudentIdParamSchema,
  SetStudentStatusSchema,
} = require("./students-schema");

router.get("", validateRequest(GetStudentsSchema), studentController.handleGetAllStudents);
router.post("", validateRequest(AddStudentSchema), studentController.handleAddStudent);
router.delete("/:id", validateRequest(StudentIdParamSchema), studentController.handleDeleteStudent);
router.get("/:id", validateRequest(StudentIdParamSchema), studentController.handleGetStudentDetail);
router.post("/:id/status", validateRequest(SetStudentStatusSchema), studentController.handleStudentStatus);
router.put("/:id", validateRequest(UpdateStudentSchema), studentController.handleUpdateStudent);

module.exports = { studentsRoutes: router };
