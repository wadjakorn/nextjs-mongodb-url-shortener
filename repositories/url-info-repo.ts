import { Collection, Filter, ObjectId, UpdateFilter, WithId } from "mongodb";
import { DeleteRes, InsertRes, ListQuery, ListRes, RedisStats, UpdateInput, UpdateRes, UpdateUrlInfo, UrlInfo } from "../types";
import { kv } from '@vercel/kv';
import sqlite3 from "sqlite3";
import { open as sqliteopen, Database as SqliteDatabase } from "sqlite";
import { urlInfColl } from "../db/url-info-collection";
import urlsJson from '../db/json/urls.json';

export class Err { code?: number; message?: string; }

export interface Repository {
  list(query: ListQuery): Promise<ListRes>
  getByUid(uid: string): Promise<UrlInfo | null>
  insert(urlInfo: UrlInfo): Promise<InsertRes>
  validateCreate(input: { link: string, uid: string}): Promise<Err>
  update(uid: string, body: UpdateInput): Promise<UpdateRes>
  delete(uid: string): Promise<DeleteRes>
}

export async function chooseDB(): Promise<Repository> {
  var r: Repository
  if (process.env.DB_VER === 'sqlite') {
    // sqlite
    console.log('is sqlite')
    r = await getSqliteRepo()
  } else if (process.env.DB_VER === 'json') {
    // sqlite
    console.log('is json')
    r = new JsonRepo()
  } else {
    // mongo
    console.log('is mongo')
    r = await getMongoRepo()
  }
  return r;
}

export function getRedisRepo(): RedisRepo {
  return new RedisRepo()
}

export async function getMongoRepo(): Promise<MongoRepo> {
  return new MongoRepo().setColl(await urlInfColl())
}

export async function getSqliteRepo(): Promise<SqliteRepo> {
  const sqlitedb = await sqliteopen({
    filename: "./urls.db",
    driver: sqlite3.Database,
  });
  return new SqliteRepo(sqlitedb)
}

export class MongoRepo implements Repository {
  private coll: Collection<UrlInfo>

  setColl(c: Collection<UrlInfo>): MongoRepo {
    this.coll = c;
    return this
  }

  async getByUid(uid: string, deleted: boolean = false): Promise<UrlInfo | null> {
    const filter: Filter<UrlInfo> = { uid }
    if (deleted) {
      filter.deletedAt = { $exists: false }
    }
    const res = await this.coll.findOne(filter);
    return res;
  }

  async insert(urlInfo: UrlInfo): Promise<InsertRes> {
    const err = await this.validateCreate({ link: urlInfo.link, uid: urlInfo.uid })
    if (err) {
      return {
        inserted: null,
        error: {
          code: err.code,
          message: err.message,
        }
      }
    }
    const res = await this.coll.insertOne(urlInfo);
    if (res?.insertedId) {
      urlInfo._id = res.insertedId as ObjectId;
      return {
        inserted: urlInfo,
        error: null
      };
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

    return null;
  }

  async updateOne(input: { filter: Filter<UrlInfo>, updateObj: UpdateFilter<UrlInfo>}): Promise<void> {
    const { filter, updateObj } = input
    await this.coll.updateOne(
      filter,
      updateObj,
    )
  }

  pushOr(filter: Filter<UrlInfo>, ...items: Filter<WithId<UrlInfo>>[]): Filter<UrlInfo> {
    if (!filter.$or) {
      filter.$or = []
    }
    filter.$or.push(...items)
    return filter
  }

  async list(query: ListQuery): Promise<ListRes> {
    const filter: Filter<UrlInfo> = { deletedAt: { $exists: false } }
    if (query.search && query.searchRules) {
      query.searchRules.split(",").forEach((key: string) => {
        switch (key) {
          case "title":
            this.pushOr(filter, { title: { $regex: query.search, $options: "i" }})
            break;
          case "uid":
            this.pushOr(filter, { uid: query.search })
            break;
          case "tags":
            this.pushOr(filter, { tags: query.search })
            break;
        }
      })
    }
 
    let prepareFind = this.coll.find(filter);
    let prepareCount = this.coll.countDocuments(filter);

    if (query.sortDir && query.sortBy) {
      const sortDirection = query.sortDir === 'desc' ? -1 : 1
      prepareFind = prepareFind.sort({
        [`${query.sortBy}`]: sortDirection
      });
    } else {
      prepareFind = prepareFind.sort({ createdAt: -1 });
    }

    const list = await prepareFind.skip(query.skip).limit(query.limit).toArray();
    const count = await prepareCount;

    return {
      list,
      count,
    }
  }

  async update(uid: string, body: UpdateInput): Promise<UpdateRes> {
    const linkExists = await this.getByUid(uid);
    if (!linkExists) {
      return {
        updated: null,
        error: {
          code: 404,
          message: 'not found uid'
        }
      }
    }
    const { title, link, tags } = body;
    const updateObj = new UpdateUrlInfo(linkExists);
    updateObj.setLatestClick(new Date());
    if (link && link !== linkExists.link) {
      updateObj.setLink(link);
    }
    if (title && title !== linkExists.title) {
      updateObj.setTitle(title);
    }
    if (tags && tags !== linkExists.tags) {
      updateObj.setTags(tags);
    }
    console.info({updateObj});
    await this.coll.updateOne({
      uid,
    }, {...updateObj.getUpdateObj()});
    return {
      updated: await this.getByUid(uid),
    }
  }

  async delete(uid: string): Promise<DeleteRes> {
    const linkExists = await this.getByUid(uid);
    if (!linkExists) {
      return {
        deleted: null,
        error: {
          code: 404,
          message: 'not found uid'
        }
      }
    }

    const updateObj: UpdateFilter<UrlInfo> = {
      $set: {
        deletedAt: new Date(),
      },
    }
    // console.info({updateObj});
    await this.coll.updateOne({
      uid,
    }, updateObj);
    return {
      deleted: await this.getByUid(uid, true),
    }
  }
}

export class RedisRepo implements Repository {

  async getRawByKey(key: string): Promise<string | null> {
    return kv.get<string>(key);
  }

  async setRaw(key: string, val: string): Promise<string> {
    return kv.set(key, val);
  }

  async getStats(uid: string): Promise<RedisStats> {
    const key = `stats:${uid}`;
    const raw = await this.getRawByKey(key);
    let redisStats: RedisStats;
    if (raw) {
        redisStats = JSON.parse(decodeURI(raw)) as RedisStats;
    } else {
        redisStats =  new RedisStats(uid);
    }
    return redisStats
  }

  async getByUid(uid: string): Promise<UrlInfo | null> {
    const raw = await kv.get<string>(uid);
    if (raw) {
      return (JSON.parse(decodeURI(raw))) as UrlInfo;
    }
    return null;
  }

  async insert (urlInfo: UrlInfo): Promise<InsertRes> {
    const err = await this.validateCreate({ link: urlInfo.link, uid: urlInfo.uid })
    if (err) {
      return {
        inserted: null,
        error: {
          code: err.code,
          message: err.message,
        }
      }
    }
    var val = JSON.stringify(urlInfo);
    val = encodeURI(val);
    const result = await kv.set(urlInfo.uid, val);
    if (result === 'OK') {
      return {
        inserted: urlInfo,
        error: null
      };
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
    return null;
  }

  async list(query: ListQuery): Promise<ListRes> {
    return { list: [], count: 0 }
  }

  async update(uid: string, body: UpdateInput): Promise<UpdateRes> {
    return {
      updated: null,
      error: {
        code: 500,
        message: 'not implmented',
      }
    };
  }

  async delete(uid: string): Promise<DeleteRes> {
    return {
      deleted: null,
      error: {
        code: 500,
        message: 'not implmented',
      }
    };
  }
}

export class SqliteRepo implements Repository {
  private db: SqliteDatabase = null;
  constructor(db: SqliteDatabase) {
    this.db = db;
  }
  async getByUid(uid: string, deleted: boolean = false): Promise<UrlInfo | null> {
    const args = [uid]
    let sql = `SELECT * FROM urls WHERE uid=? AND deleted_at IS NULL`
    if (deleted) {
      sql = `SELECT * FROM urls WHERE uid=? AND deleted_at IS NOT NULL`
    }
    const got = await this.db.all(sql, ...args);
    if (got?.length > 0) {
      console.log({ got })
      const each = got[0]
      const { id, deleted_at, data } = each;
      const jsonData = JSON.parse(data);
      return { ...jsonData, uid} as UrlInfo;
    }
    return {} as UrlInfo;
  }
  async insert(urlInfo: UrlInfo): Promise<InsertRes> {
    const err = await this.validateCreate({ link: urlInfo.link, uid: urlInfo.uid })
    if (err) {
      return {
        inserted: null,
        error: {
          code: err.code,
          message: err.message,
        }
      }
    }
    const { uid, ...rest } = urlInfo;
    const data = JSON.stringify({
      ...rest,
    })

    console.log({uid, data})

    const res = await this.db.run(`INSERT INTO urls (uid,data) VALUES (?,?)`, uid, data);
    console.log(`res.lastID:${res?.lastID}`)
    if (res.lastID) {
      const inserted = await this.getByUid(urlInfo.uid);
      return {
        inserted,
      };
    }

    return {
      inserted: {} as UrlInfo,
      error: {
        code: 500,
        message: 'unknown error',
      }
    };
  }

  async validateCreate(input: { link: string, uid: string}): Promise<Err> {
    const { uid } = input;
    const indbs = await this.db.all("SELECT * FROM urls where uid=?", uid);
    if (indbs?.length > 0) {
      return {
        code: 409,
        message: "Link or UID already exists",
      };
    }

    return null;
  }

  async list(query: ListQuery): Promise<ListRes> {
    const where = `WHERE deleted_at IS NULL`
    const { count } = await this.db.get(`SELECT COUNT(*) as count FROM urls ${where}`)
    const urlsRes = await this.db.all(`SELECT * FROM urls ${where} ORDER BY id DESC LIMIT ? OFFSET ?`, query.limit, query.skip);
    const list = urlsRes.map(each => {
      const {uid, data } = each;
      const jsonData = JSON.parse(data);
      return { ...jsonData, uid} as UrlInfo;
    })
    return { list, count }
  }

  async update(inputUid: string, body: UpdateInput): Promise<UpdateRes> {
    const exists = await this.getByUid(inputUid);
    if (!exists) {
      return {
        updated: null,
        error: {
          code: 404,
          message: 'not found uid',
        }
      }
    }
    const { _id, uid, ...rest } = exists;
    const updateObj: UrlInfo = {
      ...rest,
    } as UrlInfo
    if (body.tags) {
      updateObj.tags = body.tags;
    }
    if (body.title) {
      updateObj.title = body.title;
    }
    if (body.link) {
      updateObj.link = body.link;
    }
    const jsonStrData = JSON.stringify(updateObj)
    const res = await this.db.run(`UPDATE urls SET data=? WHERE uid=?`, jsonStrData, inputUid);
    if (res.changes > 0) {
      return {
        updated: await this.getByUid(inputUid),
      }
    }
    return {
      updated: null,
      error: {
        code: 500,
        message: 'unknown error',
      }
    };
  }

  async delete(uid: string): Promise<DeleteRes> {
    const exists = await this.getByUid(uid);
    if (!exists) {
      return {
        deleted: null,
        error: {
          code: 404,
          message: 'not found uid',
        }
      }
    }
    // date('now')
    const res = await this.db.run(`UPDATE urls SET deleted_at=datetime() WHERE uid=?`, uid);
    if (res.changes > 0) {
      return {
        deleted: await this.getByUid(uid, true),
      }
    }
    return {
      deleted: null,
      error: {
        code: 500,
        message: 'unknown error',
      }
    };
  }
}

export class JsonRepo implements Repository {
  async readDB(): Promise<UrlInfo[]> {
    const data: { urls: UrlInfo[] } = (urlsJson as unknown) as { urls: UrlInfo[] };
    return data.urls
  }
  async list(query: ListQuery): Promise<ListRes> {
    let res: UrlInfo[] = await this.readDB();
    if (query.search) {
      const finds = res.filter(each => {
        const t = each.title.includes(query.search);
        const tg = each.tags.includes(query.search)
        if (t || tg) {
          return true
        }
      })
      res = finds
    }
    return {
      list: res,
      count: res.length,
    }
  }
  async getByUid(uid: string): Promise<UrlInfo | null> {
    const urls = await this.readDB();
    const finds = urls.find(each => each.uid === uid)
    return finds ?? null
  }
  async insert(urlInfo: UrlInfo): Promise<InsertRes> {
    return null
  }
  async validateCreate(input: { link: string, uid: string}): Promise<Err> {
    return null
  }
  async update(uid: string, body: UpdateInput): Promise<UpdateRes> {
    return null
  }
  async delete(uid: string): Promise<DeleteRes> {
    return null
  }
}