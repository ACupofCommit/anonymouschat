import { App } from '@slack/bolt'
import { ACTION_APP_FORCE_ACTIVATE, ACTION_APP_FORCE_DEACTIVATE, ACTION_APP_USE_AGREEMENT, ACTION_ON_MORE_OPEN_VIEW_REPLY, ACTION_OPEN_DIALOG_DELETE_REPLY, ACTION_OPEN_DIALOG_DELETE_USERREPLY, ACTION_OPEN_DIALOG_DELETE_VOICE, ACTION_OPEN_DIALOG_REPLY, ACTION_OPEN_DIALOG_VOICE, ACTION_OPEN_VIEW_DELETE, ACTION_SHOW_DEACTIVATE_WARNING, ACTION_SUBMISSION_DELETE, ACTION_SUBMISSION_INIT, ACTION_SUBMISSION_REPLY, ACTION_SUBMISSION_SAVE_CHANNEL_SETTINGS, ACTION_SUBMISSION_SELECT_CHANNEL_TO_SETTINGS, ACTION_SUBMISSION_VOICE, ACTION_VOTE_REPLY_DISLIKE, ACTION_VOTE_REPLY_LIKE, ACTION_VOTE_REPORT, ACTION_VOTE_VOICE_DISLIKE, ACTION_VOTE_VOICE_LIKE, SHORTCUT_CHANNEL_SETTINGS, SHORTCUT_START } from '@anonymouschat/universal/dist/models'
import { handleAgreeAction, handleForceAgreeAction, handleForceDeactivate, handleShortcut, handleShowDeactivateWarning, handleSubmitInit } from './handle-initialize'
import { handleSubmitNewVoice, handleOpenViewToNewReply, handleOpenViewToNewVoice as handleOpenViewToNewVoice, handleSubmitNewReply } from './handle-message'
import { handleLikeOrDislike, handleOpenViewToDelete, handleReport, handleSubmitDelete } from './handle-message-button'
import { setGroupAndMessages } from './middlewares'
import { handleShortcutChannelSettings, handleSubmitChannelSettings, handleSubmitSaveChannelSetting } from './handle-settings'

export const initialize = (boltApp: App) => {
  boltApp.use(setGroupAndMessages)

  // activation
  boltApp.shortcut(SHORTCUT_START, handleShortcut)
  boltApp.view(ACTION_SUBMISSION_INIT, handleSubmitInit)

  boltApp.shortcut(SHORTCUT_CHANNEL_SETTINGS, handleShortcutChannelSettings)
  boltApp.view(ACTION_SUBMISSION_SELECT_CHANNEL_TO_SETTINGS, handleSubmitChannelSettings)
  boltApp.view(ACTION_SUBMISSION_SAVE_CHANNEL_SETTINGS, handleSubmitSaveChannelSetting)

  boltApp.action(ACTION_APP_USE_AGREEMENT, handleAgreeAction)
  boltApp.action(ACTION_APP_FORCE_ACTIVATE, handleForceAgreeAction)

  boltApp.action(ACTION_SHOW_DEACTIVATE_WARNING, handleShowDeactivateWarning)
  boltApp.view(ACTION_APP_FORCE_DEACTIVATE, handleForceDeactivate)

  // message
  // TODO: deactivate되면 사용불가하도록
  boltApp.action(ACTION_OPEN_DIALOG_VOICE, handleOpenViewToNewVoice)
  boltApp.view(ACTION_SUBMISSION_VOICE, handleSubmitNewVoice)
  boltApp.action(ACTION_OPEN_DIALOG_REPLY, handleOpenViewToNewReply)
  boltApp.view(ACTION_SUBMISSION_REPLY, handleSubmitNewReply)
  boltApp.shortcut(ACTION_ON_MORE_OPEN_VIEW_REPLY, handleOpenViewToNewReply)

  // message button
  boltApp.action(ACTION_VOTE_VOICE_LIKE, handleLikeOrDislike)
  boltApp.action(ACTION_VOTE_VOICE_DISLIKE, handleLikeOrDislike)
  boltApp.action(ACTION_VOTE_REPLY_LIKE, handleLikeOrDislike)
  boltApp.action(ACTION_VOTE_REPLY_DISLIKE, handleLikeOrDislike)
  boltApp.action(ACTION_VOTE_REPORT, handleReport)

  // message button - delete
  boltApp.action(ACTION_OPEN_DIALOG_DELETE_VOICE, handleOpenViewToDelete) // legacy
  boltApp.action(ACTION_OPEN_DIALOG_DELETE_REPLY, handleOpenViewToDelete) // legacy
  boltApp.action(ACTION_OPEN_DIALOG_DELETE_USERREPLY, handleOpenViewToDelete) // legacy
  boltApp.action(ACTION_OPEN_VIEW_DELETE, handleOpenViewToDelete)
  boltApp.view(ACTION_SUBMISSION_DELETE, handleSubmitDelete)

  boltApp.action(/.*/, async (args) => {
    // Legacy
    const {action} = args
    const value = (action as any).value
    if (value === ACTION_APP_USE_AGREEMENT) {
      await handleAgreeAction(args)
    } else if (value === ACTION_APP_FORCE_ACTIVATE) {
      await handleForceAgreeAction(args)
    } else if (value === ACTION_OPEN_DIALOG_VOICE) {
      await handleOpenViewToNewVoice(args)
    } else if (value === ACTION_SHOW_DEACTIVATE_WARNING) {
      await handleShowDeactivateWarning(args)
    }
  })

  boltApp.error(async (err) => {
    // Check the details of the error to handle cases where you should retry sending a message or stop the app
    console.error('Unknown error catch:')
    console.error(err)
    console.error('JSON.strinfity(err)')
    console.error(JSON.stringify(err))
  })
}

