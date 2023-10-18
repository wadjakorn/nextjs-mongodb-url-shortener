import { NextApiRequest, NextApiResponse } from "next";
import { urlInfColl } from "../../../db/url-info-collection";
import { RedisStats, UrlInfo } from "../../../types";
import { Filter } from "mongodb";
import { authenticateToken } from "../../../utils";
import { cors, runMiddleware } from "../cors";
import { RedisRepo } from "../../../repositories/url-info-repo";

export default async function Details(
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
  // console.log({ q: request.query })
  try {
    const coll = await urlInfColl()
    const filter: Filter<UrlInfo> = { deletedAt: { $exists: false }, uid }
    const item = await coll.findOne(filter);

    const r = new RedisRepo()
    let stats = await r.getStats(uid)
    stats = new RedisStats(stats.uid).toRedisStats(stats)
    item.latestClick = stats.last_click
    item.visits = stats.toVisits()

    response.status(200);
    response.send({
      type: "success",
      code: 200,
      data: item,
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