import { _decorator, Component, Node, Vec3, Tween, tween } from 'cc';
import {EntityManager} from "db://assets/Scripts/Base/EntityManager";
import {ENTITY_STATE_ENUM, EVENT_ENUM} from "db://assets/Scripts/Enum";
import EventManager from "db://assets/Scripts/Global/EventManager";
import ObjectPoolManager from "db://assets/Scripts/Global/ObjectPoolManager";
import DataManager from "db://assets/Scripts/Global/DataManager";
import {radianToAngle} from "db://assets/Scripts/Utils";
import {BulletStateMachine} from "db://assets/Scripts/Entity/Bullet/BulletStateMachine";
import {ExplosionManager} from "db://assets/Scripts/Entity/Explosion/ExplosionManager";
import {ENTITY_TYPE_ENUM} from "db://assets/Scripts/Common/Enum";
import {IBullet, IVec2} from "db://assets/Scripts/Common/State";
const { ccclass, property } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends EntityManager {
    type: ENTITY_TYPE_ENUM
    // 当前id
    id: number
    private targetPos: Vec3
    private tw: Tween<unknown>

    init (data: IBullet) {
        this.type = data.type
        this.id = data.id

        this.fsm = this.addComponent(BulletStateMachine)
        this.fsm.init(data.type)

        this.state = ENTITY_STATE_ENUM.Idle
        // 初始化的时候为false
        this.node.active = false
        this.targetPos = undefined

        // 监听子弹爆炸发生
        EventManager.Instance.on(EVENT_ENUM.EXPLOSION_BORN, this.handleExplosionBorn, this)
    }

    onDestroy () {
        EventManager.Instance.off(EVENT_ENUM.EXPLOSION_BORN, this.handleExplosionBorn, this)
    }

    handleExplosionBorn (id: number, { x, y }: IVec2) {
        if (id !== this.id) return

        // 实例化 预制体
        const explosion = ObjectPoolManager.Instance.get(ENTITY_TYPE_ENUM.EXPLOSION)
        console.log(explosion)
        // 添加脚本
        const explosionManager = explosion?.getComponent(ExplosionManager) || explosion.addComponent(ExplosionManager)
        explosionManager.init(ENTITY_TYPE_ENUM.EXPLOSION, { x, y })

        // 消除子弹节点内容
        EventManager.Instance.off(EVENT_ENUM.EXPLOSION_BORN, this.handleExplosionBorn, this)
        DataManager.Instance.bulletMap.delete(this.id)
        ObjectPoolManager.Instance.ret(this.node)
    }

    // 更新位置
    render (data: IBullet) {
        this.renderPosition(data)
        this.renderDirection(data)
    }

    renderPosition(data: IBullet) {
        const { position} = data
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
            this.tw = tween(this.node)
                .to(0.1, {position: this.targetPos})
                .start()
        }

        this.node.setPosition(data.position.x, data.position.y)
    }

    renderDirection (data: IBullet) {
        const { direction} = data

        // 获取斜边 Math.sqrt为开方
        const side = Math.sqrt(direction.x ** 2 + direction.y ** 2)
        const angle = direction.x > 0 ? radianToAngle(Math.asin(direction.y / side)) : (radianToAngle(Math.asin(-direction.y / side)) + 180)

        this.node.setRotationFromEuler(0, 0, angle)
    }
}


