import * as AuthServices from "../services/auth.js";

export const RegisterController = async (req, res) => {
    const Data = await AuthServices.register(req.body);

    res.status(201).json({
        status: 201,
        message: "Successfully registered a user!",
        Data,
    });
};

export const LoginController = async (req, res) => {
    const Session = await AuthServices.login(req.body);
    
    res.cookie("refreshToken", Session.refreshToken, {
        httpOnly: true,
        expires: Session.refreshTokenValidUntil,
    });
    
    res.cookie("sessionId", Session.id, {
        httpOnly: true,
        expires: Session.refreshTokenValidUntil,
    }); 

    res.json({
        status: 200,
        message: "Successfully logged in an user!",
        data: {
            accessToken: Session.AccessToken,
        }
    });
};