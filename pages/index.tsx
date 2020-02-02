import { CSSProperties } from 'react'
import { NextPage } from 'next'

const env = {
  ANONYMOUSLACK_API_BASE_URL: process.env.ANONYMOUSLACK_API_BASE_URL,
  GIT_REVISION: process.env.GIT_REVISION || 'maybe-local-dev-server',
}

const styleGreenLight: CSSProperties = {
  backgroundColor: '#2fff2f',
  display: 'inline-block',
  width: 25,
  height: 25,
  borderRadius: '50%',
  marginRight: 10,
}

const Index: NextPage = () => (
  <>
    <div style={{fontSize: 40}}>
      <span style={styleGreenLight}/>
      <span>Anonymouslack server in on!!</span>
    </div>
    <div style={{height: 20}}/>
    <div style={{fontSize: 20}}>publicRuntimeConfig:</div>
    <div style={{height: 10}}/>
    <pre>
      { JSON.stringify(env, null, 2) }
    </pre>
  </>
)

Index.getInitialProps = async () => {
  return {}
}

export default Index
