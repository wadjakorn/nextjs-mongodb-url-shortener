import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";

export function formatLog(val: string) {
  const separator = "=".repeat(20);
  const padding = " ".repeat(10);
  return separator + padding + val + padding + separator;
}

export function copy(text: string) {
  navigator.clipboard.writeText(text)
}

export async function authenticateToken(
  request: NextApiRequest,
  response: NextApiResponse): Promise<number | null> {
  const auth = request.headers['authorization']
  const token = auth && auth.split(' ')[1]
  let res: number | null = 200

  if (token == null) {
      return 401
  }

  jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any, user: any) => {
      // console.log(err)

      if (err) {
          res = 403
      }
  })

  return res
}

export function generateAccessToken(username: string): string {
  const secret = process.env.TOKEN_SECRET as string;
  console.log({secret})
  return jwt.sign({ username }, secret, { expiresIn: '7d' });
}