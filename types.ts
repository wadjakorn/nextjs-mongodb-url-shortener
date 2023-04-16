import { ObjectId } from "mongodb";

export enum COLLECTION_NAMES {
  "url-info" = "url-info",
}

export class UrlInfo {
    _id: ObjectId;
    uid: string;
    link: string;
    title: string;
    shortUrl: string;
    createdAt: Date;
    visit: Map<string, number>;
    constructor(uid: string, link: string, title: string, shortUrl: string, createdAt: Date) {
        this.uid = uid;
        this.link = link;
        this.title = title;
        this.shortUrl = shortUrl;
        this.createdAt = createdAt;
        this.visit = new Map<string, number>([
            ["yt", 0],
            ["fb", 0],
            ["tt", 0],
            ["ig", 0],
        ]);
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
    setVisit(visit: Map<string, number>) {
        this.visit = visit;
    }
}

export class UpdateUrlInfo {
    constructor() {
      this.$set = {};
    }
    $set: {
        link?: string;
        title?: string;
    }
    setLink(link: string) {
        this.$set.link = link;
    }
    setTitle(title: string) { 
        this.$set.title = title;
    }
}