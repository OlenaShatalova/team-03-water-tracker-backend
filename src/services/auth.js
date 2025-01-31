import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import {randomBytes} from "crypto";

import { UserCollection } from "../db/models/User.js";
import { SessionCollection } from "../db/models/Session.js";

import { AccessTokenLifetime, RefreshTokenLifetime } from "../constants/user.js";

export const Register = async payload => {
    const {email, password} = payload;
    const User = await UserCollection.findOne({email});
    if(User) {
        throw createHttpError(409, "User already exists!");
    }

    const HashPassword = await bcrypt.hash(password, 10);

    const NewUser = await UserCollection.create({...payload, password: HashPassword});

    return NewUser;
};

export const Login = async ({email, password}) => {
    const User = await UserCollection.findOne({email});
    if(!User) {
        throw createHttpError(401, "Email or password invalid");
    }

    const PasswordCompare = await bcrypt.compare(password, User.password);
    if(!PasswordCompare) {
        throw createHttpError(401, "Email or password invalid");
    }

    await SessionCollection.deleteOne({userId: User._id});

    const AccessToken = randomBytes(30).toString("base64");
    const RefreshToken = randomBytes(30).toString("base64");

    return SessionCollection.create({
        userId: User._id,
        AccessToken,
        RefreshToken,
        AccessTokenValidUntil: Date.now() + AccessTokenLifetime,
        RefreshTokenValidUntil: Date.now() + RefreshTokenLifetime,
    });
};

export const GetSession = filter => SessionCollection.findOne(filter);

export const GetUser = filter => UserCollection.findOne(filter);
