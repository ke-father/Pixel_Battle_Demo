import { _decorator, Animation, AnimationClip } from "cc";
import State from "../../Base/State";
import StateMachine, { getInitParamsTrigger } from "../../Base/StateMachine";
import {ENTITY_STATE_ENUM, ParamsNameEnum} from "db://assets/Scripts/Enum";
import {ENTITY_TYPE_ENUM} from "db://assets/Scripts/Common/Enum";
const { ccclass } = _decorator;

@ccclass("ActorStateMachine")
export default class ActorStateMachine extends StateMachine {
  init(type: ENTITY_TYPE_ENUM) {
    this.type = type;
    this.animationComponent = this.node.addComponent(Animation);
    this.initParams();
    this.initStateMachines();
    this.initAnimationEvent();
  }

  initParams() {
    this.params.set(ParamsNameEnum.Idle, getInitParamsTrigger());
    this.params.set(ParamsNameEnum.Run, getInitParamsTrigger());
  }

  initStateMachines() {
    this.stateMachines.set(ParamsNameEnum.Idle, new State(this, `${this.type}${ENTITY_STATE_ENUM.Idle}`, AnimationClip.WrapMode.Loop));
    this.stateMachines.set(ParamsNameEnum.Run, new State(this, `${this.type}${ENTITY_STATE_ENUM.Run}`, AnimationClip.WrapMode.Loop));
  }

  initAnimationEvent() {}

  run() {
    switch (this.currentState) {
      case this.stateMachines.get(ParamsNameEnum.Idle):
      case this.stateMachines.get(ParamsNameEnum.Run):
        if (this.params.get(ParamsNameEnum.Run).value) {
          this.currentState = this.stateMachines.get(ParamsNameEnum.Run);
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
