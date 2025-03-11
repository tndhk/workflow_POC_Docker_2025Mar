import React, { useEffect, useRef } from 'react';
import useWorkflowStore from '../../store/workflowStore';

/**
 * カスタムガントチャートコンポーネント (Zustandを使用)
 */
const GanttChart = ({ colors }) => {
  // Zustandストアから必要な状態を取得
  const { tasks, startDate, deadlineDate } = useWorkflowStore();
  
  // DOM参照
  const chartContainerRef = useRef(null);
  const tooltipRef = useRef(null);
  
  // タスク位置の計算と矢印の描画
  useEffect(() => {
    if (!tasks || tasks.length === 0 || !chartContainerRef.current) return;
    
    const updateArrows = () => {
      // コンテナの参照
      const container = chartContainerRef.current;
      
      // 既存の矢印SVGを削除
      const oldSvg = container.querySelector('.arrows-overlay');
      if (oldSvg) oldSvg.remove();
      
      // タスクバーの位置を取得
      const taskBars = container.querySelectorAll('.gantt-task-bar');
      const positions = {};
      
      taskBars.forEach(bar => {
        const taskId = parseInt(bar.getAttribute('data-task-id'));
        const rect = bar.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        positions[taskId] = {
          startX: rect.left - containerRect.left,
          endX: rect.right - containerRect.left,
          centerY: rect.top + rect.height/2 - containerRect.top
        };
      });
      
      // SVG要素を作成
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("class", "arrows-overlay");
      svg.style.position = "absolute";
      svg.style.top = "0";
      svg.style.left = "0";
      svg.style.width = "100%";
      svg.style.height = "100%";
      svg.style.pointerEvents = "none";
      svg.style.zIndex = "5";
      
      // マーカー定義
      const defs = document.createElementNS(svgNS, "defs");
      const marker = document.createElementNS(svgNS, "marker");
      marker.setAttribute("id", "arrowhead");
      marker.setAttribute("markerWidth", "10");
      marker.setAttribute("markerHeight", "7");
      marker.setAttribute("refX", "9");
      marker.setAttribute("refY", "3.5");
      marker.setAttribute("orient", "auto");
      
      const polygon = document.createElementNS(svgNS, "polygon");
      polygon.setAttribute("points", "0 0, 10 3.5, 0 7");
      polygon.setAttribute("fill", "#666");
      
      marker.appendChild(polygon);
      defs.appendChild(marker);
      svg.appendChild(defs);
      
      // 依存関係の矢印を描画
      tasks.forEach(task => {
        if (!task.dependencies || task.dependencies.length === 0) return;
        
        task.dependencies.forEach(depId => {
          const source = positions[depId];
          const target = positions[task.id];
          
          if (!source || !target) return;
          
          // パス要素を作成
          const path = document.createElementNS(svgNS, "path");
          
          // 単純な直線パスを定義
          const startX = source.endX;
          const startY = source.centerY;
          const endX = target.startX;
          const endY = target.centerY;
          
          path.setAttribute("d", `M ${startX} ${startY} L ${endX} ${endY}`);
          path.setAttribute("stroke", "#666");
          path.setAttribute("stroke-width", "1.5");
          path.setAttribute("stroke-dasharray", "4,2");
          path.setAttribute("fill", "none");
          path.setAttribute("marker-end", "url(#arrowhead)");
          
          svg.appendChild(path);
        });
      });
      
      container.appendChild(svg);
    };
    
    // ウィンドウリサイズイベントで矢印を更新
    window.addEventListener('resize', updateArrows);
    
    // 初回描画
    setTimeout(updateArrows, 100);
    
    return () => {
      window.removeEventListener('resize', updateArrows);
    };
  }, [tasks]);
  
  // ツールチップ表示
  const showTooltip = (e, task) => {
    if (!tooltipRef.current) return;
    
    const tooltip = tooltipRef.current;
    const rect = e.currentTarget.getBoundingClientRect();
    
    tooltip.querySelector('.tooltip-title').textContent = task.name;
    
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    
    tooltip.querySelector('.tooltip-content').innerHTML = `
      <div>Duration: ${task.duration} days</div>
      <div>Dates: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</div>
      ${task.assignee ? `<div>Assignee: ${task.assignee}</div>` : ''}
    `;
    
    tooltip.style.left = `${rect.left}px`;
    tooltip.style.top = `${rect.bottom + 5}px`;
    tooltip.style.display = 'block';
  };
  
  // ツールチップ非表示
  const hideTooltip = () => {
    if (tooltipRef.current) {
      tooltipRef.current.style.display = 'none';
    }
  };
  
  // データがない場合の表示
  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative shadow-inner">
        <h3 className="text-lg font-medium mb-3 text-gray-800">Gantt Chart with Dependencies</h3>
        <div className="h-64 flex justify-center items-center text-gray-500">
          No tasks scheduled. Click "Calculate Schedule" to generate the chart.
        </div>
      </div>
    );
  }
  
  // 日付範囲の計算
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(deadlineDate);
  const totalDays = Math.ceil((endDateObj - startDateObj) / (1000 * 60 * 60 * 24)) + 1;
  
  // 日付マーカーを生成
  const dateMarkers = [];
  const markerInterval = Math.max(1, Math.floor(totalDays / 10)); // 約10個のマーカー
  
  for (let i = 0; i <= totalDays; i += markerInterval) {
    const date = new Date(startDateObj);
    date.setDate(date.getDate() + i);
    const position = (i / totalDays) * 100;
    
    dateMarkers.push(
      <div 
        key={`marker-${i}`}
        className="text-xs text-gray-500 absolute"
        style={{ 
          left: `${position}%`, 
          bottom: '-20px',
          transform: 'translateX(-50%)'
        }}
      >
        {`${date.getMonth()+1}/${date.getDate()}`}
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative shadow-inner mb-8">
      <h3 className="text-lg font-medium mb-3 text-gray-800">Gantt Chart with Dependencies</h3>
      
      <div 
        ref={chartContainerRef} 
        className="relative" 
        style={{ 
          height: `${(tasks.length * 65) + 100}px`,
          paddingBottom: '50px',
          marginBottom: '20px'
        }}
      >
        {/* 日付ヘッダー */}
        <div className="text-center text-sm font-medium py-2 border-b border-gray-200 mb-6">
          Date
        </div>
        
        {/* 日付マーカー */}
        <div className="relative h-8 mb-6 pl-32">
          {dateMarkers}
        </div>
        
        {/* タスクバー */}
        <div className="mt-4 pb-10">
          {tasks.map((task, index) => {
            const taskStartDate = new Date(task.startDate);
            const taskEndDate = new Date(task.endDate);
            
            const startPosition = ((taskStartDate - startDateObj) / (endDateObj - startDateObj)) * 100;
            const duration = ((taskEndDate - taskStartDate) / (endDateObj - startDateObj)) * 100;
            
            return (
              <div key={`task-${task.id}`} className="flex items-center h-12 mb-4">
                <div className="w-32 pr-2 text-right">
                  <div className="text-sm font-medium truncate">{task.name}</div>
                  {task.assignee && (
                    <div className="text-xs text-gray-500 truncate">{task.assignee}</div>
                  )}
                </div>
                
                <div className="flex-grow relative h-full bg-gray-100 rounded">
                  <div 
                    className="absolute h-6 top-1/2 transform -translate-y-1/2 rounded flex items-center justify-center text-white text-xs gantt-task-bar"
                    style={{
                      left: `${startPosition}%`,
                      width: `${Math.max(3, Math.min(duration, 98))}%`,
                      backgroundColor: colors[index % colors.length],
                      minWidth: '24px'
                    }}
                    data-task-id={task.id}
                    onMouseEnter={(e) => showTooltip(e, task)}
                    onMouseLeave={hideTooltip}
                  >
                    {task.duration > 2 ? `${task.duration}d` : ''}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* ツールチップ */}
        <div 
          ref={tooltipRef}
          className="absolute bg-white border border-gray-200 rounded p-2 shadow-lg z-10 text-sm hidden tooltip"
          style={{ maxWidth: '250px' }}
        >
          <div className="font-bold border-b border-gray-100 pb-1 mb-1 tooltip-title"></div>
          <div className="text-gray-700 tooltip-content"></div>
        </div>
      </div>
      
      {/* 凡例 */}
      <div className="mt-6 text-xs text-gray-500 text-right">
        <span className="inline-block ml-2">
          <span 
            className="inline-block w-10 h-0 align-middle mr-1" 
            style={{ 
              borderStyle: 'dashed', 
              borderWidth: '1px 0 0 0', 
              borderColor: '#666' 
            }}
          ></span>
          Dependency
        </span>
      </div>
    </div>
  );
};

export default GanttChart;