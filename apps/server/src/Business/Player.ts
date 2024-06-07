import {Connection} from "../Core";

export class Player {
    id: number
    nickname: string
    // webSocket链接实例
    connection: Connection
    // 房间号
    roomId: number

    constructor({ id, nickname, connection }: Pick<Player, "id" | "nickname" | "connection">) {
        this.id = id
        this.nickname = nickname
        this.connection = connection
    }
}
