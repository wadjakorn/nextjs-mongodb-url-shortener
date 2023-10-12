import { RedisRepo } from "../repositories/url-info-repo";
import { UrlInfo } from "../types";

export async function createCache(urlInfo: UrlInfo): Promise<UrlInfo> {
  const c = new RedisRepo()
  urlInfo.visits = undefined;
  urlInfo.latestClick = undefined;
  console.log({ createCacheObj: urlInfo })
  const res = await c.insert(urlInfo);
  return res
}