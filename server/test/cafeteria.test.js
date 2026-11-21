import assert from 'node:assert';

const BASE_URL = 'http://localhost:5000/api';

async function runCafeteriaWorkflowTests() {
  console.log('🧪 Starting The Champions Club Cafeteria & Bar Automated Workflows Suite...\n');

  // 0. Login Admin
  const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@championsclub.com', password: 'admin123' })
  });
  const adminData = await adminLoginRes.json();
  const token = adminData.token;
  assert(token, 'Admin login returned JWT token');

  // Fetch initial menu & tables
  const menuRes = await fetch(`${BASE_URL}/bar/menu`);
  const menu = await menuRes.json();
  assert(menu.length >= 2, 'Menu contains items');

  // Reset test tables tbl_1, tbl_2, tbl_3, tbl_4 to available and close open test tabs
  const openOrdersBefore = await (await fetch(`${BASE_URL}/bar/orders?status=open`, {
    headers: { Authorization: `Bearer ${token}` }
  })).json();
  for (const o of openOrdersBefore) {
    if (['tbl_1', 'tbl_2', 'tbl_3', 'tbl_4'].includes(o.tableId)) {
      await fetch(`${BASE_URL}/bar/orders/${o.id}/settle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ paymentMethod: 'Cash' })
      });
    }
  }
  for (const tid of ['tbl_1', 'tbl_2', 'tbl_3', 'tbl_4']) {
    await fetch(`${BASE_URL}/bar/tables/${tid}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status: 'available' })
    });
  }

  const sandwich = menu.find(m => m.category === 'Food') || menu[0];
  const coffee = menu.find(m => m.category === 'Coffee') || menu[1];

  // =========================================================================
  // WORKFLOW 1: Select T1 -> add sandwich & coffee -> send to kitchen
  //             -> mark ready -> serve -> generate invoice -> pay Cash -> release table
  // =========================================================================
  console.log('--- WORKFLOW 1: Table T1 Dine-in -> Kitchen KDS -> Settle Cash -> Release Table ---');
  
  // 1.1 Create Order for Table T1
  const wf1CreateRes = await fetch(`${BASE_URL}/bar/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      tableId: 'tbl_1',
      customerName: 'Aarav Patel',
      customerType: 'walk-in',
      isTab: true,
      items: [
        { menuItemId: sandwich.id, name: sandwich.name, price: sandwich.price, quantity: 1 },
        { menuItemId: coffee.id, name: coffee.name, price: coffee.price, quantity: 1 }
      ]
    })
  });
  const wf1Create = await wf1CreateRes.json();
  assert(wf1CreateRes.status === 201, 'Workflow 1: Order created');
  const wf1Order = wf1Create.order;
  assert(wf1Order.status === 'open' && wf1Order.kitchenStatus === 'pending', 'Order is open with pending kitchen status');

  // Verify Table T1 is marked occupied
  const tablesAfterWf1 = await (await fetch(`${BASE_URL}/bar/tables`)).json();
  const t1 = tablesAfterWf1.find(t => t.id === 'tbl_1');
  assert(t1.status === 'occupied', 'Table T1 status is occupied');
  console.log('  ✓ Table T1 occupied with active order #' + wf1Order.id);

  // 1.2 Send to Kitchen -> Mark Ready
  const wf1ReadyRes = await fetch(`${BASE_URL}/bar/orders/${wf1Order.id}/kitchen-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ kitchenStatus: 'ready' })
  });
  const wf1Ready = await wf1ReadyRes.json();
  assert(wf1Ready.order.kitchenStatus === 'ready', 'Kitchen status updated to ready');
  console.log('  ✓ Kitchen status transitioned: pending -> ready');

  // 1.3 Mark Served
  const wf1ServeRes = await fetch(`${BASE_URL}/bar/orders/${wf1Order.id}/kitchen-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ kitchenStatus: 'served' })
  });
  const wf1Served = await wf1ServeRes.json();
  assert(wf1Served.order.kitchenStatus === 'served', 'Kitchen status updated to served');
  console.log('  ✓ Kitchen status transitioned: ready -> served');

  // 1.4 Settle via Cash
  const wf1SettleRes = await fetch(`${BASE_URL}/bar/orders/${wf1Order.id}/settle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ paymentMethod: 'Cash' })
  });
  const wf1Settled = await wf1SettleRes.json();
  assert(wf1SettleRes.status === 200 && wf1Settled.order.paymentStatus === 'paid', 'Order settled with Cash');
  assert(wf1Settled.invoice && wf1Settled.invoice.invoiceNumber, 'Tax invoice generated on settlement');
  console.log('  ✓ Order settled with Cash. Generated Tax Invoice #' + wf1Settled.invoice.invoiceNumber);

  // 1.5 Verify Table Released
  const tablesAfterSettle = await (await fetch(`${BASE_URL}/bar/tables`)).json();
  const t1Released = tablesAfterSettle.find(t => t.id === 'tbl_1');
  assert(t1Released.status === 'available', 'Table T1 is released back to available');
  console.log('  ✓ Table T1 automatically released and ready for seating');

  // =========================================================================
  // WORKFLOW 2: Open T2 tab -> add items -> add more items later
  //             -> settle using ₹500 Cash + ₹500 UPI -> verify split tender
  // =========================================================================
  console.log('\n--- WORKFLOW 2: Table T2 Tab -> Add Items Later -> Split Payment (Cash + UPI) ---');

  // 2.1 Open Tab on Table T2 with 1 item
  const wf2CreateRes = await fetch(`${BASE_URL}/bar/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      tableId: 'tbl_2',
      customerName: 'Karan Mehra',
      customerType: 'walk-in',
      isTab: true,
      items: [
        { menuItemId: coffee.id, name: coffee.name, price: coffee.price, quantity: 1 }
      ]
    })
  });
  const wf2Order = (await wf2CreateRes.json()).order;
  assert(wf2Order.items.length === 1, 'Tab opened with 1 coffee');

  // 2.2 Add more items later to open tab
  const wf2AddRes = await fetch(`${BASE_URL}/bar/orders/${wf2Order.id}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      items: [
        { menuItemId: sandwich.id, name: sandwich.name, price: sandwich.price, quantity: 2 }
      ]
    })
  });
  const wf2Updated = await wf2AddRes.json();
  assert(wf2Updated.order.items.length === 2 && wf2Updated.order.items.reduce((s, i) => s + i.quantity, 0) === 3, 'Open tab now has 2 line items with 3 total servings');
  const totalAmount = wf2Updated.order.total;
  console.log(`  ✓ Added 2 more items to tab #${wf2Order.id}. Updated total: ₹${totalAmount}`);

  // 2.3 Settle using split payment: ₹500 Cash + remainder UPI
  const splitCash = 500;
  const splitUpi = totalAmount - splitCash;
  const wf2SettleRes = await fetch(`${BASE_URL}/bar/orders/${wf2Order.id}/settle`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      paymentMethod: 'Split',
      payments: [
        { method: 'Cash', amount: splitCash },
        { method: 'UPI', amount: splitUpi }
      ]
    })
  });
  const wf2Settled = await wf2SettleRes.json();
  assert(wf2SettleRes.status === 200, 'Split payment settlement successful');
  assert(wf2Settled.order.payments.length === 2, 'Order records exactly 2 payment records');
  assert(wf2Settled.order.payments[0].method === 'Cash' && wf2Settled.order.payments[0].amount === splitCash, 'Record 1: ₹500 Cash');
  assert(wf2Settled.order.payments[1].method === 'UPI' && wf2Settled.order.payments[1].amount === splitUpi, `Record 2: ₹${splitUpi} UPI`);
  assert(wf2Settled.order.paymentStatus === 'paid' && wf2Settled.order.status === 'closed', 'Order fully paid and closed');
  console.log(`  ✓ Verified 2 payment records: ₹${splitCash} Cash + ₹${splitUpi} UPI. Order closed.`);

  // =========================================================================
  // WORKFLOW 3: Select Gold member -> create order -> verify 15% discount
  //             -> settle payment -> verify cafeteria revenue in Club Pulse / Finance
  // =========================================================================
  console.log('\n--- WORKFLOW 3: Gold Member 15% Discount & Finance Ledger Integration ---');

  // 3.1 Fetch initial finance metrics
  const finBefore = await (await fetch(`${BASE_URL}/finance/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  })).json();
  const barRevenueBefore = finBefore.barRevenue || 0;

  // 3.2 Place order for Gold Member MEM-2026-001 (Vikram Mehta)
  const wf3CreateRes = await fetch(`${BASE_URL}/bar/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      tableId: 'tbl_3',
      memberId: 'MEM-2026-001',
      customerName: 'Vikram Mehta',
      customerType: 'member',
      isTab: false,
      paymentMethod: 'UPI',
      items: [
        { menuItemId: sandwich.id, name: sandwich.name, price: 1000, quantity: 1 }
      ]
    })
  });
  const wf3Order = (await wf3CreateRes.json()).order;
  assert(wf3Order.subtotal === 1000, 'Subtotal is ₹1000');
  assert(wf3Order.discount === 150, '15% Gold member discount applied (₹150)');
  assert(wf3Order.tax === 43, '5% GST applied on taxable amount ₹850');
  assert(wf3Order.total === 893, 'Grand total is ₹893');
  console.log(`  ✓ Verified Gold member discount: Subtotal ₹1000 - Discount ₹150 + GST ₹43 = ₹${wf3Order.total}`);

  // 3.3 Verify finance ledger updated
  const finAfter = await (await fetch(`${BASE_URL}/finance/dashboard`, {
    headers: { Authorization: `Bearer ${token}` }
  })).json();
  const barRevenueAfter = finAfter.barRevenue || 0;
  assert(barRevenueAfter === barRevenueBefore + 893, `Cafeteria revenue updated from ${barRevenueBefore} to ${barRevenueAfter}`);
  console.log(`  ✓ Finance dashboard / Club Pulse correctly credited ₹893 to Bar Revenue`);

  // =========================================================================
  // WORKFLOW 4: Sell an item -> verify inventory deduction
  //             -> cancel order -> verify correct stock reversal
  // =========================================================================
  console.log('\n--- WORKFLOW 4: Atomic Inventory Deduction & Cancellation Restock ---');

  // 4.1 Check initial stock of an item
  const trackedItem = menu.find(m => m.trackStock) || menu[0];
  const initialStockRes = await (await fetch(`${BASE_URL}/bar/menu`)).json();
  const initialStock = initialStockRes.find(m => m.id === trackedItem.id).stock;

  // 4.2 Sell 3 units
  const sellQty = 3;
  const wf4CreateRes = await fetch(`${BASE_URL}/bar/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({
      tableId: 'tbl_4',
      customerName: 'Stock Tester',
      isTab: true,
      items: [
        { menuItemId: trackedItem.id, name: trackedItem.name, price: trackedItem.price, quantity: sellQty }
      ]
    })
  });
  const wf4Order = (await wf4CreateRes.json()).order;

  // Verify stock decreased
  const stockAfterSale = (await (await fetch(`${BASE_URL}/bar/menu`)).json()).find(m => m.id === trackedItem.id).stock;
  assert(stockAfterSale === initialStock - sellQty, `Stock deducted from ${initialStock} to ${stockAfterSale}`);
  console.log(`  ✓ Sold ${sellQty} units: Stock atomically decremented from ${initialStock} -> ${stockAfterSale}`);

  // 4.3 Cancel the order
  const wf4CancelRes = await fetch(`${BASE_URL}/bar/orders/${wf4Order.id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ reason: 'Customer changed mind', refundMethod: 'UPI' })
  });
  const wf4Cancelled = await wf4CancelRes.json();
  assert(wf4Cancelled.order.status === 'cancelled', 'Order status set to cancelled');

  // Verify stock reversed
  const stockAfterCancel = (await (await fetch(`${BASE_URL}/bar/menu`)).json()).find(m => m.id === trackedItem.id).stock;
  assert(stockAfterCancel === initialStock, `Stock reversed from ${stockAfterSale} back to ${stockAfterCancel}`);
  console.log(`  ✓ Order cancelled: Stock accurately reversed back to original ${stockAfterCancel} units`);

  // =========================================================================
  // WORKFLOW 5: Backend Persistence & MongoDB Verification
  // =========================================================================
  console.log('\n--- WORKFLOW 5: Data Persistence & Report Integrity in MongoDB ---');

  // Verify orders exist and can be queried directly
  const savedOrders = await (await fetch(`${BASE_URL}/bar/orders?status=all`, {
    headers: { Authorization: `Bearer ${token}` }
  })).json();
  assert(savedOrders.some(o => o.id === wf1Order.id), 'Workflow 1 order persisted in DB');
  assert(savedOrders.some(o => o.id === wf2Order.id), 'Workflow 2 order persisted in DB');
  assert(savedOrders.some(o => o.id === wf3Order.id), 'Workflow 3 order persisted in DB');
  assert(savedOrders.some(o => o.id === wf4Order.id), 'Workflow 4 order persisted in DB');

  // Verify Reports API compiles correctly
  const reportsRes = await fetch(`${BASE_URL}/bar/reports?period=all`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const reports = await reportsRes.json();
  assert(reports.totalRevenue > 0, 'Total revenue computed from database');
  assert(reports.popularItems.length > 0, 'Popular items computed from order items');
  console.log(`  ✓ Verified MongoDB persistence: ${savedOrders.length} orders saved. Reports generated.`);

  console.log('\n=======================================================');
  console.log('  ALL 5 CAFETERIA & BAR WORKFLOWS VERIFIED (100% PASS)');
  console.log('=======================================================');
}

runCafeteriaWorkflowTests().catch(err => {
  console.error('Workflow Test Failure:', err);
  process.exit(1);
});
