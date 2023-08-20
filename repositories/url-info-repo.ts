import { Collection, Filter, ObjectId, UpdateFilter, UpdateResult } from "mongodb";
import { UrlInfo } from "../types";
import kv from '@vercel/kv';

export class Err { code?: number; message?: string; }

export interface Repository {
  getByUid(uid: string): Promise<UrlInfo | null>
  insert(urlInfo: UrlInfo): Promise<UrlInfo>
  validateCreate(input: { link: string, uid: string}): Promise<Err>
}

export class MongoRepo implements Repository {
  private coll: Collection<UrlInfo>
  constructor(c: Collection<UrlInfo>) {
    this.coll = c;
  }

  async getByUid(uid: string): Promise<UrlInfo | null> {
    const res = await this.coll.findOne({
      uid,
    });
    return res;
  }

  async insert(urlInfo: UrlInfo): Promise<UrlInfo> {
    const res = await this.coll.insertOne(urlInfo);
    if (res?.insertedId) {
      urlInfo._id = res.insertedId as ObjectId;
      return urlInfo;
    }
    throw new Error(`Failed to insert ${urlInfo.uid}`)
  }

  async validateCreate(input: { link: string; uid: string; }): Promise<Err> {
    const linkExists = await this.coll.findOne({
      link: input.link,
    });
    const uidExists = await this.coll.findOne({
      uid: input.uid,
    });

    if (linkExists) {
      return {
        code: 409,
        message: "Link already exists",
      };
    }
    if (uidExists) {
      return {
        code: 409,
        message: "UID already exists",
      };
    }

    return {};
  }

  async updateOne(input: { filter: Filter<UrlInfo>, updateObj: UpdateFilter<UrlInfo>}): Promise<void> {
    const { filter, updateObj } = input
    await this.coll.updateOne(
      filter,
      updateObj,
    )
  }
}

export class RedisRepo implements Repository {

  async getByUid(uid: string): Promise<UrlInfo | null> {
    const raw = await kv.get<string>(uid);
    const jsonRes = JSON.parse(decodeURI(raw))
    return jsonRes as UrlInfo;
  }

  async insert (urlInfo: UrlInfo): Promise<UrlInfo> {
    var val = JSON.stringify(urlInfo);
    val = encodeURI(val);
    // console.log({val})
    const result = await kv.set(urlInfo.uid, val);
    if (result === 'OK') {
      return urlInfo;
    }
    throw new Error(`Failed to insert ${urlInfo.uid}`)
  }

  async validateCreate(input: { link: string; uid: string; }): Promise<Err> {
    const raw = await kv.get<string>(input.uid);
    const resJson = JSON.parse(decodeURI(raw))
    console.log({ resJson })

    // if (linkExists) {
    //   return {
    //     code: 409,
    //     message: "Link already exists",
    //   };
    // }
    if (resJson?.uid) {
      return {
        code: 409,
        message: "UID already exists",
      };
    }
    return {};
  }
}