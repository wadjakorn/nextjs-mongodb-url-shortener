import { ObjectId, UpdateFilter } from "mongodb";

export enum COLLECTION_NAMES {
  "url-info" = "url-info",
}

export class RespData {
    type: string;
    code: number;
    data: UrlInfo;
}

export class RespDataList {
    type: string;
    code: number;
    totalLinks: number;
    data: UrlInfo[];
}

export class RespLogin {
    type: string;
    code: number;
    message: string;
    token: string;
}

export class CreateRespData {
    type: string;
    code: number;
    data: UrlInfo;
    message: string;
}

export class UpdateRespData {
    type: string;
    code: number;
    data: UrlInfo;
    message: string;
}

export class DeleteRespData {
    type: string;
    code: number;
    message: string;
}

export class StatsResp {
    type: string;
    code: number;
    data: RedisStats;
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
        // validate from values
        if (from.startsWith('fb')) {
            from = 'fb';
        } else if (from.startsWith('yt')) {
            from = 'yt';
        } else if (from.startsWith('tt')) {
            from = 'tt';
        } else if (from.startsWith('ig')) {
            from = 'ig';
        }

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
    allowsSorting: boolean;
    transform?: Function
}

export class RedisStats {
    uid: string;
    last_click: Date;
    from_fb: number = 0;
    from_yt: number = 0;
    from_tt: number = 0;
    from_ig: number = 0;
    from_web: number = 0;
    from_unknown: number = 0;

    constructor(uid: string) {
        this.uid = uid;
    }

    toRedisStats(r: any) {
        const s = new RedisStats(r.uid)
        s.last_click = r.last_click
        s.from_fb = r.from_fb
        s.from_ig = r.from_ig
        s.from_tt = r.from_tt
        s.from_yt = r.from_yt
        s.from_web = r.from_web
        s.from_unknown = r.from_unknown
        return s
    }

    toVisits(): Visit[] {
        const visits: Visit[] = []
        visits.push({ from: 'fb', count: this.from_fb })
        visits.push({ from: 'yt', count: this.from_yt })
        visits.push({ from: 'tt', count: this.from_tt })
        visits.push({ from: 'ig', count: this.from_ig })
        visits.push({ from: 'web', count: this.from_web })
        visits.push({ from: 'unknown', count: this.from_unknown })
        return visits
    }
}