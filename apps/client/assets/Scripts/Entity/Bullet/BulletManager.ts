import { _decorator, Component, Node } from 'cc';
import {ENTITY_TYPE_ENUM, IBullet, IVec2} from "db://assets/Scripts/Common";
import {EntityManager} from "db://assets/Scripts/Base/EntityManager";
import {ENTITY_STATE_ENUM, EVENT_ENUM} from "db://assets/Scripts/Enum";
import EventManager from "db://assets/Scripts/Global/EventManager";
import ObjectPoolManager from "db://assets/Scripts/Global/ObjectPoolManager";
import DataManager from "db://assets/Scripts/Global/DataManager";
import {radianToAngle} from "db://assets/Scripts/Utils";
import {BulletStateMachine} from "db://assets/Scripts/Entity/Bullet/BulletStateMachine";
import {ExplosionManager} from "db://assets/Scripts/Entity/Explosion/ExplosionManager";
const { ccclass, property } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends EntityManager {
    type: ENTITY_TYPE_ENUM
    // 当前id
    id: number

    init (data: IBullet) {
        this.type = data.type
        this.id = data.id

        this.fsm = this.addComponent(BulletStateMachine)
        this.fsm.init(data.type)

        this.state = ENTITY_STATE_ENUM.Idle
        // 初始化的时候为false
        this.node.active = false

        // 监听子弹爆炸发生
        EventManager.Instance.on(EVENT_ENUM.EXPLOSION_BORN, this.handleExplosionBorn, this)
    }

    onDestroy () {
        EventManager.Instance.off(EVENT_ENUM.EXPLOSION_BORN, this.handleExplosionBorn, this)
    }

    handleExplosionBorn (id: number, { x, y }: IVec2) {
        console.log(id)
        if (id !== this.id) return
        console.log(this.id)

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
        this.node.active = true
        const { direction, position } = data
        this.node.setPosition(data.position.x, data.position.y)

        // 获取斜边 Math.sqrt为开方
        const side = Math.sqrt(direction.x ** 2 + direction.y ** 2)
        const angle = direction.x > 0 ? radianToAngle(Math.asin(direction.y / side)) : (radianToAngle(Math.asin(-direction.y / side)) + 180)

        this.node.setRotationFromEuler(0, 0, angle)
    }
}


