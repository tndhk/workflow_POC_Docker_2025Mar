import React from 'react';

/**
 * ワークフロープリセット選択コンポーネント
 */
const PresetSelector = ({ selectedPreset, setSelectedPreset, presets, disabled }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        ワークフローテンプレート
      </label>
      <select 
        className={`form-input ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        value={selectedPreset}
        onChange={(e) => setSelectedPreset(e.target.value)}
        disabled={disabled}
      >
        {Object.entries(presets).map(([key, value]) => (
          <option key={key} value={key}>{value.name}</option>
        ))}
      </select>
    </div>
  );
};

export default PresetSelector;