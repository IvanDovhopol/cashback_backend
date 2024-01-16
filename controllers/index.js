const { ctrlWrapper } = require('../helpers');

const uploadCtrl = require('./upload');

module.exports = { uploadCtrl: ctrlWrapper(uploadCtrl) };
