// routes/users.routes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// allow register only if < 10 users
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ msg: 'Faltan campos' });
    const count = await User.countDocuments();
    if (count >= 10) return res.status(403).json({ msg: 'Máximo de cuentas alcanzado' });
    if (await User.findOne({ email })) return res.status(400).json({ msg: 'Usuario ya existe' });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const u = await User.create({ name, email, password: hashed });
    res.status(201).json({ msg: 'Usuario creado', userId: u._id });
  } catch (err) {
    console.error('register error', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

router.put('/:id', auth, async (req, res) => {
  const { name, email } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { name, email }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ msg: 'Usuario no encontrado' });
  res.json(user);
});

router.delete('/:id', auth, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Usuario eliminado' });
});

module.exports = router;
