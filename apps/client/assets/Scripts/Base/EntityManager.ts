import { _decorator, Component } from "cc";
import { ENTITY_STATE_ENUM } from "../Enum";
import StateMachine from "./StateMachine";
const { ccclass, property } = _decorator;

@ccclass("EntityManager")
export abstract class EntityManager extends Component {
  fsm: StateMachine;
  private _state: ENTITY_STATE_ENUM;

  get state() {
    return this._state;
  }

  set state(newState) {
    this._state = newState;
    this.fsm.setParams(newState, true);
  }

  abstract init(...args: any[]): void;
}
