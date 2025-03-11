import React, { useState, useEffect } from 'react';
import { WORKFLOW_PRESETS } from '../../data/workflowPresets';
import { COUNTRY_HOLIDAYS } from '../../data/holidaysData';
import useWorkflowStore from '../../store/workflowStore';
import PresetSelector from './PresetSelector';
import DateSelector from './DateSelector';
import HolidaySelector from './HolidaySelector';
import { referenceService } from '../../api/services';

/**
 * ワークフロー計画ツールのコントロールパネルコンポーネント (Zustandを使用)
 */
const ControlPanel = () => {
  // ローカルステート
  const [presets, setPresets] = useState(WORKFLOW_PRESETS);
  const [holidays, setHolidays] = useState(COUNTRY_HOLIDAYS);
  const [localLoading, setLocalLoading] = useState(false);
  
  // Zustandストアから必要な状態と関数を取得
  const {
    currentProject,
    setProjectName,
    setProjectDescription,
    selectedPreset,
    setSelectedPreset,
    deadlineDate,
    setDeadlineDate,
    selectedCountries,
    setSelectedCountries,
    calculateTaskDates,
    openAddTaskModal,
    saveProject,
    loading
  } = useWorkflowStore();
  
  // リファレンスデータの取得
  useEffect(() => {
    const fetchReferenceData = async () => {
      setLocalLoading(true);
      try {
        // プリセットと休日データを並列で取得
        const [presetsData, holidaysData] = await Promise.all([
          referenceService.getPresets(),
          referenceService.getAllHolidays()
        ]);
        
        // データが存在する場合は状態を更新
        if (presetsData) setPresets(presetsData);
        if (holidaysData) setHolidays(holidaysData);
      } catch (error) {
        console.error('リファレンスデータ取得エラー:', error);
        // エラー時はデフォルトデータを使用（既に設定済み）
      } finally {
        setLocalLoading(false);
      }
    };
    
    fetchReferenceData();
  }, []);
  
  // プロジェクト保存処理
  const handleSaveProject = async () => {
    try {
      await saveProject();
      // 保存成功時の処理はストア内で行われている
    } catch (error) {
      console.error('プロジェクト保存エラー:', error);
      // エラー処理はストア内で行われている
    }
  };

  return (
    <div className="card">
      {/* プロジェクト情報 */}
      <div className="mb-6 border-b pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">プロジェクト情報</h3>
          <div className="text-sm text-gray-500">
            {currentProject.id ? 'サーバー保存済み' : 'ローカルプロジェクト'}
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              プロジェクト名
            </label>
            <input
              type="text"
              className="form-input"
              value={currentProject.name}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="プロジェクト名を入力"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              説明
            </label>
            <textarea
              className="form-input"
              value={currentProject.description}
              onChange={(e) => setProjectDescription(e.target.value)}
              placeholder="プロジェクトの説明を入力"
              rows="2"
            ></textarea>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* テンプレート選択 */}
        <PresetSelector 
          selectedPreset={selectedPreset}
          setSelectedPreset={setSelectedPreset}
          presets={presets}
          disabled={localLoading}
        />
        
        {/* 締切日選択 */}
        <DateSelector 
          deadlineDate={deadlineDate}
          setDeadlineDate={setDeadlineDate}
          disabled={localLoading}
        />
      </div>
      
      {/* 休日選択 */}
      <HolidaySelector 
        selectedCountries={selectedCountries}
        setSelectedCountries={setSelectedCountries}
        countries={holidays}
        disabled={localLoading}
      />
      
      {/* アクションボタン */}
      <div className="flex justify-center mt-4">
        <button 
          className="btn btn-primary"
          onClick={() => {
            console.log('スケジュール計算（締切日）:', deadlineDate);
            calculateTaskDates(deadlineDate);
          }}
          disabled={loading || localLoading}
        >
          スケジュール計算
        </button>
        <button 
          className="btn btn-secondary"
          onClick={openAddTaskModal}
          disabled={loading || localLoading}
        >
          タスク追加
        </button>
        <button 
          className="btn bg-green-600 hover:bg-green-700 text-white ml-4"
          onClick={handleSaveProject}
          disabled={loading || localLoading}
        >
          プロジェクト保存
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;