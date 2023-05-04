import { NextApiRequest, NextApiResponse } from "next";
import { authenticateToken, generateAccessToken } from "../../utils";

export default async function Login(
    request: NextApiRequest,
    response: NextApiResponse) {
    if (request.method !== "POST") {
        return response.status(405).json({
            type: "Error",
            code: 405,
            message: "Only POST method is accepted on this route",
        });
    }
    // get token from headers
    const statusCode = await authenticateToken(request, response);
    if (statusCode === 200) {
        // response with message already logged in
        return response.status(200).json({
            type: "Success",
            code: 200,
            message: "alreadyloggedin",
        });
    }
    const { username, password } = request.body;
    console.log({ body: request.body })
    console.log({ username, password })
    // validate
    if (!username || !password) {
        return response.status(400).json({
            type: "Error",
            code: 400,
            message: "Username and password are required",
        });
    }

    // get USERNAME and PASSWORD from env
    const USERNAME = process.env.USERNAME;
    const PASSWORD = process.env.PASSWORD;

    if (username !== USERNAME || password !== PASSWORD) {
        return response.status(401).json({
            type: "Error",
            code: 401,
            message: "Invalid username or password",
        });
    }

    // generate JWT token
    const token = generateAccessToken(username);

    // give token
    return response.status(200).json({
        type: "Success",
        code: 200,
        message: "Login success",
        token: token,
    });
}
