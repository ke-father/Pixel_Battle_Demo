import {ENTITY_TYPE_ENUM, INPUT_TYPE_ENUM} from "./Enum";

export interface IVec2 {
    x: number
    y: number
}

export interface IActor {
    id: number
    hp: number
    position: IVec2
    direction: IVec2
    type: ENTITY_TYPE_ENUM
    weaponType: ENTITY_TYPE_ENUM
    bulletType: ENTITY_TYPE_ENUM
}

export interface IBullet {
    id: number
    owner: number
    position: IVec2
    direction: IVec2
    type: ENTITY_TYPE_ENUM
}

export interface IState {
    actors: IActor[],
    bullets: IBullet[],
    nextBulletId: number
}

export type IClientInput = IActorMove | IWeaponShoot | ITimePast

export interface IActorMove {
    id: number,
    type: INPUT_TYPE_ENUM.ACTOR_MOVE,
    direction: IVec2,
    dt: number
}

export interface IWeaponShoot {
    owner: number,
    type: INPUT_TYPE_ENUM.WEAPON_SHOOT,
    position: IVec2,
    direction: IVec2
}

export interface ITimePast {
    type: INPUT_TYPE_ENUM.TIME_PAST,
    dt: number
}
