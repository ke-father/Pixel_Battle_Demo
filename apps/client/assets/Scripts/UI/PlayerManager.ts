import {Component, Label, _decorator } from "cc";
import {EVENT_ENUM} from "db://assets/Scripts/Enum";
import EventManager from "db://assets/Scripts/Global/EventManager";
import {IPlayer} from "db://assets/Scripts/Common/Api";

const { ccclass } = _decorator;

@ccclass('PlayerManager')
export class PlayerManager extends Component {
    init ({ id, nickname, roomId }: IPlayer) {
        const label = this.getComponent(Label)
        label.string = nickname
        this.node.active = true
    }
}
