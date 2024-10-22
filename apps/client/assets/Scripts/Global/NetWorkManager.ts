import { _decorator, resources, Asset } from "cc";
import Singleton from "../Base/Singleton";
import {IModel} from "db://assets/Scripts/Common/Model";
import {strenCode, strdeCode, API_MSG_ENUM, binaryEncode, binaryDecode} from "db://assets/Scripts/Common";

interface IItem {
    cb: Function;
    ctx: unknown;
}

interface ICoreApiRet<T> {
    success: boolean,
    res?: T,
    error?: Error
}

export class NetWorkManager extends Singleton {
    static get Instance() {
        return super.GetInstance<NetWorkManager>();
    }

    // 端口号
    port: number = 9876
    // ws socket实例
    ws: WebSocket = null!
    // 发布订阅模式
    private map: Map<API_MSG_ENUM, Array<IItem>> = new Map();
    // 判断是否链接
    isConnect: boolean = false

    connect () {
        return new Promise((resolve, reject) => {
            if (this.isConnect) {
                resolve(true)
                return
            }

            this.ws = new WebSocket(`ws://localhost:${this.port}`);
            this.ws.binaryType = 'arraybuffer'

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
                    // 二进制解码
                    const json = binaryDecode(event.data)
                    const { name, data } = json

                    // const ta = new Uint8Array(event.data)
                    // const str = strdeCode(ta)
                    // const json  = JSON.parse(str)
                    // const { name, data } = json

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

    callApi<T extends keyof IModel['api']> (name: T, data: IModel['api'][T]['req']): Promise<ICoreApiRet<IModel['api'][T]['res']>> {
        return new Promise(async (resolve, reject) => {
            try {
                let timer = setTimeout(() => {
                    resolve({
                        success: false,
                        error: new Error('TIme out!')
                    })
                    this.unListerMsg(name as any, cb, null)
                }, 5000)

                const cb = (res) => {
                    resolve(res)
                    timer && clearTimeout(timer)
                    this.unListerMsg(name as any, cb, null)
                }

                this.listenMsg(name as any, cb, null)
                await this.sendMsg(name as any, data)
            } catch (e) {
                resolve({
                    success: false,
                    error: new Error('TIme out!')
                })
            }
        })
    }

    async sendMsg<T extends keyof IModel['msg']> (name: T, data: IModel['msg'][T]) {
        const msg = {
            name,
            data
        }

        // 编码 二进制压缩
        const da = binaryEncode(name, data)
        this.ws && this.ws.send(da.buffer)
        // // 使用二进制编码压缩数据
        // const str = JSON.stringify(msg)
        // // 转为unit8Array数组
        // const ta = strenCode(str)
        // // 创建ArrayBuffer数组 需要规定长度
        // const ab = new ArrayBuffer(ta.length)
        // // 创建dataView
        // const da = new DataView(ab)
        // // 循环添加每一项
        // for (let index = 0; index < ta.length; index++) {
        //     da.setUint8(index, ta[index])
        // }
        // this.ws && this.ws.send(da.buffer)
    }

    listenMsg<T extends keyof IModel['msg']> (name: T, cb: (args: IModel['msg'][T]) => void, ctx: unknown) {
        if (this.map.has(name)) {
            this.map.get(name).push({ cb, ctx })
        } else {
            this.map.set(name, [{ cb, ctx }])
        }
    }

    unListerMsg<T extends keyof IModel['msg']> (name: T, cb: (args: IModel['msg'][T]) => void, ctx: unknown) {
        if (this.map.has(name)) {
            const index = this.map.get(name).findIndex((i) => cb === i.cb && i.ctx === ctx);
            index > -1 && this.map.get(name).splice(index, 1);
        }
    }
}
