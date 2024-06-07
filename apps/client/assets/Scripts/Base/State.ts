import { animation, AnimationClip, Sprite, SpriteFrame } from "cc";
import DataManager from "../Global/DataManager";
import { sortSpriteFrame } from "../Utils";
import StateMachine from "./StateMachine";

/***
 * unit:milisecond
 */
export const ANIMATION_SPEED = 1 / 10;

/***
 * 状态（每组动画的承载容器，持有SpriteAnimation组件执行播放）
 */
export default class State {
  private animationClip: AnimationClip;
  constructor(
    private fsm: StateMachine,
    private path: string,
    private wrapMode: AnimationClip.WrapMode = AnimationClip.WrapMode.Normal,
    private force: boolean = false
  ) {
    this.animationClip = new AnimationClip();

    //生成动画轨道属性
    const track = new animation.ObjectTrack();
    track.path = new animation.TrackPath().toComponent(Sprite).toProperty("spriteFrame");
    const spriteFrames = DataManager.Instance.textureMap.get(this.path);
    const frames: Array<[number, SpriteFrame]> = sortSpriteFrame(spriteFrames).map((item, index) => [index * ANIMATION_SPEED, item]);
    track.channel.curve.assignSorted(frames);

    //动画添加轨道
    // 最后将轨道添加到动画剪辑以应用
    this.animationClip.addTrack(track);
    // 设置clip的name 成为唯一标识
    this.animationClip.name = this.path

    // 整个动画剪辑的周期
    this.animationClip.duration = frames.length * ANIMATION_SPEED;
    // 设置循环播放
    this.animationClip.wrapMode = this.wrapMode
  }

  run() {
    if (this.fsm.animationComponent.defaultClip?.name === this.animationClip.name && !this.force) {
      return;
    }
    this.fsm.animationComponent.defaultClip = this.animationClip;
    this.fsm.animationComponent.play();
  }
}
