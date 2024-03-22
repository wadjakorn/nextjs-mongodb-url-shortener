import { NextApiRequest, NextApiResponse } from "next";
import { ListQuery, RespDataList } from "../../types";
import { authenticateToken } from "../../utils";
import { runMiddleware, cors } from "./cors";
import { Repository, chooseDB } from "../../repositories/url-info-repo";

const DB_VER = process.env.DB_VER;

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

  const query: ListQuery = new ListQuery(request.query);
  const r: Repository = await chooseDB()
 
  try {
    const { list, count, start, end } = await r.list(query)
    const resp: RespDataList = {
      type: "success",
      code: 200,
      totalLinks: count,
      data: list,
      version: DB_VER,
      start,
      end,
    }
    response.status(200);
    response.send(resp);
  } catch (e: any) {
    response.status(500);
    response.send({
      code: 500,
      type: "error",
      message: e.message,
    });
  }
}