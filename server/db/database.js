const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const uuidv4 = () => crypto.randomUUID();

const isServerless = !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME || !!process.env.NETLIFY;
const BUNDLED_DB_PATH = path.join(__dirname, 'data.json');
const DB_PATH = isServerless ? path.join('/tmp', 'data.json') : BUNDLED_DB_PATH;
const TEMP_PATH = isServerless ? path.join('/tmp', 'data.temp.json') : path.join(__dirname, 'data.temp.json');

class Database {
  constructor() {
    this.data = {
      users: [],
      farmer_profiles: [],
      buyer_profiles: [],
      crops: [],
      crop_listings: [],
      crop_quality_records: [],
      markets: [],
      market_prices: [],
      buyers: [],
      buyer_requirements: [],
      offers: [],
      negotiations: [],
      orders: [],
      payments: [],
      logistics: [],
      predictions: [],
      price_alerts: [],
      notifications: [],
      weather_data: []
    };
    this.init();
  }

  init() {
    try {
      if (isServerless && !fs.existsSync(DB_PATH) && fs.existsSync(BUNDLED_DB_PATH)) {
        fs.copyFileSync(BUNDLED_DB_PATH, DB_PATH);
      }
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      } else if (fs.existsSync(BUNDLED_DB_PATH)) {
        const raw = fs.readFileSync(BUNDLED_DB_PATH, 'utf8');
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
      } else {
        this.save();
      }
    } catch (err) {
      console.error('[DB] Error initializing database:', err.message);
      this.save();
    }
  }

  save() {
    try {
      const serialized = JSON.stringify(this.data, null, 2);
      fs.writeFileSync(TEMP_PATH, serialized, 'utf8');
      fs.renameSync(TEMP_PATH, DB_PATH);
    } catch (err) {
      console.error('[DB] Error persisting database:', err.message);
    }
  }

  collection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }

    const col = this.data[name];
    const self = this;

    return {
      find(predicate = () => true) {
        if (typeof predicate === 'object') {
          return col.filter(item => {
            return Object.entries(predicate).every(([key, val]) => item[key] === val);
          });
        }
        return col.filter(predicate);
      },

      findOne(predicate) {
        if (typeof predicate === 'object') {
          return col.find(item => {
            return Object.entries(predicate).every(([key, val]) => item[key] === val);
          }) || null;
        }
        return col.find(predicate) || null;
      },

      findById(id) {
        return col.find(item => item.id === id) || null;
      },

      insert(doc) {
        const newDoc = {
          id: doc.id || uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...doc
        };
        col.push(newDoc);
        self.save();
        return newDoc;
      },

      insertMany(docs) {
        const newDocs = docs.map(doc => ({
          id: doc.id || uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          ...doc
        }));
        col.push(...newDocs);
        self.save();
        return newDocs;
      },

      update(id, updates) {
        const index = col.findIndex(item => item.id === id);
        if (index === -1) return null;
        col[index] = {
          ...col[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        self.save();
        return col[index];
      },

      delete(id) {
        const index = col.findIndex(item => item.id === id);
        if (index === -1) return false;
        col.splice(index, 1);
        self.save();
        return true;
      },

      count(predicate = () => true) {
        return this.find(predicate).length;
      }
    };
  }
}

const db = new Database();
module.exports = db;
