import Singleton from "../Base/Singleton";
import {instantiate, Node } from 'cc'
import {ENTITY_TYPE_ENUM} from "db://assets/Scripts/Common";
import DataManager from "db://assets/Scripts/Global/DataManager";

// 对象池
export default class ObjectPoolManager extends Singleton {
    static get Instance() {
        return super.GetInstance<ObjectPoolManager>();
    }

    // 对象池节点
    private objectPool: Node
    private map: Map<ENTITY_TYPE_ENUM, Node[]> = new Map()

    get (type: ENTITY_TYPE_ENUM) {
        if (!this.objectPool) {
            this.objectPool = new Node('ObjectPool')
            this.objectPool.setParent(DataManager.Instance.stage)
        }

        if (!this.map.has(type)) {
            this.map.set(type, [])
            const container = new Node(type + 'Pool')
            container.setParent(this.objectPool)
        }

        const nodes = this.map.get(type)
        if (!nodes.length) {
            const prefab = DataManager.Instance.prefabMap.get(type)
            const node = instantiate(prefab)

            node.name = type
            node.setParent(this.objectPool.getChildByName(type + 'Pool'))
            node.active = true

            return node
        } else {
            let node = nodes.pop()
            node.active = true
            return node
        }
    }

    ret (node: Node) {
        node.active = false
        this.map.get(node.name as ENTITY_TYPE_ENUM).push(node)
    }
}
