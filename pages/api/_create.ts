import { NextApiRequest, NextApiResponse } from "next";
import { customAlphabet } from "nanoid";
import { UrlInfo } from "../../types";
import { urlInfColl } from "../../db/url-info-collection";
 
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const getHash = customAlphabet(characters, 4);
 
export async function create(
  request: NextApiRequest,
  response: NextApiResponse
) {
  // TODO: customDomain, tags
  const { link, title, customHash, tags /*customDomain*/ } = request.body;
  if (!link) {
    response.status(400).send({
      type: "Error",
      code: 400,
      message: "Expected {link: string}",
    });
    return;
  }
  try {
    const coll = await urlInfColl();
    const hash = customHash ?? getHash();
    const linkExists = await coll.findOne({
      "$or": [{ link }, { uid: hash }],
    });
    const shortUrl = `${process.env.HOST}/${hash}`;
    if (!linkExists) {
      const urlInfo = new UrlInfo(hash, link, title, shortUrl, new Date(), tags);
      await coll.insertOne(urlInfo);
    }
    response.status(201);
    response.send({
      type: "success",
      code: 201,
      data: {
        shortUrl: linkExists?.shortUrl || shortUrl,
        link,
      },
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