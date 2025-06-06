const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const doctorRoutes = require('./routes/doctorRoutes');
const rosterRoutes = require('./routes/rosterRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const workloadRoutes = require('./routes/workloadRoutes');
const fairnessRoutes = require('./routes/fairnessRoutes');

// Initialize notification scheduler
require('./utils/notificationScheduler');

// Load June 2025 roster data
const { loadJuneRoster } = require('./utils/loadRosterData');
loadJuneRoster();

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "'unsafe-eval'",
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com"
      ],
      scriptSrcAttr: ["'unsafe-inline'"],
      styleSrc: [
        "'self'", 
        "'unsafe-inline'", 
        "https://cdn.jsdelivr.net",
        "https://cdnjs.cloudflare.com"
      ],
      fontSrc: [
        "'self'", 
        "https://cdnjs.cloudflare.com"
      ],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.use('/api/doctors', doctorRoutes);
app.use('/api/roster', rosterRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/workload', workloadRoutes);
app.use('/api/fairness', fairnessRoutes);

app.get('/', (req, res) => {
  res.render('dashboard', { hospital: 'Fayfa General Hospital' });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';

console.log('Starting server...');
const server = app.listen(PORT, HOST, () => {
  const url = process.env.NODE_ENV === 'production' 
    ? `Application running on port ${PORT}` 
    : `http://127.0.0.1:${PORT}`;
  console.log(`Fayfa ER Roster app running on ${url}`);
  console.log('Server is ready to accept connections');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

module.exports = app;