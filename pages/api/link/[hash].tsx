import { NextApiRequest, NextApiResponse } from "next";
import { deleteLink } from "../_private/_delete";
import { updateLink } from "../_private/_update";
 
export default async function DeleteLink(
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
  if (!["PATCH","DELETE"].includes(request.method)) {
    return response.status(405).json({
      type: "Error",
      code: 405,
      message: "Only PATCH/DELETE method is accepted on this route",
    });
  }
  switch (request.method) {
    case "PATCH":
      return updateLink(request, response);
    case "DELETE":
      return deleteLink(request, response);
  }
}