import { NextApiRequest, NextApiResponse } from "next";
import { createLink } from "./_private/_create";
 
export default async function CreateLink(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if ((request.headers["api-key"] as string) !== process.env.API_KEY) {
    return response.status(401).json({
      type: "Error",
      code: 401,
      message: "Unauthorized",
    });
  }
  if (!["POST"].includes(request.method)) {
    return response.status(405).json({
      type: "Error",
      code: 405,
      message: "Only POST method is accepted on this route",
    });
  }
  switch (request.method) {
    case "POST":
      return createLink(request, response);
  }
}