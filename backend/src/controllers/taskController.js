const Task = require('../models/Task');
const Project = require('../models/Project');
const { validationResult } = require('express-validator');

// プロジェクトへのアクセス権をチェック
const checkProjectAccess = async (projectId, userId) => {
  const project = await Project.findOne({ _id: projectId, userId });
  return !!project;
};

// プロジェクトのすべてのタスクを取得
exports.getTasks = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    // プロジェクトへのアクセス権をチェック
    const hasAccess = await checkProjectAccess(projectId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to access this project' });
    }
    
    const tasks = await Task.find({ projectId }).sort({ taskId: 1 });
    res.json(tasks);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// タスク詳細を取得
exports.getTask = async (req, res) => {
  try {
    const { projectId, taskId } = req.params;
    
    // プロジェクトへのアクセス権をチェック
    const hasAccess = await checkProjectAccess(projectId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to access this project' });
    }
    
    const task = await Task.findOne({ projectId, taskId });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    res.json(task);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// 新規タスク作成
exports.createTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { projectId } = req.params;
  const {
    name,
    duration,
    startDate,
    endDate,
    assignee,
    dependencies,
    taskId
  } = req.body;
  
  try {
    // プロジェクトへのアクセス権をチェック
    const hasAccess = await checkProjectAccess(projectId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to access this project' });
    }
    
    // 次のタスクIDを取得
    let nextTaskId = taskId;
    if (!nextTaskId) {
      const maxTaskIdTask = await Task.findOne({ projectId }).sort({ taskId: -1 });
      nextTaskId = maxTaskIdTask ? maxTaskIdTask.taskId + 1 : 1;
    }
    
    // 新規タスク作成
    const task = new Task({
      projectId,
      taskId: nextTaskId,
      name,
      duration,
      startDate,
      endDate,
      assignee,
      dependencies: dependencies || []
    });
    
    await task.save();
    
    res.status(201).json({
      task,
      message: 'Task created successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// タスク更新
exports.updateTask = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { projectId, taskId } = req.params;
  const {
    name,
    duration,
    startDate,
    endDate,
    assignee,
    dependencies
  } = req.body;
  
  try {
    // プロジェクトへのアクセス権をチェック
    const hasAccess = await checkProjectAccess(projectId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to access this project' });
    }
    
    // タスク検索
    let task = await Task.findOne({ projectId, taskId });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // フィールド更新
    if (name) task.name = name;
    if (duration) task.duration = duration;
    if (startDate !== undefined) task.startDate = startDate;
    if (endDate !== undefined) task.endDate = endDate;
    if (assignee !== undefined) task.assignee = assignee;
    if (dependencies) task.dependencies = dependencies;
    
    await task.save();
    
    res.json({
      task,
      message: 'Task updated successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// タスク削除
exports.deleteTask = async (req, res) => {
  const { projectId, taskId } = req.params;
  
  try {
    // プロジェクトへのアクセス権をチェック
    const hasAccess = await checkProjectAccess(projectId, req.user.id);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Not authorized to access this project' });
    }
    
    // タスク検索と削除
    const task = await Task.findOneAndDelete({ projectId, taskId });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // このタスクに依存する他のタスクの依存関係を更新
    await Task.updateMany(
      { projectId, dependencies: { $in: [parseInt(taskId)] } },
      { $pull: { dependencies: parseInt(taskId) } }
    );
    
    res.json({ message: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};