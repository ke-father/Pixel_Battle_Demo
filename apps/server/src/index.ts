// import { symlinkCommon } from "./Utils";
import { WebSocketServer } from 'ws'

// symlinkCommon();

import {API_MSG_ENUM} from "./Common";
import {Connection, MyServer} from "./Core";
import PlayerManager from "./Business/PlayerManager";

declare module './Core' {
    interface Connection {
        playerId: number
    }
}

const server = new MyServer({
    port: 9876
})

// 绑定
server.on('connection', () => {
    console.log('来人了,', server.connections.size)
})

server.on('disconnection', (connection: Connection) => {
    console.log('走人了', server.connections.size)
    if (connection.playerId) {
        PlayerManager.Instance.removePlayer(connection.playerId)
    }
    console.log(' PlayerManager.Instance.players.size!', PlayerManager.Instance.players.size)
})

server.setApi(API_MSG_ENUM.API_PLAYER_JOIN, (connection: Connection, data) => {
    const { nickname } = data
    const player = PlayerManager.Instance.createPlayer({ nickname, connection })
    connection.playerId = player.id
    return {
        player: PlayerManager.Instance.getPlayerView(player)
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
