import { _decorator, Component, Node, EditBox, director, Prefab, instantiate } from 'cc';
import {API_MSG_ENUM} from "db://assets/Scripts/Common/Enum";
import {NetWorkManager} from "db://assets/Scripts/Global/NetWorkManager";
import {SCENE_ENUM} from "db://assets/Scripts/Enum";
import {IMsgGameStart, IMsgRoom} from "db://assets/Scripts/Common";
import {PlayerManager} from "db://assets/Scripts/UI/PlayerManager";
import DataManager from "db://assets/Scripts/Global/DataManager";
import {deepClone} from "db://assets/Scripts/Utils";
const { ccclass, property } = _decorator;

@ccclass('RoomManager')
export class RoomManager extends Component {
    @property(Node) playerContainer: Node
    @property(Prefab) playerPrefab: Prefab

    onLoad () {
        // 绑定Net监听
        NetWorkManager.Instance.listenMsg(API_MSG_ENUM.MSG_ROOM, this.renderPlayer, this)
        NetWorkManager.Instance.listenMsg(API_MSG_ENUM.MSG_GAME_START, this.handleGameStart, this)
    }

    async start () {
        this.renderPlayer({
            room: DataManager.Instance.roomInfo
        })

        // 预加载场景
        director.preloadScene(SCENE_ENUM.HALL)
        director.preloadScene(SCENE_ENUM.BATTLE)
    }

    onDestroy () {
        // 解除绑定Net监听
        NetWorkManager.Instance.unListerMsg(API_MSG_ENUM.MSG_ROOM, this.renderPlayer, this)
        NetWorkManager.Instance.unListerMsg(API_MSG_ENUM.MSG_GAME_START, this.handleGameStart, this)
    }

    renderPlayer ({ room: { players: list } }: IMsgRoom) {
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

    async handleLeaveRoom () {
        const  { success, error, res } = await NetWorkManager.Instance.callApi(API_MSG_ENUM.API_ROOM_LEAVE, {})

        if (!success) return console.log(error)

        DataManager.Instance.roomInfo = null

        director.loadScene(SCENE_ENUM.HALL)
    }

    // 游戏初始化
    async handleStart () {
        const  { success, error, res } = await NetWorkManager.Instance.callApi(API_MSG_ENUM.API_GAME_START, {})

        if (!success) return console.log(error)
    }

    handleGameStart ({ state }: IMsgGameStart) {
        DataManager.Instance.state = state
        DataManager.Instance.lastState = deepClone(state)

        director.loadScene(SCENE_ENUM.BATTLE)
    }
}


