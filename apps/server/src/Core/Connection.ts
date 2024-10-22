import {MyServer} from "./MyServer";
import {WebSocket} from "ws";
import EventEmitter from "stream";
import {API_MSG_ENUM, binaryDecode, binaryEncode, IModel, strdeCode, strenCode} from "../Common";
import {bufferToArrayBuffer} from "../Utils";

interface IItem {
    cb: Function;
    ctx: unknown;
}

export class Connection extends EventEmitter {
    // 发布订阅模式
    private messageMap: Map<API_MSG_ENUM, Array<IItem>> = new Map();

    constructor(private server: MyServer, private ws: WebSocket) {
        super()

        this.ws.on('close', () => {
            this.emit('close')
        })

        this.ws.on('message', (buffer: Buffer) => {
            // const ta = new Uint8Array(buffer)
            // const str = strdeCode(ta)
            // const {name, data } = JSON.parse(str)

            try {
                const json = binaryDecode(bufferToArrayBuffer(buffer))
                const { name, data } = json

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
                        this.messageMap.get(name).forEach(({cb, ctx}) => cb.call(ctx, this, data))
                    }
                }
            } catch (e) {
                console.log(e)
            }
        })
    }

    sendMsg<T extends keyof IModel['msg']> (name: T, data: IModel['msg'][T]) {
        const msg = {
            name,
            data
        }

        const da = binaryEncode(name, data)
        const buffer = Buffer.from(da.buffer)
        this.ws && this.ws.send(buffer)

        // // 使用二进制编码压缩数据
        // const str = JSON.stringify(msg)
        // // 转为unit8Array数组
        // const ta = strenCode(str)
        // const buffer = Buffer.from(ta)
        // // 传输buffer数据
        // this.ws && this.ws.send(buffer)
    }

    listenMsg<T extends keyof IModel['msg']> (name: T, cb: (connection: Connection, args: IModel['msg'][T]) => void, ctx: unknown) {
        if (this.messageMap.has(name)) {
            this.messageMap.get(name).push({cb, ctx})
        } else {
            this.messageMap.set(name, [{cb, ctx}])
        }
    }

    unListerMsg<T extends keyof IModel['msg']> (name: T, cb: (connection: Connection, args: IModel['msg'][T]) => void, ctx: unknown) {
        if (this.messageMap.has(name)) {
            const index = this.messageMap.get(name).findIndex((i) => cb === i.cb && i.ctx === ctx);
            index > -1 && this.messageMap.get(name).splice(index, 1);
        }
    }
}
