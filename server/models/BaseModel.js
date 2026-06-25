const { pool } = require('../config/db');

// Helper to compile Mongoose-style query filters to SQL WHERE clauses
function buildWhereClause(filter, startParamIndex = 1) {
  const whereClauses = [];
  const values = [];
  let paramCounter = startParamIndex;

  if (!filter || Object.keys(filter).length === 0) {
    return { whereSql: '', values, nextParamIndex: paramCounter };
  }

  for (const [key, value] of Object.entries(filter)) {
    let actualKey = key === '_id' ? 'id' : key;

    if (actualKey === '$or') {
      const orClauses = [];
      for (const cond of value) {
        for (const [subKey, subVal] of Object.entries(cond)) {
          if (subKey.includes('.')) {
            // Nested JSON field query: e.g. 'name.en' -> "name"->>'en'
            const [jsonCol, jsonProp] = subKey.split('.');
            if (subVal && typeof subVal === 'object' && subVal.$regex) {
              orClauses.push(`"${jsonCol}"->>'${jsonProp}' ILIKE $${paramCounter}`);
              values.push(`%${subVal.$regex}%`);
              paramCounter++;
            } else {
              orClauses.push(`"${jsonCol}"->>'${jsonProp}' = $${paramCounter}`);
              values.push(String(subVal));
              paramCounter++;
            }
          } else {
            if (subVal && typeof subVal === 'object' && subVal.$regex) {
              orClauses.push(`"${subKey}" ILIKE $${paramCounter}`);
              values.push(`%${subVal.$regex}%`);
              paramCounter++;
            } else {
              orClauses.push(`"${subKey}" = $${paramCounter}`);
              values.push(subVal);
              paramCounter++;
            }
          }
        }
      }
      if (orClauses.length > 0) {
        whereClauses.push(`(${orClauses.join(' OR ')})`);
      }
    } else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      for (const [op, opVal] of Object.entries(value)) {
        if (op === '$gte') {
          whereClauses.push(`"${actualKey}" >= $${paramCounter}`);
          values.push(opVal);
          paramCounter++;
        } else if (op === '$lte') {
          whereClauses.push(`"${actualKey}" <= $${paramCounter}`);
          values.push(opVal);
          paramCounter++;
        } else if (op === '$ne') {
          if (opVal === null || opVal === '') {
            whereClauses.push(`("${actualKey}" IS NOT NULL AND "${actualKey}" != '')`);
          } else {
            whereClauses.push(`"${actualKey}" != $${paramCounter}`);
            values.push(opVal);
            paramCounter++;
          }
        } else if (op === '$exists') {
          if (opVal) {
            whereClauses.push(`"${actualKey}" IS NOT NULL`);
          } else {
            whereClauses.push(`"${actualKey}" IS NULL`);
          }
        } else if (op === '$regex') {
          whereClauses.push(`"${actualKey}" ILIKE $${paramCounter}`);
          values.push(`%${opVal}%`);
          paramCounter++;
        }
      }
    } else {
      if (value === null) {
        whereClauses.push(`"${actualKey}" IS NULL`);
      } else {
        whereClauses.push(`"${actualKey}" = $${paramCounter}`);
        values.push(value);
        paramCounter++;
      }
    }
  }

  const whereSql = whereClauses.length > 0 ? ` WHERE ${whereClauses.join(' AND ')}` : '';
  return { whereSql, values, nextParamIndex: paramCounter };
}

// Document class returned by queries
class Document {
  constructor(row, tableName, modelClass) {
    this._tableName = tableName;
    this._modelClass = modelClass;
    Object.assign(this, row);

    // Keep track of original password to detect modifications
    if (row && row.password) {
      Object.defineProperty(this, '_originalPassword', {
        value: row.password,
        writable: true,
        enumerable: false,
        configurable: true
      });
    }

    // Map id to _id
    Object.defineProperty(this, '_id', {
      get() { return this.id; },
      set(val) { this.id = val; },
      enumerable: true,
      configurable: true
    });
  }

  toObject() {
    const obj = Object.assign({}, this);
    // Remove internal helper properties
    for (const key of Object.keys(obj)) {
      if (key.startsWith('_')) delete obj[key];
    }
    obj._id = this.id;
    return obj;
  }

  toJSON() {
    return this.toObject();
  }

  markModified(field) {
    // Mongoose specific dirty checking method - no-op for PG since we save all fields.
  }

  async save() {
    const obj = this.toObject();
    const id = obj.id;
    delete obj.id;
    delete obj._id;
    delete obj.createdAt;
    delete obj.updatedAt;

    // Check pre-save hook for password in Admin
    if (this._tableName === 'admins' && obj.password && obj.password !== this._originalPassword) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(12);
      obj.password = await bcrypt.hash(obj.password, salt);
      this.password = obj.password;
      this._originalPassword = obj.password;
    }

    const setClauses = [];
    const values = [];
    let paramCounter = 1;

    for (const [key, value] of Object.entries(obj)) {
      setClauses.push(`"${key}" = $${paramCounter}`);
      if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
      paramCounter++;
    }

    values.push(id);
    const sql = `UPDATE ${this._tableName} SET ${setClauses.join(', ')} WHERE id = $${paramCounter} RETURNING *`;
    const result = await pool.query(sql, values);
    
    if (result.rows[0]) {
      Object.assign(this, result.rows[0]);
    }
    return this;
  }
}

// Thenable query builder for chainable queries
class Query {
  constructor(tableName, modelClass, filter = {}) {
    this.tableName = tableName;
    this.modelClass = modelClass;
    this.filter = filter;
    this.populates = [];
    this.sortOption = null;
    this.skipAmount = 0;
    this.limitAmount = null;
    this.selectFields = null;
    this.single = false;
  }

  populate(field, fields) {
    this.populates.push({ field, fields });
    return this;
  }

  sort(option) {
    this.sortOption = option;
    return this;
  }

  skip(amount) {
    this.skipAmount = amount;
    return this;
  }

  limit(amount) {
    this.limitAmount = amount;
    return this;
  }

  select(fields) {
    this.selectFields = fields;
    return this;
  }

  // Implementation of thenable interface to support await
  async then(resolve, reject) {
    try {
      const res = await this.exec();
      resolve(res);
    } catch (err) {
      reject(err);
    }
  }

  async exec() {
    let sql = `SELECT * FROM ${this.tableName}`;
    const { whereSql, values } = buildWhereClause(this.filter);
    sql += whereSql;

    // Sorting
    if (this.sortOption) {
      const orderFields = [];
      if (typeof this.sortOption === 'string') {
        const desc = this.sortOption.startsWith('-');
        const field = desc ? this.sortOption.substring(1) : this.sortOption;
        const actualField = field === '_id' ? 'id' : field;
        orderFields.push(`"${actualField}" ${desc ? 'DESC' : 'ASC'}`);
      } else if (typeof this.sortOption === 'object') {
        for (const [key, val] of Object.entries(this.sortOption)) {
          const actualKey = key === '_id' ? 'id' : key;
          const desc = val === -1 || val === 'desc' || val === 'DESC';
          orderFields.push(`"${actualKey}" ${desc ? 'DESC' : 'ASC'}`);
        }
      }
      if (orderFields.length > 0) {
        sql += ` ORDER BY ${orderFields.join(', ')}`;
      }
    }

    // Limit and Skip
    if (this.limitAmount !== null) {
      sql += ` LIMIT ${this.limitAmount}`;
    }
    if (this.skipAmount > 0) {
      sql += ` OFFSET ${this.skipAmount}`;
    }

    const result = await pool.query(sql, values);
    let rows = result.rows.map(row => this.modelClass.wrapRow(row));

    // Handle joins (populate)
    if (this.populates.length > 0 && rows.length > 0) {
      for (const pop of this.populates) {
        const { field, fields } = pop;
        const idsToFetch = [...new Set(rows.map(r => r[field]).filter(id => id && typeof id === 'string'))];
        if (idsToFetch.length > 0) {
          const refTableName = field === 'category' ? 'categories' : field + 's';
          let selectCols = '*';
          if (fields) {
            const colList = fields.split(/\s+/).filter(Boolean).map(c => c === '_id' ? 'id' : `"${c}"`);
            if (!colList.includes('id')) colList.push('id');
            selectCols = colList.join(', ');
          }
          const refResult = await pool.query(`SELECT ${selectCols} FROM ${refTableName} WHERE id = ANY($1)`, [idsToFetch]);
          const refMap = {};
          refResult.rows.forEach(r => {
            const wrapped = Object.assign({}, r);
            Object.defineProperty(wrapped, '_id', { get() { return this.id; }, enumerable: true });
            refMap[r.id] = wrapped;
          });
          rows.forEach(r => {
            if (r[field] && refMap[r[field]]) {
              r[field] = refMap[r[field]];
            }
          });
        }
      }
    }

    // Select fields exclusion / inclusion
    if (this.selectFields) {
      let selectStr = typeof this.selectFields === 'string' ? this.selectFields : '';
      if (selectStr.startsWith('-')) {
        const exclude = selectStr.substring(1);
        rows.forEach(r => {
          delete r[exclude];
        });
      } else if (!selectStr.startsWith('+') && selectStr) {
        const keepFields = selectStr.split(/\s+/).filter(Boolean);
        rows = rows.map(r => {
          const newRow = {};
          keepFields.forEach(f => {
            const actualF = f === '_id' ? 'id' : f;
            newRow[f] = r[actualF];
          });
          newRow._id = r.id;
          newRow.id = r.id;
          return newRow;
        });
      }
    }

    if (this.single) {
      return rows[0] || null;
    }
    return rows;
  }
}

// Base Model Class
class BaseModel {
  constructor(tableName, documentClass = Document) {
    this.tableName = tableName;
    this.documentClass = documentClass;
  }

  wrapRow(row) {
    if (!row) return null;
    return new this.documentClass(row, this.tableName, this);
  }

  find(query = {}) {
    return new Query(this.tableName, this, query);
  }

  findOne(query = {}) {
    const q = new Query(this.tableName, this, query);
    q.single = true;
    q.limit(1);
    return q;
  }

  findById(id) {
    return this.findOne({ _id: id });
  }

  async create(data) {
    // If Admin creation, hash password before inserting
    if (this.tableName === 'admins' && data.password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(12);
      data.password = await bcrypt.hash(data.password, salt);
    }

    const columns = [];
    const setParams = [];
    const values = [];
    let paramCounter = 1;

    for (const [key, value] of Object.entries(data)) {
      columns.push(`"${key}"`);
      setParams.push(`$${paramCounter}`);
      if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
      paramCounter++;
    }

    const sql = `INSERT INTO ${this.tableName} (${columns.join(', ')}) VALUES (${setParams.join(', ')}) RETURNING *`;
    const result = await pool.query(sql, values);
    return this.wrapRow(result.rows[0]);
  }

  async insertMany(dataArray) {
    const inserted = [];
    for (const item of dataArray) {
      inserted.push(await this.create(item));
    }
    return inserted;
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    let data = updateData;
    if (updateData.$set) {
      data = Object.assign({}, updateData.$set);
    }
    delete data._id;
    delete data.id;

    const setClauses = [];
    const values = [];
    let paramCounter = 1;

    for (const [key, value] of Object.entries(data)) {
      setClauses.push(`"${key}" = $${paramCounter}`);
      if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
      paramCounter++;
    }

    if (setClauses.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const sql = `UPDATE ${this.tableName} SET ${setClauses.join(', ')} WHERE id = $${paramCounter} RETURNING *`;
    const result = await pool.query(sql, values);
    return result.rows[0] ? this.wrapRow(result.rows[0]) : null;
  }

  async findByIdAndDelete(id) {
    const sql = `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`;
    const result = await pool.query(sql, [id]);
    return result.rows[0] ? this.wrapRow(result.rows[0]) : null;
  }

  async countDocuments(query = {}) {
    let sql = `SELECT COUNT(*) FROM ${this.tableName}`;
    const { whereSql, values } = buildWhereClause(query);
    sql += whereSql;
    
    const result = await pool.query(sql, values);
    return parseInt(result.rows[0].count);
  }

  async updateMany(filter, updateData) {
    let data = updateData;
    if (updateData.$set) {
      data = Object.assign({}, updateData.$set);
    }
    delete data._id;
    delete data.id;

    const setClauses = [];
    const values = [];
    let paramCounter = 1;

    for (const [key, value] of Object.entries(data)) {
      setClauses.push(`"${key}" = $${paramCounter}`);
      if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
        values.push(JSON.stringify(value));
      } else {
        values.push(value);
      }
      paramCounter++;
    }

    if (setClauses.length === 0) return { modifiedCount: 0 };

    const { whereSql, values: filterValues } = buildWhereClause(filter, paramCounter);
    values.push(...filterValues);

    const sql = `UPDATE ${this.tableName} SET ${setClauses.join(', ')}${whereSql}`;
    const result = await pool.query(sql, values);
    return { modifiedCount: result.rowCount };
  }

  async deleteMany(query = {}) {
    let sql = `DELETE FROM ${this.tableName}`;
    const { whereSql, values } = buildWhereClause(query);
    sql += whereSql;

    const result = await pool.query(sql, values);
    return { deletedCount: result.rowCount };
  }

  async distinct(field, query = {}) {
    let sql = `SELECT DISTINCT "${field}" FROM ${this.tableName}`;
    const { whereSql, values } = buildWhereClause(query);
    sql += whereSql;

    const result = await pool.query(sql, values);
    return result.rows.map(r => r[field]).filter(val => val !== null);
  }
}

module.exports = {
  BaseModel,
  Document,
  Query,
};
