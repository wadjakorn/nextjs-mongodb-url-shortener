import { NextApiRequest, NextApiResponse } from "next";
import { customAlphabet } from "nanoid";
import { UrlInfo } from "../../../types";
import { urlInfColl } from "../../../db/url-info-collection";
import { Repository, RedisRepo, MongoRepo } from "../../../repositories/url-info-repo";
 
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const getHash = customAlphabet(characters, 4);

var domain = process.env.HOST;

export async function createLink(
  request: NextApiRequest,
  response: NextApiResponse
) {
  // TODO: customDomain, tags

  const { link, title, customHash, tags, customDomain, v } = request.body;
  domain = customDomain ?? domain;
  var r: Repository

  const isRedis = v == '2';

  if (!link) {
    response.status(400).send({
      type: "Error",
      code: 400,
      message: "Expected {link: string}",
    });
    return;
  }
  try {

    if (isRedis) {
      console.log('is v2')
      r = new RedisRepo()
    } else {
      console.log('is v1')
      const coll = await urlInfColl();
      r = new MongoRepo(coll)
    }

    const uid = customHash ?? getHash();
    const shortUrl = `${domain}/${uid}`;
    
    var { code, message } = await r.validateCreate({ link, uid });
    if (code || message) {
      response.status(code);
      response.send({
        type: "error",
        code,
        message,
      });
      return;
    }

    const urlInfo = new UrlInfo(uid, link, title, shortUrl, new Date(), tags);
    console.log({ uid: urlInfo.uid })

    const res = await r.insert(urlInfo);
    console.log({ createRes: res })

    response.status(201);
    response.send({
      type: "success",
      code: 201,
      data: {
        shortUrl: res.shortUrl,
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

// async function setKV(k: string, v: string): Promise<any> {
//   const res = await fetch(`${process.env.KV_REST_API_URL}/`, {
//     headers: {
//       Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
//     },
//     body: `["SET", "${k}", "${v}"]`,
//     method: 'POST',
//   })
//   return res.json();
// }

