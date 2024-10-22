import {Component, Label, _decorator } from "cc";
import {EVENT_ENUM} from "db://assets/Scripts/Enum";
import EventManager from "db://assets/Scripts/Global/EventManager";
import {IPlayer, IRoom} from "db://assets/Scripts/Common/Api";

const { ccclass } = _decorator;

@ccclass('RoomManager')
export class RoomManager extends Component {
    id: number

    init ({ id,players }: IRoom) {
        this.id = id
        const label = this.getComponent(Label)
        label.string = `房间${id}`
        this.node.active = true
    }

    handleClick () {
        console.log(this.id)
        EventManager.Instance.emit(EVENT_ENUM.ROOM_JOIN, this.id)
    }
}
