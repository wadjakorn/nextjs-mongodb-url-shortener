import { NextApiRequest, NextApiResponse } from "next";
import { UpdateInput } from "../../../types";
import { chooseDB } from "../../../repositories/url-info-repo";

export async function updateLink(
  request: NextApiRequest,
  response: NextApiResponse
) {
  const uid = request.query.uid as string;
  const input = request.body as UpdateInput;
  if (!uid) {
    response.status(400).send({
      type: "Error",
      code: 400,
      message: "Expected {uid: string}",
    });
    return;
  }
  try {
    const r = await chooseDB();
    const { updated, error } = await r.update(uid, input);
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
    response.status(201);
    response.send({
      type: "success",
      code: 201,
      data: {
        shortUrl: updated.shortUrl,
        link: updated.link,
        title: updated.title,
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