import { NextApiRequest, NextApiResponse } from "next";
import { customAlphabet } from "nanoid";
import { UrlInfo } from "../../../types";
import { urlInfColl } from "../../../db/url-info-collection";
 
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const getHash = customAlphabet(characters, 4);
 
export async function createLink(
  request: NextApiRequest,
  response: NextApiResponse
) {
  // TODO: customDomain, tags
  const { link, title, customHash, tags, customDomain } = request.body;
  const domain = customDomain ?? process.env.HOST;

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
      link: link,
    });
    const uidExists = await coll.findOne({
      uid: hash,
    });
    const shortUrl = `${domain}/${hash}`;
    if (linkExists) {
      response.status(409);
      response.send({
        type: "error",
        code: 409,
        message: "Link already exists",
      });
      return;
    }
    if (uidExists) {
      response.status(409);
      response.send({
        type: "error",
        code: 409,
        message: "UID already exists",
      });
      return;
    }
    const urlInfo = new UrlInfo(hash, link, title, shortUrl, new Date(), tags);
    await coll.insertOne(urlInfo);
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