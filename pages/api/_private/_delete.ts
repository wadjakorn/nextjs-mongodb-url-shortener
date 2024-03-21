import { NextApiRequest, NextApiResponse } from "next";
import { chooseDB } from "../../../repositories/url-info-repo";

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
    const r = await chooseDB();
    const { deleted, error } = await r.delete(uid);
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
    response.status(200);
    response.send({
      type: "success",
      code: 200,
      data: deleted,
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