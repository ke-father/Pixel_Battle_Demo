import { _decorator } from "cc";
import {EntityManager} from "db://assets/Scripts/Base/EntityManager";
import {ENTITY_STATE_ENUM} from "db://assets/Scripts/Enum";
import {ExplosionStateMachine} from "db://assets/Scripts/Entity/Explosion/ExplosionStateMachine";
import {ENTITY_TYPE_ENUM} from "db://assets/Scripts/Common/Enum";
import {IVec2} from "db://assets/Scripts/Common/State";

const { ccclass, property } = _decorator;

@ccclass('ExplosionManager')
export class ExplosionManager extends EntityManager {
    type: ENTITY_TYPE_ENUM
    // 当前id
    id: number

    init (type: ENTITY_TYPE_ENUM, { x, y }: IVec2) {
        this.node.setPosition(x, y)
        this.type = type

        this.fsm = this.addComponent(ExplosionStateMachine)
        this.fsm.init(type)

        this.state = ENTITY_STATE_ENUM.Idle
    }
}
