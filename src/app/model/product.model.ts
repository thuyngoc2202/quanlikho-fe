export class Product {
  product_id: string;
  product_code: string;
  bar_code: string;
  attribute_id: [];
  product_name: string;
  description_short: string;
  description_long: string;
  price: number;
  promotional_price: number;
  quantity: number;
  status: string;
  createdDate: string;
  category_id: [];

  constructor() {
    this.product_id = "";
    this.product_code = "";
    this.bar_code = "";
    this.attribute_id = [];
    this.product_name = "";
    this.description_short = "";
    this.description_long = "";
    this.price = 0;
    this.promotional_price = 0;
    this.quantity = 0;
    this.status = "";
    this.createdDate = "";
    this.category_id = [];
  }

}

