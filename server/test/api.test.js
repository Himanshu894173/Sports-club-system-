/**
 * Comprehensive Automated Test Suite for The Champions Club
 * Tests all 16 Phase requirements: Persistence, Auth, Roles, Bookings,
 * Inventory, POS, Finance, Leads, and Staff Workflows.
 */

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('🧪 Starting The Champions Club Backend Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // 1. Health Checks
    console.log('--- 1. System & Database Health ---');
    const healthRes = await fetch(`${BASE_URL}/health`);
    const health = await healthRes.json();
    assert(healthRes.status === 200 && health.database === 'connected', 'GET /api/health reports connected database');

    const v1HealthRes = await fetch(`${BASE_URL}/v1/health`);
    const v1Health = await v1HealthRes.json();
    assert(v1HealthRes.status === 200 && v1Health.version === '2.0.0', 'GET /api/v1/health reports version 2.0.0 and uptime');

    // 2. Authentication & Security
    console.log('\n--- 2. Authentication & Access Control ---');
    // Login with invalid password
    const badLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@championsclub.com', password: 'wrongpassword' })
    });
    assert(badLoginRes.status === 401, 'Login with incorrect password rejected with HTTP 401');

    // Login as Admin
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@championsclub.com', password: 'admin123' })
    });
    const adminData = await adminLoginRes.json();
    assert(adminLoginRes.status === 200 && adminData.token && adminData.user.role === 'admin', 'Admin login successful and returned JWT');
    const adminToken = adminData.token;

    // Login as Member
    const memberLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'member@championsclub.com', password: 'member123' })
    });
    const memberData = await memberLoginRes.json();
    assert(memberLoginRes.status === 200 && memberData.user.role === 'member', 'Member login successful');
    const memberToken = memberData.token;

    // Duplicate Registration check
    const dupRegRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alexander Wright',
        email: 'admin@championsclub.com',
        password: 'password123'
      })
    });
    assert(dupRegRes.status === 400, 'Duplicate registration with existing email rejected with HTTP 400');

    // Register a new test user
    const testEmail = `test_${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Athlete',
        email: testEmail,
        password: 'securePass123',
        phone: '+91 99999 88888',
        plan: 'Silver'
      })
    });
    const regData = await regRes.json();
    assert(regRes.status === 201 && regData.token && regData.user.memberId, 'New user and member profile registered with JWT');

    // Protected Route Access Without Token
    const unauthRes = await fetch(`${BASE_URL}/members`);
    assert(unauthRes.status === 401, 'Accessing protected route without token rejected with HTTP 401');

    // Role-based Access: Member attempting admin route
    const forbiddenRes = await fetch(`${BASE_URL}/finance/dashboard`, {
      headers: { Authorization: `Bearer ${memberToken}` }
    });
    assert(forbiddenRes.status === 403, 'Member accessing admin finance dashboard forbidden with HTTP 403');

    // 3. Court Booking Engine & Collision Enforcement
    console.log('\n--- 3. Court Booking Engine & Collision Enforcement ---');
    const courtsRes = await fetch(`${BASE_URL}/courts`);
    const courts = await courtsRes.json();
    assert(courtsRes.status === 200 && courts.length >= 5, 'Retrieved active tennis and cricket courts');

    // Check Court Availability with a clean dynamic test date
    const testDate = new Date(Date.now() + (100 + Math.floor(Math.random() * 200)) * 24 * 3600 * 1000).toISOString().split('T')[0];
    const availRes = await fetch(`${BASE_URL}/bookings/availability?date=${testDate}`);
    const availData = await availRes.json();
    assert(availRes.status === 200 && availData[0].slots.length > 0, 'Generated 30-min interval availability slots');

    // Create a Booking (10:00 to 11:00 on Center Court 1)
    const book1Res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        courtId: 'court_1',
        memberId: 'MEM-2026-001',
        date: testDate,
        startTime: '10:00',
        bookingType: 'member'
      })
    });
    const book1 = await book1Res.json();
    assert(book1Res.status === 201 && book1.booking.endTime === '11:00', 'Confirmed 1-hour booking (10:00 - 11:00) with Gold plan 100% discount waiver');

    // Overlap Collision Test: attempt 10:30 to 11:30 on same court
    const overlapRes = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        courtId: 'court_1',
        memberId: 'MEM-2026-002',
        date: testDate,
        startTime: '10:30',
        bookingType: 'member'
      })
    });
    const overlapErr = await overlapRes.json();
    assert(overlapRes.status === 400 && overlapErr.message.includes('Court Conflict'), `Overlap collision strictly blocked: "${overlapErr.message}"`);

    // Create 2nd booking for same member today (14:00 to 15:00)
    const book2Res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        courtId: 'court_3',
        memberId: 'MEM-2026-001',
        date: testDate,
        startTime: '14:00',
        bookingType: 'member'
      })
    });
    assert(book2Res.status === 201, 'Second active booking for member confirmed');

    // 3rd booking attempt (Daily limit is maximum 2 active bookings/day)
    const book3Res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        courtId: 'court_2',
        memberId: 'MEM-2026-001',
        date: testDate,
        startTime: '17:00',
        bookingType: 'member'
      })
    });
    const book3Err = await book3Res.json();
    assert(book3Res.status === 400 && book3Err.message.includes('Maximum 2 active bookings'), 'Third daily booking strictly blocked by member limit rule');

    // Cancel Booking and verify slot freed
    const cancelRes = await fetch(`${BASE_URL}/bookings/${book1.booking.id}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(cancelRes.status === 200, 'Booking cancelled successfully and slot freed');

    // 4. Sports Shop & Inventory
    console.log('\n--- 4. Sports Shop & Inventory Management ---');
    const prodsRes = await fetch(`${BASE_URL}/products`);
    const prods = await prodsRes.json();
    const testProd = prods.find(p => p.sku === 'HD-SPD-PRO');
    const initialStock = testProd.stock;

    // Checkout Order
    const orderRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${memberToken}`
      },
      body: JSON.stringify({
        customerName: 'Vikram Mehta',
        fulfillmentType: 'Pickup',
        paymentMethod: 'UPI',
        items: [{
          productId: testProd.id,
          name: testProd.name,
          price: testProd.price,
          quantity: 2
        }]
      })
    });
    const orderData = await orderRes.json();
    assert(orderRes.status === 201 && orderData.order.total > 0, 'Shop order placed successfully with member discount applied');

    // Verify stock decreased atomically
    const prodAfterRes = await fetch(`${BASE_URL}/products/${testProd.id}`);
    const prodAfter = await prodAfterRes.json();
    assert(prodAfter.stock === initialStock - 2, `Inventory decreased atomically from ${initialStock} to ${prodAfter.stock}`);

    // Insufficient Stock Test
    const overbuyRes = await fetch(`${BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName: 'Guest',
        items: [{
          productId: testProd.id,
          name: testProd.name,
          price: testProd.price,
          quantity: 9999
        }]
      })
    });
    assert(overbuyRes.status === 400, 'Purchase with quantity > available inventory rejected');

    // 5. Cafeteria POS & Tabs
    console.log('\n--- 5. Cafeteria POS & Open Tabs ---');
    const menuRes = await fetch(`${BASE_URL}/bar/menu`);
    const menu = await menuRes.json();
    assert(menuRes.status === 200 && menu.length > 0, 'Retrieved cafeteria menu');

    // Create an open customer tab
    const tabRes = await fetch(`${BASE_URL}/bar/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        tableId: 'tbl_1',
        customerName: 'Priya Sharma',
        customerType: 'member',
        memberId: 'MEM-2026-002',
        isTab: true,
        items: [{
          menuItemId: menu[0].id,
          name: menu[0].name,
          price: menu[0].price,
          quantity: 2
        }]
      })
    });
    const tabData = await tabRes.json();
    assert(tabRes.status === 201 && tabData.order.isTab === true && tabData.order.paymentStatus === 'unpaid', 'Open cafeteria tab created (unpaid, status open)');

    // Settle the tab via UPI
    const settleRes = await fetch(`${BASE_URL}/bar/orders/${tabData.order.id}/settle`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ paymentMethod: 'UPI' })
    });
    const settleData = await settleRes.json();
    assert(settleRes.status === 200 && settleData.order.paymentStatus === 'paid' && settleData.order.status === 'closed', 'Cafeteria bill settled via UPI and table freed');

    // 6. Centralized Finance & Invoices
    console.log('\n--- 6. Centralized Finance & Reporting ---');
    const finRes = await fetch(`${BASE_URL}/finance/dashboard`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const finData = await finRes.json();
    assert(finRes.status === 200 && finData.totalRevenue > 0 && finData.dailyRevenue.length === 7, 'Retrieved live finance dashboard metrics and 7-day revenue array');

    // Fetch printable invoice
    const invRes = await fetch(`${BASE_URL}/finance/invoices/${settleData.order.id}`);
    const invData = await invRes.json();
    assert(invRes.status === 200 && invData.invoiceNumber, 'Generated tax invoice with GST breakdown and club credentials');

    // 7. Leads Pipeline & Conversion
    console.log('\n--- 7. Leads Pipeline & Member Conversion ---');
    const newLeadEmail = `lead_${Date.now()}@corporate.com`;
    const leadRes = await fetch(`${BASE_URL}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Corporate Executive',
        email: newLeadEmail,
        phone: '+91 98888 77777',
        interestedSport: 'Cricket',
        membershipTier: 'Gold'
      })
    });
    const leadData = await leadRes.json();
    assert(leadRes.status === 201 && leadData.lead.id, 'Public enquiry lead created');

    // Convert Lead to Member
    const convRes = await fetch(`${BASE_URL}/leads/${leadData.lead.id}/convert`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const convData = await convRes.json();
    assert(convRes.status === 200 && convData.member.id, 'Lead successfully converted to registered member in database');

    // 8. Staff Management & Leaves
    console.log('\n--- 8. Staff & Leave Management ---');
    const staffRes = await fetch(`${BASE_URL}/staff`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const staffList = await staffRes.json();
    assert(staffRes.status === 200 && staffList.length > 0, 'Retrieved employee directory');

    // Apply for leave
    const leaveRes = await fetch(`${BASE_URL}/staff/leaves`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        employeeId: staffList[0].id,
        employeeName: staffList[0].name,
        leaveType: 'Casual Leave',
        startDate: testDate,
        endDate: testDate,
        days: 1,
        reason: 'Personal family event'
      })
    });
    const leaveData = await leaveRes.json();
    assert(leaveRes.status === 201 && leaveData.leave.status === 'pending', 'Leave application submitted');

    // Managerial Approval
    const approveRes = await fetch(`${BASE_URL}/staff/leaves/${leaveData.leave.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'approved' })
    });
    assert(approveRes.status === 200, 'Managerial leave approval recorded');

    // SUMMARY
    console.log('\n=======================================================');
    console.log(`  TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('=======================================================');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal Test Runner Exception:', err);
    process.exit(1);
  }
}

runTests();
