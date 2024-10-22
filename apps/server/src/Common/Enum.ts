export enum INPUT_TYPE_ENUM {
    ACTOR_MOVE,
    WEAPON_SHOOT,
    TIME_PAST
}

export enum ENTITY_TYPE_ENUM {
    ACTOR1 = 'Actor1',
    MAP = 'Map',
    WEAPON1 = 'Weapon1',
    Bullet1 = 'Bullet1',
    Bullet2 = 'Bullet2',
    EXPLOSION = 'Explosion'
}

export enum API_MSG_ENUM {
    API_PLAYER_JOIN,
    API_PLAYER_LIST,
    API_ROOM_LIST,
    API_ROOM_CREATE,
    API_ROOM_JOIN,
    API_ROOM_LEAVE,
    API_GAME_START,
    MSG_ROOM,
    MSG_GAME_START,
    MSG_ROOM_LIST,
    MSG_PLAYER_LIST,
    MSG_CLIENT_SYNC,
    MSG_SERVER_SYNC,
}
