import {
  BarMenuItem,
  Table,
  BarOrder,
  Member,
  Transaction,
  Invoice,
  InventoryMovement,
  MembershipPlan
} from '../models/index.js';
import { pricingService } from '../services/pricingService.js';
import { transactionService } from '../services/transactionService.js';

export const barController = {
  // ==========================================
  // 1. MENU MANAGEMENT
  // ==========================================
  async getMenu(req, res) {
    try {
      const { category, search, availableOnly } = req.query;
      const query = {};

      if (availableOnly === 'true') {
        query.isAvailable = true;
      }

      if (category && category !== 'all') {
        if (category.toLowerCase() === 'beverages') {
          query.category = { $in: [/smoothies/i, /coffee/i, /beverages/i] };
        } else {
          query.category = new RegExp(`^${category}$`, 'i');
        }
      }

      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ name: regex }, { description: regex }, { tags: regex }];
      }

      const list = await BarMenuItem.find(query).sort({ category: 1, name: 1 });
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving menu.', error: error.message });
    }
  },

  async createMenuItem(req, res) {
    try {
      const {
        name,
        category,
        price,
        memberPrice,
        costPrice = 0,
        stock = 50,
        minStockAlert = 10,
        isAvailable = true,
        isVeg = true,
        description = '',
        image = '',
        calories = 0,
        protein = '',
        tags = [],
        prepTime = '5-10 mins',
        ingredients = []
      } = req.body;

      if (!name || !category || price === undefined) {
        return res.status(400).json({ message: 'Name, category and price are required.' });
      }

      const id = `menu_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const calculatedMemberPrice = memberPrice !== undefined ? Number(memberPrice) : Math.round(Number(price) * 0.85);

      const newItem = await BarMenuItem.create({
        id,
        name: name.trim(),
        category,
        price: Number(price),
        memberPrice: calculatedMemberPrice,
        costPrice: Number(costPrice),
        stock: Number(stock),
        minStockAlert: Number(minStockAlert),
        isAvailable: Boolean(isAvailable),
        isVeg: Boolean(isVeg),
        description,
        image,
        calories: Number(calories) || 0,
        protein,
        tags: Array.isArray(tags) ? tags : [],
        prepTime,
        ingredients: Array.isArray(ingredients) ? ingredients : []
      });

      res.status(201).json({ message: 'Menu item created successfully.', item: newItem });
    } catch (error) {
      res.status(400).json({ message: 'Error creating menu item.', error: error.message });
    }
  },

  async updateMenuItem(req, res) {
    try {
      const item = await BarMenuItem.findOne({ id: req.params.id });
      if (!item) return res.status(404).json({ message: 'Menu item not found.' });

      const updates = req.body;
      if (updates.price !== undefined && updates.memberPrice === undefined) {
        updates.memberPrice = Math.round(Number(updates.price) * 0.85);
      }

      const updated = await BarMenuItem.findOneAndUpdate(
        { id: req.params.id },
        { $set: updates },
        { returnDocument: 'after' }
      );

      res.json({ message: 'Menu item updated successfully.', item: updated });
    } catch (error) {
      res.status(400).json({ message: 'Error updating menu item.', error: error.message });
    }
  },

  async deleteMenuItem(req, res) {
    try {
      const item = await BarMenuItem.findOneAndDelete({ id: req.params.id });
      if (!item) return res.status(404).json({ message: 'Menu item not found.' });
      res.json({ message: `Menu item '${item.name}' deleted successfully.` });
    } catch (error) {
      res.status(500).json({ message: 'Error deleting menu item.', error: error.message });
    }
  },

  async updateMenuItemStock(req, res) {
    try {
      const { quantity, type = 'Restock', reason = 'Manual inventory adjustment' } = req.body;
      const item = await BarMenuItem.findOne({ id: req.params.id });
      if (!item) return res.status(404).json({ message: 'Menu item not found.' });

      const qty = Number(quantity);
      if (isNaN(qty)) return res.status(400).json({ message: 'Valid quantity is required.' });

      const previousStock = item.stock;
      const newStock = previousStock + qty;

      if (newStock < 0) {
        return res.status(400).json({ message: 'Cannot reduce stock below zero.' });
      }

      item.stock = newStock;
      await item.save();

      await InventoryMovement.create({
        id: `mov_${Date.now()}_${item.id}`,
        productId: item.id,
        productName: item.name,
        type: type === 'Wastage' ? 'Wastage' : (qty >= 0 ? 'Restock' : 'Correction'),
        quantity: qty,
        previousStock,
        newStock,
        reason,
        performedBy: req.user ? req.user.name : 'Bar Manager'
      });

      res.json({ message: `Stock for '${item.name}' updated to ${newStock}.`, item });
    } catch (error) {
      res.status(400).json({ message: 'Error adjusting stock.', error: error.message });
    }
  },

  // ==========================================
  // 2. TABLE MANAGEMENT
  // ==========================================
  async getTables(req, res) {
    try {
      const tables = await Table.find().sort({ id: 1 });
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving tables.', error: error.message });
    }
  },

  async updateTableStatus(req, res) {
    try {
      const { status } = req.body;
      const validStatuses = ['available', 'occupied', 'reserved', 'cleaning'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }

      const table = await Table.findOneAndUpdate(
        { id: req.params.id },
        { $set: { status } },
        { returnDocument: 'after' }
      );
      if (!table) return res.status(404).json({ message: 'Table not found.' });

      res.json({ message: `Table '${table.name}' status updated to ${status}.`, table });
    } catch (error) {
      res.status(500).json({ message: 'Error updating table status.', error: error.message });
    }
  },

  async transferTable(req, res) {
    try {
      const { targetTableId } = req.body;
      const sourceTable = await Table.findOne({ id: req.params.id });
      const targetTable = await Table.findOne({ id: targetTableId });

      if (!sourceTable) return res.status(404).json({ message: 'Source table not found.' });
      if (!targetTable) return res.status(404).json({ message: 'Target table not found.' });

      // Transfer all open orders on source table to target table
      const activeOrders = await BarOrder.find({ tableId: sourceTable.id, status: 'open' });
      if (activeOrders.length === 0) {
        return res.status(400).json({ message: 'No active orders found on source table to transfer.' });
      }

      for (const order of activeOrders) {
        order.tableId = targetTable.id;
        order.tableName = targetTable.name;
        await order.save();
      }

      sourceTable.status = 'cleaning';
      sourceTable.currentOrderId = null;
      sourceTable.currentCustomerName = null;
      await sourceTable.save();

      targetTable.status = 'occupied';
      targetTable.currentOrderId = activeOrders[0].id;
      targetTable.currentCustomerName = activeOrders[0].customerName;
      await targetTable.save();

      res.json({
        message: `Transferred ${activeOrders.length} order(s) from ${sourceTable.name} to ${targetTable.name}.`,
        sourceTable,
        targetTable
      });
    } catch (error) {
      res.status(500).json({ message: 'Error transferring table.', error: error.message });
    }
  },

  async releaseTable(req, res) {
    try {
      const table = await Table.findOne({ id: req.params.id });
      if (!table) return res.status(404).json({ message: 'Table not found.' });

      table.status = 'available';
      table.currentOrderId = null;
      table.currentCustomerName = null;
      await table.save();

      res.json({ message: `Table '${table.name}' released and ready for seating.`, table });
    } catch (error) {
      res.status(500).json({ message: 'Error releasing table.', error: error.message });
    }
  },

  // ==========================================
  // 3. ORDER CREATION, TABS & POS
  // ==========================================
  async getOrders(req, res) {
    try {
      const { status, tableId, isTab, kitchenStatus } = req.query;
      const query = {};

      if (status && status !== 'all') query.status = status;
      if (tableId && tableId !== 'all') query.tableId = tableId;
      if (isTab !== undefined && isTab !== '') query.isTab = isTab === 'true';
      if (kitchenStatus && kitchenStatus !== 'all') query.kitchenStatus = kitchenStatus;

      // Role check: If member, only view own orders
      if (req.user && req.user.role === 'member') {
        query.memberId = req.user.memberId;
      }

      const list = await BarOrder.find(query).sort({ createdAt: -1 });
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving orders.', error: error.message });
    }
  },

  async getOrderById(req, res) {
    try {
      const order = await BarOrder.findOne({ id: req.params.id });
      if (!order) return res.status(404).json({ message: 'Order not found.' });

      // IDOR check for members
      if (req.user && req.user.role === 'member' && order.memberId !== req.user.memberId) {
        return res.status(403).json({ message: 'Access denied to this order.' });
      }

      res.json(order);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving order.', error: error.message });
    }
  },

  async createOrder(req, res) {
    try {
      const {
        tableId = 'tbl_takeaway',
        items,
        customerType = 'walk-in',
        memberId = null,
        customerName = 'Guest',
        customerPhone = '',
        isTab = false,
        paymentMethod = null,
        serverName = 'Bar Staff'
      } = req.body;

      if (!items || !items.length) {
        return res.status(400).json({ message: 'At least one menu item is required.' });
      }

      // Check Table
      const table = await Table.findOne({ id: tableId });
      const tableName = table ? table.name : 'Takeaway / Court Delivery';

      // Verify Member
      let finalMember = null;
      let effectiveMemberId = memberId;
      if (req.user && req.user.role === 'member') {
        effectiveMemberId = req.user.memberId;
      }

      if (effectiveMemberId) {
        finalMember = await Member.findOne({ id: effectiveMemberId });
      }

      // 1. Stock Verification & Atomic Deduction
      const preparedItems = [];
      for (const itm of items) {
        const menuItem = await BarMenuItem.findOne({ id: itm.menuItemId });
        if (menuItem) {
          if (menuItem.trackStock && menuItem.stock < itm.quantity) {
            return res.status(400).json({
              message: `Insufficient stock for '${menuItem.name}'. Only ${menuItem.stock} serving(s) available.`
            });
          }
        }
        preparedItems.push({
          menuItemId: itm.menuItemId,
          name: itm.name || (menuItem ? menuItem.name : 'Item'),
          price: Number(itm.price || (menuItem ? menuItem.price : 0)),
          quantity: Number(itm.quantity || 1),
          category: itm.category || (menuItem ? menuItem.category : 'General'),
          notes: itm.notes || '',
          itemStatus: 'pending'
        });
      }

      // Deduct stock atomically
      for (const itm of preparedItems) {
        const menuItem = await BarMenuItem.findOneAndUpdate(
          { id: itm.menuItemId, trackStock: true },
          { $inc: { stock: -itm.quantity } },
          { returnDocument: 'after' }
        );

        if (menuItem) {
          await InventoryMovement.create({
            id: `mov_${Date.now()}_${itm.menuItemId}`,
            productId: itm.menuItemId,
            productName: itm.name,
            type: 'Sale',
            quantity: -itm.quantity,
            previousStock: menuItem.stock + itm.quantity,
            newStock: menuItem.stock,
            reason: `Cafeteria Order (${tableName})`,
            performedBy: req.user ? req.user.name : serverName
          });
        }
      }

      // 2. Calculate Pricing with Discount & 5% GST
      const { subtotal, discountPercent, discount, tax, total } = await pricingService.calculateBarTotal(
        preparedItems,
        effectiveMemberId
      );

      const orderId = `BAR-2026-${Date.now().toString().slice(-4)}`;
      const orderNumber = `KOT-${Math.floor(100 + Math.random() * 900)}`;
      const isPaid = !isTab && !!paymentMethod;

      const payments = [];
      if (isPaid) {
        payments.push({
          method: paymentMethod,
          amount: total,
          transactionId: `txn_bar_${Date.now()}`,
          paidAt: new Date()
        });
      }

      const newBarOrder = await BarOrder.create({
        id: orderId,
        orderNumber,
        tableId: table ? table.id : 'tbl_takeaway',
        tableName,
        customerType: effectiveMemberId ? 'member' : customerType,
        memberId: effectiveMemberId || null,
        customerName: finalMember ? finalMember.name : customerName,
        customerPhone: finalMember ? finalMember.phone : customerPhone,
        isTab: Boolean(isTab),
        status: isPaid ? 'closed' : 'open',
        kitchenStatus: 'pending',
        items: preparedItems,
        subtotal,
        discountPercent,
        discount,
        tax,
        total,
        paymentMethod: isPaid ? paymentMethod : null,
        payments,
        paymentStatus: isPaid ? 'paid' : 'unpaid',
        serverName
      });

      // Update Table Status
      if (table && !table.id.includes('takeaway') && !table.id.includes('counter')) {
        if (!isPaid) {
          table.status = 'occupied';
          table.currentOrderId = orderId;
          table.currentCustomerName = newBarOrder.customerName;
          await table.save();
        }
      }

      // 3. Central Finance Transaction & Tax Invoice (If Paid Immediately)
      if (isPaid) {
        const txn = await transactionService.createTransaction({
          category: 'Bar',
          description: `Veranda Cafeteria Order #${orderId} (${tableName}) - ${newBarOrder.customerName}`,
          amount: total,
          method: paymentMethod,
          referenceId: orderId,
          memberName: newBarOrder.customerName,
          memberId: effectiveMemberId
        });

        // Generate Invoice
        const invoiceNumber = `INV-BAR-2026-${Date.now().toString().slice(-4)}`;
        const invoice = await Invoice.create({
          id: `inv_bar_${Date.now()}`,
          invoiceNumber,
          transactionId: txn.id,
          type: 'Tax Invoice (F&B)',
          customerName: newBarOrder.customerName,
          customerPhone: newBarOrder.customerPhone,
          memberId: effectiveMemberId,
          items: preparedItems.map(i => ({
            description: i.name,
            quantity: i.quantity,
            unitPrice: i.price,
            amount: i.price * i.quantity
          })),
          subtotal,
          discount,
          tax,
          total,
          paymentMethod,
          paymentStatus: 'paid'
        });

        newBarOrder.invoiceId = invoice.invoiceNumber;
        await newBarOrder.save();
      }

      res.status(201).json({
        message: isPaid
          ? 'Bill settled successfully.'
          : (isTab ? 'Customer tab opened on table.' : 'Order sent to kitchen.'),
        order: newBarOrder
      });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  },

  // Add more items to an existing open tab
  async addItemsToOrder(req, res) {
    try {
      const { items } = req.body;
      if (!items || !items.length) {
        return res.status(400).json({ message: 'No items provided.' });
      }

      const order = await BarOrder.findOne({ id: req.params.id });
      if (!order) return res.status(404).json({ message: 'Order not found.' });

      if (order.status === 'closed' || order.status === 'cancelled') {
        return res.status(400).json({ message: 'Cannot add items to a closed or cancelled order.' });
      }

      // Check stock & deduct
      for (const itm of items) {
        const menuItem = await BarMenuItem.findOne({ id: itm.menuItemId });
        if (menuItem && menuItem.trackStock) {
          if (menuItem.stock < itm.quantity) {
            return res.status(400).json({
              message: `Insufficient stock for '${menuItem.name}'. Only ${menuItem.stock} left.`
            });
          }
        }
      }

      for (const itm of items) {
        const menuItem = await BarMenuItem.findOneAndUpdate(
          { id: itm.menuItemId, trackStock: true },
          { $inc: { stock: -itm.quantity } },
          { returnDocument: 'after' }
        );

        if (menuItem) {
          await InventoryMovement.create({
            id: `mov_${Date.now()}_${itm.menuItemId}`,
            productId: itm.menuItemId,
            productName: itm.name,
            type: 'Sale',
            quantity: -itm.quantity,
            previousStock: menuItem.stock + itm.quantity,
            newStock: menuItem.stock,
            reason: `Added to Open Tab #${order.id}`,
            performedBy: req.user ? req.user.name : 'Bar Staff'
          });
        }

        order.items.push({
          menuItemId: itm.menuItemId,
          name: itm.name,
          price: Number(itm.price),
          quantity: Number(itm.quantity),
          category: itm.category || 'General',
          notes: itm.notes || '',
          itemStatus: 'pending'
        });
      }

      // Recalculate totals
      const { subtotal, discount, tax, total } = await pricingService.calculateBarTotal(order.items, order.memberId);
      order.subtotal = subtotal;
      order.discount = discount;
      order.tax = tax;
      order.total = total;
      order.kitchenStatus = 'pending'; // Reset kitchen status so kitchen knows new items arrived
      await order.save();

      res.json({ message: 'Items added to open tab.', order });
    } catch (error) {
      res.status(500).json({ message: 'Error adding items to order.', error: error.message });
    }
  },

  async updateOrderItems(req, res) {
    try {
      const { items } = req.body;
      const order = await BarOrder.findOne({ id: req.params.id });
      if (!order) return res.status(404).json({ message: 'Order not found.' });

      if (order.status === 'closed' || order.status === 'cancelled') {
        return res.status(400).json({ message: 'Cannot modify a closed or cancelled bill.' });
      }

      const { subtotal, discount, tax, total } = await pricingService.calculateBarTotal(items, order.memberId);
      order.items = items;
      order.subtotal = subtotal;
      order.discount = discount;
      order.tax = tax;
      order.total = total;
      await order.save();

      res.json({ message: 'Order items updated.', order });
    } catch (error) {
      res.status(500).json({ message: 'Error updating order items.', error: error.message });
    }
  },

  // ==========================================
  // 4. KITCHEN DISPLAY SYSTEM (KDS)
  // ==========================================
  async updateKitchenStatus(req, res) {
    try {
      const { kitchenStatus, status, itemIndex, itemStatus } = req.body;
      const newKitchenStatus = kitchenStatus || status;

      const order = await BarOrder.findOne({ id: req.params.id });
      if (!order) return res.status(404).json({ message: 'Order not found.' });

      // Item-level update if itemIndex provided
      if (itemIndex !== undefined && order.items[itemIndex]) {
        order.items[itemIndex].itemStatus = itemStatus || newKitchenStatus;
        // Check if all items served
        const allServed = order.items.every(i => i.itemStatus === 'served');
        const anyReady = order.items.some(i => i.itemStatus === 'ready');
        if (allServed) {
          order.kitchenStatus = 'served';
        } else if (anyReady) {
          order.kitchenStatus = 'ready';
        } else {
          order.kitchenStatus = 'preparing';
        }
      } else if (newKitchenStatus) {
        order.kitchenStatus = newKitchenStatus;
        // Propagate to all items if full order status changed
        order.items.forEach(i => {
          i.itemStatus = newKitchenStatus;
        });
      }

      await order.save();
      res.json({ message: `Kitchen status updated.`, order });
    } catch (error) {
      res.status(500).json({ message: 'Error updating kitchen status.', error: error.message });
    }
  },

  // ==========================================
  // 5. SETTLEMENT & SPLIT BILLS
  // ==========================================
  async settleOrder(req, res) {
    try {
      const { paymentMethod = 'UPI', payments = [] } = req.body;
      const order = await BarOrder.findOne({ id: req.params.id });
      if (!order) return res.status(404).json({ message: 'Order not found.' });

      if (order.status === 'closed' && order.paymentStatus === 'paid') {
        return res.status(400).json({ message: 'Bill has already been settled.' });
      }

      // Build payment tender list
      let finalPayments = [];
      if (Array.isArray(payments) && payments.length > 0) {
        const sumPaid = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
        if (Math.abs(sumPaid - order.total) > 1) { // 1 rupee tolerance for round off
          return res.status(400).json({
            message: `Split payment sum (₹${sumPaid}) must match bill total (₹${order.total}).`
          });
        }
        finalPayments = payments.map(p => ({
          method: p.method,
          amount: Number(p.amount),
          transactionId: `txn_bar_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          paidAt: new Date()
        }));
      } else {
        finalPayments = [{
          method: paymentMethod,
          amount: order.total,
          transactionId: `txn_bar_${Date.now()}`,
          paidAt: new Date()
        }];
      }

      // Create Central Transactions for each payment tender
      for (const pay of finalPayments) {
        await transactionService.createTransaction({
          category: 'Bar',
          description: `Settlement for Order #${order.id} (${order.tableName}) - ${order.customerName} via ${pay.method}`,
          amount: pay.amount,
          method: pay.method,
          referenceId: order.id,
          memberName: order.customerName,
          memberId: order.memberId
        });
      }

      // Create unique tax invoice
      const invoiceNumber = `INV-BAR-2026-${Date.now().toString().slice(-4)}`;
      const invoice = await Invoice.create({
        id: `inv_bar_${Date.now()}`,
        invoiceNumber,
        transactionId: finalPayments[0].transactionId,
        type: 'Tax Invoice (F&B)',
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        memberId: order.memberId,
        items: order.items.map(i => ({
          description: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
          amount: i.price * i.quantity
        })),
        subtotal: order.subtotal,
        discount: order.discount,
        tax: order.tax,
        total: order.total,
        paymentMethod: finalPayments.length > 1 ? 'Split Payment' : finalPayments[0].method,
        paymentStatus: 'paid'
      });

      order.status = 'closed';
      order.paymentStatus = 'paid';
      order.paymentMethod = finalPayments.length > 1 ? 'Split' : finalPayments[0].method;
      order.payments = finalPayments;
      order.isTab = false;
      order.invoiceId = invoice.invoiceNumber;
      await order.save();

      // Release table if occupied
      if (order.tableId && !order.tableId.includes('takeaway') && !order.tableId.includes('counter')) {
        const remainingOpen = await BarOrder.countDocuments({ tableId: order.tableId, status: 'open' });
        if (remainingOpen === 0) {
          await Table.updateOne(
            { id: order.tableId },
            { $set: { status: 'available', currentOrderId: null, currentCustomerName: null } }
          );
        }
      }

      res.json({
        message: `Order #${order.id} settled successfully. Invoice #${invoice.invoiceNumber} generated.`,
        order,
        invoice
      });
    } catch (error) {
      res.status(500).json({ message: 'Error settling bill.', error: error.message });
    }
  },

  // Split open order into two separate tickets
  async splitOrder(req, res) {
    try {
      const { splitItemIndices = [] } = req.body;
      const order = await BarOrder.findOne({ id: req.params.id });
      if (!order) return res.status(404).json({ message: 'Order not found.' });

      if (order.status === 'closed') {
        return res.status(400).json({ message: 'Cannot split an already settled bill.' });
      }

      if (splitItemIndices.length === 0 || splitItemIndices.length >= order.items.length) {
        return res.status(400).json({ message: 'Please select items to move into a new split bill.' });
      }

      const keptItems = [];
      const movedItems = [];

      order.items.forEach((item, idx) => {
        if (splitItemIndices.includes(idx)) {
          movedItems.push(item);
        } else {
          keptItems.push(item);
        }
      });

      // Recalculate original order
      const calc1 = await pricingService.calculateBarTotal(keptItems, order.memberId);
      order.items = keptItems;
      order.subtotal = calc1.subtotal;
      order.discount = calc1.discount;
      order.tax = calc1.tax;
      order.total = calc1.total;
      await order.save();

      // Create new split order
      const calc2 = await pricingService.calculateBarTotal(movedItems, order.memberId);
      const splitOrderId = `BAR-2026-${Date.now().toString().slice(-4)}`;
      const newSplitOrder = await BarOrder.create({
        id: splitOrderId,
        orderNumber: `KOT-${Math.floor(100 + Math.random() * 900)}`,
        tableId: order.tableId,
        tableName: `${order.tableName} (Split B)`,
        customerType: order.customerType,
        memberId: order.memberId,
        customerName: `${order.customerName} (Split B)`,
        isTab: true,
        status: 'open',
        kitchenStatus: order.kitchenStatus,
        items: movedItems,
        subtotal: calc2.subtotal,
        discountPercent: calc2.discountPercent,
        discount: calc2.discount,
        tax: calc2.tax,
        total: calc2.total,
        paymentStatus: 'unpaid'
      });

      res.json({
        message: `Order split into #${order.id} and #${newSplitOrder.id}.`,
        originalOrder: order,
        newSplitOrder
      });
    } catch (error) {
      res.status(500).json({ message: 'Error splitting order.', error: error.message });
    }
  },

  // ==========================================
  // 6. CANCELLATION & REFUNDS
  // ==========================================
  async cancelOrder(req, res) {
    try {
      const { reason = 'Customer request', refundMethod = 'UPI' } = req.body;
      const order = await BarOrder.findOne({ id: req.params.id });
      if (!order) return res.status(404).json({ message: 'Order not found.' });

      if (order.status === 'cancelled') {
        return res.status(400).json({ message: 'Order has already been cancelled.' });
      }

      // Restock inventory atomically
      for (const itm of order.items) {
        const menuItem = await BarMenuItem.findOneAndUpdate(
          { id: itm.menuItemId, trackStock: true },
          { $inc: { stock: itm.quantity } },
          { returnDocument: 'after' }
        );

        if (menuItem) {
          await InventoryMovement.create({
            id: `mov_${Date.now()}_restock_${itm.menuItemId}`,
            productId: itm.menuItemId,
            productName: itm.name,
            type: 'Restock',
            quantity: itm.quantity,
            previousStock: menuItem.stock - itm.quantity,
            newStock: menuItem.stock,
            reason: `Order #${order.id} cancelled: ${reason}`,
            performedBy: req.user ? req.user.name : 'Bar Staff'
          });
        }
      }

      // If already paid, issue refund transaction
      if (order.paymentStatus === 'paid') {
        await transactionService.createTransaction({
          category: 'Refund',
          type: 'expense',
          description: `Refund for Bar Order #${order.id} (${order.customerName}) - ${reason}`,
          amount: order.total,
          method: refundMethod,
          referenceId: order.id,
          memberName: order.customerName,
          memberId: order.memberId
        });
        order.paymentStatus = 'refunded';
      }

      order.status = 'cancelled';
      order.cancellationReason = reason;
      order.cancelledAt = new Date();
      order.cancelledBy = req.user ? req.user.name : 'Authorized Staff';
      await order.save();

      // Release table if occupied
      if (order.tableId && !order.tableId.includes('takeaway') && !order.tableId.includes('counter')) {
        const remainingOpen = await BarOrder.countDocuments({ tableId: order.tableId, status: 'open' });
        if (remainingOpen === 0) {
          await Table.updateOne(
            { id: order.tableId },
            { $set: { status: 'available', currentOrderId: null, currentCustomerName: null } }
          );
        }
      }

      res.json({ message: `Order #${order.id} cancelled. Stock reversed and logged.`, order });
    } catch (error) {
      res.status(500).json({ message: 'Error cancelling order.', error: error.message });
    }
  },

  // ==========================================
  // 7. INVOICE GENERATION & PRINTING
  // ==========================================
  async getInvoice(req, res) {
    try {
      const order = await BarOrder.findOne({ id: req.params.id });
      if (!order) return res.status(404).json({ message: 'Order not found.' });

      let invoice = null;
      if (order.invoiceId) {
        invoice = await Invoice.findOne({ invoiceNumber: order.invoiceId });
      }

      res.json({
        clubName: 'KHELORA',
        address: 'Sector 62, Golf Course Extension Road, Gurugram, HR 122002',
        gstin: '06AAATC1234F1Z8',
        fssai: '10822005000432',
        phone: '+91 (0124) 488-9000',
        order,
        invoice
      });
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving invoice.', error: error.message });
    }
  },

  // ==========================================
  // 8. REPORTS & ANALYTICS
  // ==========================================
  async getReports(req, res) {
    try {
      const { period = 'today' } = req.query;
      const now = new Date();
      let startDate = new Date();

      if (period === 'today') {
        startDate.setHours(0, 0, 0, 0);
      } else if (period === 'week') {
        startDate.setDate(now.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(now.getMonth() - 1);
      } else {
        startDate = new Date(0); // all
      }

      const allOrders = await BarOrder.find({ createdAt: { $gte: startDate } });
      const paidOrders = allOrders.filter(o => o.paymentStatus === 'paid');
      const openTabs = allOrders.filter(o => o.status === 'open');
      const cancelledOrders = allOrders.filter(o => o.status === 'cancelled');

      const totalRevenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
      const totalDiscounts = paidOrders.reduce((sum, o) => sum + (o.discount || 0), 0);
      const outstandingTabBalance = openTabs.reduce((sum, o) => sum + o.total, 0);

      // Category breakdown
      const categorySales = {};
      const itemFrequencies = {};

      paidOrders.forEach(ord => {
        ord.items.forEach(itm => {
          const cat = itm.category || 'General';
          categorySales[cat] = (categorySales[cat] || 0) + (itm.price * itm.quantity);
          itemFrequencies[itm.name] = (itemFrequencies[itm.name] || 0) + itm.quantity;
        });
      });

      // Top selling items
      const popularItems = Object.entries(itemFrequencies)
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 6);

      // Payment methods breakdown
      const paymentBreakdown = { Cash: 0, Card: 0, UPI: 0, Split: 0 };
      paidOrders.forEach(ord => {
        if (Array.isArray(ord.payments) && ord.payments.length > 1) {
          ord.payments.forEach(p => {
            if (paymentBreakdown[p.method] !== undefined) {
              paymentBreakdown[p.method] += p.amount;
            } else {
              paymentBreakdown[p.method] = p.amount;
            }
          });
        } else {
          const method = ord.paymentMethod || 'UPI';
          paymentBreakdown[method] = (paymentBreakdown[method] || 0) + ord.total;
        }
      });

      // Low stock alerts
      const lowStockItems = await BarMenuItem.find({
        trackStock: true,
        $expr: { $lte: ['$stock', '$minStockAlert'] }
      }).select('id name category stock minStockAlert');

      res.json({
        period,
        totalRevenue,
        ordersCount: paidOrders.length,
        openTabsCount: openTabs.length,
        outstandingTabBalance,
        totalDiscounts,
        cancelledCount: cancelledOrders.length,
        popularItems,
        categorySales: Object.entries(categorySales).map(([category, amount]) => ({ category, amount })),
        paymentBreakdown: Object.entries(paymentBreakdown).map(([method, amount]) => ({ method, amount })),
        lowStockItems
      });
    } catch (error) {
      res.status(500).json({ message: 'Error compiling reports.', error: error.message });
    }
  }
};

// Aliases for route mapping
barController.updateItems = barController.updateOrderItems;

export default barController;
