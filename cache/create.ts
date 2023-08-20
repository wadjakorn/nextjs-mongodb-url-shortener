import { RedisRepo } from "../repositories/url-info-repo";
import { UrlInfo } from "../types";

export async function createCache(urlInfo: UrlInfo): Promise<UrlInfo> {
  const c = new RedisRepo()
  console.log({ createCacheObj: urlInfo })
  const res = await c.insert(urlInfo)
  return res
}