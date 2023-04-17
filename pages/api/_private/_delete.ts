import { NextApiRequest, NextApiResponse } from "next";
import { UrlInfo } from "../../../types";
import { urlInfColl } from "../../../db/url-info-collection";
import { UpdateFilter } from "mongodb";

export async function deleteLink(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const hash = request.query.hash as string;
  if (!hash) {
    response.status(400).send({
      type: "Error",
      code: 400,
      message: "Expected {hash: string}",
    });
    return;
  }
  try {
    const coll = await urlInfColl();
    const linkExists = await coll.findOne({
      uid: hash,
    });
    if (linkExists) {
      const updateObj: UpdateFilter<UrlInfo> = {
        $set: {
          deletedAt: new Date(),
        },
      }
      console.info({updateObj});
      await coll.updateOne({
        uid: hash,
      }, updateObj);
      response.status(200);
      response.send({
        type: "success",
        code: 200,
      });
    } else {
      response.status(404);
      response.send({
        type: "not found hash",
        code: 404,
        data: null,
      });
    }
  } catch (e: any) {
    response.status(500);
    response.send({
      code: 500,
      type: "error",
      message: e.message,
    });
  }
}