import { NextApiRequest, NextApiResponse } from "next";
import { authenticateToken } from "../../../utils";
import { runMiddleware, cors } from "../cors";
import sqlite3 from "sqlite3";

const DB_VER = process.env.DB_VER;

export default async function InitDB(
  request: NextApiRequest,
  response: NextApiResponse
) {

  await runMiddleware(request, response, cors)
  
  if (request.method !== "POST") {
    return response.status(405).json({
      type: "Error",
      code: 405,
      message: "Only POST method is accepted on this route",
    });
  }

  if ((request.headers["api-key"] as string) !== process.env.API_KEY) {
    const authResp = await authenticateToken(request, response)
    if (authResp !== 200) {
      return response.status(401).json({
        type: "Error",
        code: 401,
        message: "Unauthorized",
      });
    }
  }
 
  try {
    initDB();
    response.status(200);
    response.send({
        type: "success",
        code: 200,
        version: DB_VER,
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


export function initDB() {
    const db = new sqlite3.Database(
        "./urls.db",
        sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
        (err) => {
            // Error handling for connection
            if (err) {
                return console.error(err.message);
            } else {
                // Success message for successful connection
                console.log("Connected to the SQLite database.");
            }
        }
    );
    
    // Serialize runs to ensure sequential execution
    db.serialize(() => {
        // Run SQL command to create table if it doesn't exist
        db.run(
            `CREATE TABLE IF NOT EXISTS urls (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                  uid VARCHAR(255) NOT NULL,
                  data TEXT NOT NULL,
                  deleted_at TIMESTAMP
              )`,
            (err) => {
                // Error handling for table creation
                if (err) {
                    return console.error(err.message);
                }
                console.log("Created urls table");
            }
        );
    });
}

