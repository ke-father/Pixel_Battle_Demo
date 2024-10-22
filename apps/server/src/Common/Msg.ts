import {IClientInput, IState} from "./State";
import {IRoom} from "./Api";

export interface IMsgClientSync {
    input: IClientInput
    frameId: number
}

export interface IMsgServerSync {
    inputs: IClientInput[]
    lastFrameId: number
}

export interface IMsgRoomList {
    list: IRoom[]
}

export interface IMsgRoom {
    room: IRoom
}

export interface IMsgGameStart {
    state: IState
}
