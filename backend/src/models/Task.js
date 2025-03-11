const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  duration: {
    type: Number,
    required: true,
    min: 1
  },
  startDate: {
    type: String // YYYY-MM-DD形式で保存
  },
  endDate: {
    type: String // YYYY-MM-DD形式で保存
  },
  assignee: {
    type: String,
    trim: true
  },
  dependencies: [{
    type: Number // タスクID
  }],
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  taskId: {
    type: Number,
    required: true
  }
}, { timestamps: true });

// AWS DynamoDBへの移行を容易にするインデックスの追加
TaskSchema.index({ projectId: 1 });
TaskSchema.index({ taskId: 1 });

module.exports = mongoose.model('Task', TaskSchema);