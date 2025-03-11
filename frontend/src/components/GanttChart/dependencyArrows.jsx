import React from 'react';

/**
 * ガントチャート上の依存関係の矢印を描画するコンポーネント
 */
const DependencyArrows = ({ tasks, taskPositions }) => {
  // 有効なデータがない場合は何も表示しない
  if (!tasks || tasks.length === 0) {
    console.log('No tasks for arrows');
    return null;
  }
  
  if (!taskPositions) {
    console.log('taskPositions is null or undefined');
    return null;
  }
  
  if (Object.keys(taskPositions).length === 0) {
    console.log('No task positions for arrows', {
      tasksType: Array.isArray(tasks) ? `Array(${tasks.length})` : typeof tasks,
      taskPositionsType: `Object with keys: ${Object.keys(taskPositions).join(', ')}`
    });
    return null;
  }
  
  console.log('Drawing arrows with positions:', taskPositions);
  console.log('Tasks with dependencies:', tasks.filter(t => t.dependencies && t.dependencies.length > 0));
  
  // 矢印要素の配列
  const arrowElements = [];
  
  tasks.forEach(task => {
    if (!task.dependencies || task.dependencies.length === 0) return;
    
    // このタスクの位置
    const targetPosition = taskPositions[task.id];
    if (!targetPosition) {
      console.log(`No position found for task ${task.id}`);
      return;
    }
    
    // 依存関係のある各タスクについて矢印を描画
    task.dependencies.forEach(depId => {
      const sourcePosition = taskPositions[depId];
      if (!sourcePosition) {
        console.log(`No position found for dependency ${depId}`);
        return;
      }
      
      const arrowKey = `arrow-${depId}-${task.id}`;
      
      // 矢印の描画位置を計算
      const sourceX = sourcePosition.endX;
      const sourceY = sourcePosition.centerY;
      const targetX = targetPosition.startX;
      const targetY = targetPosition.centerY;
      
      // パス設定 - 曲線を使用
      const path = `M ${sourceX} ${sourceY} C ${sourceX + 20} ${sourceY}, ${targetX - 20} ${targetY}, ${targetX - 5} ${targetY}`;
      
      // 曲線パスの矢印
      arrowElements.push(
        <g key={arrowKey}>
          <path
            d={path}
            stroke="#666"
            strokeWidth="1.5"
            strokeDasharray="4,2"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
        </g>
      );
      
      console.log(`Created arrow from ${depId} to ${task.id}`);
    });
  });
  
  // 矢印要素がなければnullを返す
  if (arrowElements.length === 0) {
    console.log('No arrows to display');
    return null;
  }
  
  console.log(`Displaying ${arrowElements.length} arrows`);
  
  return (
    <svg 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        overflow: 'visible'
      }}
    >
      {/* 矢印先端のマーカー定義 */}
      <defs>
        <marker
          id="arrowhead"
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
        </marker>
      </defs>
      {arrowElements}
    </svg>
  );
};

export default DependencyArrows;