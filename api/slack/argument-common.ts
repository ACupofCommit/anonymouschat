

export const isReplyByTsThreadTs = (ts: string, threadTs?: string) => {
  // reply 인지 voice 인지 ts, threadTs로 구분
  // true 이면 reply, false 이면 voice
  return threadTs && ts !== threadTs
}
