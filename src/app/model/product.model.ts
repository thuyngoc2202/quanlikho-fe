export class Product {
  product_id: string;
  create_date: string;
  modify_date: string;
  keywords: [];
  product_name: string;
  newKeyword:[];

  constructor() {
    this.product_id = "";
    this.create_date = "";
    this.modify_date = "";
    this.keywords = [];
    this.newKeyword = [];

    this.product_name = "";
  }

}

