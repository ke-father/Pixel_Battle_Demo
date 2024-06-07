export enum FsmParamTypeEnum {
  Number = "Number",
  Trigger = "Trigger",
}

export enum ParamsNameEnum {
  Idle = "Idle",
  Run = "Run",
  Attack = "Attack",
}

export enum EVENT_ENUM {
  WEAPON_SHOOT = "weaponShoot",
  EXPLOSION_BORN= "explosionBorn",
  BULLET_BORN = "bulletBorn",
  CLIENT_SYNC = 'clientSync',
}

export const PREFAB_PATH_ENUM = {
  Map: 'Prefab/Map',
  Actor1: 'Prefab/Actor',
  Weapon1: 'Prefab/Weapon1',
  Bullet2: 'Prefab/Bullet2',
  Explosion: 'Prefab/Explosion',
}

export enum ENTITY_STATE_ENUM {
  Idle = "Idle",
  Run = "Run",
  Attack = "Attack",
}

export enum TEXTURE_PATH_ENUM {
  Actor1Idle = 'texture/actor/actor1/idle',
  Actor1Run = 'texture/actor/actor1/run',
  Weapon1Idle = 'texture/weapon/weapon1/idle',
  Weapon1Attack = 'texture/weapon/weapon1/attack',
  Bullet2Idle = 'texture/bullet/bullet2',
  ExplosionIdle = 'texture/explosion',
}
