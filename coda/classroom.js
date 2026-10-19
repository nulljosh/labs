// Classroom (v46): packs for a lesson on the big screen (party.js), and the teacher's results sheet.
// Speeches and Shakespeare are hand-checked lines; First lines comes from the bank's Gutenberg novels.
// Each line's wrong answers are the pack's other answers. Loaded by party.html as window.Classroom
// and by classroom.test.js through require.
(function (root) {
  const SPEECHES = [
    ['Four score and seven years ago our fathers brought forth on this continent, a new nation.', 'Abraham Lincoln'],
    ['The only thing we have to fear is fear itself.', 'Franklin D. Roosevelt'],
    ['Yesterday, December 7th, 1941, a date which will live in infamy.', 'Franklin D. Roosevelt'],
    ['I have nothing to offer but blood, toil, tears and sweat.', 'Winston Churchill'],
    ['We shall fight on the beaches.', 'Winston Churchill'],
    ['Ask not what your country can do for you; ask what you can do for your country.', 'John F. Kennedy'],
    ['We choose to go to the Moon in this decade and do the other things, not because they are easy, but because they are hard.', 'John F. Kennedy'],
    ['I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.', 'Martin Luther King Jr.'],
    ['Mr. Gorbachev, tear down this wall!', 'Ronald Reagan'],
    ['Give me liberty, or give me death!', 'Patrick Henry'],
    ['It is an ideal which I hope to live for and to achieve. But if needs be, it is an ideal for which I am prepared to die.', 'Nelson Mandela'],
    ['The ballot or the bullet.', 'Malcolm X'],
    ['That’s one small step for man, one giant leap for mankind.', 'Neil Armstrong'],
    ['Women’s rights are human rights, and human rights are women’s rights.', 'Hillary Clinton'],
  ];
  const SHAKESPEARE = [
    ['To be, or not to be, that is the question.', 'Hamlet'],
    ['The lady doth protest too much, methinks.', 'Hamlet'],
    ['All the world’s a stage, and all the men and women merely players.', 'As You Like It'],
    ['Now is the winter of our discontent.', 'Richard III'],
    ['Friends, Romans, countrymen, lend me your ears.', 'Julius Caesar'],
    ['Cry ‘Havoc!’ and let slip the dogs of war.', 'Julius Caesar'],
    ['But, soft! what light through yonder window breaks?', 'Romeo and Juliet'],
    ['Is this a dagger which I see before me?', 'Macbeth'],
    ['Out, damned spot! out, I say!', 'Macbeth'],
    ['If music be the food of love, play on.', 'Twelfth Night'],
    ['We few, we happy few, we band of brothers.', 'Henry V'],
    ['The course of true love never did run smooth.', 'A Midsummer Night’s Dream'],
    ['Lord, what fools these mortals be!', 'A Midsummer Night’s Dream'],
    ['A horse! a horse! my kingdom for a horse!', 'Richard III'],
  ];
  const LIST = [['speeches', 'Famous speeches'], ['shakespeare', 'Shakespeare'], ['firstlines', 'First lines of novels']];

  // A pack as {title, lines: [{quote, answer}]}; First lines needs the bank.
  function pack(id, bank = []) {
    const rows = id === 'speeches' ? SPEECHES : id === 'shakespeare' ? SHAKESPEARE
      : bank.filter(q => q.type === 'book').map(q => [q.quote, q.answer]);
    const title = (LIST.find(([k]) => k === id) || [])[1];
    return title && { title, lines: rows.map(([quote, answer]) => ({ quote, answer })) };
  }

  // The teacher's sheet: one row per student, right answers and points, ready to paste into a gradebook.
  const csv = (students) => ['Name,Right,Asked,Points', ...students.map(s => `"${s.name.replace(/"/g, '""')}",${s.right},${s.asked},${s.score}`)].join('\n');

  const api = { LIST, pack, csv };
  if (typeof module !== 'undefined') module.exports = api; else root.Classroom = api;
})(this);
