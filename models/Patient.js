// models/Patient.js
const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  nombrePaciente: { type: String, required: true },
  fechaIngreso: Date,
  edad: Number,
  sexo: String,
  estadoCivil: String,
  numeroHijos: Number,
  ocupacion: String,
  calleYNúmero: String,
  codigoPostal: String,
  localidad: String,
  municipio: String,
  estado: String,
  diagnostico: String,
  tratamiento: String,
  duracionDias: Number,
  hospital: String,
  telefono: String,
  observaciones: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
