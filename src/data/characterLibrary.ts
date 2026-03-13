import type { LevelConfig, CharacterEntry } from '../types';

const allCharacters: CharacterEntry[] = [
  // Level 1-2: Page 1 - Numbers
  { char: '一', pinyin: 'yī', meaning: 'one', strokeCount: 1, emoji: '1️⃣', words: ['一个', '一天', '一起'], sentence: '我有一个好朋友。' },
  { char: '二', pinyin: 'èr', meaning: 'two', strokeCount: 2, emoji: '2️⃣', words: ['二月', '二楼', '二十'], sentence: '我家住在二楼。' },
  { char: '三', pinyin: 'sān', meaning: 'three', strokeCount: 3, emoji: '3️⃣', words: ['三月', '三个', '三角'], sentence: '桌上有三个苹果。' },
  { char: '四', pinyin: 'sì', meaning: 'four', strokeCount: 5, emoji: '4️⃣', words: ['四方', '四季', '四月'], sentence: '一年有四个季节。' },
  { char: '五', pinyin: 'wǔ', meaning: 'five', strokeCount: 4, emoji: '5️⃣', words: ['五月', '五个', '五彩'], sentence: '我每天五点放学。' },
  { char: '六', pinyin: 'liù', meaning: 'six', strokeCount: 4, emoji: '6️⃣', words: ['六月', '六个', '六一'], sentence: '六一儿童节真快乐。' },
  { char: '七', pinyin: 'qī', meaning: 'seven', strokeCount: 2, emoji: '7️⃣', words: ['七月', '七天', '七彩'], sentence: '一个星期有七天。' },
  { char: '八', pinyin: 'bā', meaning: 'eight', strokeCount: 2, emoji: '8️⃣', words: ['八月', '八方', '八个'], sentence: '我今年八岁了。' },
  { char: '九', pinyin: 'jiǔ', meaning: 'nine', strokeCount: 2, emoji: '9️⃣', words: ['九月', '九个', '九十'], sentence: '九月一日是开学日。' },
  { char: '十', pinyin: 'shí', meaning: 'ten', strokeCount: 2, emoji: '🔟', words: ['十月', '十分', '十个'], sentence: '我考了十分满分。' },

  // Level 3-4: Page 2 - Nature
  { char: '日', pinyin: 'rì', meaning: 'sun/day', strokeCount: 4, emoji: '☀️', words: ['日出', '日记', '生日'], sentence: '今天是我的生日。' },
  { char: '月', pinyin: 'yuè', meaning: 'moon/month', strokeCount: 4, emoji: '🌙', words: ['月亮', '月饼', '一月'], sentence: '月亮又圆又亮。' },
  { char: '水', pinyin: 'shuǐ', meaning: 'water', strokeCount: 4, emoji: '💧', words: ['水果', '河水', '喝水'], sentence: '小朋友要多喝水。' },
  { char: '火', pinyin: 'huǒ', meaning: 'fire', strokeCount: 4, emoji: '🔥', words: ['火车', '火山', '灭火'], sentence: '火车跑得很快。' },
  { char: '山', pinyin: 'shān', meaning: 'mountain', strokeCount: 3, emoji: '⛰️', words: ['高山', '山上', '山水'], sentence: '远处有一座高山。' },
  { char: '田', pinyin: 'tián', meaning: 'field', strokeCount: 5, emoji: '🌾', words: ['田地', '水田', '田野'], sentence: '农民在田地里干活。' },
  { char: '石', pinyin: 'shí', meaning: 'stone', strokeCount: 5, emoji: '🪨', words: ['石头', '石子', '宝石'], sentence: '河边有很多小石头。' },
  { char: '土', pinyin: 'tǔ', meaning: 'earth/soil', strokeCount: 3, emoji: '🟤', words: ['土地', '泥土', '土豆'], sentence: '小草从泥土中长出来。' },
  { char: '木', pinyin: 'mù', meaning: 'wood/tree', strokeCount: 4, emoji: '🪵', words: ['木头', '树木', '木马'], sentence: '公园里有很多树木。' },
  { char: '禾', pinyin: 'hé', meaning: 'grain', strokeCount: 5, emoji: '🌿', words: ['禾苗', '禾田', '禾草'], sentence: '田里的禾苗长高了。' },

  // Level 5-6: Page 3 - Positions
  { char: '大', pinyin: 'dà', meaning: 'big', strokeCount: 3, emoji: '🐘', words: ['大人', '大家', '大小'], sentence: '大象的身体很大。' },
  { char: '小', pinyin: 'xiǎo', meaning: 'small', strokeCount: 3, emoji: '🐜', words: ['小鸟', '小朋友', '大小'], sentence: '小鸟在树上唱歌。' },
  { char: '上', pinyin: 'shàng', meaning: 'up/above', strokeCount: 3, emoji: '⬆️', words: ['上面', '上学', '上午'], sentence: '我每天按时上学。' },
  { char: '下', pinyin: 'xià', meaning: 'down/below', strokeCount: 3, emoji: '⬇️', words: ['下面', '下雨', '下午'], sentence: '外面下雨了。' },
  { char: '里', pinyin: 'lǐ', meaning: 'inside', strokeCount: 7, emoji: '📦', words: ['里面', '家里', '心里'], sentence: '书包里有课本。' },
  { char: '外', pinyin: 'wài', meaning: 'outside', strokeCount: 5, emoji: '🏞️', words: ['外面', '外公', '课外'], sentence: '孩子们在外面玩耍。' },
  { char: '来', pinyin: 'lái', meaning: 'come', strokeCount: 7, emoji: '🏃', words: ['来到', '回来', '出来'], sentence: '春天来了，花开了。' },
  { char: '去', pinyin: 'qù', meaning: 'go', strokeCount: 5, emoji: '🚶', words: ['去年', '回去', '出去'], sentence: '我们去公园玩吧。' },
  { char: '正', pinyin: 'zhèng', meaning: 'correct/straight', strokeCount: 5, emoji: '✅', words: ['正好', '正在', '正确'], sentence: '他正在写作业。' },
  { char: '反', pinyin: 'fǎn', meaning: 'opposite/reverse', strokeCount: 4, emoji: '🔄', words: ['反面', '反对', '相反'], sentence: '请翻到纸的反面。' },

  // Level 7-8: Page 4 - Actions/States
  { char: '开', pinyin: 'kāi', meaning: 'open', strokeCount: 4, emoji: '🚪', words: ['开门', '开心', '开始'], sentence: '开学了，我很开心。' },
  { char: '关', pinyin: 'guān', meaning: 'close', strokeCount: 6, emoji: '🔒', words: ['关门', '关心', '关系'], sentence: '请随手关门。' },
  { char: '分', pinyin: 'fēn', meaning: 'divide/minute', strokeCount: 4, emoji: '✂️', words: ['分开', '十分', '分钟'], sentence: '上课十分钟就到了。' },
  { char: '合', pinyin: 'hé', meaning: 'together/close', strokeCount: 6, emoji: '🤝', words: ['合上', '合作', '适合'], sentence: '同学们一起合作完成任务。' },
  { char: '多', pinyin: 'duō', meaning: 'many/much', strokeCount: 6, emoji: '📚', words: ['多少', '很多', '多么'], sentence: '图书馆有很多书。' },
  { char: '少', pinyin: 'shǎo', meaning: 'few/less', strokeCount: 4, emoji: '🤏', words: ['多少', '少数', '不少'], sentence: '今天来了不少客人。' },
  { char: '远', pinyin: 'yuǎn', meaning: 'far', strokeCount: 7, emoji: '🌄', words: ['远方', '远处', '很远'], sentence: '学校离我家不远。' },
  { char: '近', pinyin: 'jìn', meaning: 'near', strokeCount: 7, emoji: '📍', words: ['近处', '附近', '靠近'], sentence: '公园就在附近。' },
  { char: '有', pinyin: 'yǒu', meaning: 'have', strokeCount: 6, emoji: '✋', words: ['有人', '没有', '有趣'], sentence: '我有一只小猫。' },
  { char: '无', pinyin: 'wú', meaning: 'none/without', strokeCount: 4, emoji: '🚫', words: ['无人', '无法', '无数'], sentence: '天上有无数的星星。' },

  // Level 9-10: Page 5 - Body Parts
  { char: '人', pinyin: 'rén', meaning: 'person', strokeCount: 2, emoji: '🧑', words: ['工人', '人民', '人才济济'], sentence: '我的爸爸是工人。' },
  { char: '口', pinyin: 'kǒu', meaning: 'mouth', strokeCount: 3, emoji: '👄', words: ['口才', '口水', '口是心非'], sentence: '哥哥的口才很棒。' },
  { char: '手', pinyin: 'shǒu', meaning: 'hand', strokeCount: 4, emoji: '🤚', words: ['手指', '手帕', '心灵手巧'], sentence: '姐姐的手指非常漂亮。' },
  { char: '耳', pinyin: 'ěr', meaning: 'ear', strokeCount: 6, emoji: '👂', words: ['耳朵', '耳环', '耳目一新'], sentence: '耳朵用来听声音。' },
  { char: '目', pinyin: 'mù', meaning: 'eye', strokeCount: 5, emoji: '👁️', words: ['目光', '题目', '目不转睛'], sentence: '奶奶的目光很慈祥。' },
  { char: '足', pinyin: 'zú', meaning: 'foot', strokeCount: 7, emoji: '🦶', words: ['足球', '足够', '画蛇添足'], sentence: '哥哥喜欢踢足球。' },
  { char: '舌', pinyin: 'shé', meaning: 'tongue', strokeCount: 6, emoji: '👅', words: ['舌头', '舌尖', '鸭舌帽'], sentence: '医生在帮我检查舌头。' },
  { char: '牙', pinyin: 'yá', meaning: 'tooth', strokeCount: 4, emoji: '🦷', words: ['蛀牙', '牙齿', '伶牙俐齿'], sentence: '认真刷牙可以预防蛀牙。' },
  { char: '头', pinyin: 'tóu', meaning: 'head', strokeCount: 5, emoji: '🗣️', words: ['头上', '头痛', '头头是道'], sentence: '发烧会引起头痛。' },
  { char: '发', pinyin: 'fà', meaning: 'hair', strokeCount: 5, emoji: '💇', words: ['发梢', '白发', '怒发冲冠'], sentence: '爷爷满头白发。' },

  // Level 11-12: Page 6 - Directions/Seasons
  { char: '东', pinyin: 'dōng', meaning: 'east', strokeCount: 5, emoji: '🌅', words: ['东方', '东西', '东边'], sentence: '太阳从东方升起。' },
  { char: '南', pinyin: 'nán', meaning: 'south', strokeCount: 9, emoji: '🧭', words: ['南方', '南边', '南瓜'], sentence: '小鸟飞向南方过冬。' },
  { char: '西', pinyin: 'xī', meaning: 'west', strokeCount: 6, emoji: '🌇', words: ['西方', '西瓜', '东西'], sentence: '夏天我最爱吃西瓜。' },
  { char: '北', pinyin: 'běi', meaning: 'north', strokeCount: 5, emoji: '❄️', words: ['北方', '北京', '北边'], sentence: '北京是中国的首都。' },
  { char: '左', pinyin: 'zuǒ', meaning: 'left', strokeCount: 5, emoji: '👈', words: ['左边', '左手', '左右'], sentence: '学校在我家左边。' },
  { char: '右', pinyin: 'yòu', meaning: 'right', strokeCount: 5, emoji: '👉', words: ['右边', '右手', '左右'], sentence: '请向右转。' },
  { char: '春', pinyin: 'chūn', meaning: 'spring', strokeCount: 9, emoji: '🌸', words: ['春天', '春风', '春雨'], sentence: '春天来了，花儿开了。' },
  { char: '夏', pinyin: 'xià', meaning: 'summer', strokeCount: 10, emoji: '☀️', words: ['夏天', '夏季', '夏日'], sentence: '夏天可以去游泳。' },
  { char: '秋', pinyin: 'qiū', meaning: 'autumn', strokeCount: 9, emoji: '🍂', words: ['秋天', '秋风', '秋叶'], sentence: '秋天树叶变黄了。' },
  { char: '冬', pinyin: 'dōng', meaning: 'winter', strokeCount: 5, emoji: '⛄', words: ['冬天', '冬季', '冬眠'], sentence: '冬天可以堆雪人。' },

  // Level 13-14: Page 7 - Pronouns/Family
  { char: '你', pinyin: 'nǐ', meaning: 'you', strokeCount: 7, emoji: '👤', words: ['你好', '你们', '你的'], sentence: '你好，我叫小明。' },
  { char: '我', pinyin: 'wǒ', meaning: 'I/me', strokeCount: 7, emoji: '🙋', words: ['我们', '我的', '自我'], sentence: '我喜欢画画。' },
  { char: '他', pinyin: 'tā', meaning: 'he/him', strokeCount: 5, emoji: '👦', words: ['他们', '他的', '其他'], sentence: '他是我的好朋友。' },
  { char: '它', pinyin: 'tā', meaning: 'it', strokeCount: 5, emoji: '🐾', words: ['它们', '它的', '其它'], sentence: '小狗很可爱，我喜欢它。' },
  { char: '她', pinyin: 'tā', meaning: 'she/her', strokeCount: 6, emoji: '👧', words: ['她们', '她的'], sentence: '她是我的姐姐。' },
  { char: '们', pinyin: 'men', meaning: '(plural)', strokeCount: 5, emoji: '👥', words: ['我们', '你们', '他们'], sentence: '我们一起上学去。' },
  { char: '爸', pinyin: 'bà', meaning: 'father', strokeCount: 8, emoji: '👨', words: ['爸爸', '爸妈'], sentence: '爸爸每天送我上学。' },
  { char: '妈', pinyin: 'mā', meaning: 'mother', strokeCount: 6, emoji: '👩', words: ['妈妈', '爸妈', '大妈'], sentence: '妈妈做的饭菜真好吃。' },
  { char: '哥', pinyin: 'gē', meaning: 'elder brother', strokeCount: 10, emoji: '👦', words: ['哥哥', '大哥'], sentence: '哥哥教我骑自行车。' },
  { char: '弟', pinyin: 'dì', meaning: 'younger brother', strokeCount: 7, emoji: '👶', words: ['弟弟', '兄弟'], sentence: '弟弟今年三岁了。' },

  // Level 15-16: Page 8 - Extended Family
  { char: '姐', pinyin: 'jiě', meaning: 'elder sister', strokeCount: 8, emoji: '👩', words: ['姐姐', '姐妹', '小姐'], sentence: '姐姐在读中学。' },
  { char: '妹', pinyin: 'mèi', meaning: 'younger sister', strokeCount: 8, emoji: '👧', words: ['妹妹', '姐妹'], sentence: '妹妹喜欢唱歌。' },
  { char: '父', pinyin: 'fù', meaning: 'father', strokeCount: 4, emoji: '👨‍👧', words: ['父亲', '父母', '祖父'], sentence: '父亲节我送了爸爸一幅画。' },
  { char: '母', pinyin: 'mǔ', meaning: 'mother', strokeCount: 5, emoji: '👩‍👧', words: ['母亲', '父母', '祖母'], sentence: '母亲节快乐！' },
  { char: '爷', pinyin: 'yé', meaning: 'grandpa', strokeCount: 6, emoji: '👴', words: ['爷爷', '老爷'], sentence: '爷爷给我讲故事。' },
  { char: '奶', pinyin: 'nǎi', meaning: 'grandma', strokeCount: 5, emoji: '👵', words: ['奶奶', '牛奶', '奶茶'], sentence: '奶奶做的点心最好吃。' },
  { char: '叔', pinyin: 'shū', meaning: 'uncle', strokeCount: 8, emoji: '👨‍🦱', words: ['叔叔', '叔父', '大叔'], sentence: '叔叔带我去动物园。' },
  { char: '伯', pinyin: 'bó', meaning: 'uncle (elder)', strokeCount: 7, emoji: '👨‍🦳', words: ['伯伯', '伯父', '伯母'], sentence: '伯伯家在北京。' },
  { char: '老', pinyin: 'lǎo', meaning: 'old', strokeCount: 6, emoji: '🧓', words: ['老师', '老人', '古老'], sentence: '老师教我们写字。' },
  { char: '幼', pinyin: 'yòu', meaning: 'young/child', strokeCount: 5, emoji: '👶', words: ['幼儿', '幼小', '幼儿园'], sentence: '弟弟还在上幼儿园。' },

  // Level 17-18: Page 9 - Actions
  { char: '男', pinyin: 'nán', meaning: 'male', strokeCount: 7, emoji: '🚹', words: ['男生', '男孩', '男女'], sentence: '我们班有十五个男生。' },
  { char: '女', pinyin: 'nǚ', meaning: 'female', strokeCount: 3, emoji: '🚺', words: ['女生', '女孩', '男女'], sentence: '她是一个可爱的女孩。' },
  { char: '出', pinyin: 'chū', meaning: 'go out', strokeCount: 5, emoji: '🚪', words: ['出去', '出来', '出发'], sentence: '我们出发去旅行。' },
  { char: '入', pinyin: 'rù', meaning: 'enter', strokeCount: 2, emoji: '🔑', words: ['进入', '加入', '出入'], sentence: '请从这里进入。' },
  { char: '坐', pinyin: 'zuò', meaning: 'sit', strokeCount: 7, emoji: '🪑', words: ['坐下', '坐车', '请坐'], sentence: '请坐下来休息一会儿。' },
  { char: '站', pinyin: 'zhàn', meaning: 'stand', strokeCount: 10, emoji: '🧍', words: ['站立', '车站', '站起来'], sentence: '请大家站起来。' },
  { char: '直', pinyin: 'zhí', meaning: 'straight', strokeCount: 8, emoji: '📏', words: ['直线', '一直', '正直'], sentence: '请画一条直线。' },
  { char: '弯', pinyin: 'wān', meaning: 'curved/bend', strokeCount: 9, emoji: '🌈', words: ['弯曲', '转弯', '弯路'], sentence: '前面有一个弯路。' },
  { char: '长', pinyin: 'cháng', meaning: 'long', strokeCount: 4, emoji: '📐', words: ['长短', '长大', '很长'], sentence: '这条路很长。' },
  { char: '短', pinyin: 'duǎn', meaning: 'short', strokeCount: 12, emoji: '📎', words: ['长短', '短小', '短文'], sentence: '弟弟的头发很短。' },

  // Level 19-20: Page 10 - Time/Concepts
  { char: '早', pinyin: 'zǎo', meaning: 'early/morning', strokeCount: 6, emoji: '🌅', words: ['早上', '早安', '早晨'], sentence: '早上好，同学们！' },
  { char: '晚', pinyin: 'wǎn', meaning: 'late/evening', strokeCount: 11, emoji: '🌆', words: ['晚上', '晚安', '早晚'], sentence: '晚上月亮出来了。' },
  { char: '古', pinyin: 'gǔ', meaning: 'ancient', strokeCount: 5, emoji: '🏛️', words: ['古代', '古老', '古今'], sentence: '长城是古代的建筑。' },
  { char: '今', pinyin: 'jīn', meaning: 'today/now', strokeCount: 4, emoji: '📅', words: ['今天', '今年', '古今'], sentence: '今天天气真好。' },
  { char: '明', pinyin: 'míng', meaning: 'bright/tomorrow', strokeCount: 8, emoji: '💡', words: ['明天', '明亮', '聪明'], sentence: '明天我们去郊游。' },
  { char: '昨', pinyin: 'zuó', meaning: 'yesterday', strokeCount: 9, emoji: '⏪', words: ['昨天', '昨日', '昨晚'], sentence: '昨天下了一场大雨。' },
  { char: '生', pinyin: 'shēng', meaning: 'life/birth', strokeCount: 5, emoji: '🌱', words: ['生日', '学生', '生活'], sentence: '我是一名小学生。' },
  { char: '灭', pinyin: 'miè', meaning: 'extinguish', strokeCount: 5, emoji: '🧯', words: ['灭火', '消灭', '熄灭'], sentence: '消防员赶来灭火。' },
  { char: '横', pinyin: 'héng', meaning: 'horizontal', strokeCount: 15, emoji: '➖', words: ['横线', '横竖', '纵横'], sentence: '请画一条横线。' },
  { char: '竖', pinyin: 'shù', meaning: 'vertical', strokeCount: 9, emoji: '|', words: ['竖线', '横竖', '竖立'], sentence: '请画一条竖线。' },
];

// Build 20 levels, 5 characters each
const CHARS_PER_LEVEL = 5;
const TOTAL_LEVELS = 20;

const levelNames = [
  '数字一', '数字二', '自然一', '自然二',
  '位置一', '位置二', '动作一', '动作二',
  '身体一', '身体二', '方向', '季节',
  '代词', '家人一', '家人二', '家人三',
  '人物一', '人物二', '时间一', '时间二',
];

export const characterLevels: LevelConfig[] = Array.from({ length: TOTAL_LEVELS }, (_, i) => ({
  label: `Level ${i + 1}`,
  labelZh: `第${i + 1}关`,
  description: levelNames[i] || '',
  characters: allCharacters.slice(i * CHARS_PER_LEVEL, (i + 1) * CHARS_PER_LEVEL),
}));

export function getLevelConfig(level: number): LevelConfig {
  return characterLevels[level - 1] || characterLevels[0];
}

export const TOTAL_LEVEL_COUNT = TOTAL_LEVELS;
