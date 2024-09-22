export class ProductCategory {
    product_category_id: string;
    product_id: string;
    product_name: string;
    category_id: string;
    quantity: number;
    min_limit: number;
    max_limit: number;
    price: number;
    create_date: string;
    modify_date: string;
    
    constructor(){
        this.product_category_id = '';
        this.product_id = '';
        this.category_id = '';
        this.product_name = '';
        this.quantity = 0;
        this.min_limit = 0;
        this.max_limit = 0;
        this.price = 0;
        this.create_date = '';
        this.modify_date = '';
    }
}