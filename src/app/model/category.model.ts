export class Category {
    category_id: string;
    category_name: string;
    min_quantity: number;
    modify_date: string;

    constructor() {
        this.category_id = "";
        this.category_name = "";
        this.modify_date = "";
        this.min_quantity = 0;
    }
}