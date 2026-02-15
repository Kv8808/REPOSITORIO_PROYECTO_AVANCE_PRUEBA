// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'frontend')));

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users.routes');
const patientRoutes = require('./routes/patients.routes');

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// servir login por defecto
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'frontend', 'login.html')));

const PORT = process.env.PORT || 3000;
(async () => {
  try {
    await connectDB();
    app.listen(PORT, () => console.log(`Servidor corriendo en http://localhost:${PORT}`));
  } catch (err) {
    console.error('No se pudo iniciar la app', err);
  }
})();
