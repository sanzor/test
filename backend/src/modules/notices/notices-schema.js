const { z } = require("zod");

const NoticeIdParamSchema = z.object({
  params: z.object({
    id: z.coerce.number().int().positive("id must be a positive integer"),
  }),
});

const NoticeQuerySchema = z.object({
  query: z.object({
    status: z.union([z.string(), z.number()]).optional(),
    author_id: z.union([z.string(), z.number()]).optional(),
    recipient_type: z.string().optional(),
  }),
});

const NoticeBodySchema = z
  .object({
    title: z.string().trim().min(1, "title is required"),
    description: z.string().trim().optional(),
    content: z.string().trim().optional(),
    status: z.coerce.number().int().positive("status is required"),
    recipientType: z.enum(["EV", "SP"]),
    recipientRole: z.coerce.number().int().positive().optional(),
    firstField: z.union([z.string(), z.number()]).optional(),
  })
  .superRefine((data, ctx) => {
    const description = data.description ?? data.content;
    if (!description || String(description).trim().length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["description"],
        message: "description is required",
      });
    }

    if (data.recipientType === "SP" && !data.recipientRole) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recipientRole"],
        message: "recipientRole is required when recipientType is SP",
      });
    }
  });

const AddNoticeSchema = z.object({
  body: NoticeBodySchema,
});

const UpdateNoticeSchema = z.object({
  params: NoticeIdParamSchema.shape.params,
  body: NoticeBodySchema,
});

const NoticeStatusSchema = z.object({
  params: NoticeIdParamSchema.shape.params,
  body: z.object({
    status: z.coerce.number().int().positive("status is required"),
  }),
});

const NoticeRecipientBodySchema = z.object({
  roleId: z.coerce.number().int().positive("roleId is required"),
  primaryDependentName: z.string().trim().min(1, "primaryDependentName is required"),
  primaryDependentSelect: z.string().trim().min(1, "primaryDependentSelect is required"),
});

const AddNoticeRecipientSchema = z.object({
  body: NoticeRecipientBodySchema,
});

const UpdateNoticeRecipientSchema = z.object({
  params: NoticeIdParamSchema.shape.params,
  body: NoticeRecipientBodySchema,
});

module.exports = {
  NoticeIdParamSchema,
  NoticeQuerySchema,
  AddNoticeSchema,
  UpdateNoticeSchema,
  NoticeStatusSchema,
  AddNoticeRecipientSchema,
  UpdateNoticeRecipientSchema,
};
