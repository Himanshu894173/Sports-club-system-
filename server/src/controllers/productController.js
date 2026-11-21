import { Product, InventoryMovement } from '../models/index.js';

export const productController = {
  async getProducts(req, res) {
    try {
      const { category, search, lowStock, activeOnly = 'true' } = req.query;
      const query = {};

      if (activeOnly === 'true') {
        query.isActive = true;
      }
      if (category && category !== 'all') {
        query.category = new RegExp(`^${category}$`, 'i');
      }
      if (search) {
        const q = search.trim();
        query.$or = [
          { name: { $regex: q, $options: 'i' } },
          { sku: { $regex: q, $options: 'i' } },
          { brand: { $regex: q, $options: 'i' } }
        ];
      }
      if (lowStock === 'true') {
        query.$expr = { $lte: ['$stock', '$minStockAlert'] };
      }

      const list = await Product.find(query).sort({ category: 1, name: 1 });
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving products.', error: error.message });
    }
  },

  async getProductById(req, res) {
    try {
      const product = await Product.findOne({ id: req.params.id });
      if (!product) return res.status(404).json({ message: 'Product not found.' });
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving product.', error: error.message });
    }
  },

  async addProduct(req, res) {
    try {
      const { name, category, brand, sku, price, memberPrice, costPrice, stock, minStockAlert, image, description } = req.body;
      if (!name || !price || !sku) {
        return res.status(400).json({ message: 'Product name, SKU, and price are required.' });
      }

      const existingSku = await Product.findOne({ sku: sku.toUpperCase().trim() });
      if (existingSku) {
        return res.status(400).json({ message: `A product with SKU '${sku}' already exists.` });
      }

      const productId = `prd_${Date.now()}`;
      const newProduct = await Product.create({
        id: productId,
        name: name.trim(),
        category: category || 'Accessories',
        brand: brand || 'KHELORA',
        sku: sku.toUpperCase().trim(),
        price: Number(price),
        memberPrice: memberPrice ? Number(memberPrice) : Math.round(Number(price) * 0.85),
        costPrice: costPrice ? Number(costPrice) : Math.round(Number(price) * 0.7),
        stock: Number(stock) || 0,
        minStockAlert: Number(minStockAlert) || 5,
        image: image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
        description: description || '',
        isActive: true
      });

      if (newProduct.stock > 0) {
        await InventoryMovement.create({
          id: `mov_${Date.now()}`,
          productId: newProduct.id,
          productName: newProduct.name,
          type: 'Restock',
          quantity: newProduct.stock,
          previousStock: 0,
          newStock: newProduct.stock,
          reason: 'Initial stock entry',
          performedBy: req.user ? req.user.name : 'System Admin'
        });
      }

      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({ message: 'Error creating product.', error: error.message });
    }
  },

  async updateProduct(req, res) {
    try {
      const product = await Product.findOne({ id: req.params.id });
      if (!product) return res.status(404).json({ message: 'Product not found.' });

      const { name, category, brand, price, memberPrice, costPrice, stock, minStockAlert, image, description, isActive } = req.body;
      const prevStock = product.stock;

      if (name) product.name = name.trim();
      if (category) product.category = category;
      if (brand) product.brand = brand.trim();
      if (price !== undefined) product.price = Number(price);
      if (memberPrice !== undefined) product.memberPrice = Number(memberPrice);
      if (costPrice !== undefined) product.costPrice = Number(costPrice);
      if (minStockAlert !== undefined) product.minStockAlert = Number(minStockAlert);
      if (image !== undefined) product.image = image;
      if (description !== undefined) product.description = description;
      if (isActive !== undefined) product.isActive = Boolean(isActive);

      if (stock !== undefined && Number(stock) !== prevStock) {
        const diff = Number(stock) - prevStock;
        product.stock = Number(stock);
        await InventoryMovement.create({
          id: `mov_${Date.now()}`,
          productId: product.id,
          productName: product.name,
          type: diff > 0 ? 'Restock' : 'Correction',
          quantity: diff,
          previousStock: prevStock,
          newStock: product.stock,
          reason: 'Manual stock edit from products dashboard',
          performedBy: req.user ? req.user.name : 'System Admin'
        });
      }

      await product.save();
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: 'Error updating product.', error: error.message });
    }
  },

  async deactivateProduct(req, res) {
    try {
      const product = await Product.findOne({ id: req.params.id });
      if (!product) return res.status(404).json({ message: 'Product not found.' });

      product.isActive = false;
      await product.save();
      res.json({ message: 'Product successfully deactivated.', product });
    } catch (error) {
      res.status(500).json({ message: 'Error deactivating product.', error: error.message });
    }
  },

  async getInventoryMovements(req, res) {
    try {
      const list = await InventoryMovement.find().sort({ timestamp: -1 }).limit(100);
      res.json(list);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving inventory movements.', error: error.message });
    }
  },

  async adjustInventory(req, res) {
    try {
      const { productId, type = 'Correction', quantity, reason } = req.body;
      const numQty = Number(quantity);

      if (!productId || isNaN(numQty)) {
        return res.status(400).json({ message: 'Product ID and valid quantity change are required.' });
      }

      const product = await Product.findOne({ id: productId });
      if (!product) return res.status(404).json({ message: 'Product not found.' });

      const prevStock = product.stock;
      const newStock = prevStock + numQty;

      if (newStock < 0) {
        return res.status(400).json({ message: `Adjustment rejected: Cannot reduce stock below 0. Current: ${prevStock}` });
      }

      product.stock = newStock;
      await product.save();

      const movement = await InventoryMovement.create({
        id: `mov_${Date.now()}`,
        productId: product.id,
        productName: product.name,
        type: type || (numQty > 0 ? 'Restock' : 'Correction'),
        quantity: numQty,
        previousStock: prevStock,
        newStock: newStock,
        reason: reason || 'Inventory adjustment from management portal',
        performedBy: req.user ? req.user.name : 'Inventory Staff'
      });

      res.json({
        message: 'Stock successfully adjusted.',
        product,
        movement
      });
    } catch (error) {
      res.status(500).json({ message: 'Error adjusting inventory.', error: error.message });
    }
  }
};

productController.deleteProduct = productController.deactivateProduct;

export default productController;
