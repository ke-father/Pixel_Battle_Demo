import {API_MSG_ENUM} from "./Enum";
import {
    IApiGameStartReq, IApiGameStartRes,
    IApiPlayerJoinReq,
    IApiPlayerJoinRes,
    IApiPlayerListReq,
    IApiPlayerListRes,
    IApiRoomCreateReq,
    IApiRoomCreateRes,
    IApiRoomJoinReq,
    IApiRoomJoinRes,
    IApiRoomLeaveReq,
    IApiRoomLeaveRes,
    IApiRoomListReq,
    IApiRoomListRes,
} from "./Api";
import {IMsgClientSync, IMsgGameStart, IMsgRoom, IMsgRoomList, IMsgServerSync} from "./Msg";

export interface IModel {
    api: {
        [API_MSG_ENUM.API_PLAYER_JOIN]: {
            req: IApiPlayerJoinReq,
            res: IApiPlayerJoinRes,
        },
        [API_MSG_ENUM.API_PLAYER_LIST]: {
            req: IApiPlayerListReq,
            res: IApiPlayerListRes
        },
        [API_MSG_ENUM.API_ROOM_CREATE]: {
            req: IApiRoomCreateReq,
            res: IApiRoomCreateRes
        },
        [API_MSG_ENUM.API_ROOM_LIST]: {
            req: IApiRoomListReq,
            res: IApiRoomListRes
        },
        [API_MSG_ENUM.API_ROOM_JOIN]: {
            req: IApiRoomJoinReq,
            res: IApiRoomJoinRes
        },
        [API_MSG_ENUM.API_ROOM_LEAVE]: {
            req: IApiRoomLeaveReq,
            res: IApiRoomLeaveRes
        },
        [API_MSG_ENUM.API_GAME_START]: {
            req: IApiGameStartReq,
            res: IApiGameStartRes
        }
    }

    msg: {
        [API_MSG_ENUM.MSG_PLAYER_LIST]: IApiPlayerListRes
        [API_MSG_ENUM.MSG_CLIENT_SYNC]: IMsgClientSync
        [API_MSG_ENUM.MSG_SERVER_SYNC]: IMsgServerSync
        [API_MSG_ENUM.MSG_ROOM]: IMsgRoom
        [API_MSG_ENUM.MSG_ROOM_LIST]: IMsgRoomList
        [API_MSG_ENUM.MSG_GAME_START]: IMsgGameStart
    }
}
