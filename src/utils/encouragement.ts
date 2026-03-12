const correctMessages = [
  { en: 'Great job!', zh: '做得好！' },
  { en: 'Perfect!', zh: '太棒了！' },
  { en: 'You got it!', zh: '答对了！' },
  { en: 'Awesome!', zh: '真厉害！' },
  { en: 'Keep it up!', zh: '继续加油！' },
  { en: 'Wonderful!', zh: '真好！' },
  { en: 'Nice stroke!', zh: '写得真好！' },
  { en: 'Excellent!', zh: '太棒了！' },
];

const mistakeMessages = [
  { en: 'Almost! Try again', zh: '差一点！再试试' },
  { en: 'So close!', zh: '快了！' },
  { en: 'You can do it!', zh: '你可以的！' },
  { en: 'Keep trying!', zh: '再试一次！' },
];

const completionMessages: Record<string, { en: string; zh: string }[]> = {
  perfect: [
    { en: 'Character master!', zh: '写字大师！' },
    { en: 'Incredible!', zh: '太不可思议了！' },
    { en: 'Flawless!', zh: '完美无缺！' },
  ],
  great: [
    { en: 'Wonderful work!', zh: '做得真好！' },
    { en: 'Almost perfect!', zh: '接近完美！' },
    { en: 'So talented!', zh: '真有天赋！' },
  ],
  good: [
    { en: 'Good effort!', zh: '努力不错！' },
    { en: 'Well done!', zh: '干得好！' },
    { en: 'Getting better!', zh: '越来越好了！' },
  ],
  tryAgain: [
    { en: 'Keep practicing!', zh: '继续练习！' },
    { en: 'You\'ll get it!', zh: '你会学会的！' },
    { en: 'Practice makes perfect!', zh: '熟能生巧！' },
  ],
};

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function getCorrectMessage() {
  return randomPick(correctMessages);
}

export function getMistakeMessage() {
  return randomPick(mistakeMessages);
}

export function getCompletionMessage(grade: string) {
  const pool = completionMessages[grade] || completionMessages.tryAgain;
  return randomPick(pool);
}
