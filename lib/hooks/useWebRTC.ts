'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
const io = require('socket.io-client').default || require('socket.io-client')
type Socket = any

interface UseWebRTCOptions {
  roomId: string
  userId: string
  onAudioReceived?: (audio: ArrayBuffer) => void
  onUserJoined?: (userId: string) => void
  onUserLeft?: (userId: string) => void
}

export function useWebRTC({
  roomId,
  userId,
  onAudioReceived,
  onUserJoined,
  onUserLeft,
}: UseWebRTCOptions) {
  const [isConnected, setIsConnected] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [participants, setParticipants] = useState<string[]>([])
  
  const socketRef = useRef<Socket | null>(null)
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map())
  const localStreamRef = useRef<MediaStream | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)

  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ]

  const initializeSocket = useCallback(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
    })

    socket.on('connect', () => {
      console.log('Connected to signaling server')
      setIsConnected(true)
      socket.emit('join-room', { roomId, userId })
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from signaling server')
      setIsConnected(false)
    })

    socket.on('user-joined', async ({ userId: newUserId, socketId }: any) => {
      console.log(`User ${newUserId} joined`)
      setParticipants(prev => [...prev, newUserId])
      onUserJoined?.(newUserId)
      
      // Create offer for new participant
      const pc = createPeerConnection(socketId)
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      
      socket.emit('offer', { to: socketId, offer })
    })

    socket.on('user-left', ({ userId: leftUserId, socketId }: any) => {
      console.log(`User ${leftUserId} left`)
      setParticipants(prev => prev.filter(id => id !== leftUserId))
      onUserLeft?.(leftUserId)
      
      // Clean up peer connection
      const pc = peerConnectionsRef.current.get(socketId)
      if (pc) {
        pc.close()
        peerConnectionsRef.current.delete(socketId)
      }
    })

    socket.on('offer', async ({ from, offer }: any) => {
      const pc = createPeerConnection(from)
      await pc.setRemoteDescription(offer)
      const answer = await pc.createAnswer()
      await pc.setLocalDescription(answer)
      
      socket.emit('answer', { to: from, answer })
    })

    socket.on('answer', async ({ from, answer }: any) => {
      const pc = peerConnectionsRef.current.get(from)
      if (pc) {
        await pc.setRemoteDescription(answer)
      }
    })

    socket.on('ice-candidate', ({ from, candidate }: any) => {
      const pc = peerConnectionsRef.current.get(from)
      if (pc) {
        pc.addIceCandidate(new RTCIceCandidate(candidate))
      }
    })

    socket.on('audio-data', ({ from, audio, timestamp }: any) => {
      onAudioReceived?.(audio)
    })

    socketRef.current = socket
    return socket
  }, [roomId, userId, onAudioReceived, onUserJoined, onUserLeft])

  const createPeerConnection = useCallback((peerId: string) => {
    const pc = new RTCPeerConnection({ iceServers })

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          to: peerId,
          candidate: event.candidate,
        })
      }
    }

    pc.ontrack = (event) => {
      console.log('Received remote track', event.streams)
      // Handle incoming audio stream
      if (event.streams[0]) {
        const audio = new Audio()
        audio.srcObject = event.streams[0]
        audio.play()
      }
    }

    // Add local stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        if (localStreamRef.current) {
          pc.addTrack(track, localStreamRef.current)
        }
      })
    }

    peerConnectionsRef.current.set(peerId, pc)
    return pc
  }, [])

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      })

      localStreamRef.current = stream
      setIsRecording(true)

      // Set up audio processing
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1)

      processor.onaudioprocess = (e) => {
        if (!isRecording || !socketRef.current) return

        const inputData = e.inputBuffer.getChannelData(0)
        const buffer = new ArrayBuffer(inputData.length * 2)
        const view = new Int16Array(buffer)
        
        for (let i = 0; i < inputData.length; i++) {
          view[i] = Math.max(-32768, Math.min(32767, inputData[i] * 32768))
        }

        // Send audio data through WebSocket
        socketRef.current.emit('audio-data', {
          audio: buffer,
          timestamp: Date.now(),
        })
      }

      source.connect(processor)
      processor.connect(audioContextRef.current.destination)
      processorRef.current = processor

      // Notify server
      socketRef.current?.emit('ready')
    } catch (error) {
      console.error('Error starting recording:', error)
      setIsRecording(false)
    }
  }, [isRecording])

  const stopRecording = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop())
      localStreamRef.current = null
    }

    if (processorRef.current) {
      processorRef.current.disconnect()
      processorRef.current = null
    }

    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setIsRecording(false)
  }, [])

  const sendAudioData = useCallback((audioData: ArrayBuffer) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('audio-data', {
        audio: audioData,
        timestamp: Date.now(),
      })
    }
  }, [isConnected])

  useEffect(() => {
    const socket = initializeSocket()

    return () => {
      stopRecording()
      peerConnectionsRef.current.forEach(pc => pc.close())
      peerConnectionsRef.current.clear()
      socket.close()
    }
  }, [initializeSocket, stopRecording])

  return {
    isConnected,
    isRecording,
    participants,
    startRecording,
    stopRecording,
    sendAudioData,
  }
}