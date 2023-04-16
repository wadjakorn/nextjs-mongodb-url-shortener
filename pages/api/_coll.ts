import { connectToDatabase } from "../../mongodb";
import { COLLECTION_NAMES, UrlInfo } from "../../types";

export async function urlInfColl() {
    const database = await connectToDatabase();
    return database.collection<UrlInfo>(COLLECTION_NAMES["url-info"]);
  }