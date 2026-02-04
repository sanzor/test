const { z } = require("zod");

const StudentIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("id must be a positive integer"),
  }),
});

const GetStudentsSchema = z.object({
  query: z.object({
    name: z.string().trim().min(1).optional(),
    class: z.string().trim().min(1).optional(),
    section: z.string().trim().min(1).optional(),
    roll: z.string().trim().min(1).optional(),
  }),
});

const StudentBodyFieldsSchema = z.object({
  name: z.string().trim().min(1, "name is required"),
  gender: z.string().trim().min(1, "gender is required"),
  dob: z.union([z.string(), z.date()]),
  phone: z.string().trim().min(1, "phone is required"),
  email: z.string().trim().email("email must be valid"),
  class: z.string().trim().min(1, "class is required"),
  section: z.string().trim().min(1, "section is required"),
  roll: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .refine(
      (val) => Number.isInteger(val) && val > 0,
      "roll must be a positive integer"
    ),
  admissionDate: z.union([z.string(), z.date()]),
  currentAddress: z.string().trim().min(1, "currentAddress is required"),
  permanentAddress: z.string().trim().min(1, "permanentAddress is required"),
  fatherName: z.string().trim().min(1, "fatherName is required"),
  fatherPhone: z.string().trim().optional(),
  motherName: z.string().trim().optional(),
  motherPhone: z.string().trim().optional(),
  guardianName: z.string().trim().min(1, "guardianName is required"),
  guardianPhone: z.string().trim().min(1, "guardianPhone is required"),
  relationOfGuardian: z.string().trim().min(1, "relationOfGuardian is required"),
  systemAccess: z.boolean(),
});

const AddStudentSchema = z.object({
  body: StudentBodyFieldsSchema,
});

const UpdateStudentSchema = z.object({
  params: StudentIdParamSchema.shape.params,
  body: StudentBodyFieldsSchema,
});

const SetStudentStatusSchema = z.object({
  params: StudentIdParamSchema.shape.params,
  body: z.object({
    status: z.boolean(),
  }),
});

module.exports = {
  GetStudentsSchema,
  AddStudentSchema,
  UpdateStudentSchema,
  StudentIdParamSchema,
  SetStudentStatusSchema,
};
