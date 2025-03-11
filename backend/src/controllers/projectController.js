const Project = require('../models/Project');
const Task = require('../models/Task');
const { validationResult } = require('express-validator');

// すべてのプロジェクトを取得
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ userId: req.user.id });
    res.json(projects);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// プロジェクト詳細を取得
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findOne({ 
      _id: req.params.id,
      userId: req.user.id 
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // プロジェクトに関連するタスクを取得
    const tasks = await Task.find({ projectId: project._id });
    
    res.json({
      project,
      tasks
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};

// 新規プロジェクト作成
exports.createProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const {
    name,
    description,
    startDate,
    deadlineDate,
    selectedPreset,
    selectedCountries,
    tasks
  } = req.body;
  
  try {
    // 新規プロジェクト作成
    const project = new Project({
      name,
      description,
      startDate,
      deadlineDate,
      selectedPreset,
      selectedCountries,
      userId: req.user.id
    });
    
    await project.save();
    
    // タスクがある場合は保存
    if (tasks && tasks.length > 0) {
      const taskDocuments = tasks.map(task => ({
        ...task,
        projectId: project._id,
        taskId: task.id || task.taskId
      }));
      
      await Task.insertMany(taskDocuments);
    }
    
    res.status(201).json({
      project,
      message: 'Project created successfully'
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

// プロジェクト更新
exports.updateProject = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  // 更新対象のフィールド
  const {
    name,
    description,
    startDate,
    deadlineDate,
    selectedPreset,
    selectedCountries,
    status,
    tasks
  } = req.body;
  
  try {
    // プロジェクト検索
    let project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // フィールド更新
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (startDate) project.startDate = startDate;
    if (deadlineDate) project.deadlineDate = deadlineDate;
    if (selectedPreset) project.selectedPreset = selectedPreset;
    if (selectedCountries) project.selectedCountries = selectedCountries;
    if (status) project.status = status;
    
    await project.save();
    
    // タスク更新（既存タスクを削除して新しいタスクを挿入）
    if (tasks && tasks.length > 0) {
      // 既存タスクを削除
      await Task.deleteMany({ projectId: project._id });
      
      // 新しいタスクを挿入
      const taskDocuments = tasks.map(task => ({
        ...task,
        projectId: project._id,
        taskId: task.id || task.taskId
      }));
      
      await Task.insertMany(taskDocuments);
    }
    
    res.json({
      project,
      message: 'Project updated successfully'
    });
  } catch (err) {
    console.error(err.message);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};

// プロジェクト削除
exports.deleteProject = async (req, res) => {
  try {
    // プロジェクト検索と同時に削除
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    // 関連するタスクを削除
    await Task.deleteMany({ projectId: project._id });
    
    res.json({ message: 'Project removed' });
  } catch (err) {
    console.error('Delete project error:', err);
    
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ error: 'Project not found' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};