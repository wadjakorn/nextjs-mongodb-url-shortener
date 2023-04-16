import { NextApiRequest, NextApiResponse } from "next";
import { create } from "./_create";
import { update } from "./_update";
 
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
  if (!["POST", "PATCH"].includes(request.method)) {
    return response.status(405).json({
      type: "Error",
      code: 405,
      message: "Only POST/PATCH method is accepted on this route",
    });
  }
  switch (request.method) {
    case "POST":
      return create(request, response);
    case "PATCH":
      return update(request, response);
  }
}