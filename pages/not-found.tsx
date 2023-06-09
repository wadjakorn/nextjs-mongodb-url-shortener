import Head from 'next/head'
import styles from '../styles/Home.module.css'


export default function Home() {
    return (
      <div className={styles.container}>
        <Head>
          <title>404 not found</title>
          <meta name="description" content="Generated by create next app" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
  
        <main className={styles.main}>
          <h1 className={styles.title}>
          404 not found
          </h1>
        </main>
      </div>
    )
  }