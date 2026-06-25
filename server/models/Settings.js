const { BaseModel } = require('./BaseModel');

class SettingsModel extends BaseModel {
  constructor() {
    super('settings');
  }
}

module.exports = new SettingsModel();
