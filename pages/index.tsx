import getConfig from 'next/config'
import { CSSProperties } from 'react'
import { NextPage } from 'next'
const { publicRuntimeConfig } = getConfig()

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
      { JSON.stringify(publicRuntimeConfig, null, 2) }
    </pre>
  </>
)

Index.getInitialProps = async () => {
  return {}
}

export default Index
