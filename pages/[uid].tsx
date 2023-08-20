 import { NextApiRequest, NextApiResponse, NextPage } from "next";
import Head from "next/head";
import { UpdateUrlInfo, UrlInfo, Visit } from "../types";
import { urlInfColl } from "../db/url-info-collection";
import { RedisRepo } from "../repositories/url-info-repo";
 
export async function getServerSideProps(request: NextApiRequest, response: NextApiResponse) {
  const uid = request.query.uid as string
  const isTest = request.query.test as string

  // get cache
  let cache: UrlInfo
  try {
    cache = await (new RedisRepo()).getByUid(uid)
    if (cache) {
      console.log(`found cache: ${uid}`)
    } else {
      console.log(`no cache!!!: ${uid}`)
    }
  } catch (err) {
    console.log(`error while getting cache: ${err}`)
  }

  // if not found in cache, get from db
  let urlInfo: UrlInfo
  if (!cache) {
    const urlInfoCollection = await urlInfColl()
    urlInfo = await urlInfoCollection.findOne({ uid })
  }

  if (!urlInfo) {
    return {
      props: {},
    };
  }

  // if not found in cache, create cache
  if (!cache) {
    try {
      await fetch(`${process.env.HOST}/api/cache`, { method: 'POST', body: JSON.stringify(urlInfo)})
    } catch (err) {
      console.log(`error while caching: ${err}`)
    }
  }
  
  // if not test, update stats
  if (!isTest) {
    try {
      await fetch(`${process.env.HOST}/api/stats`, { method: 'POST', body: JSON.stringify(urlInfo)})
    } catch (err) {
      console.log(`error while caching: ${err}`)
    }
  }

  return {
    redirect: {
      destination: urlInfo.link,
      permanent: false,
    },
  };
}
 
const UIDPage: NextPage = () => {
  return (
    <div>
      <Head>
        <title>URL Shortener</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <h1>Requested link not found</h1>
    </div>
  );
};
 
export default UIDPage;