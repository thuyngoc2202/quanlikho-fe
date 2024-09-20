export class Category {
    category_id: string;
    category_name: string;
    category_parent_id: string;
    category_type: string;
    display_status: string;
    display_position: number;

    constructor() {
        this.category_id = "";
        this.category_name = "";
        this.category_parent_id = "";
        this.category_type = "";
        this.display_status = "";
        this.display_position = 0;
    }
}