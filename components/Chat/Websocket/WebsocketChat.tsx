import { useEffect } from 'react'
import io from 'socket.io-client'
import { parseCookies } from 'nookies'
import {
  NewChannelMessageProps,
  NewConversationMessageProps,
} from '@/types/chat'

export interface WebsocketI {
  workspaceId: string
  handleNewChannelMessage(message: NewChannelMessageProps): void
  handleNewConversationMessage(message: NewConversationMessageProps): void
  handleNewOrderPixPaidMessage?(message: any): void
}

const WebsocketComponent = ({
  workspaceId,
  handleNewChannelMessage,
  handleNewConversationMessage,
  handleNewOrderPixPaidMessage,
}: WebsocketI) => {
  useEffect(() => {
    if (workspaceId) {
      console.log('trying connect with websocket')

      const { userSessionToken } = parseCookies()

      const socket = io('https://api.accelar.io', {
        query: {
          workspaceId,
        },
        extraHeaders: {
          'X-Parse-Session-Token': userSessionToken,
        },
      })

      socket.on('connect', () => {
        console.log('Conectado ao WebSocket')
      })

      socket.on('personalMessage', (message) => {
        console.log('Mensagem pessoal recebida:', message)
        handleNewConversationMessage(message)
      })

      socket.on('channelMessage', (message) => {
        console.log('Mensagem do canal recebida:', message)
        handleNewChannelMessage(message)
      })

      socket.on('orderPixPaid', (message) => {
        console.log('Mensagem orderPixPaid recebida:', message)
        handleNewOrderPixPaidMessage(message)
      })

      socket.on('disconnect', () => {
        console.log('Desconectado do WebSocket')
      })

      return () => {
        socket.off('personalMessage')
        socket.off('channelMessage')
        socket.disconnect()
      }
    }
  }, [workspaceId])

  return <></>
}

export default WebsocketComponent
