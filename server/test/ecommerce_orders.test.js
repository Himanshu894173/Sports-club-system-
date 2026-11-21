import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function runEcommerceTestSuite() {
  console.log('🧪 Starting The Champions Club E-Commerce Order Management Test Suite...\n');

  try {
    // 1. Authenticate Admin and Member
    console.log('--- 1. Authentication for Testing ---');
    const adminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@championsclub.com', password: 'admin123' })
    });
    const adminData = await adminRes.json();
    assert(adminRes.status === 200 && adminData.token, 'Admin logged in');
    const adminToken = adminData.token;

    const memberRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'member@championsclub.com', password: 'member123' })
    });
    const memberData = await memberRes.json();
    assert(memberRes.status === 200 && memberData.token, 'Member logged in');
    const memberToken = memberData.token;
    console.log('  ✓ PASS: Admin and Member tokens acquired');

    // 2. Locate Product for Ordering
    console.log('\n--- 2. Product Catalog Inspection ---');
    const prodsRes = await fetch(`${BASE_URL}/products`);
    const prods = await prodsRes.json();
    const testProd = prods.find(p => p.stock >= 5) || prods[0];
    assert(testProd, 'Found test product in catalog');
    const initialStock = testProd.stock;
    console.log(`  ✓ PASS: Selected product '${testProd.name}' (SKU: ${testProd.sku}, Price: Rs. ${testProd.price}, Stock: ${initialStock})`);

    // 3. Place Home Delivery Order (Subtotal < Rs. 2000 -> Rs. 100 Delivery Charge)
    console.log('\n--- 3. Order Placement & ID Generation ---');
    const orderPayload = {
      items: [{
        productId: testProd.id,
        name: testProd.name,
        price: testProd.price,
        quantity: 1
      }],
      fulfillmentType: 'Home Delivery',
      deliveryAddress: 'Flat 402, Sea Green Apartments, Worli, Mumbai 400018',
      shippingAddress: {
        name: 'Vikram Mehta',
        phone: '+91 98765 11111',
        addressLine: 'Flat 402, Sea Green Apartments, Worli',
        city: 'Mumbai',
        state: 'Maharashtra',
        postalCode: '400018'
      },
      paymentMethod: 'UPI'
    };

    const placeRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify(orderPayload)
    });
    const placeData = await placeRes.json();
    assert(placeRes.status === 201, `Order placement returned 201: ${JSON.stringify(placeData)}`);
    const createdOrder = placeData.order;

    // Verify Unique Order ID Format: TCC-YYYYMMDD-XXXXXX
    const orderIdRegex = /^TCC-\d{8}-\d{6}$/;
    assert(orderIdRegex.test(createdOrder.orderId), `Order ID '${createdOrder.orderId}' matches format TCC-YYYYMMDD-XXXXXX`);
    assert(createdOrder.id === createdOrder.orderId, 'Order id matches orderId for compatibility');
    assert(createdOrder.orderStatus === 'Placed', `Initial status is 'Placed', received '${createdOrder.orderStatus}'`);
    assert(createdOrder.statusHistory.length >= 1, 'Initial statusHistory entry created');
    console.log(`  ✓ PASS: Order created with ID: ${createdOrder.orderId} (Status: ${createdOrder.orderStatus})`);

    // Verify Atomic Stock Deduction
    const checkStockRes = await fetch(`${BASE_URL}/products/${testProd.id}`);
    const checkStockData = await checkStockRes.json();
    assert(checkStockData.stock === initialStock - 1, `Stock atomically decremented from ${initialStock} to ${checkStockData.stock}`);
    console.log(`  ✓ PASS: Inventory atomically decremented from ${initialStock} to ${checkStockData.stock}`);

    // 4. Retrieve Order by Order ID
    console.log('\n--- 4. Order Confirmation & Retrieval ---');
    const getOrderRes = await fetch(`${BASE_URL}/orders/${createdOrder.orderId}`);
    const fetchedOrder = await getOrderRes.json();
    assert(getOrderRes.status === 200, 'Order successfully retrieved by Order ID');
    assert(fetchedOrder.orderId === createdOrder.orderId, 'Retrieved order matches requested ID');
    assert(fetchedOrder.items[0].sku === testProd.sku, 'Order items enriched with SKU');
    console.log(`  ✓ PASS: Retrieved order details with items, destination, and invoice reference: ${fetchedOrder.invoiceReference}`);

    // 5. Member My Orders List
    console.log('\n--- 5. Customer My Orders Listing ---');
    const myOrdersRes = await fetch(`${BASE_URL}/orders/my-orders`, {
      headers: { Authorization: `Bearer ${memberToken}` }
    });
    const myOrders = await myOrdersRes.json();
    if (!Array.isArray(myOrders)) {
      console.log('myOrders status:', myOrdersRes.status, 'body:', myOrders);
    }
    assert(Array.isArray(myOrders), 'My orders returns an array');
    const foundInMyOrders = myOrders.some(o => (o.orderId || o.id) === createdOrder.orderId);
    assert(foundInMyOrders, 'Newly placed order is present in member My Orders');
    console.log(`  ✓ PASS: Member has ${myOrders.length} orders in history; newly created order found`);

    // 6. Visual Order Tracking Timeline
    console.log('\n--- 6. Visual Order Tracking Timeline ---');
    const trackingRes = await fetch(`${BASE_URL}/orders/${createdOrder.orderId}/tracking`);
    const tracking = await trackingRes.json();
    assert(trackingRes.status === 200, 'Tracking endpoint returned 200');
    assert(tracking.stages && tracking.stages.length === 7, 'Home Delivery tracking has 7 stages');
    assert(tracking.stages[0].state === 'current' || tracking.stages[0].state === 'completed', 'Stage 1 (Placed) is current/completed');
    console.log(`  ✓ PASS: Tracking timeline stages verified: ${tracking.stages.map(s => s.key).join(' -> ')}`);

    // 7. Admin Order Lifecycle Progression
    console.log('\n--- 7. Admin Order Lifecycle & Shipment Assignment ---');
    // Confirm Order
    const confirmRes = await fetch(`${BASE_URL}/orders/${createdOrder.orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Confirmed', note: 'Order confirmed and inventory locked.' })
    });
    const confirmData = await confirmRes.json();
    assert(confirmData.order.orderStatus === 'Confirmed', 'Order status moved to Confirmed');

    // Packing
    await fetch(`${BASE_URL}/orders/${createdOrder.orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Packed', note: 'Packed in Club Pro Box.' })
    });

    // Shipping with Carrier & Tracking Reference
    const shipRes = await fetch(`${BASE_URL}/orders/${createdOrder.orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        status: 'Shipped',
        carrierName: 'BlueDart Express',
        trackingNumber: 'BLU-2026-992145',
        note: 'Dispatched via BlueDart Express courier.'
      })
    });
    const shipData = await shipRes.json();
    assert(shipData.order.orderStatus === 'Shipped', 'Order status is Shipped');
    assert(shipData.order.carrierName === 'BlueDart Express', 'Carrier name recorded');
    assert(shipData.order.shipmentReference === 'BLU-2026-992145', 'Tracking number recorded');
    console.log(`  ✓ PASS: Order transitioned Placed -> Confirmed -> Packed -> Shipped (${shipData.order.carrierName} ${shipData.order.shipmentReference})`);

    // 8. Order Cancellation & Stock Restoration on New Order
    console.log('\n--- 8. Customer Order Cancellation & Inventory Restoration ---');
    // Place a 2nd order to test customer cancellation
    const cancelTestOrderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({
        items: [{
          productId: testProd.id,
          name: testProd.name,
          price: testProd.price,
          quantity: 2
        }],
        fulfillmentType: 'Front Desk Pickup',
        paymentMethod: 'UPI'
      })
    });
    const cancelTestData = await cancelTestOrderRes.json();
    const orderToCancel = cancelTestData.order;
    const stockBeforeCancel = (await (await fetch(`${BASE_URL}/products/${testProd.id}`)).json()).stock;

    // Cancel the order with reason
    const cancelReq = await fetch(`${BASE_URL}/orders/${orderToCancel.orderId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({ reason: 'Ordered wrong racket grip size by mistake.' })
    });
    const cancelResp = await cancelReq.json();
    assert(cancelReq.status === 200, `Cancel returned 200: ${JSON.stringify(cancelResp)}`);
    assert(cancelResp.order.orderStatus === 'Cancelled', 'Order status updated to Cancelled');
    assert(cancelResp.order.cancellationReason.includes('wrong racket grip size'), 'Cancellation reason persisted');
    assert(cancelResp.order.refundStatus === 'requested', 'Refund status marked requested');

    // Verify stock restored
    const stockAfterCancel = (await (await fetch(`${BASE_URL}/products/${testProd.id}`)).json()).stock;
    assert(stockAfterCancel === stockBeforeCancel + 2, `Inventory restored atomically by +2 (${stockBeforeCancel} -> ${stockAfterCancel})`);
    console.log(`  ✓ PASS: Order #${orderToCancel.orderId} cancelled; 2 units atomically restored to inventory (${stockBeforeCancel} -> ${stockAfterCancel})`);

    // 9. Admin Refund Processing
    console.log('\n--- 9. Admin Refund & Finance Ledger Integration ---');
    const refundRes = await fetch(`${BASE_URL}/orders/${orderToCancel.orderId}/refund`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        refundAmount: orderToCancel.total,
        refundReference: 'REF-HDFC-998822',
        note: 'Refund disbursed to customer UPI VPA'
      })
    });
    const refundData = await refundRes.json();
    assert(refundRes.status === 200, 'Refund returned 200');
    assert(refundData.order.refundStatus === 'refunded', 'Order refundStatus is refunded');
    assert(refundData.order.refundReference === 'REF-HDFC-998822', 'Refund reference recorded');
    console.log(`  ✓ PASS: Refund processed for Rs. ${orderToCancel.total}; reference ${refundData.order.refundReference}`);

    // 10. Printable Invoice Endpoint
    console.log('\n--- 10. Structured Printable Tax Invoice ---');
    const invRes = await fetch(`${BASE_URL}/orders/${createdOrder.orderId}/invoice`);
    const invData = await invRes.json();
    assert(invRes.status === 200, 'Invoice endpoint returned 200');
    assert(invData.clubInfo.gstin === '27AAAAA0000A1Z5', 'Club GSTIN verified on tax invoice');
    assert(invData.order.items.length > 0, 'Items listed on tax invoice');
    console.log(`  ✓ PASS: Printable tax invoice generated with club GSTIN, breakdown, and reference: ${invData.invoiceReference}`);

    // 11. Admin Orders Listing & KPIs
    console.log('\n--- 11. Admin Orders Dashboard & KPIs ---');
    const adminOrdersRes = await fetch(`${BASE_URL}/orders?limit=50`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const adminOrdersData = await adminOrdersRes.json();
    assert(adminOrdersData.orders && Array.isArray(adminOrdersData.orders), 'Admin orders list returned array of orders');
    assert(adminOrdersData.kpi, 'Admin KPI object returned');
    assert(adminOrdersData.kpi.totalOrders >= 2, 'KPI includes total orders');
    assert(typeof adminOrdersData.kpi.totalRevenue === 'number', 'KPI total revenue is a number');
    console.log(`  ✓ PASS: Admin orders list retrieved (${adminOrdersData.orders.length} orders, total revenue: Rs. ${adminOrdersData.kpi.totalRevenue})`);

    // 12. Soft Delete / Archival
    console.log('\n--- 12. Order Archival (Soft Delete) ---');
    const archiveRes = await fetch(`${BASE_URL}/orders/${orderToCancel.orderId}/archive`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(archiveRes.status === 200, 'Archive returned 200');

    // Verify archived order is excluded from normal listing
    const checkArchivedRes = await fetch(`${BASE_URL}/orders?search=${orderToCancel.orderId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const checkArchivedData = await checkArchivedRes.json();
    assert(checkArchivedData.orders.length === 0, 'Archived order is excluded from active orders list');
    console.log(`  ✓ PASS: Order #${orderToCancel.orderId} soft-deleted/archived successfully and hidden from active views`);

    console.log('\n=======================================================');
    console.log('  ALL 12 E-COMMERCE ORDER MANAGEMENT WORKFLOWS VERIFIED (100% PASS)');
    console.log('=======================================================\n');

  } catch (err) {
    console.error('❌ E-Commerce Test Failed:', err);
    process.exit(1);
  }
}

runEcommerceTestSuite();
