const csv = require('csv-parser');
const { Readable } = require('stream');

const upload = (req, res) => {
  const { file, uploadedFileName } = req;

  if (!file) {
    return res.status(400).send('Invalid request: No file provided');
  }

  try {
    const readableStream = new Readable();
    readableStream._read = () => {};
    readableStream.push(file.buffer);
    readableStream.push(null);

    const results = [];

    readableStream
      .pipe(csv({ encoding: 'utf16le' }))
      .on('data', data => {
        results.push(data);
      })
      .on('end', () => {
        res.json({ data: results, fileName: uploadedFileName });
      })
      .on('error', error => {
        console.error('Error parsing CSV:', error);
        res.status(500).send('Error parsing CSV');
      });
  } catch (error) {
    console.error('Error handling file:', error);
    res.status(500).send('Internal Server Error', error);
  }
};

module.exports = upload;
