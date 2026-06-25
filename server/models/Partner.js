const { BaseModel } = require('./BaseModel');

class PartnerModel extends BaseModel {
  constructor() {
    super('partners');
  }
}

module.exports = new PartnerModel();
