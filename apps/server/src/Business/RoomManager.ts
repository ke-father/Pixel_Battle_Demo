import Singleton from "../Base/Singleton";
import {Room} from "./Room";
import {API_MSG_ENUM, IApiPlayerJoinReq} from "../Common";
import {Connection} from "../Core";
import {Player} from "./Player";
import PlayerManager from "./PlayerManager";

export default class RoomManager extends Singleton {
    static get Instance() {
        return super.GetInstance<RoomManager>()
    }

    nextRoomId: number = 1
    rooms: Set<Room> = new Set()
    idMapRoom: Map<number, Room> = new Map()

    createRoom () {
        const room = new Room(this.nextRoomId++)
        this.rooms.add(room)
        this.idMapRoom.set(room.id, room)

        return room
    }

    joinRoom (rid: number, uid: number) {
        const room = this.idMapRoom.get(rid)

        if (!room) return

        room.join(uid)
        return room
    }

    leaveRoom (rid: number, uid: number) {
        const room = this.idMapRoom.get(rid)
        if (!room) return

        room.leave(uid)
    }

    closeRoom (rid: number) {
        const room = this.idMapRoom.get(rid)
        if (!room) return
        room.close()
        this.rooms.delete(room)
        this.idMapRoom.delete(rid)
    }

    startRoom (rid: number) {
        const room = this.idMapRoom.get(rid)
        if (!room) return
        room.start()
    }

    syncRooms () {
        for (const player of PlayerManager.Instance.players) {
            player.connection.sendMsg(API_MSG_ENUM.MSG_ROOM_LIST, {
                list: this.getRoomsView()
            })
        }
    }

    syncRoom(rid: number) {
        const room = this.idMapRoom.get(rid)
        if (!room) return
        room.sync()
    }

    getRoomsView (rooms: Set<Room> = this.rooms) {
        return [...rooms].map(r => this.getRoomView(r))
    }

    getRoomView ({ id, players }: Room) {
        return {
            id,
            players: PlayerManager.Instance.getPlayersView(players)
        }
    }
}
