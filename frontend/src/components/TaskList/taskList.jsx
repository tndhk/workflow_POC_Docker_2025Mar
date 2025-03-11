import React from 'react';
import useWorkflowStore from '../../store/workflowStore';
import TaskRow from './TaskRow';

/**
 * タスク一覧表示テーブルコンポーネント (Zustandを使用)
 */
const TaskList = () => {
  // Zustandストアから必要な状態と関数を取得
  const {
    tasks,
    openEditTaskModal,
    deleteTask
  } = useWorkflowStore();

  return (
    <div className="card">
      <h3 className="text-lg font-medium mb-3 text-gray-800">Task List</h3>
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Duration
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assignee
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dependencies
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <TaskRow 
                key={task.id}
                task={task}
                allTasks={tasks}
                onEdit={() => openEditTaskModal(task)}
                onDelete={() => deleteTask(task.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskList;