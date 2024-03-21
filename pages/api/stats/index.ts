import { NextApiRequest, NextApiResponse } from "next";
import { RedisStats, UpdateUrlInfo, UrlInfo, Visit } from "../../../types";
import { MongoRepo, RedisRepo } from "../../../repositories/url-info-repo";
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
        const repo = new MongoRepo()
        repo.setColl(await urlInfColl())
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

export const updateStatsV2 = async function(uid: string, from: string): Promise<void> {
    try {
        const cacheRepo = new RedisRepo()
        // find existing
        const key = `stats:${uid}`;
        const raw = await cacheRepo.getRawByKey(key);
        let redisStats: RedisStats;
        if (raw) {
            redisStats = JSON.parse(decodeURI(raw)) as RedisStats;
        } else {
            redisStats =  new RedisStats(uid);
        }

        redisStats.last_click = new Date();

        if (from.startsWith('fb')) {
            redisStats.from_fb = redisStats.from_fb ? redisStats.from_fb + 1 : 1;
        } else if (from.startsWith('yt')) {
            redisStats.from_yt = redisStats.from_yt ? redisStats.from_yt + 1 : 1;
        } else if (from.startsWith('tt')) {
            redisStats.from_tt = redisStats.from_tt ? redisStats.from_tt + 1 : 1;
        } else if (from.startsWith('ig')) {
            redisStats.from_ig = redisStats.from_ig ? redisStats.from_ig + 1 : 1;
        } else if (from.startsWith('web')) {
            redisStats.from_web = redisStats.from_web ? redisStats.from_web + 1 : 1;
        } else {
            redisStats.from_unknown = redisStats.from_unknown ? redisStats.from_unknown + 1 : 1;
        }

        // upsert cache
        const val = encodeURI(JSON.stringify(redisStats));
        console.log({updateStatsV2: {key,val}});
        await cacheRepo.setRaw(key, val);
    } catch (e) {
        console.log(`failed to updateStatsV2 for ${uid}, error: ${e}`)
        return Promise.reject()
    }
}