import { NextApiRequest, NextApiResponse } from "next";
import { authenticateToken } from "../../../utils";
import { cors, runMiddleware } from "../cors";
import { RedisRepo } from "../../../repositories/url-info-repo";

export default async function GetStats(
  request: NextApiRequest,
  response: NextApiResponse
) {

  await runMiddleware(request, response, cors)

  if (request.method !== "GET") {
    return response.status(405).json({
      type: "Error",
      code: 405,
      message: "Only GET method is accepted on this route",
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
  
  const uid = request.query.uid as string;

  try {
    const r = new RedisRepo()
    const stats = await r.getStats(uid)
    response.status(200);
    response.send({
      type: "success",
      code: 200,
      data: stats,
    });
  } catch (e: any) {
    response.status(500);
    response.send({
      code: 500,
      type: "error",
      message: e.message,
    });
  }
}