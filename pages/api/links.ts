import { NextApiRequest, NextApiResponse } from "next";
import { urlInfColl } from "./_coll";

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
 
  try {
    const coll = await urlInfColl()
    const list = await coll.find().sort({ createdAt: -1 }).skip(skip).limit(limit).toArray();
    response.status(200);
    response.send({
      type: "success",
      code: 201,
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