import { _decorator, resources, Asset } from "cc";
import Singleton from "../Base/Singleton";

interface IItem {
    cb: Function;
    ctx: unknown;
}

interface ICoreApiRet {
    success: boolean,
    res?: any,
    error?: Error
}

export class NetWorkManager extends Singleton {
    static get Instance() {
        return super.GetInstance<NetWorkManager>();
    }

    // 端口号
    port: 9876
    // ws socket实例
    ws: WebSocket = null!
    // 发布订阅模式
    private map: Map<string, Array<IItem>> = new Map();
    // 判断是否链接
    isConnect: boolean = false

    connect () {
        return new Promise((resolve, reject) => {
            if (this.isConnect) {
                resolve(true)
                return
            }
            this.ws = new WebSocket(`ws://localhost:9876`);
            // this.ws = new WebSocket(`ws://localhost:${this.port}`);

            this.ws.onopen = () => {
                this.isConnect = true
                resolve(true)
                console.log('连接成功')
            }

            this.ws.onclose = () => {
                this.isConnect = false
                reject(false)
                console.log('连接关闭')
            }

            this.ws.onerror = () => {
                reject(false)
                console.log('连接错误')
            }

            this.ws.onmessage = (event) => {
                try {
                    console.log('onMessage', event.data)
                    const { name, data } = JSON.parse(event.data)
                    // emit触发挂载事件
                    if (this.map.has(name)) {
                        this.map.get(name).forEach(({ cb, ctx }) => {
                            cb.apply(ctx, [data])
                        })
                    }
                } catch (e) {
                    console.log(e)
                }
            }
        })
    }

    callApi (name: string, data): Promise<ICoreApiRet> {
        return new Promise((resolve, reject) => {
            try {
                let timer = setTimeout(() => {
                    resolve({
                        success: false,
                        error: new Error('TIme out!')
                    })
                    this.unListerMsg(name, cb, null)
                }, 5000)

                const cb = (res) => {
                    resolve(res)
                    timer && clearTimeout(timer)
                    this.unListerMsg(name, cb, null)
                }

                this.listenMsg(name, cb, null)
                this.sendMsg(name, data)
            } catch (e) {
                resolve({
                    success: false,
                    error: new Error('TIme out!')
                })
            }
        })
    }

    sendMsg (name: string, data) {
        const msg = {
            name,
            data
        }
        console.log('send!' + this.ws)
        this.ws && this.ws.send(JSON.stringify(msg))
    }

    listenMsg (name: string, cb: Function, ctx: unknown) {
        if (this.map.has(name)) {
            this.map.get(name).push({ cb, ctx })
        } else {
            this.map.set(name, [{ cb, ctx }])
        }
    }

    unListerMsg (name: string, cb: Function, ctx: unknown) {
        if (this.map.has(name)) {
            const index = this.map.get(name).findIndex((i) => cb === i.cb && i.ctx === ctx);
            index > -1 && this.map.get(name).splice(index, 1);
        }
    }
}
