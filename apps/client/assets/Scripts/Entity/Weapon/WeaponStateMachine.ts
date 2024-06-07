import { _decorator, Animation, AnimationClip } from "cc";
import State from "../../Base/State";
import StateMachine, { getInitParamsTrigger } from "../../Base/StateMachine";
import {ENTITY_TYPE_ENUM} from "db://assets/Scripts/Common";
import {ENTITY_STATE_ENUM, ParamsNameEnum} from "db://assets/Scripts/Enum";
import {WeaponManager} from "db://assets/Scripts/Entity/Weapon/WeaponManager";
const { ccclass } = _decorator;

@ccclass("WeaponStateMachine")
export class WeaponStateMachine extends StateMachine {
  init(type: ENTITY_TYPE_ENUM) {
    this.type = type;
    this.animationComponent = this.node.addComponent(Animation);
    this.initParams();
    this.initStateMachines();
    this.initAnimationEvent();
  }

  initParams() {
    this.params.set(ParamsNameEnum.Idle, getInitParamsTrigger());
    this.params.set(ParamsNameEnum.Attack, getInitParamsTrigger());
  }

  initStateMachines() {
    this.stateMachines.set(ParamsNameEnum.Idle, new State(this, `${this.type}${ENTITY_STATE_ENUM.Idle}`, AnimationClip.WrapMode.Loop, true));
    this.stateMachines.set(ParamsNameEnum.Attack, new State(this, `${this.type}${ENTITY_STATE_ENUM.Attack}`, AnimationClip.WrapMode.Normal, true));
  }

  initAnimationEvent() {
    this.animationComponent.on(Animation.EventType.FINISHED, () => {
      // 攻击后将动画重置为IDLE
        if (this.animationComponent.defaultClip.name.includes(ENTITY_STATE_ENUM.Attack)) {
          this.node.parent.getComponent(WeaponManager).state = ENTITY_STATE_ENUM.Idle
        }
    })
  }

  run() {
    switch (this.currentState) {
      case this.stateMachines.get(ParamsNameEnum.Idle):
      case this.stateMachines.get(ParamsNameEnum.Attack):
        if (this.params.get(ParamsNameEnum.Attack).value) {
          this.currentState = this.stateMachines.get(ParamsNameEnum.Attack);
        } else if (this.params.get(ParamsNameEnum.Idle).value) {
          this.currentState = this.stateMachines.get(ParamsNameEnum.Idle);
        } else {
          this.currentState = this.currentState;
        }
        break;
      default:
        this.currentState = this.stateMachines.get(ParamsNameEnum.Idle);
        break;
    }
  }
}
