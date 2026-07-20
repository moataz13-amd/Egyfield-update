const { BaseModel } = require('./BaseModel');
class SeoPageModel extends BaseModel {
  constructor() { super('seo_pages'); }
}
module.exports = new SeoPageModel();
