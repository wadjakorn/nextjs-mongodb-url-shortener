import { NextApiRequest, NextApiResponse } from "next";
import { connectToDatabase } from "../../mongodb";
import { customAlphabet } from "nanoid";
import { COLLECTION_NAMES } from "../../types";
 
const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
const getHash = customAlphabet(characters, 4);
 
export default async function CreateLink(
  request: NextApiRequest,
  response: NextApiResponse
) {
  if ((request.headers["api-key"] as string) !== process.env.API_KEY) {
    return response.status(401).json({
      type: "Error",
      code: 401,
      message: "Unauthorized",
    });
  }
  if (!["POST", "PATCH"].includes(request.method)) {
    return response.status(405).json({
      type: "Error",
      code: 405,
      message: "Only POST/PATCH method is accepted on this route",
    });
  }
  switch (request.method) {
    case "POST":
      return create(request, response);
    case "PATCH":
      return update(request, response);
  }
  
}

async function create(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const { link, customHash, title } = request.body;
  if (!link) {
    response.status(400).send({
      type: "Error",
      code: 400,
      message: "Expected {link: string}",
    });
    return;
  }
  try {
    const database = await connectToDatabase();
    const urlInfoCollection = database.collection(COLLECTION_NAMES["url-info"]);
    const hash = customHash ?? getHash();
    const linkExists = await urlInfoCollection.findOne({
      "$or": [{ link }, { uid: hash }],
    });
    const shortUrl = `${process.env.HOST}/${hash}`;
    if (!linkExists) {
      await urlInfoCollection.insertOne({
        title,
        link,
        uid: hash,
        shortUrl: shortUrl,
        createdAt: new Date(),
      });
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

async function update(
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
    const database = await connectToDatabase();
    const urlInfoCollection = database.collection(COLLECTION_NAMES["url-info"]);
    const linkExists = await urlInfoCollection.findOne({
      uid: hash,
    });
    if (linkExists) {
      const updateObj = {
        "$set": {},
      }
      if (link) {
        updateObj["$set"]['link'] = link;
      }
      if (title) {
        updateObj["$set"]['title'] = title;
      }
      await urlInfoCollection.updateOne({
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