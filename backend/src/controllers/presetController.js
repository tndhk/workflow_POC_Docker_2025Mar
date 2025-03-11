const { WORKFLOW_PRESETS } = require('../data/workflowPresets');

// プリセット一覧を取得
exports.getPresets = (req, res) => {
  res.json(WORKFLOW_PRESETS);
};

// 特定のプリセットを取得
exports.getPreset = (req, res) => {
  const preset = WORKFLOW_PRESETS[req.params.id];
  
  if (!preset) {
    return res.status(404).json({ error: 'Preset not found' });
  }
  
  res.json(preset);
};