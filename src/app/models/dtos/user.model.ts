export interface User {
    id : number;
    name : string;
    lastname : string;
    birthDate : string;
    email : string;
    image ? : string;
    enabled : boolean;
}

export interface CreateUserRequest extends Omit<User, 'id' | 'image' | 'enabled'> {
    password : string;
}

export type UpdateUserRequest = Pick<User, 'name' | 'lastname' | 'birthDate'>;

export interface UpdatePasswordRequest {
    oldPassword : string;
    newPassword : string;
}

export interface DeleteUserRequest {
    password : string;
}