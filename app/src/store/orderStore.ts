export interface OrderItem {
  id: string; // unique order id
  mealKey: string; // '1031_lunch' | '1031_dinner' | '1101_lunch'
  userName: string;
  itemId: string;
  itemName: string;
  price: number;
  quantity: number;
  details?: string; // e.g. "湯底: 鮮奶湯底 / 副食: 冬粉"
  timestamp: number;
}

const STORAGE_ORDERS_KEY = 'family_trip_orders_v1';
const STORAGE_USER_KEY = 'family_trip_current_user_v1';

export function getLocalUser(): string {
  return localStorage.getItem(STORAGE_USER_KEY) || '';
}

export function setLocalUser(name: string): void {
  localStorage.setItem(STORAGE_USER_KEY, name.trim());
}

export function getOrders(): OrderItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOrders(orders: OrderItem[]): void {
  localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
  // dispatch custom event for cross-component sync
  window.dispatchEvent(new Event('orders_updated'));
}

export function addOrder(item: Omit<OrderItem, 'id' | 'timestamp'>): void {
  const current = getOrders();
  // check if matching existing item for this user & meal
  const existingIdx = current.findIndex(
    (o) =>
      o.mealKey === item.mealKey &&
      o.userName === item.userName &&
      o.itemId === item.itemId &&
      (o.details || '') === (item.details || '')
  );

  if (existingIdx >= 0) {
    current[existingIdx].quantity += item.quantity;
  } else {
    current.push({
      ...item,
      id: 'ord_' + Math.random().toString(36).substring(2, 9),
      timestamp: Date.now()
    });
  }
  saveOrders(current);
}

export function updateOrderQty(id: string, delta: number): void {
  let current = getOrders();
  const target = current.find((o) => o.id === id);
  if (!target) return;

  target.quantity += delta;
  if (target.quantity <= 0) {
    current = current.filter((o) => o.id !== id);
  }
  saveOrders(current);
}

export function removeOrder(id: string): void {
  const current = getOrders().filter((o) => o.id !== id);
  saveOrders(current);
}

export function clearMealOrders(mealKey: string): void {
  const current = getOrders().filter((o) => o.mealKey !== mealKey);
  saveOrders(current);
}
