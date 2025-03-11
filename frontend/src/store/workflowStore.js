import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { projectService, taskService, referenceService } from '../api/services';
import { formatDate, addDays, isWeekend } from '../utils/dateUtils';

// Zustandストアの作成
const useWorkflowStore = create(
  persist(
    (set, get) => ({
      // プロジェクト情報
      currentProject: {
        id: null,
        name: 'New Project',
        description: '',
        status: 'planning', // planning, inProgress, completed
      },
      
      // 状態
      selectedPreset: 'webdev',
      deadlineDate: formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)), // 2週間後をデフォルト
      startDate: formatDate(new Date()),
      tasks: [],
      selectedCountries: ['japan'],
      editingTask: null,
      showTaskModal: false,
      newTask: {
        id: 0,
        name: '',
        duration: 1,
        dependencies: [],
        assignee: ''
      },
      nextTaskId: 1,
      
      // ローディングと成功/エラー状態
      loading: false,
      error: null,
      success: null,
      
      // プロジェクトの初期化（新規作成または既存のロード）
      initProject: async (projectId = null) => {
        set({ loading: true, error: null, success: null });
        
        try {
          // リファレンスデータを取得
          const presetsPromise = referenceService.getPresets();
          const holidaysPromise = referenceService.getAllHolidays();
          
          // 並列でAPIリクエストを実行
          const [presets, holidays] = await Promise.all([presetsPromise, holidaysPromise]);
          
          // 新規プロジェクトの場合
          if (!projectId) {
            set({
              currentProject: {
                id: null,
                name: 'New Project',
                description: '',
                status: 'planning'
              },
              tasks: [],
              loading: false
            });
            return;
          }
          
          // 既存プロジェクトのロード
          const projectData = await projectService.getProject(projectId);
          const { project, tasks } = projectData;
          
          // プロジェクトデータの設定
          set({
            currentProject: {
              id: project._id,
              name: project.name,
              description: project.description || '',
              status: project.status
            },
            startDate: project.startDate,
            deadlineDate: project.deadlineDate,
            selectedPreset: project.selectedPreset || 'webdev',
            selectedCountries: project.selectedCountries || ['japan'],
            tasks: tasks || [],
            nextTaskId: tasks && tasks.length > 0 
              ? Math.max(...tasks.map(t => t.taskId)) + 1 
              : 1,
            loading: false
          });
          
          return projectData;
        } catch (error) {
          console.error('プロジェクト初期化エラー:', error);
          set({ 
            loading: false, 
            error: error.message || 'プロジェクトの初期化に失敗しました' 
          });
          throw error;
        }
      },
      
      // プロジェクト操作
      setProjectName: (name) => {
        set(state => ({
          currentProject: {
            ...state.currentProject,
            name
          }
        }));
      },
      
      setProjectDescription: (description) => {
        set(state => ({
          currentProject: {
            ...state.currentProject,
            description
          }
        }));
      },
      
      setProjectStatus: (status) => {
        set(state => ({
          currentProject: {
            ...state.currentProject,
            status
          }
        }));
      },

      // アクション
      setSelectedPreset: (preset) => set({ selectedPreset: preset }),
      
      setDeadlineDate: (date) => set({ deadlineDate: date }),
      
      setSelectedCountries: (countries) => set({ selectedCountries: countries }),
      
      setTasks: (tasks) => set({ tasks }),
      
      // プロジェクト一覧を取得
      getProjects: async () => {
        set({ loading: true, error: null });
        
        try {
          const projects = await projectService.getProjects();
          set({ loading: false });
          return projects;
        } catch (error) {
          set({ 
            loading: false, 
            error: error.message || 'プロジェクトの取得に失敗しました' 
          });
          throw error;
        }
      },
      
      // タスク計算関数
      calculateTaskDates: async (deadline) => {
        set({ loading: true, error: null });
        
        try {
          // プリセットデータを取得
          let presetTasks;
          
          // カスタムプリセットとデフォルトプリセットを区別
          const { selectedPreset } = get();
          if (selectedPreset.startsWith('custom-')) {
            // カスタムプリセットの場合は現在のタスクを使用
            presetTasks = get().tasks;
          } else {
            // デフォルトプリセットの場合はAPIから取得
            const presetData = await referenceService.getPreset(selectedPreset);
            presetTasks = presetData.tasks;
          }
          
          if (!presetTasks || presetTasks.length === 0) {
            set({ loading: false, error: 'プリセットタスクが見つかりません' });
            return;
          }
          
          // 依存関係グラフを構築（トポロジカルソート用）
          const graph = {};
          const inDegree = {};
          
          // 初期化
          presetTasks.forEach(task => {
            graph[task.id || task.taskId] = [];
            inDegree[task.id || task.taskId] = 0;
          });
          
          // 依存関係の構築
          presetTasks.forEach(task => {
            const taskId = task.id || task.taskId;
            if (task.dependencies && task.dependencies.length > 0) {
              task.dependencies.forEach(depId => {
                // このタスクは依存先のタスクに依存している (逆向きのエッジを保存)
                graph[depId].push(taskId);
                // 依存度をインクリメント
                inDegree[taskId]++;
              });
            }
          });
          
          // トポロジカルソートでタスクの実行順序を決定
          const queue = [];
          const sortedTasks = [];
          
          // 依存関係がないタスクをキューに追加
          presetTasks.forEach(task => {
            const taskId = task.id || task.taskId;
            if (inDegree[taskId] === 0) {
              queue.push(taskId);
            }
          });
          
          // 実行順序を決定
          while (queue.length > 0) {
            const current = queue.shift();
            sortedTasks.push(current);
            
            graph[current].forEach(neighbor => {
              inDegree[neighbor]--;
              
              if (inDegree[neighbor] === 0) {
                queue.push(neighbor);
              }
            });
          }
          
          // 締切日から逆算して各タスクの日付を計算
          const deadlineObj = new Date(deadline);
          const taskDates = {};
          
          // 休日判定関数
          const isHoliday = (date) => {
            // 週末のチェック
            if (isWeekend(date)) return true;
            
            // 選択された国の休日チェック
            const formattedDate = formatDate(date);
            const { selectedCountries } = get();
            
            // APIから取得した休日データを使用（まだ実装されていないため仮実装）
            // 実際の実装では、事前に取得した休日データを使用する
            return selectedCountries.some(country => {
              const holidays = []; // APIから取得した休日データを設定
              return holidays.includes(formattedDate);
            });
          };
          
          // 作業日を調整する関数（休日を考慮）
          const adjustWorkingDays = (date, days) => {
            let result = new Date(date);
            let daysToAdd = days;
            
            while (daysToAdd > 0) {
              result = addDays(result, 1);
              if (!isHoliday(result)) {
                daysToAdd--;
              }
            }
            
            return result;
          };
          
          // 逆作業日を調整する関数（休日を考慮して日付を引く）
          const adjustWorkingDaysBackward = (date, days) => {
            let result = new Date(date);
            let daysToSubtract = days;
            
            while (daysToSubtract > 0) {
              result = addDays(result, -1);
              if (!isHoliday(result)) {
                daysToSubtract--;
              }
            }
            
            return result;
          };
          
          // 計算順序を反転（締切日から逆算するため）
          const reversedOrder = [...sortedTasks].reverse();
          
          // 各タスクの開始日と終了日を計算
          reversedOrder.forEach(taskId => {
            const task = presetTasks.find(t => (t.id || t.taskId) === taskId);
            
            // 依存先タスクがある場合
            const dependentTasks = presetTasks.filter(t => 
              t.dependencies && t.dependencies.includes(taskId)
            );
            
            if (dependentTasks.length > 0) {
              // 依存先タスクの最早開始日を見つける
              const earliestDependentStartDate = dependentTasks.reduce((earliest, depTask) => {
                const depStartDate = taskDates[depTask.id || depTask.taskId]?.startDate;
                if (depStartDate) {
                  const depDate = new Date(depStartDate);
                  return earliest ? (depDate < earliest ? depDate : earliest) : depDate;
                }
                return earliest;
              }, null);
              
              if (earliestDependentStartDate) {
                // 終了日 = 依存先タスクの最早開始日の前日
                const endDate = adjustWorkingDaysBackward(earliestDependentStartDate, 1);
                
                // 開始日 = 終了日から作業日数を引いた日
                const startDate = adjustWorkingDaysBackward(endDate, task.duration - 1);
                
                taskDates[taskId] = {
                  startDate: formatDate(startDate),
                  endDate: formatDate(endDate)
                };
                return;
              }
            }
            
            // 依存先タスクがない場合は締切日から逆算
            const endDate = new Date(deadlineObj);
            const startDate = adjustWorkingDaysBackward(endDate, task.duration - 1);
            
            taskDates[taskId] = {
              startDate: formatDate(startDate),
              endDate: formatDate(endDate)
            };
          });
          
          // プロジェクト開始日を計算
          const projectStartDate = Object.values(taskDates).reduce((earliest, dates) => {
            const startDate = new Date(dates.startDate);
            return earliest ? (startDate < earliest ? startDate : earliest) : startDate;
          }, null);
          
          // タスクリストを構築
          const newTasks = presetTasks.map(task => {
            const taskId = task.id || task.taskId;
            return {
              ...task,
              taskId: taskId,
              id: taskId,
              startDate: taskDates[taskId]?.startDate || '',
              endDate: taskDates[taskId]?.endDate || ''
            };
          });
          
          // 状態を更新
          set({
            tasks: newTasks,
            startDate: projectStartDate ? formatDate(projectStartDate) : formatDate(new Date()),
            nextTaskId: Math.max(...newTasks.map(t => t.id || t.taskId), 0) + 1,
            loading: false
          });
        } catch (error) {
          console.error('スケジュール計算エラー:', error);
          set({ 
            loading: false, 
            error: error.message || 'スケジュール計算に失敗しました' 
          });
        }
      },
      
      // タスク操作
      addTask: (task) => {
        const { tasks, nextTaskId } = get();
        const newTask = { ...task, id: nextTaskId, taskId: nextTaskId };
        set({ 
          tasks: [...tasks, newTask],
          nextTaskId: nextTaskId + 1 
        });
      },
      
      updateTask: (updatedTask) => {
        const { tasks } = get();
        set({
          tasks: tasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          )
        });
      },
      
      deleteTask: (taskId) => {
        const { tasks } = get();
        // 削除するタスクに依存するタスクの依存関係も更新
        const updatedTasks = tasks
          .filter(task => task.id !== taskId)
          .map(task => ({
            ...task,
            dependencies: task.dependencies 
              ? task.dependencies.filter(id => id !== taskId)
              : []
          }));
        
        set({ tasks: updatedTasks });
      },
      
      // モーダル操作
      openAddTaskModal: () => {
        set({
          editingTask: null,
          showTaskModal: true,
          newTask: {
            id: get().nextTaskId,
            name: '',
            duration: 1,
            dependencies: [],
            assignee: ''
          }
        });
      },
      
      openEditTaskModal: (task) => {
        set({
          editingTask: task,
          showTaskModal: true,
          newTask: { ...task }
        });
      },
      
      closeTaskModal: () => {
        set({ showTaskModal: false });
      },
      
      setNewTask: (task) => {
        set({ newTask: task });
      },
      
      handleSaveTask: () => {
        const { newTask, editingTask, addTask, updateTask } = get();
        
        if (editingTask) {
          updateTask(newTask);
        } else {
          addTask(newTask);
        }
        
        set({ showTaskModal: false });
      },
      
      // APIを使用したタスク操作
      createTaskOnServer: async (projectId, taskData) => {
        set({ loading: true, error: null });
        
        try {
          const result = await taskService.createTask(projectId, taskData);
          set({ loading: false, success: 'タスクが作成されました' });
          return result.task;
        } catch (error) {
          set({ 
            loading: false, 
            error: error.message || 'タスクの作成に失敗しました' 
          });
          throw error;
        }
      },
      
      updateTaskOnServer: async (projectId, taskId, taskData) => {
        set({ loading: true, error: null });
        
        try {
          const result = await taskService.updateTask(projectId, taskId, taskData);
          set({ loading: false, success: 'タスクが更新されました' });
          return result.task;
        } catch (error) {
          set({ 
            loading: false, 
            error: error.message || 'タスクの更新に失敗しました' 
          });
          throw error;
        }
      },
      
      deleteTaskOnServer: async (projectId, taskId) => {
        set({ loading: true, error: null });
        
        try {
          await taskService.deleteTask(projectId, taskId);
          set({ loading: false, success: 'タスクが削除されました' });
        } catch (error) {
          set({ 
            loading: false, 
            error: error.message || 'タスクの削除に失敗しました' 
          });
          throw error;
        }
      },
      
      // プロジェクト保存（APIと連携）
      saveProject: async () => {
        set({ loading: true, error: null, success: null });
        
        // プロジェクト情報の構築
        const projectData = {
          name: get().currentProject.name,
          description: get().currentProject.description,
          startDate: get().startDate,
          deadlineDate: get().deadlineDate,
          selectedPreset: get().selectedPreset,
          selectedCountries: get().selectedCountries,
          status: get().currentProject.status,
          tasks: get().tasks.map(task => ({
            name: task.name,
            duration: task.duration,
            startDate: task.startDate,
            endDate: task.endDate,
            assignee: task.assignee,
            dependencies: task.dependencies || [],
            taskId: task.id || task.taskId
          }))
        };
        
        try {
          let result;
          
          if (get().currentProject.id) {
            // 既存プロジェクトの更新
            result = await projectService.updateProject(get().currentProject.id, projectData);
            set({ 
              loading: false, 
              success: 'プロジェクトが更新されました',
              currentProject: {
                ...get().currentProject,
                id: result.project._id
              }
            });
          } else {
            // 新規プロジェクト作成
            result = await projectService.createProject(projectData);
            set({ 
              loading: false, 
              success: 'プロジェクトが作成されました',
              currentProject: {
                ...get().currentProject,
                id: result.project._id
              }
            });
          }
          
          return result;
        } catch (error) {
          console.error('プロジェクト保存エラー:', error);
          set({ 
            loading: false, 
            error: error.message || 'プロジェクトの保存に失敗しました' 
          });
          throw error;
        }
      },
      
      // プロジェクト削除
      deleteProject: async (projectId) => {
        set({ loading: true, error: null });
        
        try {
          await projectService.deleteProject(projectId);
          
          // 新規プロジェクト状態にリセット
          set({
            currentProject: {
              id: null,
              name: 'New Project',
              description: '',
              status: 'planning'
            },
            tasks: [],
            loading: false,
            success: 'プロジェクトが削除されました'
          });
        } catch (error) {
          set({ 
            loading: false, 
            error: error.message || 'プロジェクトの削除に失敗しました' 
          });
          throw error;
        }
      },
      
      // エラーと成功メッセージのクリア
      clearMessages: () => {
        set({ error: null, success: null });
      }
    }),
    {
      name: 'workflow-project-storage', // ローカルストレージのキー
      // 永続化する状態の一部を指定
      partialize: (state) => ({
        currentProject: state.currentProject,
        tasks: state.tasks,
        startDate: state.startDate,
        deadlineDate: state.deadlineDate,
        selectedPreset: state.selectedPreset,
        selectedCountries: state.selectedCountries,
        nextTaskId: state.nextTaskId
      })
    }
  )
);

export default useWorkflowStore;