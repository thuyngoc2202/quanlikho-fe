export class Product {
  product_id: string;
  system_name: string;
  create_date: string;
  modify_date: string;
  keywords: [];
  product_name: string;
  newKeyword: [];
  generic_names: [];
  newGenericName: [];

  constructor() {
    this.product_id = "";
    this.system_name = "";
    this.create_date = "";
    this.modify_date = "";
    this.keywords = [];
    this.newKeyword = [];
    this.generic_names = [];
    this.newGenericName = [];
    this.product_name = "";
  }

}

