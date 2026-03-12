export interface ScoreResult {
  score: number;
  stars: number;
  perfectStrokes: number;
  grade: 'perfect' | 'great' | 'good' | 'tryAgain';
}

export function calculateScore(
  totalStrokes: number,
  mistakesPerStroke: number[]
): ScoreResult {
  if (totalStrokes === 0) {
    return { score: 0, stars: 0, perfectStrokes: 0, grade: 'tryAgain' };
  }

  const pointsPerStroke = 100 / totalStrokes;
  const perfectBonus = 5;
  let totalScore = 0;
  let perfectStrokes = 0;

  for (let i = 0; i < totalStrokes; i++) {
    const mistakes = mistakesPerStroke[i] || 0;
    if (mistakes === 0) {
      totalScore += pointsPerStroke + perfectBonus;
      perfectStrokes++;
    } else {
      const deduction = mistakes * 10;
      totalScore += Math.max(0, pointsPerStroke - deduction);
    }
  }

  const score = Math.min(100, Math.round(totalScore));

  let stars: number;
  let grade: ScoreResult['grade'];

  if (score >= 90) {
    stars = 5;
    grade = 'perfect';
  } else if (score >= 75) {
    stars = 4;
    grade = 'great';
  } else if (score >= 60) {
    stars = 3;
    grade = 'good';
  } else {
    stars = score >= 40 ? 2 : 1;
    grade = 'tryAgain';
  }

  return { score, stars, perfectStrokes, grade };
}
