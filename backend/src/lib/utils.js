import jwt from "jsonwebtoken"

export const generateToken = (userId, res) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })
    res.cookie("jwt", token, {
        maxAge: 7*24*60*60*1000, // milliseconds
        httpOnly: true, //prevent XSS attacks
        sameSite: "strict", // CSRF attacks cross site request forgey attacks
        secure:process.env.NODE_ENV !== "development" ? true : false,
    })

    return token

}