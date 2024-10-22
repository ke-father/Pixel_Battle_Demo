import { _decorator, Component, Node, EditBox, director, Prefab, instantiate } from 'cc';
import {API_MSG_ENUM} from "db://assets/Scripts/Common/Enum";
import {NetWorkManager} from "db://assets/Scripts/Global/NetWorkManager";
import {IApiPlayerListRes, IApiRoomListRes} from "db://assets/Scripts/Common/Api";
import {PlayerManager} from "db://assets/Scripts/UI/PlayerManager";
import DataManager from "db://assets/Scripts/Global/DataManager";
import {EVENT_ENUM, SCENE_ENUM} from "db://assets/Scripts/Enum";
import {RoomManager} from "db://assets/Scripts/UI/RoomManager";
import EventManager from "db://assets/Scripts/Global/EventManager";
const { ccclass, property } = _decorator;

@ccclass('HallManager')
export class HallManager extends Component {
    @property(Node) playerContainer: Node
    @property(Prefab) playerPrefab: Prefab

    @property(Node) roomContainer: Node
    @property(Prefab) roomPrefab: Prefab

    onLoad () {
        // 绑定Net监听
        NetWorkManager.Instance.listenMsg(API_MSG_ENUM.MSG_PLAYER_LIST, this.renderPlayer, this)
        NetWorkManager.Instance.listenMsg(API_MSG_ENUM.MSG_ROOM_LIST, this.renderRoom, this)
        // 监听房间点击
        EventManager.Instance.on(EVENT_ENUM.ROOM_JOIN, this.handleJoinRoom, this)
    }

    async start () {
        // 清除所有子
        this.playerContainer.destroyAllChildren()
        this.roomContainer.destroyAllChildren()

        await this.getPlayers()
        await this.getRooms()
        // 预加载场景
        director.preloadScene(SCENE_ENUM.ROOM)
    }

    onDestroy () {
        // 解除绑定Net监听
        NetWorkManager.Instance.unListerMsg(API_MSG_ENUM.MSG_PLAYER_LIST, this.renderPlayer, this)
        NetWorkManager.Instance.unListerMsg(API_MSG_ENUM.MSG_ROOM_LIST, this.renderRoom, this)
        // 解除监听房间点击
        EventManager.Instance.off(EVENT_ENUM.ROOM_JOIN, this.handleJoinRoom, this)
    }

    async getPlayers () {
        const  { success, error, res } = await NetWorkManager.Instance.callApi(API_MSG_ENUM.API_PLAYER_LIST, {})

        if (!success) return console.log(error)

        this.renderPlayer(res)
    }

    renderPlayer ({ list }: IApiPlayerListRes) {
        for (const c of this.playerContainer.children) {
            c.active = false
        }

        while (this.playerContainer.children.length < list.length) {
            const node = instantiate(this.playerPrefab)
            node.active = true
            node.setParent(this.playerContainer)
        }

        console.log(list)

        for (let i = 0; i < list.length; i++) {
            const data = list[i]
            const node = this.playerContainer.children[i]
            node.getComponent(PlayerManager).init(data)
        }
    }

    async handleCreateRoom () {
        const  { success, error, res } = await NetWorkManager.Instance.callApi(API_MSG_ENUM.API_ROOM_CREATE, {})

        if (!success) return console.log(error)

        DataManager.Instance.roomInfo = res.room

        director.loadScene(SCENE_ENUM.ROOM)
    }

    async getRooms () {
        const  { success, error, res } = await NetWorkManager.Instance.callApi(API_MSG_ENUM.API_ROOM_LIST, {})

        if (!success) return console.log(error)

        this.renderRoom(res)
    }

    renderRoom ({ list }: IApiRoomListRes) {
        for (const c of this.roomContainer.children) {
            c.active = false
        }

        while (this.roomContainer.children.length < list.length) {
            const node = instantiate(this.roomPrefab)
            node.active = true
            node.setParent(this.roomContainer)
        }

        console.log(list)

        for (let i = 0; i < list.length; i++) {
            const data = list[i]
            const node = this.roomContainer.children[i]
            node.getComponent(RoomManager).init(data)
        }
    }

    async handleJoinRoom (rid: number) {
        const  { success, error, res } = await NetWorkManager.Instance.callApi(API_MSG_ENUM.API_ROOM_JOIN, {
            rid
        })

        if (!success) return console.log(error)

        DataManager.Instance.roomInfo = res.room
        console.log('res', res)
        director.loadScene(SCENE_ENUM.ROOM)
    }
}


