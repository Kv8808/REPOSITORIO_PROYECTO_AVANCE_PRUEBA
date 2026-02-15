// scripts/seedUsers.js
require('dotenv').config();
const connectDB = require('../config/db');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const seed = async () => {
  try {
    await connectDB();
    const list = [];
    for (let i = 1; i <= 10; i++) {
      list.push({ name: `Trabajador ${i}`, email: `user${i}@example.com`, password: '123456' });
    }
    for (const u of list) {
      if (await User.findOne({ email: u.email })) {
        console.log('ya existe', u.email);
        continue;
      }
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(u.password, salt);
      await User.create({ name: u.name, email: u.email, password: hashed });
      console.log('creado', u.email);
    }
    console.log('seed completado');
    process.exit(0);
  } catch (err) {
    console.error('seed error', err);
    process.exit(1);
  }
};

seed();
