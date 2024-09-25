export class Order {
  approved: boolean;
  id: number;
  orderBy: string
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
  product_category_id: string;
  orderId!: number;
  quantity: number;
  category_id: string;
  category_name: string;
  price: number;

  constructor() {
    this.product_name = '';
    this.product_category_id = '';
    this.quantity = 0;
    this.price = 0;
    this.category_id = '';
    this.category_name = '';
  }
}
export class OrderUser {
  full_name: string;
  email: string;
  phone_number: string;
  shipping_address: string;
  totalAmount: number;
  note: string;

  constructor() {
    this.full_name = '';
    this.email = '';
    this.phone_number = '';
    this.shipping_address = '';
    this.totalAmount = 0;
    this.note = '';
  }
}

export class PlaceOrderDetail {
  product_order_id: string;
  product_category_id: string;
  product_name: string;
  quantity: number;
  price: number;
  subtotal: number;
  
  constructor() {
    this.product_order_id = '';
    this.product_category_id = '';
    this.product_name = '';
    this.price = 0;
    this.quantity = 0;
    this.subtotal = 0;
  }
}
