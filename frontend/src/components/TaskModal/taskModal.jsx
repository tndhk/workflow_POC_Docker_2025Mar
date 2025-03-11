import React from 'react';
import useWorkflowStore from '../../store/workflowStore';
import DependencySelector from './DependencySelector';

/**
 * タスク追加/編集用モーダルコンポーネント (Zustandを使用)
 */
const TaskModal = () => {
  // Zustandストアから必要な状態と関数を取得
  const {
    tasks,
    editingTask,
    newTask,
    setNewTask,
    handleSaveTask,
    closeTaskModal
  } = useWorkflowStore();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium mb-4">
          {editingTask ? 'Edit Task' : 'Add New Task'}
        </h3>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Task Name
          </label>
          <input
            type="text"
            className="form-input"
            value={newTask.name}
            onChange={(e) => setNewTask({...newTask, name: e.target.value})}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Duration (days)
          </label>
          <input
            type="number"
            min="1"
            className="form-input"
            value={newTask.duration}
            onChange={(e) => setNewTask({...newTask, duration: parseInt(e.target.value) || 1})}
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Assignee
          </label>
          <input
            type="text"
            className="form-input"
            value={newTask.assignee || ''}
            onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
            placeholder="Person responsible for this task"
          />
        </div>
        
        {/* 依存関係選択コンポーネント */}
        <DependencySelector 
          tasks={tasks}
          currentTaskId={newTask.id}
          selectedDependencies={newTask.dependencies}
          onChange={(dependencies) => setNewTask({...newTask, dependencies})}
        />
        
        <div className="flex justify-end space-x-2">
          <button
            className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-md"
            onClick={closeTaskModal}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
            onClick={handleSaveTask}
          >
            {editingTask ? 'Update' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;