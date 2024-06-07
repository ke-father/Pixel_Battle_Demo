import { _decorator, Component, Node, input, Input, EventTouch, Vec2, v2, UITransform } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('JoyStickManager')
export class JoyStickManager extends Component {
    private body: Node
    private stick: Node
    // body的初始位置
    private BodyDefaultPos: Vec2
    // 获取半径
    private radius: number

    // 向外输出
    input: Vec2 = Vec2.ZERO


    onLoad () {
        this.body = this.node.getChildByName('Body')
        this.stick = this.node.getChildByPath('Body/Stick')
        this.radius = this.body.getComponent(UITransform).contentSize.width / 2
        // 记录初始位置
        this.BodyDefaultPos = v2(this.body.position.x, this.body.position.y)
        // 监听触摸开始事件
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this)
        // 触摸移动事件
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this)
        // 监听触摸结束事件
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this)
    }

    onDestroy () {
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this)
    }

    onTouchStart (event: EventTouch) {
        // 获取当前点击位置
        const touchPos = event.getUILocation()
        this.body.setPosition(touchPos.x, touchPos.y)
    }

    onTouchMove (event: EventTouch) {
        const touchPos = event.getUILocation()
        // 因为stick在body中是相对位置 所以需要获得stick在body中的位置
        const newPos = v2(touchPos.x - this.body.position.x, touchPos.y - this.body.position.y)

        // 判断向量长度是否大于半径
        if (newPos.length() > this.radius) {
            newPos.multiplyScalar(this.radius / newPos.length())
        }

        // 修改坐标
        this.stick.setPosition(newPos.x, newPos.y)

        // 使用向量归一化 主要获取方向
        this.input = newPos.clone().normalize()
    }

    onTouchEnd (event: EventTouch) {
        // 恢复初始位置
        this.body.setPosition(this.BodyDefaultPos.x, this.BodyDefaultPos.y)
        this.stick.setPosition(0, 0)
        this.input = Vec2.ZERO
    }
}


