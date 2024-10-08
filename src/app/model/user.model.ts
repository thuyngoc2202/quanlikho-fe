export class User {
    first_name: string;
    last_name: string;
    password: string;
    email: string;
    role_id: string;

    constructor(){
        this.first_name = '';
        this.last_name = '';
        this.password = '';
        this.email = '';
        this.role_id = '';
    }
}