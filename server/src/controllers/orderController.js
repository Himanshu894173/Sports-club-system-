import { Order, Product, InventoryMovement, Member, Transaction } from '../models/index.js';
import { pricingService } from '../services/pricingService.js';
import { transactionService } from '../services/transactionService.js';

export const generateOrderId = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const random6 = Math.floor(100000 + Math.random() * 900000);
  return `TCC-${yyyy}${mm}${dd}-${random6}`;
};

export const generateInvoiceReference = (orderId) => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `INV-SHOP-${yyyy}${mm}-${random4}`;
};

export const orderController = {
  // 1. Get Orders (Admin & Staff) with filters, search, and KPI calculations
  async getOrders(req, res) {
    try {
      const { status, fulfillmentType, search, includeArchived, limit = 100, page = 1 } = req.query;
      const query = {};

      if (includeArchived !== 'true') {
        query.archivedAt = null;
      }

      // Status filtering
      if (status && status !== 'all') {
        if (status === 'placed') {
          query.orderStatus = { $in: ['Placed', 'Pending'] };
        } else if (status === 'processing') {
          query.orderStatus = { $in: ['Processing', 'Packed', 'Preparing'] };
        } else if (status === 'shipped') {
          query.orderStatus = { $in: ['Shipped', 'Out for Delivery', 'Ready for Pickup', 'Ready'] };
        } else if (status === 'delivered') {
          query.orderStatus = { $in: ['Delivered', 'Collected', 'Completed'] };
        } else if (status === 'cancelled') {
          query.orderStatus = { $in: ['Cancelled', 'Returned'] };
        } else {
          query.orderStatus = status;
        }
      }

      // Fulfillment filtering
      if (fulfillmentType && fulfillmentType !== 'all') {
        if (fulfillmentType === 'Delivery') {
          query.fulfillmentType = { $in: ['Home Delivery', 'Delivery'] };
        } else if (fulfillmentType === 'Pickup') {
          query.fulfillmentType = { $in: ['Front Desk Pickup', 'Pickup'] };
        } else {
          query.fulfillmentType = fulfillmentType;
        }
      }

      // Search filtering
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [
          { orderId: regex },
          { id: regex },
          { customerName: regex },
          { customerEmail: regex },
          { customerPhone: regex },
          { invoiceReference: regex },
          { 'items.name': regex }
        ];
      }

      const list = await Order.find(query).sort({ createdAt: -1 }).limit(Number(limit));

      // Calculate KPI statistics across all active orders
      const allActive = await Order.find({ archivedAt: null }).lean();
      const kpi = {
        totalOrders: allActive.length,
        placedCount: allActive.filter(o => ['Placed', 'Pending'].includes(o.orderStatus)).length,
        processingCount: allActive.filter(o => ['Processing', 'Packed', 'Preparing'].includes(o.orderStatus)).length,
        shippedCount: allActive.filter(o => ['Shipped', 'Out for Delivery', 'Ready for Pickup', 'Ready'].includes(o.orderStatus)).length,
        deliveredCount: allActive.filter(o => ['Delivered', 'Collected', 'Completed'].includes(o.orderStatus)).length,
        cancelledCount: allActive.filter(o => ['Cancelled', 'Returned'].includes(o.orderStatus)).length,
        refundedCount: allActive.filter(o => o.refundStatus === 'refunded' || o.orderStatus === 'Refunded').length,
        totalRevenue: allActive
          .filter(o => !['Cancelled', 'Returned'].includes(o.orderStatus))
          .reduce((sum, o) => sum + (Number(o.total) || 0), 0)
      };

      res.json({
        orders: list,
        kpi,
        total: list.length
      });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving orders.', error: error.message });
    }
  },

  // 2. Get Order by ID or orderId
  async getOrderById(req, res) {
    try {
      const searchKey = req.params.id;
      const order = await Order.findOne({
        $or: [
          { orderId: searchKey },
          { id: searchKey }
        ]
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving order.', error: error.message });
    }
  },

  // 3. Create Order with atomic inventory deduction & pricing validation
  async createOrder(req, res) {
    try {
      const {
        items,
        fulfillmentType = 'Front Desk Pickup',
        deliveryAddress,
        shippingAddress,
        paymentMethod = 'UPI',
        customerName,
        customerEmail,
        customerPhone,
        isCounterSale = false
      } = req.body;

      if (!items || !items.length) {
        return res.status(400).json({ message: 'Cart items are required.' });
      }

      // Check stock and gather product metadata
      const enrichedItems = [];
      for (const itm of items) {
        const prod = await Product.findOne({ id: itm.productId });
        if (!prod) {
          return res.status(404).json({ message: `Product ${itm.name || itm.productId} not found.` });
        }
        if (prod.stock < itm.quantity) {
          return res.status(400).json({
            message: `Insufficient inventory for '${prod.name}'. In stock: ${prod.stock}, requested: ${itm.quantity}`
          });
        }
        enrichedItems.push({
          productId: prod.id,
          name: prod.name,
          brand: prod.brand || '',
          sku: prod.sku || '',
          image: prod.image || itm.image || '',
          price: prod.price,
          quantity: Number(itm.quantity),
          discount: 0,
          total: Number(prod.price) * Number(itm.quantity)
        });
      }

      // Normalize fulfillment type
      const isHomeDelivery = fulfillmentType === 'Delivery' || fulfillmentType === 'Home Delivery';
      const normalizedFulfillment = isHomeDelivery ? 'Home Delivery' : 'Front Desk Pickup';

      // Member context detection
      let memberId = req.body.memberId || null;
      let finalCustomerName = customerName || (req.user ? req.user.name : 'Customer');
      let finalCustomerEmail = customerEmail || (req.user ? req.user.email : '');
      let finalCustomerPhone = customerPhone || (req.user ? req.user.phone : '');

      if (req.user) {
        if (req.user.memberId) {
          memberId = req.user.memberId;
        }
        const member = await Member.findOne({
          $or: [
            { userId: req.user.id },
            { id: req.user.memberId || req.body.memberId },
            { email: req.user.email ? req.user.email.toLowerCase() : null }
          ].filter(Boolean)
        });
        if (member) {
          memberId = member.id;
          finalCustomerName = member.name || finalCustomerName;
          finalCustomerEmail = member.email || finalCustomerEmail;
          finalCustomerPhone = member.phone || finalCustomerPhone;
        }
      }

      // Calculate totals securely on backend
      const {
        subtotal,
        discount,
        tax,
        deliveryCharge,
        total
      } = await pricingService.calculateShopTotal(enrichedItems, memberId, normalizedFulfillment);

      // Generate unique backend Order ID
      const orderId = generateOrderId();
      const invoiceRef = generateInvoiceReference(orderId);

      // Estimated Delivery / Pickup Readiness
      const estimatedDeliveryDate = isHomeDelivery
        ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 business days
        : new Date(Date.now() + 2 * 60 * 60 * 1000);     // 2 hours for club desk pickup

      // Atomic stock deduction & stock movement recording
      for (const itm of enrichedItems) {
        const updatedProd = await Product.findOneAndUpdate(
          { id: itm.productId, stock: { $gte: itm.quantity } },
          { $inc: { stock: -itm.quantity } },
          { returnDocument: 'after' }
        );

        if (!updatedProd) {
          throw new Error(`Inventory race condition: Stock for '${itm.name}' was just purchased by another customer.`);
        }

        await InventoryMovement.create({
          id: `mov_${Date.now()}_${itm.productId}`,
          productId: itm.productId,
          productName: itm.name,
          type: isCounterSale ? 'CounterSale' : 'Sale',
          quantity: -itm.quantity,
          previousStock: updatedProd.stock + itm.quantity,
          newStock: updatedProd.stock,
          reason: isCounterSale ? `Counter POS Sale #${orderId}` : `Pro Shop Order #${orderId}`,
          performedBy: req.user ? req.user.name : 'Customer Checkout'
        });
      }

      const initialStatus = isCounterSale ? 'Completed' : 'Placed';
      const initialNote = isCounterSale
        ? 'Front-Desk Counter POS Sale completed.'
        : `Order placed online via Pro Shop (${normalizedFulfillment}).`;

      const destinationAddress = isHomeDelivery
        ? (deliveryAddress || (shippingAddress ? `${shippingAddress.addressLine}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.postalCode}` : 'Home Delivery Address'))
        : 'KHELORA Pro Shop Front Desk (Court 1 Wing)';

      const newOrder = await Order.create({
        id: orderId,
        orderId,
        invoiceReference: invoiceRef,
        userId: req.user ? (req.user.id || (req.user._id ? req.user._id.toString() : null)) : null,
        memberId,
        customerName: finalCustomerName,
        customerEmail: finalCustomerEmail,
        customerPhone: finalCustomerPhone,
        isCounterSale: Boolean(isCounterSale),
        fulfillmentType: normalizedFulfillment,
        deliveryAddress: destinationAddress,
        shippingAddress: shippingAddress || {
          name: finalCustomerName,
          phone: finalCustomerPhone,
          addressLine: destinationAddress,
          city: 'Mumbai',
          state: 'Maharashtra',
          postalCode: '400050'
        },
        items: enrichedItems,
        subtotal,
        discount,
        tax,
        deliveryCharge,
        total,
        paymentMethod,
        paymentStatus: 'paid',
        orderStatus: initialStatus,
        estimatedDeliveryDate,
        statusHistory: [{
          status: initialStatus,
          timestamp: new Date(),
          note: initialNote,
          updatedBy: req.user ? req.user.name : finalCustomerName
        }]
      });

      // Record central financial transaction
      await transactionService.createTransaction({
        category: 'Shop',
        description: `Pro Shop Order #${orderId} (${enrichedItems.length} items) - ${finalCustomerName}`,
        amount: total,
        method: paymentMethod,
        referenceId: orderId,
        memberName: finalCustomerName,
        memberId
      });

      // Increment Member spend
      if (memberId) {
        await Member.updateOne({ id: memberId }, { $inc: { totalSpent: total } });
      }

      res.status(201).json({
        message: 'Order created successfully.',
        order: newOrder
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // 4. Update Order Status (Admin & Staff) with statusHistory auditing
  async updateOrderStatus(req, res) {
    try {
      const { status, note, shipmentReference, carrierName, trackingNumber } = req.body;
      const order = await Order.findOne({
        $or: [
          { orderId: req.params.id },
          { id: req.params.id }
        ]
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      const prevStatus = order.orderStatus;
      const targetStatus = status || req.body.orderStatus;

      if (!targetStatus) {
        return res.status(400).json({ message: 'Status is required.' });
      }

      // Restock inventory if transition to Cancelled
      if (targetStatus === 'Cancelled' && prevStatus !== 'Cancelled') {
        for (const itm of order.items) {
          const prod = await Product.findOneAndUpdate(
            { id: itm.productId },
            { $inc: { stock: itm.quantity } },
            { returnDocument: 'after' }
          );

          if (prod) {
            await InventoryMovement.create({
              id: `mov_${Date.now()}_${itm.productId}_restock`,
              productId: itm.productId,
              productName: itm.name,
              type: 'Restock',
              quantity: itm.quantity,
              previousStock: prod.stock - itm.quantity,
              newStock: prod.stock,
              reason: `Order #${order.orderId || order.id} cancelled by staff - restocked`,
              performedBy: req.user ? req.user.name : 'System Admin'
            });
          }
        }
        order.cancellationReason = note || 'Cancelled by staff';
        order.cancelledAt = new Date();
        order.cancelledBy = req.user ? req.user.name : 'Staff';
      }

      if (shipmentReference || trackingNumber) {
        order.shipmentReference = shipmentReference || trackingNumber;
        order.trackingNumber = trackingNumber || shipmentReference;
      }
      if (carrierName) {
        order.carrierName = carrierName;
      }

      order.orderStatus = targetStatus;
      order.statusHistory.push({
        status: targetStatus,
        timestamp: new Date(),
        note: note || `Order status updated to ${targetStatus}`,
        updatedBy: req.user ? req.user.name : 'Staff',
        shipmentReference: shipmentReference || order.shipmentReference || ''
      });

      await order.save();

      res.json({
        message: `Order status updated to '${targetStatus}'.`,
        order
      });
    } catch (error) {
      res.status(500).json({ message: 'Error updating order status.', error: error.message });
    }
  },

  // 5. Cancel Order (Customer or Admin) with stock restore & refund logging
  async cancelOrder(req, res) {
    try {
      const order = await Order.findOne({
        $or: [
          { orderId: req.params.id },
          { id: req.params.id }
        ]
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      if (order.orderStatus === 'Cancelled') {
        return res.status(400).json({ message: 'This order is already cancelled.' });
      }

      // Check customer cancellation eligibility
      const nonCancellableStatuses = ['Shipped', 'Out for Delivery', 'Delivered', 'Collected', 'Completed'];
      const isStaffOrAdmin = req.user && ['admin', 'staff'].includes(req.user.role);

      if (!isStaffOrAdmin && nonCancellableStatuses.includes(order.orderStatus)) {
        return res.status(400).json({
          message: `Orders that are ${order.orderStatus.toLowerCase()} cannot be cancelled online. Please contact the Club Desk.`
        });
      }

      const reason = req.body.reason || req.body.cancellationReason;
      if (!reason || !reason.trim()) {
        return res.status(400).json({ message: 'A cancellation reason is required.' });
      }

      // Restock inventory atomically
      for (const itm of order.items) {
        const prod = await Product.findOneAndUpdate(
          { id: itm.productId },
          { $inc: { stock: itm.quantity } },
          { returnDocument: 'after' }
        );

        if (prod) {
          await InventoryMovement.create({
            id: `mov_${Date.now()}_${itm.productId}_restock`,
            productId: itm.productId,
            productName: itm.name,
            type: 'Restock',
            quantity: itm.quantity,
            previousStock: prod.stock - itm.quantity,
            newStock: prod.stock,
            reason: `Order #${order.orderId || order.id} cancelled (${reason})`,
            performedBy: req.user ? req.user.name : order.customerName
          });
        }
      }

      order.orderStatus = 'Cancelled';
      order.cancellationReason = reason.trim();
      order.cancelledAt = new Date();
      order.cancelledBy = req.user ? req.user.name : order.customerName;

      // Handle refund state
      if (order.paymentStatus === 'paid') {
        order.refundStatus = 'requested';
        order.refundAmount = order.total;

        // Record refund ledger entry
        await transactionService.createTransaction({
          category: 'Shop',
          type: 'expense',
          description: `Refund requested for Cancelled Order #${order.orderId || order.id} - ${order.customerName}`,
          amount: order.total,
          method: order.paymentMethod,
          referenceId: order.orderId || order.id,
          memberName: order.customerName,
          memberId: order.memberId
        });
      }

      order.statusHistory.push({
        status: 'Cancelled',
        timestamp: new Date(),
        note: `Cancelled: ${reason.trim()}`,
        updatedBy: req.user ? req.user.name : 'Customer'
      });

      await order.save();

      res.json({
        message: 'Order cancelled successfully and inventory was restored.',
        order
      });
    } catch (error) {
      res.status(500).json({ message: 'Error cancelling order.', error: error.message });
    }
  },

  // 6. Process Refund (Admin / Staff)
  async refundOrder(req, res) {
    try {
      const { refundAmount, refundReference, note } = req.body;
      const order = await Order.findOne({
        $or: [
          { orderId: req.params.id },
          { id: req.params.id }
        ]
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      const amountToRefund = Number(refundAmount) || order.total;
      const refNumber = refundReference || `REF-${Date.now().toString().slice(-6)}`;

      order.refundStatus = 'refunded';
      order.refundAmount = amountToRefund;
      order.refundReference = refNumber;
      order.refundedAt = new Date();

      order.statusHistory.push({
        status: 'Refunded',
        timestamp: new Date(),
        note: `Refund of Rs. ${amountToRefund} processed. Ref: ${refNumber}. ${note || ''}`,
        updatedBy: req.user ? req.user.name : 'Admin'
      });

      await transactionService.createTransaction({
        category: 'Shop',
        type: 'expense',
        description: `Pro Shop Refund #${order.orderId || order.id} (Ref: ${refNumber})`,
        amount: amountToRefund,
        method: order.paymentMethod,
        referenceId: order.orderId || order.id,
        memberName: order.customerName,
        memberId: order.memberId
      });

      await order.save();

      res.json({
        message: 'Refund recorded and finance ledger updated successfully.',
        order
      });
    } catch (error) {
      res.status(500).json({ message: 'Error processing refund.', error: error.message });
    }
  },

  // 7. Soft Delete / Archive Order (Admin / Staff)
  async archiveOrder(req, res) {
    try {
      const order = await Order.findOne({
        $or: [
          { orderId: req.params.id },
          { id: req.params.id }
        ]
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      order.archivedAt = new Date();
      order.statusHistory.push({
        status: 'Archived',
        timestamp: new Date(),
        note: 'Order archived by staff',
        updatedBy: req.user ? req.user.name : 'Staff'
      });

      await order.save();

      res.json({ message: 'Order archived successfully.', orderId: order.orderId || order.id });
    } catch (error) {
      res.status(500).json({ message: 'Error archiving order.', error: error.message });
    }
  },

  // 8. Visual Order Tracking Timeline Stages
  async getOrderTracking(req, res) {
    try {
      const order = await Order.findOne({
        $or: [
          { orderId: req.params.id },
          { id: req.params.id }
        ]
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      const isHomeDelivery = order.fulfillmentType === 'Home Delivery' || order.fulfillmentType === 'Delivery';

      const deliveryStages = [
        { key: 'Placed', label: 'Order Placed', desc: 'Order received and confirmed' },
        { key: 'Confirmed', label: 'Confirmed', desc: 'Payment verified and order verified' },
        { key: 'Processing', label: 'Processing', desc: 'Items retrieved from pro stock' },
        { key: 'Packed', label: 'Packed', desc: 'Securely packed in sports club packaging' },
        { key: 'Shipped', label: 'Shipped', desc: 'Dispatched with club courier' },
        { key: 'Out for Delivery', label: 'Out for Delivery', desc: 'Delivery partner en route' },
        { key: 'Delivered', label: 'Delivered', desc: 'Package delivered to recipient' }
      ];

      const pickupStages = [
        { key: 'Placed', label: 'Order Placed', desc: 'Order received at club desk' },
        { key: 'Confirmed', label: 'Confirmed', desc: 'Payment verified' },
        { key: 'Preparing', label: 'Preparing', desc: 'Staff preparing items at Pro Shop' },
        { key: 'Ready for Pickup', label: 'Ready for Pickup', desc: 'Waiting at Front Desk Court 1' },
        { key: 'Collected', label: 'Collected', desc: 'Handed over to member' }
      ];

      const activeStages = isHomeDelivery ? deliveryStages : pickupStages;
      const historyMap = {};
      (order.statusHistory || []).forEach(h => {
        historyMap[h.status] = h;
      });

      // Determine progress index
      let currentIndex = activeStages.findIndex(s => s.key.toLowerCase() === order.orderStatus.toLowerCase());
      if (currentIndex === -1) {
        // Fallbacks for legacy statuses
        if (order.orderStatus === 'Completed') currentIndex = activeStages.length - 1;
        else if (order.orderStatus === 'Ready') currentIndex = activeStages.findIndex(s => s.key.includes('Ready')) || 2;
        else if (order.orderStatus === 'Pending') currentIndex = 0;
      }

      const stages = activeStages.map((stage, idx) => {
        const historyEvent = historyMap[stage.key];
        let state = 'upcoming';
        if (order.orderStatus === 'Cancelled') {
          state = idx === 0 ? 'completed' : 'cancelled';
        } else if (idx < currentIndex) {
          state = 'completed';
        } else if (idx === currentIndex) {
          state = 'current';
        }

        return {
          ...stage,
          state,
          timestamp: historyEvent ? historyEvent.timestamp : null,
          note: historyEvent ? historyEvent.note : null
        };
      });

      res.json({
        orderId: order.orderId || order.id,
        fulfillmentType: order.fulfillmentType,
        orderStatus: order.orderStatus,
        estimatedDeliveryDate: order.estimatedDeliveryDate,
        carrierName: order.carrierName,
        shipmentReference: order.shipmentReference,
        cancellationReason: order.cancellationReason,
        cancelledAt: order.cancelledAt,
        refundStatus: order.refundStatus,
        refundAmount: order.refundAmount,
        stages,
        statusHistory: order.statusHistory
      });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving tracking.', error: error.message });
    }
  },

  // 9. Structured Printable Invoice
  async getOrderInvoice(req, res) {
    try {
      const order = await Order.findOne({
        $or: [
          { orderId: req.params.id },
          { id: req.params.id }
        ]
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }

      res.json({
        invoiceReference: order.invoiceReference || `INV-${order.orderId || order.id}`,
        invoiceDate: order.createdAt,
        clubInfo: {
          name: 'KHELORA Sports & Pro Shop',
          address: 'Court Central Complex, 42 Sports Way, Mumbai 400050',
          phone: '+91 (022) 555-0199',
          email: 'proshop@khelora.com',
          gstin: '27AAAAA0000A1Z5'
        },
        order
      });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving invoice.', error: error.message });
    }
  },

  // 10. Member's My Orders list
  async getMyOrders(req, res) {
    try {
      const orConditions = [];
      if (req.user?.memberId) orConditions.push({ memberId: req.user.memberId });
      if (req.user?.email) orConditions.push({ customerEmail: req.user.email.toLowerCase() });
      if (req.user?.id) orConditions.push({ userId: req.user.id });

      const query = {
        archivedAt: null,
        $or: orConditions.length ? orConditions : [{ customerEmail: req.user?.email || 'non-existent' }]
      };

      const orders = await Order.find(query).sort({ createdAt: -1 });
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving member orders.', error: error.message });
    }
  }
};

export default orderController;
