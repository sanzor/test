const axios = require('axios');
const asyncHandler = require("express-async-handler");
const asyncErrorHandler = require("../utils/asyncErrorHandler");
const { checkPermission } = require("../modules/roles-and-permissions/rp-repository");
const { ApiError, getCachedString, setCachedString } = require("../utils");
const { env } = require("../config");

const getPermissionCacheTtl = () =>
  Number(env.PERMISSION_CACHE_TTL_SECONDS || 300);

const checkApiAccess = asyncHandler(async (req, res, next) => {
    const { baseUrl, route: { path }, method } = req;
    const { roleId } = req.user;
    const originalUrl = `${baseUrl}${path}`

    if (roleId !== 1) {
        const cacheKey = `cache:permission:${roleId}:${method}:${originalUrl}`;
        let affectedRow = await getCachedString(cacheKey);
        if (affectedRow === null) {
            affectedRow = await checkPermission(roleId, originalUrl, method);
            await setCachedString(cacheKey, String(affectedRow), getPermissionCacheTtl());
        } else {
            affectedRow = Number(affectedRow);
        }

        if (affectedRow <= 0) {
            throw new ApiError(403, `You do not have permission to access to this resource - ${originalUrl}`);
        }
    }
    next();
});
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
module.exports = { checkApiAccess };
