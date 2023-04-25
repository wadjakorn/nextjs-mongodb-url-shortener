import { NextApiRequest, NextApiResponse } from "next";
import { createLink } from "./_private/_create";
import csv from 'neat-csv'

class Result {
    // createdAt: '2023-01-11T13:52:52+00:00',
    // shortUrl: 'https://l.tea2.one/7MVAc',
    // longUrl: 'https://invol.co/cl5x3fh',
    // title: 'edifier g2000 search',
    // tags: 'shopee_involve,tsunami',
    // visits: '0'
    createdAt: string;
    shortUrl: string;
    longUrl: string;
    title: string;
    tags: string;
    visits: string;
}

class Input {
    link: string;
    title: string;
    customHash: string;
    tags: string[];
    customDomain: string;
}

export default async function Migrate(
    request: NextApiRequest,
    response: NextApiResponse
  ) {
    const fs = require('fs');
    const path = './pages/api/short_urls.csv'
    const raw = fs.readFileSync(path, 'utf8');

    const readCSV = async () => {
        const results: Result[] = await csv(raw, { });
        // console.log(results);
        results.map(async (result) => {
            console.log({ item: result });
            const hash = result.shortUrl.split('/').pop()
            const input: Input = {
                link: result.longUrl,
                title: result.title,
                customHash: hash,
                tags: result.tags.split(','),
                customDomain: 'https://i.tea2.one'
            }
            request.body = input
            try {
                await createLink(request, response)
            } catch (e) {
                console.log({
                    error: e,
                    item: result.title,
                    uid: hash
                })
            }
      });
    }

    readCSV();
}
