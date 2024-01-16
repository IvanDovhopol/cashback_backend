const express = require('express');
const logger = require('morgan');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');
require('dotenv').config();

const uploadRouter = require('./routes/api/upload');

const app = express();
const { PORT = 3001 } = process.env;

app.use(logger('dev'));
app.use(cors());
app.use(express.json({ limit: '30mb' }));

const uploadDir = path.join(__dirname, 'uploads');
let filePath;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const fileName = 'uploadedFile.csv';
    cb(null, fileName);
    filePath = path.join(uploadDir, fileName);
    req.uploadedFileName = file.originalname;
  },
});

const upload = multer({ storage });

app.use('/', upload.single('file'), uploadRouter);

app.get('/', (req, res) => {
  if (!filePath) return res.send([]);

  const results = [];

  fs.createReadStream(filePath, { encoding: 'utf16le' })
    .pipe(csv())
    .on('data', data => {
      results.push(data);
    })
    .on('end', () => {
      res.json(results);
    })
    .on('error', error => {
      console.error('Error reading CSV file:', error);
      res.status(500).send('Internal Server Error');
    });
});

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

app.use((err, req, res, next) => {
  const { status = 500, message = 'Server error' } = err;
  res.status(status).json({ message });
});

app.listen(PORT);
