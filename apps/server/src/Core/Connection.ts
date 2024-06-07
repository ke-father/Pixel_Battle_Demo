import {MyServer} from "./MyServer";
import {WebSocket} from "ws";
import EventEmitter from "stream";

interface IItem {
    cb: Function;
    ctx: unknown;
}

export class Connection extends EventEmitter {
    // 发布订阅模式
    private messageMap: Map<string, Array<IItem>> = new Map();

    constructor(private server: MyServer, private ws: WebSocket) {
        super()

        this.ws.on('close', () => {
            this.emit('close')
        })

        this.ws.on('message', (buffer) => {
            try {
                const {name, data } = JSON.parse(buffer.toString())
                if (this.server.ApiMap.has(name)) {
                    try {
                        const cb = this.server.ApiMap.get(name)
                        const res = cb.call(null, this, data)
                        this.sendMsg(name, {
                            success: true,
                            res
                        })
                    } catch (e) {
                        this.sendMsg(name, {
                            success: false,
                            error: e.message
                        })
                    }
                } else {
                    if (this.messageMap.has(name)) {
                        this.messageMap.get(name).forEach(({cb, ctx}) => {
                            cb.apply(ctx, data)
                        })
                    }
                }
            } catch (e) {
                console.log(e)
            }
        })
    }

    sendMsg(name: string, data) {
        const msg = {
            name,
            data
        }
        this.ws && this.ws.send(JSON.stringify(msg))
    }

    listenMsg(name: string, cb: Function, ctx: unknown) {
        if (this.messageMap.has(name)) {
            this.messageMap.get(name).push({cb, ctx})
        } else {
            this.messageMap.set(name, [{cb, ctx}])
        }
    }

    unListerMsg(name: string, cb: Function, ctx: unknown) {
        if (this.messageMap.has(name)) {
            const index = this.messageMap.get(name).findIndex((i) => cb === i.cb && i.ctx === ctx);
            index > -1 && this.messageMap.get(name).splice(index, 1);
        }
    }
}
