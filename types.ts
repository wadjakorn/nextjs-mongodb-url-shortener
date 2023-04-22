import { ObjectId, UpdateFilter } from "mongodb";

export enum COLLECTION_NAMES {
  "url-info" = "url-info",
}

export class RespData {
    type: string;
    code: number;
    totalLinks: number;
    data: UrlInfo[];
}

export class CreateRespData {
    type: string;
    code: number;
    data: UrlInfo;
}

export class DeleteRespData {
    type: string;
    code: number;
}

export class UrlInfo {
    _id: ObjectId;
    uid: string;
    link: string;
    title: string;
    shortUrl: string;
    createdAt: Date;
    visits: Visit[];
    latestClick: Date;
    tags: string[];
    constructor(uid: string, link: string, title: string, shortUrl: string, createdAt: Date, tags: string[] = []) {
        this.uid = uid;
        this.link = link;
        this.title = title;
        this.shortUrl = shortUrl;
        this.createdAt = createdAt;
        this.visits = [];
        this.latestClick = null;
        this.tags = tags;
    }
    setUid(uid: string) {
        this.uid = uid;
    }
    setLink(link: string) {
        this.link = link;
    }
    setTitle(title: string) {
        this.title = title;
    }
    setShortUrl(shortUrl: string) {
        this.shortUrl = shortUrl;
    }
    setCreatedAt(createdAt: Date) {
        this.createdAt = createdAt;
    }
    setLatestClick(latestClick: Date) {
        this.latestClick = latestClick;
    }
    setTags(tags: string[]) {
        this.tags = tags;
    }
}

export class UpdateUrlInfo {
    _urlInfo: UrlInfo;
    constructor(existsInfo: UrlInfo) {
        this._urlInfo = existsInfo;
        this.$set = {};
    }
    $set?: {
        link?: string;
        title?: string;
        latestClick?: Date;
        tags?: string[];
        visits?: Visit[];
    }
    $push?: {
        visits?: Visit;
    }
    $inc?: any
    getUpdateObj(): UpdateFilter<UrlInfo> {
        const filter: UpdateFilter<UrlInfo> = {};
        if (this.$set) {
            filter.$set = this.$set;
        }
        if (this.$push) {
            filter.$push = this.$push;
        }
        if (this.$inc) {
            filter.$inc = this.$inc;
        }
        return filter;
    }
    setLink(link: string) {
        this.$set.link = link;
    }
    setTitle(title: string) { 
        this.$set.title = title;
    }
    setLatestClick(latestClick: Date) {
        this.$set.latestClick = latestClick;
    }
    incVisit(from: string, count: number = 1) {
        const i = this._urlInfo.visits?.findIndex((v) => v.from === from);
        if (i >= 0) {
            this.$inc = {
                [`visits.${i}.count`]: count,
            };
        } else {
            this.$push = {
                visits: new Visit(from, count),
            };
        }
    }
    setTags(tags: string[]) {
        this.$set.tags = tags;
    }
}

export class Visit {
    from: string;
    count: number;
    constructor(from: string = null, count: number = 0) {
        this.from = from;
        this.count = count;
    }
}

export class CreateLinkInputs {
    link: string;
    title: string;
    tags: string[];
    customHash: string;
    constructor(link: string = null, title: string = null, tags: string[] = [], customHash: string = null) {
        this.link = link;
        this.title = title;
        this.tags = tags;
        this.customHash = customHash;
    }
}

export class Column {
    key: string;
    label: string;
}