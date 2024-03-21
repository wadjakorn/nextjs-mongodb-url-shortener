import { NextApiRequest, NextApiResponse } from "next";
import { customAlphabet } from "nanoid";
import { UrlInfo } from "../../../types";
import { Repository, chooseDB } from "../../../repositories/url-info-repo";

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const getHash = customAlphabet(characters, 4);

var domain = process.env.HOST;

export async function createLink(
  request: NextApiRequest,
  response: NextApiResponse
) {
  // TODO: customDomain, tags

  const { link, title, customHash, tags, customDomain, bulk } = request.body;

  if (bulk) {
    return createBulk(request, response)
  }

  domain = customDomain ?? domain;

  if (!link) {
    response.status(400).send({
      type: "Error",
      code: 400,
      message: "Expected {link: string}",
    });
    return;
  }
  try {
    const r: Repository = await chooseDB()
    console.log({ customHash })
    const uid = customHash ?? getHash();
    const shortUrl = `${domain}/${uid}`;
    
    const urlInfo = new UrlInfo(uid, link, title, shortUrl, new Date(), tags);
    console.log({ uid: urlInfo.uid })

    const { inserted, error } = await r.insert(urlInfo);
    if (error) {
      const { code, message } = error;
      response.status(code);
      response.send({
        type: "error",
        code,
        message,
      });
      return;
    }

    console.log({ createRes: inserted })

    response.status(201);
    response.send({
      type: "success",
      code: 201,
      data: {
        shortUrl: inserted.shortUrl,
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

async function createBulk(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const r: Repository = await chooseDB()

  request.body.list.forEach(async (each: JsonImport) => {
    const { uid, link, title, tags } = each;
    console.log({ uid })
    const shortUrl = `${domain}/${uid}`;
    const urlInfo = new UrlInfo(uid, link, title, shortUrl, new Date(), tags);
  
    const { inserted, error } = await r.insert(urlInfo);
    if (error) {
      console.log(`error on uid ${uid}, code: ${error.code}, message: ${error.message}`)
    } else {
      console.log(`inserted: ${inserted.uid}`)
    }
  })

  response.status(201);
  response.send({
    type: "success",
    code: 201,
  });
}

class JsonImport {
  uid: string;
  link: string;
  title: string;
  shortUrl: string;
  tags: string[];
  deletedAt: { '$date': string }
}

/**{
  "_id": {
    "$oid": "644723028c083251c97295a3"
  },
  "uid": "OvMqh",
  "link": "https://nuphy.com?sca_ref=3367632.Zer4Ym7uOa",
  "title": "Nuphy",
  "shortUrl": "https://i.tea2.one/OvMqh",
  "createdAt": {
    "$date": "2023-04-25T00:46:58.381Z"
  },
  "visits": [],
  "latestClick": null,
  "tags": [
    "nuphy_aff"
  ]
}, */