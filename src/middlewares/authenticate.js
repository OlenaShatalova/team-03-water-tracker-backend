import createHttpError from "http-errors";

import { getSession, getUser } from "../services/auth.js";

export const authenticate = async (req, res, next) => {
    const authHeader = req.get("Authorization");
    if(!authHeader) {
        return next(createHttpError(401, "Authorization header not found"));
    }

    const [bearer, AccessToken] = AuthHeader.split(" ");
    if(bearer !== "Bearer") {
        return next(createHttpError(401, "Header must be Bearer type"));
}

const session = await getSession({AccessToken});
if(!session) {
    return next(createHttpError(401, "Session not found"));
}

if(Date.now() > session.accessTokenValidUntil) {
    return next(createHttpError(401, "Access token expired"));
}

const user = await getUser({_id: session.userId});
    if(!User) {
        return next(createHttpError(401, "User not found"));
    }
    
    req.user = User;

    next();
};
