import { useState, FC, Dispatch, SetStateAction } from 'react'
import to from 'await-to-js'

import { createStyles, makeStyles, Theme, withStyles } from '@material-ui/core/styles'
import BottomNavigation from '@material-ui/core/BottomNavigation'
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction'
import IconAdd from '@material-ui/icons/Add'
import IconInfo from '@material-ui/icons/Info'
import IconComment from '@material-ui/icons/Comment'
import Typography from '@material-ui/core/Typography'
import Container from '@material-ui/core/Container'
import Avatar from '@material-ui/core/Avatar'
import { deepOrange, green, purple } from '@material-ui/core/colors'
import IconMood from '@material-ui/icons/Mood'
import InputLabel from '@material-ui/core/InputLabel'
import MenuItem from '@material-ui/core/MenuItem'
import FormControl from '@material-ui/core/FormControl'
import Select from '@material-ui/core/Select'
import TextField from '@material-ui/core/TextField'
import Button from '@material-ui/core/Button'
import { SvgIconProps } from '@material-ui/core/SvgIcon'

import { STR_DIALOG_VOICE_PLACEHOLDER, STR_PLACEHOLDER_CONTENT_FOR_REPLY } from '@anonymouslack/universal/dist/models/strings.model'
import { isParamNewVoiceFromWeb, IParamNewVoiceFromWeb } from '@anonymouslack/universal/dist/types/type-voice'
import { isParamNewReplyFromWeb, IParamNewReplyFromWeb } from '@anonymouslack/universal/dist/types/type-reply'
import { IFaceImoji } from '@anonymouslack/universal/dist/types/type-common'
import { axiosInstance } from '../core/web'
import { getRawPassword } from '../utils/common.util'

const postVoice = async (paramNewVoiceFromWeb: IParamNewVoiceFromWeb, webAccessToken: string) => {
  if (!isParamNewVoiceFromWeb(paramNewVoiceFromWeb)) {
    throw new Error('NOT_ALLOW_EMPTY_FIELDS')
  }

  const data = { paramNewVoiceFromWeb, webAccessToken }
  const [err, res] = await to(axiosInstance.post('/voice', data))
  if (err) throw err

  alert("슬랙 채널에 익명 메시지를 작성하였습니다.")
}

const postReply = async (paramNewReplyFromWeb: IParamNewReplyFromWeb, webAccessToken: string) => {
  if (!isParamNewReplyFromWeb(paramNewReplyFromWeb)) {
    throw new Error('NOT_ALLOW_EMPTY_FIELDS')
  }

  const data = { paramNewReplyFromWeb, webAccessToken }
  const [err, res] = await to(axiosInstance.post('/reply', data))
  if (err) throw err

  alert("익명 댓글을 작성하였습니다.")
}


const ColorButton = withStyles((theme: Theme) => ({
  root: {
    color: theme.palette.getContrastText(purple[500]),
    backgroundColor: '#007a5a',
    '&:hover': {
      backgroundColor: '#00aa8a',
    },
  },
}))(Button)

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    textField: {
      // marginLeft: theme.spacing(1),
      // marginRight: theme.spacing(1),
      width: 200,
    },
    textFieldMessageId: {
      marginTop: 0,
      marginBottom: 0,
    },

    square: {
      color: theme.palette.getContrastText(deepOrange[500]),
      backgroundColor: deepOrange[500],
    },
    rounded: {
      color: '#fff',
      backgroundColor: green[500],
    },

    formControl: {
      // margin: theme.spacing(1),
      minWidth: 120,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  }),
)



const style = { backgroundColor: '#cfe8fc', padding: 20, }
const inputLabelStyle = { fontSize: 20, fontWeight: 700, color: 'black' }
const inputStyle = { marginTop: 20 }

type TTabId = 'TAB_NEW_MSG' | 'TAB_REPLY' | 'TAB_INFO'
interface ITabObj {
  id: TTabId
  label: string
  Icon: React.ComponentType<SvgIconProps>
}
const tabList: ITabObj[] = [
  { id: 'TAB_NEW_MSG', label: '새 메시지', Icon: IconAdd },
  { id: 'TAB_REPLY', label: '댓글', Icon: IconComment },
  { id: 'TAB_INFO', label: '정보', Icon: IconInfo },
]

interface IButtonNaviProps {
  tabIdx: number
  setTabIdx: Dispatch<SetStateAction<number>>
}
const ButtonNavi: FC<IButtonNaviProps> = (props) => {
  const {tabIdx, setTabIdx} = props
  return (
    <BottomNavigation
      value={tabIdx}
      onChange={(_, newValue) => setTabIdx(newValue)}
      showLabels
      style={{backgroundColor: '#cfe8fc', marginBottom: 2 }}
    >
      {tabList.map(o =>
        <BottomNavigationAction key={o.id} label={o.label} icon={<o.Icon/>} />
      )}
    </BottomNavigation>
  )
}

export interface IPropsMainForm {
  faceImojiList: IFaceImoji[]
  channelId: string
  channelName: string
  webAccessToken: string
}
const MainForm: FC<IPropsMainForm> = (props) => {
  const { faceImojiList, webAccessToken, channelName, channelId } = props
  const modifiedChannelName = (channelName && channelName !== 'privategroup')
    ? `#${channelName}` : `[${channelId}]`
  const classes = useStyles({})
  const [tabIdx, setTabIdx] = useState(0)
  const [threadTs, setThreadTs] = useState('')
  const [faceImoji, setFaceImoji] = useState(':grinning:')
  const [nickname, setNickname] = useState('')
  const [content, setContent] = useState('')
  const [rawPassword, setRawPassword] = useState(getRawPassword())
  const tabId = tabList[tabIdx].id

  const post = async () => {
    const p = { faceImoji, nickname, content, rawPassword }
    const [err] =
        tabId === 'TAB_NEW_MSG' ? await to<any,any>(postVoice(p, webAccessToken))
      : tabId === 'TAB_REPLY' ? await to<any,any>(postReply({ ...p, threadTs}, webAccessToken))
      : [new Error('UNKNOWN_TAB_ID')]

    if (err) {
      if (err?.message === 'NOT_ALLOW_EMPTY_FIELDS') {
        return alert('필드를 모두 채워주세요')
      }

      const errorMessage = ((err.response || {}).data || {}).errorMessage
      if (errorMessage) return alert(errorMessage)
      if (err.message) return alert(err.message)

      alert('알 수 없는 에러')
      return console.error(err)
    }

    setContent("")
    setRawPassword(getRawPassword())
  }

  if (tabId === 'TAB_INFO') {
    return (
      <>
        <Container maxWidth="sm">
          <ButtonNavi tabIdx={tabIdx} setTabIdx={setTabIdx}/>
          <Typography component="div" style={style}>
            <div>- Anonymouslack is an Slack app that enables anonymous communication in Slack.</div>
            <div>- Anonymouslack is OpenSource</div>
          </Typography>
        </Container>
      </>
    )
  }

  return (
    <>
      <Container maxWidth="sm">
        <ButtonNavi tabIdx={tabIdx} setTabIdx={setTabIdx}/>

        <Typography component="div" style={style}>
          <div style={{display: 'flex'}}>
            <Avatar className={classes.rounded} component={IconMood}/>
            <div style={{fontSize: 24, marginLeft: 20}}>Anonymouslack</div>
          </div>
          <div style={{marginTop: 10, fontSize: 18, minHeight: 60, wordBreak: 'keep-all' }}>
            { tabId === 'TAB_NEW_MSG' && <span><b>{modifiedChannelName}</b> 채널에 새로운 익명 메시지를 작성합니다.</span>}

            { tabId === 'TAB_REPLY' && <span><b>{modifiedChannelName}</b> 채널의 </span>}
            { tabId === 'TAB_REPLY' &&
              <TextField
                label="MessageID"
                id="outlined-margin-dense"
                className={classes.textField}
                margin="dense"
                variant="outlined"
                value={threadTs}
                onChange={e => setThreadTs(e.target.value)}
                InputLabelProps={{style: {fontSize: 14, lineHeight: '8px' }}}
                InputProps={{ style: {fontSize: 12, height: 28 }}}
                style={{marginTop: 0, marginBottom: 0, width: 150 }}
              />
            }
            { tabId === 'TAB_REPLY' && <span> 메시지에 익명으로 댓글을 작성합니다.</span>}
          </div>

          <div style={{marginTop: 32}}>
            <FormControl fullWidth className={classes.formControl}>
              <InputLabel style={inputLabelStyle} shrink id="demo-simple-select-placeholder-label-label">
                프로필 이미지
              </InputLabel>
              <div style={{height:6}}/>
              <Select
                id="demo-simple-select-placeholder-label"
                value={faceImoji}
                onChange={(e) => setFaceImoji(e.target.value as string)}
                displayEmpty
                className={classes.selectEmpty}
              >
                {faceImojiList.map(o =>
                  <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
                )}
              </Select>
            </FormControl>
          </div>

          <TextField
            id="standard-full-width"
            label="닉네임"
            placeholder="아기상어"
            fullWidth
            margin="normal"
            value={nickname}
            onChange={e => setNickname(e.target.value)}
            InputLabelProps={{ shrink: true, style: inputLabelStyle }}
            InputProps={{ style: inputStyle }}
          />

          <div style={{ marginTop: 32 }}>
            <TextField
              id="standard-multiline-static"
              label="메시지"
              multiline
              rows="4"
              placeholder={tabId === 'TAB_NEW_MSG' ? STR_DIALOG_VOICE_PLACEHOLDER : STR_PLACEHOLDER_CONTENT_FOR_REPLY}
              fullWidth
              value={content}
              onChange={e => setContent(e.target.value)}
              InputLabelProps={{ shrink: true, style: inputLabelStyle }}
              InputProps={{ style: inputStyle }}
            />
          </div>

          <div style={{marginTop: 32}}>
            <TextField
              id="standard-full-width"
              label="패스워드"
              placeholder="password"
              fullWidth
              margin="normal"
              value={rawPassword}
              onChange={e => setRawPassword(e.target.value)}
              InputLabelProps={{ shrink: true, style: inputLabelStyle }}
              InputProps={{ style: inputStyle }}
              helperText="패스워드는 메시지 삭제시 필요합니다"
            />
          </div>
          <div style={{marginTop: 40, display: 'flex', flexDirection: 'row-reverse'}}>
            <ColorButton variant="contained" color="primary" onClick={post}>
              { tabId === 'TAB_NEW_MSG' ? "새 익명 메시지 작성" : "익명 댓글 작성" }
            </ColorButton>
          </div>

        </Typography>
      </Container>
      <style jsx>{`
        .container {
          padding: 32px;
        }
      `}</style>
    </>
  )
}

export default MainForm
