import { SpriteFrame } from "cc";

const INDEX_REG = /\((\d+)\)/;

const getNumberWithinString = (str: string) => parseInt(str.match(INDEX_REG)?.[1] || "0");

export const sortSpriteFrame = (spriteFrame: Array<SpriteFrame>) =>
  spriteFrame.sort((a, b) => getNumberWithinString(a.name) - getNumberWithinString(b.name));


export const radianToAngle = (radian: number) => radian * 180 / Math.PI

// 深克隆
export const deepClone = (obj: any) => {
    if (typeof obj !== 'object' || obj === null) return obj

    const res = Array.isArray(obj) ? [] : {}

    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            res[key] = deepClone(obj[key])
        }
    }

    return res
}

// 生成种子
export const randomBySeed = (seed: number) => {
    return (seed * 9301 + 49297) % 233280
}
