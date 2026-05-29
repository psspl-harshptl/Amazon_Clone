const SellerService = require('../services/SellerService');

function parseCSV(text) {
  const lines = [];
  let row = [""];
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const next = text[i+1];

    if (c === '"') {
      if (inQuotes && next === '"') {
        row[row.length - 1] += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      row.push('');
    } else if ((c === '\r' || c === '\n') && !inQuotes) {
      if (c === '\r' && next === '\n') {
        i++;
      }
      lines.push(row);
      row = [''];
    } else {
      row[row.length - 1] += c;
    }
  }
  if (row.length > 1 || row[0] !== '') {
    lines.push(row);
  }
  return lines;
}

class SellerController {
  async getDashboard(req, res) {
    try {
      const stats = await SellerService.getDashboardStats(req.user.id);
      res.json({ success: true, data: stats });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getMyProducts(req, res) {
    try {
      const products = await SellerService.getMyProducts(req.user.id);
      res.json({ success: true, data: products });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async createProduct(req, res) {
    try {
      const product = await SellerService.createProduct(req.user.id, req.body);
      res.status(201).json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async updateProduct(req, res) {
    try {
      const product = await SellerService.updateProduct(req.user.id, req.params.id, req.body);
      res.json({ success: true, data: product });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      await SellerService.deleteProduct(req.user.id, req.params.id);
      res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async requestCategory(req, res) {
    try {
      const request = await SellerService.requestCategory(req.user.id, req.body.name);
      res.status(201).json({ success: true, data: request, message: 'Category request submitted' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async bulkUploadProducts(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const csvText = req.file.buffer.toString('utf-8');
      const lines = parseCSV(csvText);

      if (lines.length <= 1) {
        return res.status(400).json({ success: false, message: 'CSV file is empty or missing data rows' });
      }

      const headers = lines[0].map(h => h.trim().toLowerCase());
      
      const colIndices = {
        name: headers.indexOf('name'),
        description: headers.indexOf('description'),
        price: headers.indexOf('price'),
        mrp: headers.indexOf('mrp'),
        stock: headers.indexOf('stock'),
        category: headers.indexOf('category'),
        brand: headers.indexOf('brand'),
        imageUrl: headers.includes('image_url') ? headers.indexOf('image_url') : headers.indexOf('imageurl')
      };

      if (colIndices.name === -1 || colIndices.price === -1 || colIndices.category === -1) {
        return res.status(400).json({
          success: false,
          message: 'CSV must contain at least "name", "price", and "category" headers.'
        });
      }

      const logs = [];
      let successCount = 0;
      let failureCount = 0;

      const { Category } = require('../models');
      const dbCategories = await Category.findAll();
      const categoryMap = {};
      dbCategories.forEach(cat => {
        categoryMap[cat.name.toLowerCase()] = cat.id;
      });

      for (let i = 1; i < lines.length; i++) {
        const row = lines[i];
        if (row.length === 0 || (row.length === 1 && row[0].trim() === '')) {
          continue;
        }

        const rowNum = i + 1;
        try {
          const name = row[colIndices.name]?.trim();
          const description = colIndices.description !== -1 ? row[colIndices.description]?.trim() : '';
          const priceRaw = colIndices.price !== -1 ? row[colIndices.price]?.trim() : '';
          const mrpRaw = colIndices.mrp !== -1 ? row[colIndices.mrp]?.trim() : '';
          const stockRaw = colIndices.stock !== -1 ? row[colIndices.stock]?.trim() : '';
          const categoryName = colIndices.category !== -1 ? row[colIndices.category]?.trim() : '';
          const brand = colIndices.brand !== -1 ? row[colIndices.brand]?.trim() : '';
          const imageUrl = colIndices.imageUrl !== -1 ? row[colIndices.imageUrl]?.trim() : '';

          if (!name) {
            throw new Error('Product name is required');
          }
          if (!priceRaw) {
            throw new Error('Price is required');
          }
          const price = parseFloat(priceRaw);
          if (isNaN(price) || price < 0) {
            throw new Error('Price must be a valid non-negative number');
          }

          let mrp = null;
          if (mrpRaw) {
            mrp = parseFloat(mrpRaw);
            if (isNaN(mrp) || mrp < 0) {
              throw new Error('MRP must be a valid non-negative number');
            }
          }

          let stock = 0;
          if (stockRaw) {
            stock = parseInt(stockRaw, 10);
            if (isNaN(stock) || stock < 0) {
              throw new Error('Stock must be a valid non-negative integer');
            }
          }

          if (!categoryName) {
            throw new Error('Category name is required');
          }

          let categoryId = categoryMap[categoryName.toLowerCase()];
          if (!categoryId) {
            throw new Error(`Category "${categoryName}" does not exist`);
          }

          await SellerService.createProduct(req.user.id, {
            name,
            description,
            price,
            mrp,
            stock,
            categoryId,
            imageUrl,
            brand,
            imageUrls: imageUrl ? [imageUrl] : []
          });

          successCount++;
          logs.push({ row: rowNum, status: 'success', name, message: 'Product imported successfully' });
        } catch (error) {
          failureCount++;
          logs.push({ row: rowNum, status: 'failure', name: row[colIndices.name] || 'Unknown', message: error.message });
        }
      }

      res.json({
        success: true,
        data: {
          successCount,
          failureCount,
          logs
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new SellerController();
