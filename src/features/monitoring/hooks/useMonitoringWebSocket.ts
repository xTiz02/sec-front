import { useEffect, useRef } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { BASE_URL } from "@/routes/endpoints"
import type { LiveAssistanceEventDto } from "../api/monitoringModel"

const REFRESH_DEBOUNCE_MS = 10_000

/**
 * Connects to the STOMP/SockJS WebSocket and subscribes to /topic/assists.
 * - Each incoming event is passed to `onEvent` immediately (live feed).
 * - After 10s of silence, `onRefreshFlags` is called to re-fetch unit markers.
 */
export function useMonitoringWebSocket(
  onEvent: (event: LiveAssistanceEventDto) => void,
  onRefreshFlags: () => void,
) {
  // Keep latest callbacks in refs so the stable useEffect closure sees them
  const onEventRef = useRef(onEvent)
  const onRefreshFlagsRef = useRef(onRefreshFlags)
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => { onEventRef.current = onEvent }, [onEvent])
  useEffect(() => { onRefreshFlagsRef.current = onRefreshFlags }, [onRefreshFlags])

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(`${BASE_URL}/assistance-socket`),
      reconnectDelay: 5_000,
      onConnect: () => {
        client.subscribe("/topic/assists", message => {
          try {
            const event: LiveAssistanceEventDto = JSON.parse(message.body)
            // 1. Immediately update live feed
            onEventRef.current(event)
            // 2. Debounced map flag refresh (reset timer on each event)
            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
            refreshTimerRef.current = setTimeout(() => {
              onRefreshFlagsRef.current()
            }, REFRESH_DEBOUNCE_MS)
          } catch {
            // ignore malformed messages
          }
        })
      },
      onStompError: frame => {
        console.error("STOMP error:", frame.headers["message"])
      },
    })

    client.activate()

    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current)
      client.deactivate()
    }
  }, [])
}
