const { supabase } = require('../config/db');

function applyDbFilters(query, filter) {
  if (!filter || Object.keys(filter).length === 0) return query;
  for (const [key, value] of Object.entries(filter)) {
    const actualKey = key === '_id' ? 'id' : key;
    if (actualKey === '$or') {
      const orParts = [];
      for (const cond of value) {
        const condParts = [];
        for (const [k, v] of Object.entries(cond)) {
          const a = k === '_id' ? 'id' : k;
          if (k.includes('.')) {
            const [col, prop] = k.split('.');
            if (v && typeof v === 'object' && v.$regex) condParts.push(`${col}->>${prop}.ilike.%${v.$regex}%`);
            else condParts.push(`${col}->>${prop}.eq.${v}`);
          } else if (v && typeof v === 'object' && v.$regex) {
            condParts.push(`${a}.ilike.%${v.$regex}%`);
          } else condParts.push(`${a}.eq.${v}`);
        }
        orParts.push(condParts.join(','));
      }
      query = query.or(orParts.join(','));
    } else if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      for (const [op, opVal] of Object.entries(value)) {
        if (op === '$gte') query = query.gte(actualKey, opVal);
        else if (op === '$lte') query = query.lte(actualKey, opVal);
        else if (op === '$ne') {
          if (opVal === null || opVal === '') {
            query = query.not(actualKey, 'is', null).neq(actualKey, '');
          } else query = query.neq(actualKey, opVal);
        } else if (op === '$exists') {
          if (opVal) query = query.not(actualKey, 'is', null);
          else query = query.is(actualKey, null);
        } else if (op === '$regex') query = query.ilike(actualKey, `%${opVal}%`);
      }
    } else if (value === null) {
      query = query.is(actualKey, null);
    } else query = query.eq(actualKey, value);
  }
  return query;
}

class Document {
  constructor(row, tableName, modelClass) {
    this._tableName = tableName;
    this._modelClass = modelClass;
    Object.assign(this, row);
    if (row && row.password) {
      Object.defineProperty(this, '_originalPassword', {
        value: row.password, writable: true, enumerable: false, configurable: true,
      });
    }
    Object.defineProperty(this, '_id', {
      get() { return this.id; }, set(val) { this.id = val; }, enumerable: true, configurable: true,
    });
  }

  toObject() {
    const obj = Object.assign({}, this);
    for (const key of Object.keys(obj)) { if (key.startsWith('_')) delete obj[key]; }
    obj._id = this.id;
    return obj;
  }

  toJSON() { return this.toObject(); }
  markModified() {}

  async save() {
    const obj = this.toObject();
    const id = obj.id;
    delete obj.id; delete obj._id; delete obj.createdAt; delete obj.updatedAt;
    if (this._tableName === 'admins' && obj.password && obj.password !== this._originalPassword) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(12);
      obj.password = await bcrypt.hash(obj.password, salt);
      this.password = obj.password;
      this._originalPassword = obj.password;
    }
    const { data, error } = await supabase.from(this._tableName).update(obj).eq('id', id).select().single();
    if (error) throw error;
    if (data) Object.assign(this, data);
    return this;
  }
}

class Query {
  constructor(tableName, modelClass, filter = {}) {
    this.tableName = tableName; this.modelClass = modelClass; this.filter = filter;
    this.populates = []; this.sortOption = null; this.skipAmount = 0;
    this.limitAmount = null; this.selectFields = null; this.single = false;
  }

  populate(field, fields) { this.populates.push({ field, fields }); return this; }
  sort(option) { this.sortOption = option; return this; }
  skip(amount) { this.skipAmount = amount; return this; }
  limit(amount) { this.limitAmount = amount; return this; }
  select(fields) { this.selectFields = fields; return this; }
  then(resolve, reject) { this.exec().then(resolve).catch(reject); }

  async exec() {
    let q = supabase.from(this.tableName).select('*');
    q = applyDbFilters(q, this.filter);

    if (this.sortOption) {
      if (typeof this.sortOption === 'string') {
        const desc = this.sortOption.startsWith('-');
        const field = desc ? this.sortOption.substring(1) : this.sortOption;
        q = q.order(field === '_id' ? 'id' : field, { ascending: !desc });
      } else if (typeof this.sortOption === 'object') {
        for (const [key, val] of Object.entries(this.sortOption)) {
          const desc = val === -1 || val === 'desc' || val === 'DESC';
          q = q.order(key === '_id' ? 'id' : key, { ascending: !desc });
        }
      }
    }

    if (this.limitAmount !== null && this.skipAmount > 0) {
      q = q.range(this.skipAmount, this.skipAmount + this.limitAmount - 1);
    } else if (this.limitAmount !== null) {
      q = q.limit(this.limitAmount);
    } else if (this.skipAmount > 0) {
      q = q.range(this.skipAmount, 999999);
    }

    const { data, error } = await q;
    if (error) throw error;

    let rows = (data || []).map(row => this.modelClass.wrapRow(row));

    for (const pop of this.populates) {
      const { field, fields } = pop;
      const idsToFetch = [...new Set(rows.map(r => r[field]).filter(id => id && typeof id === 'string'))];
      if (idsToFetch.length > 0) {
        const refTableName = field === 'category' ? 'categories' : field + 's';
        let qRef = supabase.from(refTableName).select('*').in('id', idsToFetch);
        const { data: refData } = await qRef;
        const refMap = {};
        (refData || []).forEach(r => {
          const w = Object.assign({}, r);
          Object.defineProperty(w, '_id', { get() { return this.id; }, enumerable: true });
          refMap[r.id] = w;
        });
        rows.forEach(r => { if (r[field] && refMap[r[field]]) r[field] = refMap[r[field]]; });
      }
    }

    if (this.selectFields) {
      const sel = typeof this.selectFields === 'string' ? this.selectFields : '';
      if (sel.startsWith('-')) {
        const exclude = sel.substring(1);
        rows.forEach(r => delete r[exclude]);
      } else if (!sel.startsWith('+') && sel) {
        const keep = sel.split(/\s+/).filter(Boolean);
        rows = rows.map(r => {
          const nr = {};
          keep.forEach(f => { const af = f === '_id' ? 'id' : f; nr[f] = r[af]; });
          nr._id = r.id; nr.id = r.id;
          return nr;
        });
      }
    }

    if (this.single) return rows[0] || null;
    return rows;
  }
}

class BaseModel {
  constructor(tableName, documentClass = Document) {
    this.tableName = tableName; this.documentClass = documentClass;
  }

  wrapRow(row) { return row ? new this.documentClass(row, this.tableName, this) : null; }
  find(query = {}) { return new Query(this.tableName, this, query); }

  findOne(query = {}) {
    const q = new Query(this.tableName, this, query);
    q.single = true; q.limit(1);
    return q;
  }

  findById(id) { return this.findOne({ _id: id }); }

  async create(data) {
    if (this.tableName === 'admins' && data.password) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(12);
      data.password = await bcrypt.hash(data.password, salt);
    }
    const { data: result, error } = await supabase.from(this.tableName).insert([data]).select().single();
    if (error) throw error;
    return this.wrapRow(result);
  }

  async insertMany(dataArray) {
    const inserted = [];
    for (const item of dataArray) inserted.push(await this.create(item));
    return inserted;
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    let data = updateData;
    if (updateData.$set) data = Object.assign({}, updateData.$set);
    delete data._id; delete data.id;
    const { data: result, error } = await supabase.from(this.tableName).update(data).eq('id', id).select().maybeSingle();
    return result ? this.wrapRow(result) : null;
  }

  async findByIdAndDelete(id) {
    const { data: result, error } = await supabase.from(this.tableName).delete().eq('id', id).select().maybeSingle();
    return result ? this.wrapRow(result) : null;
  }

  async countDocuments(query = {}) {
    let q = supabase.from(this.tableName).select('*', { count: 'exact', head: true });
    q = applyDbFilters(q, query);
    const { count, error } = await q;
    return count || 0;
  }

  async updateMany(filter, updateData) {
    let data = updateData;
    if (updateData.$set) data = Object.assign({}, updateData.$set);
    delete data._id; delete data.id;
    let q = supabase.from(this.tableName).update(data);
    q = applyDbFilters(q, filter);
    const { data: result, error } = await q.select();
    return { modifiedCount: (result || []).length };
  }

  async deleteMany(query = {}) {
    let q = supabase.from(this.tableName).delete();
    q = applyDbFilters(q, query);
    const { data: result, error } = await q.select();
    return { deletedCount: (result || []).length };
  }

  async distinct(field, query = {}) {
    let q = supabase.from(this.tableName).select(field);
    q = applyDbFilters(q, query);
    const { data, error } = await q;
    return [...new Set((data || []).map(r => r[field]).filter(v => v !== null && v !== undefined))];
  }
}

module.exports = { BaseModel, Document, Query };
