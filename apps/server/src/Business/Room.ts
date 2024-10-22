import {Player} from "./Player";
import PlayerManager from "./PlayerManager";
import {
    API_MSG_ENUM,
    ENTITY_TYPE_ENUM,
    IClientInput,
    IMsgClientSync,
    INPUT_TYPE_ENUM,
    IState,
    toFixed
} from "../Common";
import RoomManager from "./RoomManager";

export class Room {
    id: number
    players: Set<Player> = new Set()

    lastTime: number = undefined
    pendingInput: IClientInput[] = []

    lastPlayerFrameIdMap: Map<number, number> = new Map()

    constructor (roomId: number) {
        this.id = roomId
    }

    join (uid: number) {
        const player = PlayerManager.Instance.idMapPlayer.get(uid)

        if (!player) return

        player.roomId = this.id
        this.players.add(player)
    }

    leave (uid: number) {
        const player = PlayerManager.Instance.idMapPlayer.get(uid)

        if (!player) return

        player.roomId = undefined

        this.players.delete(player)

        if (!this.players.size) RoomManager.Instance.closeRoom(this.id)
    }

    close () {
        this.players.clear()
    }

    sync () {
        for (const player of this.players) {
            player.connection.sendMsg(API_MSG_ENUM.MSG_ROOM, {
                room: RoomManager.Instance.getRoomView(this)
            })
        }
    }

    start () {
        const state: IState = {
            actors: [...this.players].map((player, index) => ( {
                id: player.id,
                nickname: player.nickname,
                hp: 100,
                type: ENTITY_TYPE_ENUM.ACTOR1,
                weaponType: ENTITY_TYPE_ENUM.WEAPON1,
                bulletType: ENTITY_TYPE_ENUM.Bullet2,
                position: {
                    x: -150 + index * 300,
                    y: -150 + index * 300
                },
                direction: {
                    x: 1,
                    y: 0
                }
            })) ,
            bullets: [],
            nextBulletId: 1
        }

        for (const player of this.players) {
            player.connection.sendMsg(API_MSG_ENUM.MSG_GAME_START, {
                state
            })

            player.connection.listenMsg(API_MSG_ENUM.MSG_CLIENT_SYNC, this.getClientMsg, this)
        }

        const timer1 = setInterval(() =>{
            this.sendServerMsg()
        }, 100)

        const timer2 = setInterval(() =>{
            this.timePast()
        }, 16)
    }

    getClientMsg (connection, { input, frameId  }: IMsgClientSync) {
        this.pendingInput.push(input)
        this.lastPlayerFrameIdMap.set(connection.playerId, frameId)
    }

    sendServerMsg () {
        const inputs = this.pendingInput
        this.pendingInput = []

        for (const player of this.players) {
            player.connection.sendMsg(API_MSG_ENUM.MSG_SERVER_SYNC, {
                lastFrameId: this.lastPlayerFrameIdMap.get(player.id) ?? 0,
                inputs
            })
        }
    }

    timePast () {
        const now = process.uptime()
        const dt = now - this.lastTime ?? now
        this.pendingInput.push({ type: INPUT_TYPE_ENUM.TIME_PAST, dt: toFixed(dt) })

        this.lastTime = now
    }
}
