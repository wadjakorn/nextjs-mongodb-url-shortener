import { Db, MongoClient } from "mongodb";
// import { formatLog } from "../utils";
 
let cachedDB: Db | null = null;
 
export async function connectToDatabase(): Promise<Db> {
  if (cachedDB) {
    // console.info(formatLog("Using cached client!"));
    return cachedDB;
  }
  const opts = {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // directConnection: true,
  };
  // console.info(formatLog("No client found! Creating a new one."));
  // If no connection is cached, create a new one
  const client = new MongoClient(process.env.MONGODB_URI as string, opts);
  await client.connect();
  const db: Db = client.db(process.env.DB_NAME);
  cachedDB = db;
  return cachedDB;
}