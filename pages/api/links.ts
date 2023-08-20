import { NextApiRequest, NextApiResponse } from "next";
import { urlInfColl } from "../../db/url-info-collection";
import { UrlInfo } from "../../types";
import { Filter, WithId } from "mongodb";
import { authenticateToken } from "../../utils";
import { runMiddleware, cors } from "./cors";

export default async function ListLink(
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

  const query = request.query;
  // pagination
  const limit = Number(query.limit) || 50;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;
  // search
  const search = query.search as string;
  const searchRules = query.searchRules as string;
  // sort
  const sortBy = query.sortBy as string;
  const sortDir = query.sortDir as string;
 
  try {
    const coll = await urlInfColl()
    const filter: Filter<UrlInfo> = { deletedAt: { $exists: false } }
    if (search && searchRules) {
      searchRules.split(",").forEach((key: string) => {
        switch (key) {
          case "title":
            pushOr(filter, { title: { $regex: search, $options: "i" }})
            break;
          case "uid":
            pushOr(filter, { uid: search })
            break;
          case "tags":
            pushOr(filter, { tags: search })
            break;
        }
      })
    }
 
    let prepareFind = coll.find(filter);
    let prepareCount = coll.countDocuments(filter);

    if (sortDir && sortBy) {
      const sortDirection = sortDir === 'desc' ? -1 : 1
      prepareFind = prepareFind.sort({
        [`${sortBy}`]: sortDirection
      });
    } else {
      prepareFind = prepareFind.sort({ createdAt: -1 });
    }

    const list = await prepareFind.skip(skip).limit(limit).toArray();
    const count = await prepareCount;

    response.status(200);
    response.send({
      type: "success",
      code: 200,
      totalLinks: count,
      data: list,
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

function pushOr(filter: Filter<UrlInfo>, ...items: Filter<WithId<UrlInfo>>[]): Filter<UrlInfo> {
  if (!filter.$or) {
    filter.$or = []
  }
  filter.$or.push(...items)
  return filter
}