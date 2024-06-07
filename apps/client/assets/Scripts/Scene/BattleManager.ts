import {_decorator, Component, Node, instantiate, Prefab, SpriteFrame} from 'cc';
import EventManager from "db://assets/Scripts/Global/EventManager";
import {EVENT_ENUM, PREFAB_PATH_ENUM, TEXTURE_PATH_ENUM} from "db://assets/Scripts/Enum";
import DataManager from "db://assets/Scripts/Global/DataManager";
import {NetWorkManager} from "db://assets/Scripts/Global/NetWorkManager";
import {API_MSG_ENUM, ENTITY_TYPE_ENUM, IClientInput, INPUT_TYPE_ENUM} from "db://assets/Scripts/Common";
import {JoyStickManager} from "db://assets/Scripts/UI/JoyStickManager";
import ResourceManager from "db://assets/Scripts/Global/ResourceManager";
import ObjectPoolManager from "db://assets/Scripts/Global/ObjectPoolManager";
import ActorManager from "db://assets/Scripts/Entity/Actor/ActorManager";
import {BulletManager} from "db://assets/Scripts/Entity/Bullet/BulletManager";

const { ccclass, property } = _decorator;

@ccclass('BattleManager')
export class BattleManager extends Component {
    // 舞台节点
    private Stage: Node
    // ui节点
    private UI: Node
    // 是否加载任务完成
    private shouldUpdate = false

    async start () {
        // 清空
        this.clearGame()
        // 同步执行
        await Promise.all([
            await this.connectServer(),
            await this.loadRes()
        ])
        // 加载
        // this.initGame()
    }

    // 链接websocket
    async connectServer () {
        try {
            await NetWorkManager.Instance.connect()
        } catch (e) {
            console.log(e)
            // 1秒后重发请求
            await new Promise(rs => setTimeout(rs, 1000))
            await this.connectServer()
        }
    }

    async loadRes () {
        // 异步任务列表
        const promiseList = []
        // 获取所有需要加载的内容
        Object.keys(PREFAB_PATH_ENUM).map(type => {
            // 异步任务
            const promise = ResourceManager.Instance.loadRes(PREFAB_PATH_ENUM[type], Prefab).then((prefab) => {
                DataManager.Instance.prefabMap.set(String(type), prefab)
            })
            promiseList.push(promise)
        })

        // 获取所有需要加载的内容
        Object.keys(TEXTURE_PATH_ENUM).map(type => {
            // 异步任务
            const promise = ResourceManager.Instance.loadDir(TEXTURE_PATH_ENUM[type], SpriteFrame).then((SpriteFrames) => {
                DataManager.Instance.textureMap.set(String(type), SpriteFrames)
            })
            promiseList.push(promise)
        })
        await Promise.all(promiseList)
    }

    clearGame () {
        // 客户端数据
        EventManager.Instance.off(EVENT_ENUM.CLIENT_SYNC, this.handleClientSync, this)
        // 解绑Net监听
        NetWorkManager.Instance.unListerMsg(API_MSG_ENUM.MSG_SERVER_SYNC, this.handleServerSync, this)
        // 记录舞台
        DataManager.Instance.stage = this.Stage = this.node.getChildByName('Stage')
        // 获取摇杆
        this.UI = this.node.getChildByPath('UI/JoyStick')
        // 清空舞台
        this.Stage.destroyAllChildren()
    }

    initGame () {
        DataManager.Instance.jm = this.UI.getComponent(JoyStickManager)
        // 初始化地图
        this.initMap()
        // 是否加载完成
        this.shouldUpdate = true
        // 客户端数据
        EventManager.Instance.on(EVENT_ENUM.CLIENT_SYNC, this.handleClientSync, this)
        // 绑定Net监听
        NetWorkManager.Instance.listenMsg(API_MSG_ENUM.MSG_SERVER_SYNC, this.handleServerSync, this)
    }

    // 初始化地图
    initMap () {
        // 加载玩家预制体
        let mapPrefab = DataManager.Instance.prefabMap.get(ENTITY_TYPE_ENUM.MAP)
        // 实例化
        let map = instantiate(mapPrefab)
        // 挂载到舞台
        map.setParent(this.Stage)
    }

    update (dt) {
        if (!this.shouldUpdate) return

        this.render()
        this.tick(dt)
    }

    tick (dt: number) {
        // 调用ActorManager的tick方法
        this.tickActor(dt)

        DataManager.Instance.applyInput({
            type: INPUT_TYPE_ENUM.TIME_PAST,
            dt,
        })
    }

    tickActor (dt) {
        // 获取已存在actor
        for (const data of DataManager.Instance.state.actors) {
            const { id } = data
            let actorMap = DataManager.Instance.actorMap.get(id)
            if (actorMap) actorMap.tick(dt)
        }
    }

    render () {
        this.renderActor()
        this.renderBullet()
    }

    // 渲染玩家
    renderActor () {
        for (const data of DataManager.Instance.state.actors) {
            const { id, type } = data
            let actorMap = DataManager.Instance.actorMap.get(id)
            if (!actorMap) {
                // 加载玩家预制体
                let actorPrefab = DataManager.Instance.prefabMap.get(type)
                // 实例化
                let actor = instantiate(actorPrefab)
                // 挂载到舞台
                actor.setParent(this.Stage)
                // 动态添加脚本
                actorMap = actor.addComponent(ActorManager)
                // 存储
                DataManager.Instance.actorMap.set(id, actorMap)
                // 初始化
                actorMap.init(data)
            } else {
                actorMap.render(data)
            }
        }
    }

    // 渲染子弹
    renderBullet () {
        for (const data of DataManager.Instance.state.bullets) {
            const { id, type } = data
            let bulletMap = DataManager.Instance.bulletMap.get(id)
            if (!bulletMap) {
                // 实例化
                let bullet = ObjectPoolManager.Instance.get(type)
                // 动态添加脚本
                bulletMap = bullet?.getComponent(BulletManager) || bullet.addComponent(BulletManager)
                // 存储
                DataManager.Instance.bulletMap.set(id, bulletMap)
                // 初始化
                bulletMap.init(data)
            } else {
                bulletMap.render(data)
            }
        }
    }

    handleClientSync (input: IClientInput) {
        const msg = {
            input,
            frameId: DataManager.Instance.frameId++
        }
        NetWorkManager.Instance.sendMsg(API_MSG_ENUM.MSG_CLIENT_SYNC, msg)
    }

    handleServerSync ({ inputs }) {
        for (const input of inputs) {
            DataManager.Instance.applyInput(input)
        }
    }
}


