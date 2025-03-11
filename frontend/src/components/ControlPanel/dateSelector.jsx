import React from 'react';

/**
 * 締切日選択コンポーネント
 */
const DateSelector = ({ deadlineDate, setDeadlineDate, disabled }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        締切日
      </label>
      <input 
        type="date" 
        className={`form-input ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        value={deadlineDate}
        onChange={(e) => setDeadlineDate(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
};

export default DateSelector;