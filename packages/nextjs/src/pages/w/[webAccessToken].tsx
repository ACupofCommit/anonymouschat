import React from 'react'
import { NextPage } from 'next'
import Head from 'next/head'
import to from 'await-to-js'
import CssBaseline from '@material-ui/core/CssBaseline'

import {getFaceImojiList} from '@anonymouslack/universal/dist/utils/common.util'
import MainForm, { IPropsMainForm } from '../../components/MainForm'
import { axiosInstance } from '../../core/web'
import { isNotEmptyString } from '../../utils/common.util'

interface IPropsHome extends IPropsMainForm {
}
const Home: NextPage<IPropsHome> = (p) => (
  <div>
    <Head>
      <title>Anonymouslack</title>
      <link rel='icon' href='/favicon.ico' />
    </Head>

    <CssBaseline />
    <div className='hero'>
      <h1 className='title'>Anonymouslack</h1>
      <MainForm
        faceImojiList={p.faceImojiList}
        channelId={p.channelId}
        channelName={p.channelName}
        webAccessToken={p.webAccessToken}
      />
    </div>

    <style jsx>{`
      .hero {
        margin-top: 10px;
        width: 100%;
        color: #333;
      }
      .title {
        width: 100%;
        line-height: 1.15;
        font-size: 36px;
        font-family: "Roboto", "Helvetica", "Arial", sans-serif;
        margin: 0;
        margin-bottom: 18px;
        color: gray;
      }
      .title,
      .description {
        text-align: center;
      }
    `}</style>
  </div>
)

Home.getInitialProps = async (ctx) => {
  // const res = await fetch('https://api.github.com/repos/zeit/next.js')
  // const json = await res.json()
  const { query } = ctx
  const webAccessToken = isNotEmptyString(query.webAccessToken) ? query.webAccessToken : 'wrong-at'
  const headers = { Authorization: `Bearer ${webAccessToken}`}
  const [err, res] = await to(axiosInstance.get('/groups/byWebAccessToken', { headers }))
  if (err || res?.data?.ok !== true) console.log('can not get channelName')

  return {
    // https://apps.timwhitlock.info/emoji/tables/unicode
    webAccessToken,
    channelId: res?.data?.channelId || '',
    channelName: res?.data?.channelName || '',
    faceImojiList: getFaceImojiList(),
  }
}

export default Home
