import to from 'await-to-js'
import { ScheduledHandler } from 'aws-lambda'
import { AdminService } from './services/admin.service'

// 3분에 한번씩 이 함수가 호출된다면,
// 최대 팀당 3개씩 처리되니 하루 1440개 그룹을 커버 할 수 있음.
const NUMBER_OF_GROUPS_IN_A_TEAM_TO_RENEW_TOKEN_AT_ONCE = 3

// 3 일때, 2시간 내 만료될 토큰을 query해서 refresh 시킴.
// limit가 있어서 모든 토큰이 만료되지는 않음.
const REFRESH_TRESHOLD_HOURS = 3

export const index: ScheduledHandler = async (event) => {
  const service = new AdminService()

  // refreshAllTeam을 universal에서 이쪽 Service로 가져오자
  const [err, resultArr] = await to(service.refreshAllTeam(
    REFRESH_TRESHOLD_HOURS,
    NUMBER_OF_GROUPS_IN_A_TEAM_TO_RENEW_TOKEN_AT_ONCE
  ))

  if (err) {
    console.log('error occurs:')
    console.log(err)
  }

  console.log(JSON.stringify(resultArr))
}
