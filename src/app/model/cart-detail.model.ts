export class Order {
    approved:	boolean;
    id:	number;
    orderBy:	string
    orderDetails: OrderDetails[];
    userId: number;
  
    constructor() {
      this.id = 0;
      this.approved = false;
      this.orderBy = '';
      this.orderDetails = [];
      this.userId = 0;
    }
  }
  
  export class OrderDetails {
    id!: number;
    product_name: string;
    product_id: string;
    orderId!: number;
    quantity: number;
    price : number;
  
    constructor() {
      this.product_name = '';
      this.product_id = '';
      this.quantity = 0;
      this.price = 0;
    }
  }
  