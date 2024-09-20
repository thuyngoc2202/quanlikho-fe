export class Attribute {
    id: number;
    attribute_name: string;
    attribute_parent_id: string;
    attribute_type: string;

    constructor() {
        this.id = 0;
        this.attribute_name = "";
        this.attribute_parent_id = "";
        this.attribute_type = "";
    }
}