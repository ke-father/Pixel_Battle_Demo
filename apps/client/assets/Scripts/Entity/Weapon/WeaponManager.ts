import {_decorator, Node, UITransform, Vec2} from 'cc';
import {EntityManager} from "db://assets/Scripts/Base/EntityManager";
import {IActor, INPUT_TYPE_ENUM} from "db://assets/Scripts/Common";
import {WeaponStateMachine} from "db://assets/Scripts/Entity/Weapon/WeaponStateMachine";
import {ENTITY_STATE_ENUM, EVENT_ENUM} from "db://assets/Scripts/Enum";
import EventManager from "db://assets/Scripts/Global/EventManager";
import DataManager from "db://assets/Scripts/Global/DataManager";
const { ccclass, property } = _decorator;

@ccclass('WeaponManager')
export class WeaponManager extends EntityManager {
    private body: Node
    private anchor: Node
    private point: Node

    // 子弹发出者id
    owner: number

    init (data: IActor) {
        // 记录子弹发出者id
        this.owner = data.id
        this.body = this.node.getChildByName('Body')
        this.anchor = this.body.getChildByName('Anchor')
        this.point = this.anchor.getChildByName('Point')

        // 状态机添加
        this.fsm = this.body.addComponent(WeaponStateMachine)
        this.fsm.init(data.weaponType)

        // 设置初始状态
        this.state = ENTITY_STATE_ENUM.Idle

        // 挂载射击监听
        EventManager.Instance.on(EVENT_ENUM.WEAPON_SHOOT, this.handleWeaponShoot, this)
        EventManager.Instance.on(EVENT_ENUM.BULLET_BORN, this.handleBulletBorn, this)
    }

    onDestroy () {
        EventManager.Instance.off(EVENT_ENUM.WEAPON_SHOOT, this.handleWeaponShoot, this)
        EventManager.Instance.off(EVENT_ENUM.BULLET_BORN, this.handleBulletBorn, this)
    }

    handleBulletBorn (owner) {
        if (owner !== this.owner) return
        console.log('attack')
        this.state = ENTITY_STATE_ENUM.Attack
    }

    handleWeaponShoot () {
        if (this.owner !== DataManager.Instance.myPlayerId) return
        // 获取世界坐标
        const pointWorldPosition = this.point.getWorldPosition()
        // 转换为舞台坐标
        const pointStagePosition = DataManager.Instance.stage.getComponent(UITransform).convertToNodeSpaceAR(pointWorldPosition)
        // 获取枪口锚点位置
        const anchorWorldPosition = this.anchor.getWorldPosition()

        // 获取anchor的二维向量 归一化 只有方向没有长度
        const direction = new Vec2(pointWorldPosition.x - anchorWorldPosition.x, pointWorldPosition.y - anchorWorldPosition.y).normalize()

        // 数据驱动子弹创建
        DataManager.Instance.applyInput({
            owner: this.owner,
            type: INPUT_TYPE_ENUM.WEAPON_SHOOT,
            position: pointStagePosition,
            direction: {
                x: direction.x,
                y: direction.y
            }
        })
    }
}
