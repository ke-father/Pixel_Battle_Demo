import { _decorator, Component, Node, ProgressBar, instantiate, Vec3, Tween, tween } from 'cc';
import {EntityManager} from "db://assets/Scripts/Base/EntityManager";
// import WeaponManager from "db://assets/Scripts/Entity/Weapon/WeaponManager";
import ActorStateMachine from "db://assets/Scripts/Entity/Actor/ActorStateMachine";
import DataManager from "db://assets/Scripts/Global/DataManager";
import {ENTITY_STATE_ENUM, EVENT_ENUM} from "db://assets/Scripts/Enum";
import {radianToAngle} from "db://assets/Scripts/Utils";
import EventManager from "db://assets/Scripts/Global/EventManager";
import {WeaponManager} from "db://assets/Scripts/Entity/Weapon/WeaponManager";
import {ENTITY_TYPE_ENUM, INPUT_TYPE_ENUM} from "db://assets/Scripts/Common/Enum";
import {IActor} from "db://assets/Scripts/Common/State";
import {toFixed} from "db://assets/Scripts/Common";
const { ccclass, property } = _decorator;

@ccclass('ActorManager')
export default class ActorManager extends EntityManager {
    private id: number
    private targetPos: Vec3
    private tw: Tween<unknown>
    bulletType: ENTITY_TYPE_ENUM
    // hp进度条
    private hpComponent: ProgressBar
    private weaponManager: WeaponManager

    init (data: IActor) {
        this.hpComponent = this.node.getComponentInChildren(ProgressBar)

        this.bulletType = data.bulletType
        this.id = data.id

        this.fsm = this.addComponent(ActorStateMachine)
        this.fsm.init(data.type)

        this.state = ENTITY_STATE_ENUM.Idle
        this.node.active = false
        this.targetPos = undefined

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
        this.renderPosition(data)
        this.renderDirection(data)
        this.renderHp(data)
    }

    renderPosition (data: IActor) {
        const { direction, position } = data
        const newPos = new Vec3(position.x, position.y)

        if (!this.targetPos) {
            this.node.active = true
            this.node.setPosition(newPos)
            this.targetPos = new Vec3(newPos)
        } else if (!this.targetPos.equals(newPos)) {
            // 判断位置是否相同 newPos每100ms改变一次
            this.tw?.stop()
            this.node.setPosition(this.targetPos)
            this.targetPos.set(newPos)
            this.state = ENTITY_STATE_ENUM.Run
            this.tw = tween(this.node).to(0.1, {
                position: this.targetPos
            }).call(() => {
                this.state = ENTITY_STATE_ENUM.Idle
            }).start()
        }

        this.node.setPosition(data.position.x, data.position.y)
    }

    renderDirection (data: IActor) {
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
    }

    renderHp (data: IActor) {
        this.hpComponent.progress = data.hp / this.hpComponent.totalLength
    }

    tick (dt) {
        if (this.id !== DataManager.Instance.myPlayerId) return

        if (DataManager.Instance.jm?.input.length()) {
            const { x, y } = DataManager.Instance.jm.input
            EventManager.Instance.emit(EVENT_ENUM.CLIENT_SYNC, {
                id: DataManager.Instance.myPlayerId,
                type: INPUT_TYPE_ENUM.ACTOR_MOVE,
                direction: {
                    x: toFixed(x),
                    y: toFixed(y)
                },
                dt: toFixed(dt),
            })

            // DataManager.Instance.applyInput({
            //     id: 1,
            //     type: INPUT_TYPE_ENUM.ACTOR_MOVE,
            //     direction: {
            //         x, y
            //     },
            //     dt,
            // })
        }
    }
}


