import Singleton from "../Base/Singleton";
import { EVENT_ENUM } from "../Enum";

interface IItem {
  cb: Function;
  ctx: unknown;
}

export default class EventManager extends Singleton {
  static get Instance() {
    return super.GetInstance<EventManager>();
  }

  private map: Map<EVENT_ENUM, Array<IItem>> = new Map();

  on(event: EVENT_ENUM, cb: Function, ctx: unknown) {
    if (this.map.has(event)) {
      this.map.get(event).push({ cb, ctx });
    } else {
      this.map.set(event, [{ cb, ctx }]);
    }
  }

  off(event: EVENT_ENUM, cb: Function, ctx: unknown) {
    if (this.map.has(event)) {
      const index = this.map.get(event).findIndex((i) => cb === i.cb && i.ctx === ctx);
      index > -1 && this.map.get(event).splice(index, 1);
    }
  }

  emit(event: EVENT_ENUM, ...params: unknown[]) {
    if (this.map.has(event)) {
      this.map.get(event).forEach(({ cb, ctx }) => {
        cb.apply(ctx, params);
      });
    }
  }

  clear() {
    this.map.clear();
  }
}
