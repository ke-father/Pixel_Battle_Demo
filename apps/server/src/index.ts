import { symlinkCommon } from "./Utils";
import { WebSocketServer } from 'ws'

// symlinkCommon();

import {
    API_MSG_ENUM, IApiGameStartReq, IApiGameStartRes,
    IApiPlayerJoinReq,
    IApiPlayerJoinRes,
    IApiPlayerListReq,
    IApiPlayerListRes,
    IApiRoomCreateReq,
    IApiRoomCreateRes,
    IApiRoomJoinReq,
    IApiRoomJoinRes,
    IApiRoomLeaveReq,
    IApiRoomLeaveRes,
    IApiRoomListReq,
    IApiRoomListRes
} from "./Common";
import {Connection, MyServer} from "./Core";
import PlayerManager from "./Business/PlayerManager";
import {Player} from "./Business/Player";
import {Room} from "./Business/Room";
import RoomManager from "./Business/RoomManager";

declare module './Core' {
    interface Connection {
        playerId: number
    }
}

const server = new MyServer({
    port: 9876
})

// 服务器链接
server.on('connection', () => {
    console.log('来人了,', server.connections.size)
})

// 服务器链接失效
server.on('disconnection', (connection: Connection) => {
    console.log('走人了', server.connections.size)
    if (connection.playerId) {
        PlayerManager.Instance.removePlayer(connection.playerId)
    }
    PlayerManager.Instance.syncPlayers()
    console.log(' PlayerManager.Instance.players.size!', PlayerManager.Instance.players.size)
})

// 玩家加入
server.setApi(API_MSG_ENUM.API_PLAYER_JOIN, (connection: Connection, data: IApiPlayerJoinReq): IApiPlayerJoinRes => {
    const { nickname } = data
    const player = PlayerManager.Instance.createPlayer({ nickname, connection })
    connection.playerId = player.id
    PlayerManager.Instance.syncPlayers()
    return {
        player: PlayerManager.Instance.getPlayerView(player)
    }
})

// 获取玩家列表
server.setApi(API_MSG_ENUM.API_PLAYER_LIST, (connection: Connection, data: IApiPlayerListReq): IApiPlayerListRes => {
    return {
        list: PlayerManager.Instance.getPlayersView()
    }
})

// 获取房间列表
server.setApi(API_MSG_ENUM.API_ROOM_LIST, (connection: Connection, data: IApiRoomListReq): IApiRoomListRes => {
    return {
        list: RoomManager.Instance.getRoomsView()
    }
})

// 创建房间
server.setApi(API_MSG_ENUM.API_ROOM_CREATE, (connection, data: IApiRoomCreateReq): IApiRoomCreateRes => {
    if (!connection.playerId) throw new Error('未登录')

    const newRoom = RoomManager.Instance.createRoom()
    const room = RoomManager.Instance.joinRoom(newRoom.id, connection.playerId)

    if (!room) throw new Error('房间不存在')

    PlayerManager.Instance.syncPlayers()
    // 同步房间
    RoomManager.Instance.syncRooms()

    return {
        room: RoomManager.Instance.getRoomView(room)
    }
})

// 加入房间
server.setApi(API_MSG_ENUM.API_ROOM_JOIN, (connection, { rid }: IApiRoomJoinReq): IApiRoomJoinRes => {
    if (!connection.playerId) throw new Error('未登录')

    console.log(rid)

    const room = RoomManager.Instance.joinRoom(rid, connection.playerId)

    if (!room) throw new Error('房间不存在')

    console.log('加入房间')

    PlayerManager.Instance.syncPlayers()
    // 同步房间
    RoomManager.Instance.syncRooms()
    // 同步房间内消息
    RoomManager.Instance.syncRoom(rid)

    return {
        room: RoomManager.Instance.getRoomView(room)
    }
})

// 离开房间
server.setApi(API_MSG_ENUM.API_ROOM_LEAVE, (connection, data: IApiRoomLeaveReq): IApiRoomLeaveRes => {
    if (!connection.playerId) throw new Error('未登录')
    // 获取玩家
    const player = PlayerManager.Instance.idMapPlayer.get(connection.playerId)
    if (!player) throw new Error('玩家不存在')

    const rid = player.roomId

    if (!rid) throw new Error('玩家不在房间')

    // 离开房间
    RoomManager.Instance.leaveRoom(rid, player.id)

    PlayerManager.Instance.syncPlayers()
    // 同步房间
    RoomManager.Instance.syncRooms()
    // 同步房间内消息
    RoomManager.Instance.syncRoom(rid)

    return {
    }
})

// 离开房间
server.setApi(API_MSG_ENUM.API_GAME_START, (connection, data: IApiGameStartReq): IApiGameStartRes => {
    if (!connection.playerId) throw new Error('未登录')
    // 获取玩家
    const player = PlayerManager.Instance.idMapPlayer.get(connection.playerId)
    if (!player) throw new Error('玩家不存在')

    const rid = player.roomId

    if (!rid) throw new Error('玩家不在房间')

    // 离开房间
    RoomManager.Instance.startRoom(rid)

    PlayerManager.Instance.syncPlayers()
    // 同步房间
    RoomManager.Instance.syncRooms()
    // 同步房间内消息
    RoomManager.Instance.syncRoom(rid)

    return {
    }
})

server.start()

// // 创建websocket实例
// const wss = new WebSocketServer({
//     port: 9876
// })
//
// let inputs = []
//
// // 监听链接事件
// wss.on('connection', (socket) => {
//     socket.on('message', (buffer) => {
//         try {
//             console.log(buffer.toString())
//             const { name, data: { frameId, input } } = JSON.parse(buffer.toString())
//             inputs.push(input)
//         } catch (e) {
//
//         }
//     })
//
//     setInterval(() => {
//         const temp = inputs
//         inputs = []
//         const object = {
//             name: API_MSG_ENUM.MSG_SERVER_SYNC,
//             data: {
//                 inputs: temp,
//             }
//         }
//         inputs = []
//         socket.send(JSON.stringify(object))
//     }, 100)
// })
//
// // 监听服务启动事件
// wss.on('listening', () => {
//     console.log('服务启动')
// })
