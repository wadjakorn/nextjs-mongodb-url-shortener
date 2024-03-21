import { NextApiRequest, NextApiResponse } from "next";
import { createLink } from "./_private/_create";
import { authenticateToken } from "../../utils";
 
export default async function CreateLink(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (!["POST"].includes(request.method)) {
    return response.status(405).json({
      type: "Error",
      code: 405,
      message: "Only POST method is accepted on this route",
    });
  }
  
  if ((request.headers["api-key"] as string) !== process.env.API_KEY) {
    const authResp = await authenticateToken(request, response)
    if (authResp !== 200) {
      return response.status(401).json({
        type: "Error",
        code: 401,
        message: "Unauthorized",
      });
    }
  }

  switch (request.method) {
    case "POST":
      return createLink(request, response);
  }
}