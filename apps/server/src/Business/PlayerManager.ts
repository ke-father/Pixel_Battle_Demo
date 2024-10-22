import Singleton from "../Base/Singleton";
import {Player} from "./Player";
import {API_MSG_ENUM, IApiPlayerJoinReq} from "../Common";
import {Connection} from "../Core";
import RoomManager from "./RoomManager";

export default class PlayerManager extends Singleton {
    static get Instance() {
        return super.GetInstance<PlayerManager>()
    }

    nextPlayerId: number = 1
    players: Set<Player> = new Set<Player>()
    idMapPlayer: Map<number, Player> = new Map()

    createPlayer ({ nickname, connection }: IApiPlayerJoinReq & { connection: Connection }) {
        const player = new Player({ id: this.nextPlayerId++, nickname, connection })
        this.players.add(player)
        this.idMapPlayer.set(player.id, player)
        return player
    }

    removePlayer (pid: number) {
        const player = this.idMapPlayer.get(pid)
        if (player) {
            const rid = player.roomId

            if (rid !== undefined) {
                // 离开房间
                RoomManager.Instance.leaveRoom(rid, player.id)
                // 同步房间
                RoomManager.Instance.syncRooms()
                // 同步房间内消息
                RoomManager.Instance.syncRoom(rid)
            }

            this.players.delete(player)
            this.idMapPlayer.delete(player.id)
        }
    }

    syncPlayers () {
        for (const player of this.players) {
            player.connection.sendMsg(API_MSG_ENUM.MSG_PLAYER_LIST, {
                list: this.getPlayersView()
            })
        }
    }

    getPlayersView (players: Set<Player> = this.players) {
        return [...players].map(p => this.getPlayerView(p))
    }

    getPlayerView ({ id, nickname, roomId }: Player) {
        return {
            id, nickname, roomId
        }
    }
}
