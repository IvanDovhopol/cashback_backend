const express = require('express');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '30mb' }));

const uploadDir = path.join(__dirname, 'uploads');
let filePath;

// Создаем директорию, если ее нет
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
  // Удаляем все файлы в директории
  const files = fs.readdirSync(uploadDir);
  files.forEach(file => {
    const filePath = path.join(uploadDir, file);
    fs.unlinkSync(filePath);
    console.log(`Deleted file: ${filePath}`);
  });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
    filePath = path.join(uploadDir, file.originalname);
  },
});

const upload = multer({ storage });

app.get('/read-csv', (req, res) => {
  if (!filePath) {
    console.log('File not uploaded yet');
    return res.status(500).send('File not uploaded yet');
  }

  const results = [];

  console.log('filePath2: ', filePath);

  fs.createReadStream(filePath, { encoding: 'utf16le' })
    .pipe(csv())
    .on('data', data => {
      // console.log('data: ', data);
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

app.post('/upload', upload.single('file'), (req, res) => {
  const { file, body } = req;

  if (!file) {
    return res.status(400).send('Invalid request: No file provided');
  }

  const filePath = path.join(uploadDir, file.originalname);

  fs.writeFile(filePath, file.buffer, err => {
    if (err) {
      console.error('Error writing file:', err);
      return res.status(500).send('Internal Server Error');
    }

    const results = [];

    fs.createReadStream(filePath, { encoding: 'utf16le' })
      .pipe(csv())
      .on('data', data => {
        results.push(data);
      })
      .on('end', () => {
        res.json({ filePath, data: results });
      })
      .on('error', error => {
        console.error('Error reading CSV file:', error);
        res.status(500).send('Internal Server Error');
      });
  });
});

app.listen(3001, () => {
  console.log(`app start on port ${PORT}`);
});
