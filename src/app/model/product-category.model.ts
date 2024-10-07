export class ProductCategory {
    product_category_id: string;
    product_id: string;
    product_name: string;
    category_id: string;
    quantity: number;
    min_limit: number;
    max_limit: number;
    create_date: string;
    modify_date: string;
    keywords: string[];
    generic_name: string[];
    constructor(){
        this.product_category_id = '';
        this.product_id = '';
        this.category_id = '';
        this.product_name = '';
        this.quantity = 0;
        this.min_limit = 0;
        this.max_limit = 0;
        this.create_date = '';
        this.modify_date = '';
        this.keywords = [];
        this.generic_name = [];
    }
}