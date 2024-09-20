export class Product {
    id: string;
    code: string;
    barCode: string;
    attribute_id: [];
    product_name: string;
    shortDescription: string;
    longDescription: string;
    price: number;
    salePrice: number;
    quantity: number;
    status: string;
    createdDate: string;
    category_id: [];

  constructor() {
    this.id = "";
    this.code = "";
    this.barCode = "";
    this.attribute_id = [];
    this.product_name = "";
    this.shortDescription = "";
    this.longDescription = "";
    this.price = 0; 
    this.salePrice = 0;
    this.quantity = 0;
    this.status = "";
    this.createdDate = "";
    this.category_id = [];
  }
  
}

