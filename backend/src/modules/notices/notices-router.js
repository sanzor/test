const express = require("express");
const router = express.Router();
const noticeController = require("./notices-controller");
const { checkApiAccess } = require("../../middlewares");
const { validateRequest } = require("../../utils");
const {
  NoticeIdParamSchema,
  NoticeQuerySchema,
  AddNoticeSchema,
  UpdateNoticeSchema,
  NoticeStatusSchema,
  AddNoticeRecipientSchema,
  UpdateNoticeRecipientSchema,
} = require("./notices-schema");

router.get(
  "/recipients/list",
  checkApiAccess,
  validateRequest(NoticeQuerySchema),
  noticeController.handleFetchNoticeRecipients
);
router.get(
  "/recipients",
  checkApiAccess,
  validateRequest(NoticeQuerySchema),
  noticeController.handleGetNoticeRecipients
);
router.get(
  "/recipients/:id",
  checkApiAccess,
  validateRequest(NoticeIdParamSchema),
  noticeController.handleGetNoticeRecipient
);
router.post(
  "/recipients",
  checkApiAccess,
  validateRequest(AddNoticeRecipientSchema),
  noticeController.handleAddNoticeRecipient
);
router.put(
  "/recipients/:id",
  checkApiAccess,
  validateRequest(UpdateNoticeRecipientSchema),
  noticeController.handleUpdateNoticeRecipient
);
router.delete(
  "/recipients/:id",
  checkApiAccess,
  validateRequest(NoticeIdParamSchema),
  noticeController.handleDeleteNoticeRecipient
);
router.post(
  "/:id/status",
  checkApiAccess,
  validateRequest(NoticeStatusSchema),
  noticeController.handleNoticeStatus
);
router.get(
  "/pending",
  checkApiAccess,
  validateRequest(NoticeQuerySchema),
  noticeController.handleFetchAllPendingNotices
);
router.get(
  "/:id",
  checkApiAccess,
  validateRequest(NoticeIdParamSchema),
  noticeController.handleFetchNoticeDetailById
);
router.get("", checkApiAccess, validateRequest(NoticeQuerySchema), noticeController.handleFetchAllNotices);
router.post("", checkApiAccess, validateRequest(AddNoticeSchema), noticeController.handleAddNotice);
router.put("/:id", checkApiAccess, validateRequest(UpdateNoticeSchema), noticeController.handleUpdateNotice);

module.exports = { noticesRoutes: router };
