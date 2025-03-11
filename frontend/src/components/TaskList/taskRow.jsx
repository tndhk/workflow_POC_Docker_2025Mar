import React from 'react';

/**
 * タスク一覧テーブルの各行コンポーネント
 */
const TaskRow = ({ task, allTasks, onEdit, onDelete }) => {
  // 依存関係の名前を取得する
  const getDependencyNames = () => {
    if (!task.dependencies || task.dependencies.length === 0) {
      return '-';
    }
    
    return task.dependencies.map(depId => {
      const depTask = allTasks.find(t => t.id === depId);
      return depTask ? depTask.name : '';
    }).join(', ');
  };

  return (
    <tr>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{task.name}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{task.duration} days</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{task.startDate}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{task.endDate}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{task.assignee || '-'}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-500">{getDependencyNames()}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <button
          className="text-indigo-600 hover:text-indigo-900 mr-3 font-medium"
          onClick={onEdit}
        >
          Edit
        </button>
        <button
          className="text-red-600 hover:text-red-900 font-medium"
          onClick={onDelete}
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default TaskRow;