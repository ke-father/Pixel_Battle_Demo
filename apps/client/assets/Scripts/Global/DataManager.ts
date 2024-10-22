import Singleton from "../Base/Singleton";
import {JoyStickManager} from "db://assets/Scripts/UI/JoyStickManager";
import {Node, Prefab, SpriteFrame} from "cc";
import {EVENT_ENUM} from "db://assets/Scripts/Enum";
import ActorManager from "db://assets/Scripts/Entity/Actor/ActorManager";
import {BulletManager} from "db://assets/Scripts/Entity/Bullet/BulletManager";
import EventManager from "db://assets/Scripts/Global/EventManager";
import {ENTITY_TYPE_ENUM, INPUT_TYPE_ENUM} from "db://assets/Scripts/Common/Enum";
import {IBullet, IClientInput, IState} from "db://assets/Scripts/Common/State";
import {IRoom, toFixed} from "db://assets/Scripts/Common";
import {randomBySeed} from "db://assets/Scripts/Utils";

// 玩家移动速度
const ACTOR_SPEED = 100
// 子弹速度
const BULLET_SPEED = 600

const MAP_WIDTH = 960
const MAP_HEIGHT = 640

const ACTOR_RADIUS = 50
const BULLET_RADIUS = 10

const BULLET_DAMAGE = 5

export default class DataManager extends Singleton {
    static get Instance() {
        return super.GetInstance<DataManager>();
    }

    frameId = 1
    // 玩家id
    myPlayerId = 1
    // 房间信息
    roomInfo: IRoom
    // 舞台实例
    stage: Node
    // joyStickManager实例
    jm: JoyStickManager
    // 玩家生成图
    actorMap: Map<Number, ActorManager> = new Map()
    // 子弹生成图
    bulletMap: Map<Number, BulletManager> = new Map()
    // 预制体map
    prefabMap: Map<string, Prefab> = new Map()
    // 贴图Map
    textureMap: Map<string, SpriteFrame[]> = new Map()

    lastState: IState
    // 状态
    state: IState = {
        actors: [
            // {
            //     id: 1,
            //     hp: 30,
            //     type: ENTITY_TYPE_ENUM.ACTOR1,
            //     weaponType: ENTITY_TYPE_ENUM.WEAPON1,
            //     bulletType: ENTITY_TYPE_ENUM.Bullet2,
            //     position: {
            //         x: -150,
            //         y: -150
            //     },
            //     direction: {
            //         x: 1,
            //         y: 0
            //     }
            // },
            //
            // {
            //     id: 2,
            //     hp: 30,
            //     type: ENTITY_TYPE_ENUM.ACTOR1,
            //     weaponType: ENTITY_TYPE_ENUM.WEAPON1,
            //     bulletType: ENTITY_TYPE_ENUM.Bullet2,
            //     position: {
            //         x: 150,
            //         y: 150
            //     },
            //     direction: {
            //         x: -1,
            //         y: 0
            //     }
            // }
        ],
        bullets: [],
        nextBulletId: 1,
        seed: 1
    }

    applyInput(input: IClientInput) {
        switch (input.type) {
            // 类型玩家移动
            case INPUT_TYPE_ENUM.ACTOR_MOVE: {
                // 获取信息
                const {id, direction: {x: actorX, y: actorY}, dt} = input
                // 找到更改信息的玩家
                const actor = this.state.actors.find(actor => actor.id === id)
                // 更改方向
                actor.direction.x = actorX
                actor.direction.y = actorY

                // 修改位置
                actor.position.x += toFixed(actorX * dt * ACTOR_SPEED)
                actor.position.y += toFixed(actorY * dt * ACTOR_SPEED)
                break
            }
            // 类型射击
            case INPUT_TYPE_ENUM.WEAPON_SHOOT:
                const { owner, position, direction } = input
                const bullet: IBullet = {
                    id: this.state.nextBulletId++,
                    owner,
                    position,
                    direction,
                    type: this.actorMap.get(owner).bulletType
                }

                // 通知武器发射事件
                EventManager.Instance.emit(EVENT_ENUM.BULLET_BORN, owner)

                this.state.bullets.push(bullet)
                break
            // 时间输入
            case INPUT_TYPE_ENUM.TIME_PAST: {
                const { dt } = input
                const { bullets } = this.state

                for (let i = bullets.length - 1; i >= 0; i--) {
                    const bullet = bullets[i]

                    // 判断子弹是否与敌人相撞
                    for (let actorIndex = this.state.actors.length - 1; actorIndex >= 0; actorIndex--) {
                        const actor = this.state.actors[actorIndex]
                        if (actor.id === bullet.owner) continue
                        if ((actor.position.x - bullet.position.x) ** 2 + (actor.position.y - bullet.position.y) ** 2 < (ACTOR_RADIUS + BULLET_RADIUS) ** 2) {
                            // 生成种子随机数
                            const random = randomBySeed(this.state.seed)
                            // 重新赋值种子
                            this.state.seed = random
                            // 是否产生暴击
                            const damage = random / 233280 > 0.5 ? BULLET_DAMAGE * 2 : BULLET_DAMAGE
                            // 扣除血量
                            actor.hp -= damage
                            // 发生爆炸效果
                            EventManager.Instance.emit(EVENT_ENUM.EXPLOSION_BORN, bullet.id, {
                                x: toFixed((actor.position.x + bullet.position.x) / 2),
                                y: toFixed((actor.position.y + bullet.position.y) / 2)
                            })
                            // 消除子弹
                            bullets.splice(i, 1)
                            break
                        }
                    }

                    // 如果子弹超出边界
                    if (Math.abs(bullet.position.x) > MAP_WIDTH / 2 || Math.abs(bullet.position.y) > MAP_HEIGHT / 2) {
                        // 发生爆炸效果
                        EventManager.Instance.emit(EVENT_ENUM.EXPLOSION_BORN, bullet.id, { x: bullet.position.x, y: bullet.position.y })
                        // 消除子弹
                        bullets.splice(i, 1)
                        break
                    }
                }

                for (let bullet of bullets) {
                    bullet.position.x += toFixed(bullet.direction.x * dt * BULLET_SPEED)
                    bullet.position.y += toFixed(bullet.direction.y * dt * BULLET_SPEED)
                }

                break
            }
        }
    }
}
