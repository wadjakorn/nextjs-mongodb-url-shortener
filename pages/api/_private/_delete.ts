import { NextApiRequest, NextApiResponse } from "next";
import { UrlInfo } from "../../../types";
import { urlInfColl } from "../../../db/url-info-collection";
import { UpdateFilter } from "mongodb";

export async function deleteLink(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  const uid = request.query.uid as string;
  if (!uid) {
    response.status(400).send({
      type: "Error",
      code: 400,
      message: "Expected {uid: string}",
    });
    return;
  }
  try {
    const coll = await urlInfColl();
    const linkExists = await coll.findOne({
      uid,
    });
    if (linkExists) {
      const updateObj: UpdateFilter<UrlInfo> = {
        $set: {
          deletedAt: new Date(),
        },
      }
      console.info({updateObj});
      await coll.updateOne({
        uid,
      }, updateObj);
      response.status(200);
      response.send({
        type: "success",
        code: 200,
      });
    } else {
      response.status(404);
      response.send({
        type: "not found uid",
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