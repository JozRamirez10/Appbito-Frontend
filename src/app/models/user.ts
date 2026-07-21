import { Habit } from "./habit";

export class User {
    id ! : number;
    name ! : string;
    lastname ! : string;
    password ! : string;
    email ! : string;
    date ! : Date;
    image ! : string;
    imageProfile ? : any
}

export class UpdatePasswordRequest{
    oldPassword : string = '';
    newPassword : String = '';
}