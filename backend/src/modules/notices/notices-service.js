const { ApiError } = require("../../utils");
const {
  getNoticeRecipients,
  getNoticeById,
  addNewNotice,
  updateNoticeById,
  manageNoticeStatus,
  getNotices,
  addNoticeRecipient,
  updateNoticeRecipient,
  getNoticeRecipientList,
  deleteNoticeRecipient,
  getNoticeRecipientById,
  getAllPendingNotices,
} = require("./notices-repository");
const { NoticesValidator } = require("./notices-validator");
const { env } = require("../../config");
const { getCachedJson, setCachedJson, deleteCachedKey } = require("../../utils");

const NOTICE_RECIPIENT_LIST_CACHE_KEY = "cache:notices:recipients:list";
const NOTICE_RECIPIENTS_CACHE_KEY = "cache:notices:recipients";

const getCacheTtl = () => Number(env.CACHE_TTL_SECONDS || 300);

const fetchNoticeRecipients = async () => {
  const cached = await getCachedJson(NOTICE_RECIPIENT_LIST_CACHE_KEY);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  const recipients = await getNoticeRecipientList();
  if (!Array.isArray(recipients) || recipients.length <= 0) {
    throw new ApiError(404, "Recipients not found");
  }

  await setCachedJson(
    NOTICE_RECIPIENT_LIST_CACHE_KEY,
    recipients,
    getCacheTtl()
  );
  return recipients;
};

const processGetNoticeRecipients = async () => {
  const cached = await getCachedJson(NOTICE_RECIPIENTS_CACHE_KEY);
  if (cached && Array.isArray(cached) && cached.length > 0) {
    return cached;
  }

  const recipients = await getNoticeRecipients();
  if (!Array.isArray(recipients) || recipients.length <= 0) {
    throw new ApiError(404, "Recipients not found");
  }

  await setCachedJson(NOTICE_RECIPIENTS_CACHE_KEY, recipients, getCacheTtl());
  return recipients;
};

const processGetNoticeRecipient = async (id) => {
  const recipient = await getNoticeRecipientById(id);
  if (!recipient) {
    throw new ApiError(404, "Recipient detail not found");
  }

  return recipient;
};

const fetchAllNotices = async (userId) => {
  const notices = await getNotices(userId);
  if (notices.length <= 0) {
    throw new ApiError(404, "Notices not found");
  }
  return notices;
};

const fetchNoticeDetailById = async (id) => {
  const noticeDetail = await getNoticeById(id);
  if (!noticeDetail) {
    throw new ApiError(404, "Notice detail not found");
  }
  return noticeDetail;
};

const addNotice = async (payload) => {
  const validation = NoticesValidator.validateNoticePayload(payload);
  if (!validation.ok) return validation;

  const affectedRow = await addNewNotice(payload);
  if (affectedRow <= 0) {
    return {
      ok: false,
      statusCode: 500,
      message: "Unable to add new notice",
    };
  }

  return {
    ok: true,
    statusCode: 201,
    data: { message: "Notice added successfully" },
  };
};

const updateNotice = async (payload) => {
  const validation = NoticesValidator.validateNoticePayload(payload);
  if (!validation.ok) return validation;

  const affectedRow = await updateNoticeById(payload);
  if (affectedRow <= 0) {
    return {
      ok: false,
      statusCode: 500,
      message: "Unable to update notice",
    };
  }

  return {
    ok: true,
    statusCode: 200,
    data: { message: "Notice updated successfully" },
  };
};

const processNoticeStatus = async (payload) => {
  const { noticeId, status, currentUserId, currentUserRole } = payload;
  const notice = await getNoticeById(noticeId);
  if (!notice) {
    throw new ApiError(404, "Notice not found");
  }

  const now = new Date();
  const {
    authorId,
    reviewer_id: reviewerIdFromDB,
    reviewed_dt: reviewedDateFromDB,
  } = notice;
  const userCanManageStatus = handleStatusCheck(
    currentUserRole,
    currentUserId,
    authorId,
    status
  );
  if (!userCanManageStatus) {
    throw new ApiError(
      403,
      "Forbidden. You do not have permission to access to this resource."
    );
  }

  const affectedRow = await manageNoticeStatus({
    noticeId,
    status,
    reviewerId: currentUserRole === "admin" ? currentUserId : reviewerIdFromDB,
    reviewDate: currentUserRole === "admin" ? now : reviewedDateFromDB,
  });
  if (affectedRow <= 0) {
    throw new ApiError(500, "Unable to review notice");
  }

  return { message: "Success" };
};

const handleStatusCheck = (
  currentUserRole,
  currentUserId,
  authorId,
  status
) => {
  if (currentUserRole === "admin") {
    return true;
  } else if (authorId === currentUserId) {
    switch (status) {
      case 1:
      case 2:
      case 3:
        return true;
      default:
        return false;
    }
  }

  return false;
};

const processAddNoticeRecipient = async (payload) => {
  const affectedRow = await addNoticeRecipient(payload);
  if (affectedRow <= 0) {
    throw new ApiError(500, "Unable to add notice recipient");
  }

  await deleteCachedKey(NOTICE_RECIPIENT_LIST_CACHE_KEY);
  await deleteCachedKey(NOTICE_RECIPIENTS_CACHE_KEY);

  return { message: "Notice Recipient added successfully" };
};

const processUpdateNoticeRecipient = async (payload) => {
  const affectedRow = await updateNoticeRecipient(payload);
  if (affectedRow <= 0) {
    throw new ApiError(500, "Unable to update notice recipient");
  }

  await deleteCachedKey(NOTICE_RECIPIENT_LIST_CACHE_KEY);
  await deleteCachedKey(NOTICE_RECIPIENTS_CACHE_KEY);

  return { message: "Notice Recipient updated successfully" };
};

const processDeleteNoticeRecipient = async (id) => {
  const affectedRow = await deleteNoticeRecipient(id);
  if (affectedRow <= 0) {
    throw new ApiError(500, "Unable to delete notice recipient");
  }

  await deleteCachedKey(NOTICE_RECIPIENT_LIST_CACHE_KEY);
  await deleteCachedKey(NOTICE_RECIPIENTS_CACHE_KEY);

  return { message: "Notice Recipient deleted successfully" };
};

const processGetAllPendingNotices = async () => {
  const notices = await getAllPendingNotices();
  if (notices.length <= 0) {
    throw new ApiError(404, "Pending Notices not found");
  }

  return notices;
};

module.exports = {
  fetchNoticeRecipients,
  fetchAllNotices,
  fetchNoticeDetailById,
  addNotice,
  updateNotice,
  processNoticeStatus,
  processAddNoticeRecipient,
  processUpdateNoticeRecipient,
  processGetNoticeRecipients,
  processDeleteNoticeRecipient,
  processGetNoticeRecipient,
  processGetAllPendingNotices,
};
