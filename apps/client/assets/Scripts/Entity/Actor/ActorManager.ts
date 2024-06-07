import { _decorator, Component, Node, ProgressBar, instantiate } from 'cc';
import {EntityManager} from "db://assets/Scripts/Base/EntityManager";
// import WeaponManager from "db://assets/Scripts/Entity/Weapon/WeaponManager";
import {ENTITY_TYPE_ENUM, IActor, INPUT_TYPE_ENUM} from "db://assets/Scripts/Common";
import ActorStateMachine from "db://assets/Scripts/Entity/Actor/ActorStateMachine";
import DataManager from "db://assets/Scripts/Global/DataManager";
import {ENTITY_STATE_ENUM, EVENT_ENUM} from "db://assets/Scripts/Enum";
import {radianToAngle} from "db://assets/Scripts/Utils";
import EventManager from "db://assets/Scripts/Global/EventManager";
import {WeaponManager} from "db://assets/Scripts/Entity/Weapon/WeaponManager";
const { ccclass, property } = _decorator;

@ccclass('ActorManager')
export default class ActorManager extends EntityManager {
    private weaponManager: WeaponManager

    bulletType: ENTITY_TYPE_ENUM

    private id: number
    // hp进度条
    private hpComponent: ProgressBar

    init (data: IActor) {
        this.hpComponent = this.node.getComponentInChildren(ProgressBar)

        this.bulletType = data.bulletType
        this.id = data.id

        this.fsm = this.addComponent(ActorStateMachine)
        this.fsm.init(data.type)

        this.state = ENTITY_STATE_ENUM.Idle

        // 获取武器预制体
        const prefab = DataManager.Instance.prefabMap.get(ENTITY_TYPE_ENUM.WEAPON1)
        // 实例化武器
        const weapon = instantiate(prefab)
        // 挂载到节点
        weapon.setParent(this.node)
        // 挂载管理脚本
        this.weaponManager = weapon.addComponent(WeaponManager)
        this.weaponManager.init(data)
    }

    // 更新位置
    render (data: IActor) {
        const { direction, position } = data
        this.node.setPosition(data.position.x, data.position.y)

        if (direction.x !== 0) {
            this.node.setScale(direction.x > 0 ? 1 : -1, 1)
            this.hpComponent.node.setScale(direction.x > 0 ? 1 : -1, 1)
        }

        // 获取斜边 Math.sqrt为开方
        const side = Math.sqrt(direction.x ** 2 + direction.y ** 2)
        const radian = Math.asin(direction.y / side)
        const angle = radianToAngle(radian)

        this.weaponManager.node.setRotationFromEuler(0, 0, angle)

        this.hpComponent.progress = data.hp / this.hpComponent.totalLength
    }

    tick (dt) {
        if (this.id !== DataManager.Instance.myPlayerId) return

        if (DataManager.Instance.jm?.input.length()) {
            const { x, y } = DataManager.Instance.jm.input
            EventManager.Instance.emit(EVENT_ENUM.CLIENT_SYNC, {
                id: 1,
                type: INPUT_TYPE_ENUM.ACTOR_MOVE,
                direction: {
                    x, y
                },
                dt,
            })

            // DataManager.Instance.applyInput({
            //     id: 1,
            //     type: INPUT_TYPE_ENUM.ACTOR_MOVE,
            //     direction: {
            //         x, y
            //     },
            //     dt,
            // })

            this.state = ENTITY_STATE_ENUM.Run
        } else {
            this.state = ENTITY_STATE_ENUM.Idle
        }
    }
}


