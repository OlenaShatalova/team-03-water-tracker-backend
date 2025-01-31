import createHttpError from "http-errors";

import { getSession, getUser } from "../services/auth.js";

export const Authenticate = async (req, res, next) => {
    const AuthHeader = req.get("Authorization");
    if(!AuthHeader) {
        return next(createHttpError(401, "Authorization header not found"));
    }

    const [Bearer, AccessToken] = AuthHeader.split(" ");
    if(Bearer !== "Bearer") {
        return next(createHttpError(401, "Header must be Bearer type"));
}

const Session = await getSession({AccessToken});
if(!Session) {
    return next(createHttpError(401, "Session not found"));
}

if(Date.now() > Session.AccessTokenValidUntil) {
    return next(createHttpError(401, "Access token expired"));
}

const User = await getUser({_id: Session.userId});
    if(!User) {
        return next(createHttpError(401, "User not found"));
    }
    
    req.user = User;

    next();
};