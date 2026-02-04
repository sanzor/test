const asyncHandler = require("express-async-handler");
const { getAllStudents, addNewStudent, getStudentDetail, setStudentStatus, updateStudent, deleteStudent } = require("./students-service");

const mapListStudentsRequestDtoToServicePayload = (queryDto) => {
    return {
        name: queryDto.name,
        className: queryDto.className || queryDto.class,
        section: queryDto.section,
        roll: queryDto.roll
    };
};

const mapCreateStudentRequestDtoToServicePayload = (bodyDto) => {
    return {
        name: bodyDto.name,
        gender: bodyDto.gender,
        dob: bodyDto.dob,
        phone: bodyDto.phone,
        email: bodyDto.email,
        class: bodyDto.class,
        section: bodyDto.section,
        roll: bodyDto.roll,
        admissionDate: bodyDto.admissionDate,
        currentAddress: bodyDto.currentAddress,
        permanentAddress: bodyDto.permanentAddress,
        fatherName: bodyDto.fatherName,
        fatherPhone: bodyDto.fatherPhone,
        motherName: bodyDto.motherName,
        motherPhone: bodyDto.motherPhone,
        guardianName: bodyDto.guardianName,
        guardianPhone: bodyDto.guardianPhone,
        relationOfGuardian: bodyDto.relationOfGuardian,
        systemAccess: bodyDto.systemAccess
    };
};

const mapUpdateStudentRequestDtoToServicePayload = ({ paramsDto, bodyDto }) => {
    return {
        ...mapCreateStudentRequestDtoToServicePayload(bodyDto),
        userId: paramsDto.id
    };
};

const mapStudentStatusRequestDtoToServicePayload = ({ paramsDto, bodyDto, reviewerId }) => {
    return {
        userId: paramsDto.id,
        reviewerId,
        status: bodyDto.status
    };
};

const handleGetAllStudents = asyncHandler(async (req, res) => {
    const listStudentsQueryDto = req.query;
    const servicePayload = mapListStudentsRequestDtoToServicePayload(listStudentsQueryDto);

    const students = await getAllStudents(servicePayload);
    res.status(200).json({ students });
});

const handleAddStudent = asyncHandler(async (req, res) => {
    const addStudentRequestDto = req.body;
    const servicePayload = mapCreateStudentRequestDtoToServicePayload(addStudentRequestDto);

    const message = await addNewStudent(servicePayload);
    res.status(201).json(message);
});

const handleUpdateStudent = asyncHandler(async (req, res) => {
    const paramsDto = req.params;
    const updateStudentRequestDto = req.body;

    const servicePayload = mapUpdateStudentRequestDtoToServicePayload({ paramsDto, bodyDto: updateStudentRequestDto });

    const message = await updateStudent(servicePayload);
    res.status(200).json(message);

});

const handleGetStudentDetail = asyncHandler(async (req, res) => {
    const paramsDto = req.params;

    const student = await getStudentDetail(paramsDto.id);
    res.status(200).json(student);

});

const handleStudentStatus = asyncHandler(async (req, res) => {
    const paramsDto = req.params;
    const statusRequestDto = req.body;

    const servicePayload = mapStudentStatusRequestDtoToServicePayload({
        paramsDto,
        bodyDto: statusRequestDto,
        reviewerId: req.user.id
    });

    const message = await setStudentStatus(servicePayload);
    res.status(200).json(message);

});


const handleDeleteStudent = asyncHandler(async (req, res) => {
    const paramsDto = req.params;
    const deleteResult = await deleteStudent(paramsDto.id);
    res.status(200).json(deleteResult);

});

module.exports = {
    handleGetAllStudents,
    handleGetStudentDetail,
    handleAddStudent,
    handleStudentStatus,
    handleUpdateStudent,
    handleDeleteStudent
};
