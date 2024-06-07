import { _decorator, Component, Node, EditBox } from 'cc';
import {NetWorkManager} from "db://assets/Scripts/Global/NetWorkManager";
import {API_MSG_ENUM} from "db://assets/Scripts/Common";
import DataManager from "db://assets/Scripts/Global/DataManager";
const { ccclass, property } = _decorator;

@ccclass('LoginManager')
export class LoginManager extends Component {
    input: EditBox

    onLoad () {
        this.input = this.getComponentInChildren(EditBox)
    }

    async start () {
        await NetWorkManager.Instance.connect()
    }

    async handleClick () {
        // 未连接成功
        if (!NetWorkManager.Instance.isConnect) {
            console.log('未连接')
            await NetWorkManager.Instance.connect()
            return
        }

        // 判断是否输入昵称
        const nickname = this.input.string
        if (!nickname) return


        const  { success, error, res } = await NetWorkManager.Instance.callApi(API_MSG_ENUM.API_PLAYER_JOIN, {
            nickname
        })
        if (!success) return console.log(error)

        DataManager.Instance.myPlayerId = res.player.id
        console.log('res!', res)
    }
}


