export interface OrderBookEntry {
  price: number;
  quantity: number;
}

export interface OrderBook {
  lastUpdateId: number;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

export interface OrderWall {
  price: number;
  quantity: number;
  type: 'bid' | 'ask';
}
