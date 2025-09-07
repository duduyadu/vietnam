const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Database
const db = require('./config/database');

// Routes
const authRoutes = require('./routes/auth');
const studentsRoutes = require('./routes/students');
const consultationsRoutes = require('./routes/consultations');
const menuRoutes = require('./routes/menu');
const usersRoutes = require('./routes/users');
const filesRoutes = require('./routes/files');
const excelRoutes = require('./routes/excel');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/consultations', consultationsRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/excel', excelRoutes);

// Agencies routes - Direct implementation
app.get('/api/agencies', async (req, res) => {
  try {
    const agencies = await db('agencies')
      .select('*')
      .orderBy('agency_name', 'asc');
    
    res.json({
      success: true,
      data: agencies
    });
  } catch (error) {
    console.error('Get agencies error:', error);
    res.status(500).json({ 
      error: 'Failed to get agencies',
      message: error.message 
    });
  }
});

app.post('/api/agencies', async (req, res) => {
  try {
    const { agency_name, agency_code, contact_person, phone, email, address } = req.body;

    if (!agency_name || !agency_code) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message_ko: '유학원명과 코드는 필수입니다'
      });
    }

    // Check for duplicate code
    const existing = await db('agencies')
      .where('agency_code', agency_code)
      .first();
    
    if (existing) {
      return res.status(400).json({ 
        error: 'Agency code already exists',
        message_ko: '이미 존재하는 유학원 코드입니다'
      });
    }

    const [agency] = await db('agencies').insert({
      agency_name,
      agency_code,
      contact_person,
      phone,
      email,
      address
    }).returning('*');

    res.json({
      success: true,
      data: agency,
      message_ko: '유학원이 등록되었습니다'
    });
  } catch (error) {
    console.error('Create agency error:', error);
    res.status(500).json({ 
      error: 'Failed to create agency',
      message: error.message 
    });
  }
});

app.put('/api/agencies/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { agency_name, contact_person, phone, email, address } = req.body;

    const [agency] = await db('agencies')
      .where('agency_id', id)
      .update({
        agency_name,
        contact_person,
        phone,
        email,
        address
      })
      .returning('*');

    res.json({
      success: true,
      data: agency,
      message_ko: '유학원 정보가 수정되었습니다'
    });
  } catch (error) {
    console.error('Update agency error:', error);
    res.status(500).json({ 
      error: 'Failed to update agency',
      message: error.message 
    });
  }
});

app.delete('/api/agencies/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await db('agencies')
      .where('agency_id', id)
      .delete();

    res.json({
      success: true,
      message_ko: '유학원이 삭제되었습니다'
    });
  } catch (error) {
    console.error('Delete agency error:', error);
    res.status(500).json({ 
      error: 'Failed to delete agency',
      message: error.message 
    });
  }
});

// Static files
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Vietnam Student Management System API',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;