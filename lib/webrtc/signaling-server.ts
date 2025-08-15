import { Server as SocketIOServer } from 'socket.io'
import { Server as HTTPServer } from 'http'
import { prisma } from '../db'
import { cache } from '../redis'

interface PeerConnection {
  userId: string
  socketId: string
  roomId: string
  isReady: boolean
}

export class SignalingServer {
  private io: SocketIOServer
  private connections: Map<string, PeerConnection> = new Map()

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
      transports: ['websocket', 'polling'],
    })

    this.setupEventHandlers()
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`)

      socket.on('join-room', async (data: { roomId: string; userId: string }) => {
        const { roomId, userId } = data
        
        // Store connection info
        this.connections.set(socket.id, {
          userId,
          socketId: socket.id,
          roomId,
          isReady: false,
        })

        // Join the room
        socket.join(roomId)
        
        // Notify others in the room
        socket.to(roomId).emit('user-joined', {
          userId,
          socketId: socket.id,
        })

        // Send existing participants
        const roomParticipants = Array.from(this.connections.values())
          .filter(conn => conn.roomId === roomId && conn.socketId !== socket.id)
        
        socket.emit('room-participants', roomParticipants)

        // Store in Redis for persistence
        await cache.set(`room:${roomId}:${userId}`, {
          socketId: socket.id,
          joinedAt: new Date(),
        }, 3600) // 1 hour TTL
      })

      socket.on('offer', (data: { to: string; offer: RTCSessionDescriptionInit }) => {
        socket.to(data.to).emit('offer', {
          from: socket.id,
          offer: data.offer,
        })
      })

      socket.on('answer', (data: { to: string; answer: RTCSessionDescriptionInit }) => {
        socket.to(data.to).emit('answer', {
          from: socket.id,
          answer: data.answer,
        })
      })

      socket.on('ice-candidate', (data: { to: string; candidate: RTCIceCandidateInit }) => {
        socket.to(data.to).emit('ice-candidate', {
          from: socket.id,
          candidate: data.candidate,
        })
      })

      socket.on('ready', () => {
        const connection = this.connections.get(socket.id)
        if (connection) {
          connection.isReady = true
          socket.to(connection.roomId).emit('user-ready', {
            userId: connection.userId,
            socketId: socket.id,
          })
        }
      })

      socket.on('start-recording', async (data: { conversationId: string }) => {
        const connection = this.connections.get(socket.id)
        if (!connection) return

        // Create conversation record
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: {
            mode: 'VOICE',
            startedAt: new Date(),
          }
        })

        socket.to(connection.roomId).emit('recording-started')
      })

      socket.on('stop-recording', async (data: { conversationId: string }) => {
        const connection = this.connections.get(socket.id)
        if (!connection) return

        // Update conversation record
        await prisma.conversation.update({
          where: { id: data.conversationId },
          data: {
            endedAt: new Date(),
          }
        })

        socket.to(connection.roomId).emit('recording-stopped')
      })

      socket.on('audio-data', (data: { audio: ArrayBuffer; timestamp: number }) => {
        const connection = this.connections.get(socket.id)
        if (!connection) return

        // Broadcast audio to room participants
        socket.to(connection.roomId).emit('audio-data', {
          from: connection.userId,
          audio: data.audio,
          timestamp: data.timestamp,
        })
      })

      socket.on('disconnect', async () => {
        const connection = this.connections.get(socket.id)
        if (connection) {
          // Notify room participants
          socket.to(connection.roomId).emit('user-left', {
            userId: connection.userId,
            socketId: socket.id,
          })

          // Clean up Redis
          await cache.del(`room:${connection.roomId}:${connection.userId}`)
          
          // Remove from connections
          this.connections.delete(socket.id)
        }

        console.log(`Client disconnected: ${socket.id}`)
      })
    })
  }

  public getIO(): SocketIOServer {
    return this.io
  }

  public getRoomParticipants(roomId: string): PeerConnection[] {
    return Array.from(this.connections.values())
      .filter(conn => conn.roomId === roomId)
  }
}