const { BaseModel } = require('./BaseModel');

class ArticleModel extends BaseModel {
  constructor() {
    super('articles');
  }
}

module.exports = new ArticleModel();
