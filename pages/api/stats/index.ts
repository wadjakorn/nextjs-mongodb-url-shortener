import { NextApiRequest, NextApiResponse } from "next";
import { UpdateUrlInfo, UrlInfo, Visit } from "../../../types";
import { MongoRepo } from "../../../repositories/url-info-repo";
import { urlInfColl } from "../../../db/url-info-collection";

export default async function Stats(
    request: NextApiRequest,
    response: NextApiResponse
  ) {
    if (!["POST"].includes(request.method)) {
        response.status(405).json({
            type: "Error",
            code: 405,
            message: "Only POST method is accepted on this route",
        });
    }

    const urlInfo = JSON.parse(request.body)
    const from = (request.query.from ?? "unknown") as keyof Visit

    try {
        await updateStats(urlInfo, from)
        return response.status(200).json({
            type: "Success",
            code: 202,
            message: "Stats creating requested",
        });
    } catch (e) {
        return response.status(405).json({
            type: "Error",
            code: 405,
            message: "Only POST method is accepted on this route",
        });
    }
}

export const updateStats = async function(urlInfo: UrlInfo, from: keyof Visit): Promise<void> {
    const updateObj = new UpdateUrlInfo(urlInfo)
    updateObj.setLatestClick(new Date())
    updateObj.incVisit(from)

    // TODO: save visit history

    try {
        const repo = new MongoRepo(await urlInfColl())
        await repo.updateOne(
            {
                filter: { uid: urlInfo.uid },
                updateObj: {...updateObj.getUpdateObj()},
            }
        )
        console.log(`done updating stats for ${urlInfo.uid}`)
        return Promise.resolve()
    } catch (e) {
        console.log(`failed to update stats for ${urlInfo.uid}, error: ${e}`)
        return Promise.reject()
    }
}