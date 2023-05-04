import { NextApiRequest, NextApiResponse } from "next";
import { urlInfColl } from "../../db/url-info-collection";
import { UrlInfo } from "../../types";
import { Filter, WithId } from "mongodb";
import { authenticateToken } from "../../utils";

export default async function ListLink(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if (request.method !== "GET") {
    return response.status(405).json({
      type: "Error",
      code: 405,
      message: "Only GET method is accepted on this route",
    });
  }

  const auth = request.headers['authorization'];
  const token = auth && auth.split(' ')[1];
  if (token == null) {
    return response.status(401).json({
      type: "Error",
      code: 401,
      message: "Invalid token",
    });
  }

  try {
    const res = await authenticateToken(request, response);
    console.log({res})
    if (res === 401) {
      console.log("invalid token")
      response.status(401).json({
        type: "error",
        code: 401,
        message: "Invalid token",
      });
      return;
    }
    if (res === 403) {
      console.log("forbidden")
      response.status(403).json({
        type: "error",
        code: 403,
        message: "Forbidden",
      });
      return;
    }
  } catch (e: any) {
    console.log("error")
    response.status(500).json({
      code: 500,
      type: "error",
      message: e.message,
    });
    return;
  }
  console.log("passed")

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