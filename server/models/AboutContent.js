const { BaseModel } = require('./BaseModel');

class AboutContentModel extends BaseModel {
  constructor() {
    super('about_contents');
  }
}

module.exports = new AboutContentModel();
