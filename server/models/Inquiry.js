const { BaseModel } = require('./BaseModel');

class InquiryModel extends BaseModel {
  constructor() {
    super('inquiries');
  }
}

module.exports = new InquiryModel();
