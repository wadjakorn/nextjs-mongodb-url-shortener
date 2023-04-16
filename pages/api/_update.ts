import { NextApiRequest, NextApiResponse } from "next";
import { UpdateUrlInfo } from "../../types";
import { urlInfColl } from "../../db/url-info-collection";
 
export async function update(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { link, hash, title } = request.body;
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
      const updateObj = new UpdateUrlInfo(linkExists);
      updateObj.setLatestClick(new Date());
      if (link) {
        updateObj.setLink(link);
      }
      if (title) {
        updateObj.setTitle(title);
      }
      await coll.updateOne({
        uid: hash,
      }, {...updateObj});
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