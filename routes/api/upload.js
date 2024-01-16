const express = require('express');
const router = express.Router();

const { uploadCtrl } = require('../../controllers');

router.post('/', uploadCtrl);

module.exports = router;
