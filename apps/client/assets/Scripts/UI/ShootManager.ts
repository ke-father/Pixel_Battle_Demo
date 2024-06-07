import {Component, _decorator } from "cc";
import {EVENT_ENUM} from "db://assets/Scripts/Enum";
import EventManager from "db://assets/Scripts/Global/EventManager";

const { ccclass } = _decorator;

@ccclass('ShootManager')
export class ShootManager extends Component {
    handleShoot () {
        EventManager.Instance.emit(EVENT_ENUM.WEAPON_SHOOT)
    }
}
