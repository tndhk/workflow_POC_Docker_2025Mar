/**
 * 日付に指定された日数を追加する
 * @param {Date} date 元の日付
 * @param {number} days 追加する日数
 * @returns {Date} 計算された新しい日付
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/**
 * 日付をYYYY-MM-DD形式でフォーマットする
 * @param {Date} date フォーマットする日付
 * @returns {string} YYYY-MM-DD形式の日付文字列
 */
export const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

/**
 * 指定された日付が週末かどうかを判定する
 * @param {Date} date チェックする日付
 * @returns {boolean} 週末の場合はtrue、それ以外はfalse
 */
export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0: Sunday, 6: Saturday
};