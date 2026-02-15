// routes/patients.routes.js
const express = require('express');
const Patient = require('../models/Patient');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const payload = req.body;
    payload.createdBy = req.user.id;
    const p = await Patient.create(payload);
    res.status(201).json(p);
  } catch (err) {
    console.error('create patient', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const patients = await Patient.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    console.error('list patients', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

router.get('/:id', auth, async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ msg: 'Paciente no encontrado' });
  res.json(patient);
});

router.put('/:id', auth, async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!patient) return res.status(404).json({ msg: 'Paciente no encontrado' });
  res.json(patient);
});

router.delete('/:id', auth, async (req, res) => {
  await Patient.findByIdAndDelete(req.params.id);
  res.json({ msg: 'Paciente eliminado' });
});

module.exports = router;
