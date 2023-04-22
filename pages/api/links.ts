import { NextApiRequest, NextApiResponse } from "next";
import { urlInfColl } from "../../db/url-info-collection";
import { UrlInfo } from "../../types";
import { Filter, WithId } from "mongodb";

export default async function ListLink(
  request: NextApiRequest,
  response: NextApiResponse
) {
  // const apiKey = request.headers["api-key"] as string;
  if (request.method !== "GET") {
    return response.status(405).json({
      type: "Error",
      code: 405,
      message: "Only GET method is accepted on this route",
    });
  }

  const query = request.query;
  const limit = Number(query.limit) || 50;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;
  const search = query.search as string;
  const searchRules = query.searchRules as string;
 
  try {
    const coll = await urlInfColl()
    const filter: Filter<UrlInfo> = { deletedAt: { $exists: false } }
    if (search) {
      const searchRuleSplit = searchRules.split(",")
      if (searchRuleSplit.includes("title")) {
        pushOr(filter, { title: { $regex: search, $options: "i" }})
      }
      if (searchRuleSplit.includes("hash")) {
        pushOr(filter, { uid: search })
      }
      if (searchRuleSplit.includes("tags")) {
        pushOr(filter, { tags: search })
      }
    }
    
    const count = await coll.countDocuments(filter);
    const list = await coll.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
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