class NoticesValidator {
  static validateNoticePayload(payload) {
    const description = payload.description;
    if (!description || String(description).trim().length === 0) {
      return {
        ok: false,
        statusCode: 400,
        message: "Bad argument",
      };
    }

    return { ok: true };
  }
}

module.exports = { NoticesValidator };
