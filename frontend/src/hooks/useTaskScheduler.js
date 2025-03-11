import { useState, useEffect, useCallback } from 'react';
import { addDays, formatDate, isWeekend } from '../utils/dateUtils';
import { WORKFLOW_PRESETS } from '../data/workflowPresets';
import { COUNTRY_HOLIDAYS } from '../data/holidaysData';

/**
 * タスクスケジュールの計算と管理を行うカスタムフック
 * @returns {Object} タスク管理に関する状態と関数
 */
export const useTaskScheduler = () => {
  // 状態管理
  const [selectedPreset, setSelectedPreset] = useState('webdev');
  const [deadlineDate, setDeadlineDate] = useState(formatDate(addDays(new Date(), 30)));
  const [startDate, setStartDate] = useState(formatDate(new Date()));
  const [tasks, setTasks] = useState([]);
  const [selectedCountries, setSelectedCountries] = useState(['usa']);
  
  // タスク編集状態
  const [editingTask, setEditingTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    id: 0,
    name: '',
    duration: 1,
    dependencies: [],
    assignee: ''
  });

  /**
   * 指定された日付が選択された国の休日かどうかをチェックする
   * @param {Date} date チェックする日付
   * @returns {boolean} 休日の場合はtrue
   */
  const isHoliday = useCallback((date) => {
    const formattedDate = formatDate(date);
    return selectedCountries.some(country => 
      COUNTRY_HOLIDAYS[country]?.holidays.includes(formattedDate)
    );
  }, [selectedCountries]);

  /**
   * ガントチャート用のデータを準備する
   * @returns {Array} チャート用に整形されたタスクデータ
   */
    // useTaskScheduler.js 内の prepareChartData 関数を以下のように修正

const prepareChartData = useCallback(() => {
  if (!tasks || tasks.length === 0) return [];
  
  return tasks.map(task => {
    const startDateObj = task.startDate ? new Date(task.startDate) : null;
    const endDateObj = task.endDate ? new Date(task.endDate) : null;
    
    if (!startDateObj || !endDateObj) {
      return {
        name: task.name || "",
        start: 0,
        end: 0,
        duration: 0,
        id: task.id || 0,
        dependencies: task.dependencies || [],
        assignee: task.assignee || ''
      };
    }
    
    const startTime = startDateObj.getTime();
    const endTime = endDateObj.getTime();
    
    // ここが重要: duration はミリ秒ではなく日数で設定
    const durationDays = Math.max(1, Math.round((endTime - startTime) / (1000 * 60 * 60 * 24)));
    
    return {
      name: task.name || "",
      start: startTime,
      end: endTime,
      duration: endTime - startTime, // ミリ秒単位での期間を設定
      id: task.id || 0,
      dependencies: task.dependencies || [],
      assignee: task.assignee || ''
    };
  });
}, [tasks]);

  /**
   * タスクの日付を依存関係に基づいて計算する
   * @param {string} deadline 締切日(YYYY-MM-DD形式)
   */
  const calculateTaskDates = useCallback((deadline) => {
    console.log('Calculating task dates with deadline:', deadline);
    const selectedWorkflow = WORKFLOW_PRESETS[selectedPreset];
    if (!selectedWorkflow) return;
    
    // タスクのコピーを作成（元のプリセットを保持）
    const tasksCopy = JSON.parse(JSON.stringify(selectedWorkflow.tasks));
    const deadlineObj = new Date(deadline);
    
    console.log('Using deadline:', deadlineObj);
    
    // IDでタスクをマッピング
    const taskMap = {};
    tasksCopy.forEach(task => {
      taskMap[task.id] = { 
        ...task, 
        startDate: null, 
        endDate: null, 
        processed: false 
      };
    });
    
    // 最終タスク（他のタスクから依存されていないタスク）を見つける
    const finalTasks = tasksCopy.filter(task => {
      return !tasksCopy.some(t => t.dependencies.includes(task.id));
    });
    
    console.log('Final tasks:', finalTasks.map(t => t.id));
    
    // 最終タスクの終了日を締切日に設定
    finalTasks.forEach(task => {
      taskMap[task.id].endDate = formatDate(deadlineObj);
      
      // 開始日を計算（終了日から必要な日数を引く）
      let currentDate = new Date(deadlineObj);
      let workDays = 0;
      
      while (workDays < task.duration) {
        currentDate = addDays(currentDate, -1);
        if (!isWeekend(currentDate) && !isHoliday(currentDate)) {
          workDays++;
        }
      }
      
      taskMap[task.id].startDate = formatDate(currentDate);
      taskMap[task.id].processed = true;
      
      console.log(`Task ${task.id} scheduled: ${taskMap[task.id].startDate} to ${taskMap[task.id].endDate}`);
    });
    
    // 依存関係を持つ残りのタスクを処理
    const processTasks = () => {
      let processedAny = false;
      
      tasksCopy.forEach(task => {
        if (taskMap[task.id].processed) return;
        
        // このタスクに依存する全てのタスクを取得
        const dependentTaskIds = tasksCopy
          .filter(t => t.dependencies.includes(task.id))
          .map(t => t.id);
        
        // 全ての依存タスクが処理済みかどうかをチェック
        const allDependentsProcessed = dependentTaskIds.length === 0 || 
          dependentTaskIds.every(depId => taskMap[depId].processed);
        
        if (allDependentsProcessed) {
          // 依存タスク間で最も早い開始日を見つける
          const dependentStartDates = dependentTaskIds.map(depId => 
            new Date(taskMap[depId].startDate)
          );
          
          let endDate;
          if (dependentStartDates.length > 0) {
            // 終了日は最も早い依存タスクの開始日の前日
            const earliestDepDate = new Date(Math.min(...dependentStartDates));
            endDate = addDays(earliestDepDate, -1);
          } else {
            // 依存タスクがない場合は締切日を使用
            endDate = new Date(deadlineObj);
          }
          
          // 開始日を計算（終了日から必要な日数を引く）
          let currentDate = new Date(endDate);
          let workDays = 0;
          
          while (workDays < task.duration) {
            currentDate = addDays(currentDate, -1);
            if (!isWeekend(currentDate) && !isHoliday(currentDate)) {
              workDays++;
            }
          }
          
          taskMap[task.id].endDate = formatDate(endDate);
          taskMap[task.id].startDate = formatDate(currentDate);
          taskMap[task.id].processed = true;
          processedAny = true;
          
          console.log(`Task ${task.id} scheduled: ${taskMap[task.id].startDate} to ${taskMap[task.id].endDate}`);
        }
      });
      
      return processedAny;
    };
    
    // 全てのタスクが処理されるまで繰り返す
    let iterations = 0;
    const MAX_ITERATIONS = 100; // 無限ループを防止
    
    while (iterations < MAX_ITERATIONS) {
      const processed = processTasks();
      if (!processed) break;
      iterations++;
    }
    
    // 計算結果を状態に設定
    const calculatedTasks = Object.values(taskMap);
    calculatedTasks.sort((a, b) => {
      // 依存関係で並べ替え
      if (a.dependencies.includes(b.id)) return 1;
      if (b.dependencies.includes(a.id)) return -1;
      
      // 同じレベルなら開始日で並べ替え
      return new Date(a.startDate) - new Date(b.startDate);
    });
    
    console.log('Calculated tasks:', calculatedTasks);
    setTasks(calculatedTasks);
    
    // 最も早い開始日をプロジェクト全体の開始日として設定
    if (calculatedTasks.length > 0) {
      const earliestDate = calculatedTasks.reduce((earliest, task) => {
        const taskDate = new Date(task.startDate);
        return taskDate < earliest ? taskDate : earliest;
      }, new Date(calculatedTasks[0].startDate));
      
      setStartDate(formatDate(earliestDate));
      console.log('Project start date set to:', formatDate(earliestDate));
    }
  }, [selectedPreset, isHoliday, addDays, formatDate, isWeekend]);

  // プリセットまたは選択された国が変更されたときにタスクを再計算
  useEffect(() => {
    if (deadlineDate) {
      calculateTaskDates(deadlineDate);
    }
  }, [selectedPreset, deadlineDate, selectedCountries, calculateTaskDates]);

  /**
   * タスクを削除する
   * @param {number} taskId 削除するタスクのID
   */
  const handleDeleteTask = useCallback((taskId) => {
    const updatedTasks = tasks.filter(t => t.id !== taskId);
    
    // 依存関係を更新
    const tasksWithUpdatedDeps = updatedTasks.map(t => ({
      ...t,
      dependencies: t.dependencies.filter(depId => depId !== taskId)
    }));
    
    setTasks(tasksWithUpdatedDeps);
    calculateTaskDates(deadlineDate);
  }, [tasks, deadlineDate, calculateTaskDates]);

  /**
   * タスクを保存（追加または更新）する
   */
  const handleSaveTask = useCallback(() => {
    // バリデーション
    if (!newTask.name.trim()) {
      alert('Please enter a task name');
      return;
    }
    
    if (editingTask) {
      // 依存関係のサイクルをチェック
      const checkDependencyCycle = (taskId, dependencies, allTasks) => {
        for (const depId of dependencies) {
          if (depId === taskId) return true;
          const depTask = allTasks.find(t => t.id === depId);
          if (depTask && checkDependencyCycle(taskId, depTask.dependencies, allTasks)) {
            return true;
          }
        }
        return false;
      };
      
      const hasCycle = checkDependencyCycle(newTask.id, newTask.dependencies, tasks);
      if (hasCycle) {
        alert('Circular dependency detected. Please review dependencies.');
        return;
      }
      
      // 既存タスクを更新
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id ? newTask : task
      );
      setTasks(updatedTasks);
    } else {
      // 新規タスクを追加
      setTasks([...tasks, newTask]);
    }
    
    // モーダルを閉じる
    setShowTaskModal(false);
    // スケジュールを再計算
    calculateTaskDates(deadlineDate);
  }, [newTask, editingTask, tasks, deadlineDate, calculateTaskDates]);

  /**
   * 新規タスク追加モーダルを開く
   */
  const openAddTaskModal = useCallback(() => {
    setEditingTask(null);
    setNewTask({
      id: Math.max(0, ...tasks.map(t => t.id)) + 1,
      name: '',
      duration: 1,
      dependencies: [],
      assignee: ''
    });
    setShowTaskModal(true);
  }, [tasks]);

  /**
   * タスク編集モーダルを開く
   * @param {Object} task 編集するタスク
   */
  const openEditTaskModal = useCallback((task) => {
    setEditingTask(task);
    setNewTask({...task});
    setShowTaskModal(true);
  }, []);

  return {
    // 状態
    selectedPreset,
    setSelectedPreset,
    deadlineDate,
    setDeadlineDate,
    startDate,
    tasks,
    selectedCountries,
    setSelectedCountries,
    editingTask,
    showTaskModal,
    setShowTaskModal,
    newTask,
    setNewTask,
    
    // 関数
    calculateTaskDates,
    prepareChartData,
    handleDeleteTask,
    handleSaveTask,
    openAddTaskModal,
    openEditTaskModal
  };
};