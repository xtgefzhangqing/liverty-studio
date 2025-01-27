import { useCallback, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTimer } from './useTimer'
import { RootState } from '../domains'
import {
  BroadcastState,
  finishStreaming as _finishStreaming,
  setStream as _setStream,
  startStreaming as _startStreaming
} from '../domains/broadcast'
import { sendStreamKey, startServer, terminateServer } from '../ipc'

const formatTime = (hours: number, minutes: number, seconds: number) =>
  [hours, minutes, seconds].map(time => ('0' + time).slice(-2)).join(':')

export const useBroadcast = () => {
  const dispatch = useDispatch()
  const mediaRecoder = useRef<MediaRecorder | null>(null)
  const ws = useRef<WebSocket | null>(null)

  const isStreaming = useSelector<RootState, BroadcastState['isStreaming']>(
    ({ broadcast }) => broadcast.isStreaming
  )

  const stream = useSelector<RootState, BroadcastState['stream']>(
    ({ broadcast }) => broadcast.stream
  )

  const { time } = useTimer(isStreaming)

  const broadcastTime = useMemo(() => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor(time / 60)
    const seconds = time - hours * 3600 - minutes * 60
    return formatTime(hours, minutes, seconds)
  }, [time])

  const startStreaming = useCallback(
    async (streamKey: string) => {
      if (!stream) return
      dispatch(_startStreaming())
      sendStreamKey(streamKey)
      await startServer()
      ws.current = new WebSocket('ws://127.0.0.1:3000')

      ws.current.addEventListener('open', event => {
        console.log('WebSocket open', event)

        mediaRecoder.current = new MediaRecorder(stream, {
          mimeType: 'video/webm',
          audioBitsPerSecond: 128000,
          videoBitsPerSecond: 4096000
        })

        mediaRecoder.current.addEventListener('dataavailable', event => {
          if (!ws.current) return
          ws.current.send((event as BlobEvent).data)
        })

        mediaRecoder.current.addEventListener('stop', () => {
          if (!ws.current) return
          ws.current.close()
        })

        mediaRecoder.current.start(1000)
      })

      ws.current.addEventListener('close', event => {
        console.log('WebSocket close', event)
        if (mediaRecoder.current) {
          mediaRecoder.current.stop()
        }
      })
    },
    [dispatch, stream]
  )

  const finishStreaming = useCallback(async () => {
    ws.current?.close()
    await terminateServer()
    dispatch(_finishStreaming())
  }, [dispatch])

  const setStream = useCallback(
    (stream: MediaStream) => {
      dispatch(_setStream(stream))
    },
    [dispatch]
  )

  return {
    isStreaming,
    broadcastTime,
    finishStreaming,
    setStream,
    startStreaming
  }
}
