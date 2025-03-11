const mongoose = require('mongoose');

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  startDate: {
    type: String, // YYYY-MM-DD形式で保存
    required: true
  },
  deadlineDate: {
    type: String, // YYYY-MM-DD形式で保存
    required: true
  },
  selectedPreset: {
    type: String
  },
  selectedCountries: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['planning', 'inProgress', 'completed'],
    default: 'planning'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// AWS DynamoDBへの移行を容易にするインデックスの追加
ProjectSchema.index({ userId: 1 });

module.exports = mongoose.model('Project', ProjectSchema);