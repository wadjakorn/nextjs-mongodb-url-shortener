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
    visit: Visit;
    latestClick: Date;
    tags: string[];
    constructor(uid: string, link: string, title: string, shortUrl: string, createdAt: Date, tags: string[] = []) {
        this.uid = uid;
        this.link = link;
        this.title = title;
        this.shortUrl = shortUrl;
        this.createdAt = createdAt;
        this.visit = new Visit();
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
    setVisit(visit: Visit) {
        this.visit = visit;
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
    $set: {
        link?: string;
        title?: string;
        latestClick?: Date;
        visit?: Visit;
        tags?: string[];
    }
    getUpdateObj(): UpdateFilter<UrlInfo> {
        return {
            $set: this.$set,
        };
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
    setVisit(visit: Visit) {
        this.$set.visit = visit;
    }
    incVisitFrom(visitFrom: keyof Visit) {
        if (!this.$set.visit) {
            this.$set.visit = new Visit();
        }
        this.$set.visit[`${visitFrom}`] = (this._urlInfo.visit[`${visitFrom}`] ?? 0) + 1;
    }
    setTags(tags: string[]) {
        this.$set.tags = tags;
    }
}

export class Visit {
    yt: number;
    fb: number;
    tt: number;
    ig: number;
    unknown: number;
    constructor(yt: number = 0, fb: number = 0, tt: number = 0, ig: number = 0, unknown: number = 0) {
        this.yt = yt;
        this.fb = fb;
        this.tt = tt;
        this.ig = ig;
        this.unknown = unknown;
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