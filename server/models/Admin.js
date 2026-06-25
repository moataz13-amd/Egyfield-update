const bcrypt = require('bcryptjs');
const { BaseModel, Document } = require('./BaseModel');

class AdminDocument extends Document {
  async comparePassword(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }
}

class AdminModel extends BaseModel {
  constructor() {
    super('admins', AdminDocument);
  }
}

module.exports = new AdminModel();
