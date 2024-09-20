export class Category {
    id: string;
    category_name: string;
    category_parent_id: string;
    catagory_type: string;
    display_status: string;
    display_position: number;

    constructor() {
        this.id = "";
        this.category_name = "";
        this.category_parent_id = "";
        this.catagory_type = "";
        this.display_status = "";
        this.display_position = 0;
    }
}