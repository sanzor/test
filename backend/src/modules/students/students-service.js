const { ApiError, sendAccountVerificationEmail } = require("../../utils");
const { STUDENT_MESSAGES } = require("../../constants");
const { findAllStudents, findStudentDetail, findStudentToSetStatus, addOrUpdateStudent, deleteStudentById } = require("./students-repository");
const { findUserById } = require("../../shared/repository");

const checkStudentId = async (id) => {
    const isStudentFound = await findUserById(id);
    if (!isStudentFound) {
        throw new ApiError(404, STUDENT_MESSAGES.STUDENT_NOT_FOUND);
    }
}

const getAllStudents = async (payload) => {
    const students = await findAllStudents(payload);
    return students || [];
}

const getStudentDetail = async (id) => {
    await checkStudentId(id);

    const student = await findStudentDetail(id);
    if (!student) {
        throw new ApiError(404, STUDENT_MESSAGES.STUDENT_NOT_FOUND);
    }

    return student;
}

const addNewStudent = async (payload) => {
    try {
        const result = await addOrUpdateStudent(payload);
        if (!result.status) {
            const detail = result.description ? ` - ${result.description}` : "";
            const loweredMessage = String(result.message || "").toLowerCase();
            const loweredDescription = String(result.description || "").toLowerCase();

            if (loweredMessage.includes(STUDENT_MESSAGES.EMAIL_ALREADY_EXISTS)) {
                throw new ApiError(409, `${result.message}${detail}`);
            }

            if (loweredDescription.includes(STUDENT_MESSAGES.INVALID_INPUT_SYNTAX)) {
                throw new ApiError(400, `${result.message}${detail}`);
            }

            throw new ApiError(500, `${result.message}${detail}`);
        }

        try {
            await sendAccountVerificationEmail({ userId: result.userId, userEmail: payload.email });
            return { message: STUDENT_MESSAGES.ADD_STUDENT_AND_EMAIL_SEND_SUCCESS };
        } catch (error) {
            return { message: STUDENT_MESSAGES.ADD_STUDENT_BUT_EMAIL_SEND_FAIL }
        }
    } catch (error) {
        if (error instanceof ApiError) {
            throw error;
        }

        throw new ApiError(500, `${STUDENT_MESSAGES.UNABLE_TO_ADD_STUDENT} - ${error.message || STUDENT_MESSAGES.UNKNOWN_ERROR}`);
    }
}

const updateStudent = async (payload) => {
    const result = await addOrUpdateStudent(payload);
    if (!result.status) {
        throw new ApiError(500, result.message);
    }

    return { message: result.message };
}

const setStudentStatus = async ({ userId, reviewerId, status }) => {
    await checkStudentId(userId);

    const affectedRow = await findStudentToSetStatus({ userId, reviewerId, status });
    if (affectedRow <= 0) {
        throw new ApiError(500, STUDENT_MESSAGES.UNABLE_TO_DISABLE_STUDENT);
    }

    return { message: STUDENT_MESSAGES.STUDENT_STATUS_CHANGED_SUCCESS };
}

const deleteStudent = async (id) => {
    await checkStudentId(id);

    const affectedRow = await deleteStudentById(id);
    if (affectedRow <= 0) {
        throw new ApiError(500, STUDENT_MESSAGES.UNABLE_TO_DELETE_STUDENT);
    }

    return { message: STUDENT_MESSAGES.STUDENT_DELETED_SUCCESS };
}

module.exports = {
    getAllStudents,
    getStudentDetail,
    addNewStudent,
    setStudentStatus,
    updateStudent,
    deleteStudent,
};
