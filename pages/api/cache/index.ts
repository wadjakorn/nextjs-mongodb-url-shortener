import { NextApiRequest, NextApiResponse } from "next";
import { createCache } from "../../../cache/create";
import { MongoRepo } from "../../../repositories/url-info-repo";
import { urlInfColl } from "../../../db/url-info-collection";

export default async function Cache(
  request: NextApiRequest,
  response: NextApiResponse
) {
    if (!["POST"].includes(request.method)) {
        response.status(405).json({
            type: "Error",
            code: 405,
            message: "Only POST method is accepted on this route",
        });
    } else {
        response.status(200).json({
            type: "Success",
            code: 202,
            message: "Cache creating requested",
        });
    }

    let urlInfo = JSON.parse(request.body)

    if (!urlInfo._id) {
        const repo = new MongoRepo()
        repo.setColl(await urlInfColl())
        urlInfo = await repo.getByUid(urlInfo.uid)
    }

    try {
        await createCache(urlInfo)
        console.log(`done caching ${urlInfo.uid}`)
    } catch (e) {
        console.log(`failed to cache ${urlInfo.uid}, error: ${e}`)
    }

    return;
}