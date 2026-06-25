const { BaseModel } = require('./BaseModel');

class ProductModel extends BaseModel {
  constructor() {
    super('products');
  }
}

module.exports = new ProductModel();
