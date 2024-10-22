import { API_MSG_ENUM, INPUT_TYPE_ENUM } from "./Enum";
import { strdeCode, strenCode, toFixed } from "./Utils";

const encodeActorMove = (input: any, view: DataView, index: number) => {
    view.setUint8(index++, input.type)
    view.setUint8(index++, input.id)
    view.setFloat32(index, input.direction.x)
    index += 4
    view.setFloat32(index, input.direction.y)
    index += 4
    view.setFloat32(index, input.dt)
    index += 4
}

const encodeWeaponShoot = (input: any, view: DataView, index: number) => {
    view.setUint8(index++, input.type)
    view.setUint8(index++, input.owner)
    view.setFloat32(index, input.position.x)
    index += 4
    view.setFloat32(index, input.position.y)
    index += 4
    view.setFloat32(index, input.direction.x)
    index += 4
    view.setFloat32(index, input.direction.y)
    index += 4
}

export const encodeTimePast = (input: any, view: DataView, index: number) => {
    view.setUint8(index++, input.type)
    view.setFloat32(index, input.dt)
    index += 4
}

export const binaryEncode = (name: API_MSG_ENUM, data: any): DataView => {
    if (name === API_MSG_ENUM.MSG_CLIENT_SYNC) {
        //name 1字节 + frameId 4字节 + 数据长度 n 字节
        const { frameId, input } = data
        if (input.type === INPUT_TYPE_ENUM.ACTOR_MOVE) {
            let index = 0
            const ab = new ArrayBuffer(1 + 4 + 14)
            const view = new DataView(ab)
            view.setUint8(index++, name)
            view.setUint32(index, frameId)
            index += 4
            encodeActorMove(input, view, index)
            return view
        } else if (input.type === INPUT_TYPE_ENUM.WEAPON_SHOOT) {
            let index = 0
            const ab = new ArrayBuffer(1 + 4 + 18)
            const view = new DataView(ab)
            view.setUint8(index++, name)
            view.setUint32(index, frameId)
            index += 4
            encodeWeaponShoot(input, view, index)
            return view
        } else {
            let index = 0
            const ab = new ArrayBuffer(1 + 4 + 5)
            const view = new DataView(ab)
            view.setUint8(index++, name)
            view.setUint32(index, frameId)
            index += 4
            encodeTimePast(input, view, index)
            return view
        }
    } else if (name === API_MSG_ENUM.MSG_SERVER_SYNC) {
        const { lastFrameId, inputs } = data
        let total = 0
        for (const input of inputs) {
            if (input.type === INPUT_TYPE_ENUM.ACTOR_MOVE) {
                total += 14
            } else if (input.type === INPUT_TYPE_ENUM.WEAPON_SHOOT) {
                total += 18
            } else {
                total += 5
            }
        }
        //name 1字节 + lastFrameId 4字节 + 数组长度 1字节 + 数据长度 n 字节
        const ab = new ArrayBuffer(1 + 4 + 1 + total)
        const view = new DataView(ab)
        let index = 0
        view.setUint8(index++, name)
        view.setUint32(index, lastFrameId)
        index += 4
        view.setUint8(index++, inputs.length)
        for (const input of inputs) {
            if (input.type === INPUT_TYPE_ENUM.ACTOR_MOVE) {
                encodeActorMove(input, view, index)
                index += 14
            } else if (input.type === INPUT_TYPE_ENUM.WEAPON_SHOOT) {
                encodeWeaponShoot(input, view, index)
                index += 18
            } else {
                encodeTimePast(input, view, index)
                index += 5
            }
        }
        return view
    } else {
        let index = 0
        const str = JSON.stringify(data)
        const ta = strenCode(str)
        const ab = new ArrayBuffer(ta.length + 1)
        const view = new DataView(ab)
        view.setUint8(index++, name)
        for (let i = 0; i < ta.length; i++) {
            view.setUint8(index++, ta[i])
        }
        return view
    }
}

const decodeActorMove = (view: DataView, index: number) => {
    const id = view.getUint8(index++)
    const directionX = toFixed(view.getFloat32(index))
    index += 4
    const directionY = toFixed(view.getFloat32(index))
    index += 4
    const dt = toFixed(view.getFloat32(index))
    index += 4
    const input = {
        type: INPUT_TYPE_ENUM.ACTOR_MOVE,
        id,
        direction: {
            x: directionX,
            y: directionY,
        },
        dt
    }

    return input
}

const decodeWeaponShoot = (view: DataView, index: number) => {
    const owner = view.getUint8(index++)
    const positionX = toFixed(view.getFloat32(index))
    index += 4
    const positionY = toFixed(view.getFloat32(index))
    index += 4
    const directionX = toFixed(view.getFloat32(index))
    index += 4
    const directionY = toFixed(view.getFloat32(index))
    index += 4
    const input = {
        type: INPUT_TYPE_ENUM.WEAPON_SHOOT,
        owner,
        position: {
            x: positionX,
            y: positionY,
        },
        direction: {
            x: directionX,
            y: directionY,
        },
    }
    return input
}

const decodeTimePast = (view: DataView, index: number) => {
    const dt = toFixed(view.getFloat32(index))
    index += 4
    const input = {
        type: INPUT_TYPE_ENUM.TIME_PAST,
        dt,
    }
    return input
}

export const binaryDecode = (buffer: ArrayBuffer) => {
    let index = 0
    const view = new DataView(buffer)
    const name = view.getUint8(index++)

    if (name === API_MSG_ENUM.MSG_CLIENT_SYNC) {
        const frameId = view.getUint32(index)
        index += 4
        const inputType = view.getUint8(index++)
        if (inputType === INPUT_TYPE_ENUM.ACTOR_MOVE) {
            const input = decodeActorMove(view, index)
            return {
                name,
                data: {
                    frameId,
                    input
                }
            }
        } else if (inputType === INPUT_TYPE_ENUM.WEAPON_SHOOT) {
            const input = decodeWeaponShoot(view, index)
            return {
                name,
                data: {
                    frameId,
                    input
                }
            }
        } else {
            const input = decodeTimePast(view, index)
            return {
                name,
                data: {
                    frameId,
                    input
                }
            }
        }
    } else if (name === API_MSG_ENUM.MSG_SERVER_SYNC) {
        const lastFrameId = view.getUint32(index)
        index += 4
        const len = view.getUint8(index++)
        const inputs = []
        for (let i = 0; i < len; i++) {
            const inputType = view.getUint8(index++)
            if (inputType === INPUT_TYPE_ENUM.ACTOR_MOVE) {
                inputs.push(decodeActorMove(view, index))
                index += 13
            } else if (inputType === INPUT_TYPE_ENUM.WEAPON_SHOOT) {
                inputs.push(decodeWeaponShoot(view, index))
                index += 17
            } else {
                inputs.push(decodeTimePast(view, index))
                index += 4
            }
        }
        return {
            name: API_MSG_ENUM.MSG_SERVER_SYNC,
            data: {
                lastFrameId,
                inputs
            }
        }
    } else {
        return {
            name: name,
            data: JSON.parse(strdeCode(new Uint8Array(buffer.slice(1))))
        }
    }
}
