import { useState, useCallback, useEffect, useRef } from 'react'; // useRef を追加

/**
 * ガントチャート内のタスク位置を追跡するためのカスタムフック
 */
export const useChartPositions = () => {
  const [chartRef, setChartRef] = useState(null);
  const [taskPositions, setTaskPositions] = useState({});
  const [lastPositions, setLastPositions] = useState({}); // 前回のポジションを保存
  const renderCount = useRef(0); // レンダリング回数を追跡するための参照を追加

  /**
   * タスクの位置を計算する - チャートのDOMが取得できない場合の代替手段
   */
  const calculateFallbackPositions = useCallback((chartData, chartBounds) => {
    console.log('Using fallback position calculation for chartData:', chartData);
    
    if (!chartData || chartData.length === 0 || !chartBounds) return {};
    
    // チャート全体のサイズ
    const { width, height, top, left } = chartBounds;
    
    // タイムラインの開始日と終了日を取得
    const startTimeMs = Math.min(...chartData.map(t => t.start));
    const endTimeMs = Math.max(...chartData.map(t => t.end));
    const timeRangeMs = Math.max(86400000, endTimeMs - startTimeMs); // 最低1日
    
    // 左マージン（Yラベル用）とタスク領域の幅を推定
    const leftMargin = 120; // Yラベル用に推定
    const taskAreaWidth = width - leftMargin - 40; // 右マージン40px
    
    // 各タスクのバーの高さを計算（余白を考慮）
    const barHeight = 20; // バーの高さ
    const barSpacing = Math.max(30, (height - 60) / Math.max(1, chartData.length)); // 最小間隔を確保
    
    // 位置情報を生成
    const positions = {};
    
    chartData.forEach((task, index) => {
      // タイムライン上での位置をピクセルに変換
      const startPos = Math.max(leftMargin, leftMargin + ((task.start - startTimeMs) / timeRangeMs) * taskAreaWidth);
      const endPos = Math.min(width - 40, leftMargin + ((task.end - startTimeMs) / timeRangeMs) * taskAreaWidth);
      const centerY = top + 30 + (index * barSpacing) + (barHeight / 2);
      
      positions[task.id] = {
        startX: startPos,
        endX: endPos,
        centerY: centerY,
        height: barHeight
      };
    });
    
    return positions;
  }, []);
  

   /**
   * バーチャートがレンダリングされたときに各バーの位置を取得する
   */
   const handleBarChartRender = useCallback((chartData) => {
    console.log('Bar chart render callback triggered with chartData:', chartData || []);
    
    // バウンスガード: 頻繁な更新を防ぐ
    if (renderCount.current > 3) {
      console.log('Too many render attempts, skipping position calculation');
      renderCount.current = 0;
      return;
    }
    
    renderCount.current++;
    
    if (!chartRef) {
      console.log('Chart ref not available');
      return;
    }
    
    // チャートコンテナの境界を取得
    const chartContainer = chartRef.container;
    if (!chartContainer) {
      console.log('Chart container not available');
      return;
    }
    
    const chartBounds = chartContainer.getBoundingClientRect();
    console.log('Chart bounds:', chartBounds);
    
    // 実際のチャートデータを取得
    const actualChartData = chartRef.props?.data || [];
    if (!actualChartData.length) {
      console.log('No chart data in chartRef');
      return;
    }
    
    // DOMが完全に描画されるまで少し待つ
    setTimeout(() => {
      try {
        // フォールバック位置計算を使用
        console.log('Using fallback position calculation');
        const fallbackPositions = calculateFallbackPositions(actualChartData, chartBounds);
        
        // 位置が変更された場合のみ状態を更新
        const positionsChanged = JSON.stringify(fallbackPositions) !== JSON.stringify(lastPositions);
        if (positionsChanged && Object.keys(fallbackPositions).length > 0) {
          console.log('Positions changed, updating state');
          setLastPositions(fallbackPositions);
          setTaskPositions(fallbackPositions);
        } else {
          console.log('Positions unchanged or empty, skipping update');
        }
      } catch (error) {
        console.error('Error processing bar positions:', error);
      }
    }, 300);
  }, [chartRef, calculateFallbackPositions, lastPositions]);

  // チャート参照が変更されたときにリスナーを再設定
  useEffect(() => {
    if (chartRef) {
      console.log('Chart ref updated, setting up render callback');
      // リサイズ時にも位置を更新
      const handleResize = () => {
        console.log('Window resized, updating chart positions');
        handleBarChartRender(chartRef.props?.data);
      };
      
      window.addEventListener('resize', handleResize);
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [chartRef, handleBarChartRender]);

  return {
    chartRef,
    setChartRef,
    taskPositions,
    handleBarChartRender
  };
};