import { NextApiRequest, NextApiResponse } from "next";
import { UpdateUrlInfo } from "../../../types";
import { urlInfColl } from "../../../db/url-info-collection";

export async function updateLink(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const uid = request.query.uid;
  const { link, title, tags } = request.body;
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
      const updateObj = new UpdateUrlInfo(linkExists);
      updateObj.setLatestClick(new Date());
      if (link && link !== linkExists.link) {
        updateObj.setLink(link);
      }
      if (title && title !== linkExists.title) {
        updateObj.setTitle(title);
      }
      if (tags && tags !== linkExists.tags) {
        updateObj.setTags(tags);
      }
      console.info({updateObj});
      await coll.updateOne({
        uid,
      }, {...updateObj.getUpdateObj()});
      response.status(201);
      response.send({
        type: "success",
        code: 201,
        data: {
          shortUrl: linkExists.shortUrl,
          link: linkExists.link,
          title: linkExists.title,
        },
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