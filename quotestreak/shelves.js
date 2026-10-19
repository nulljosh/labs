// Sports calls (v75), Speeches (v76) and Stand-up (v78): hand-picked lines, each found word for word (80% of its
// five-word runs) on the page in `source` before it went in; lines that failed the check stayed out.
// Each shelf plays as a ten-line pack off the leaderboard; wrong answers come from the same shelf.
// Classic script after game.js; shelves.test.js requires it.
(function (root) {
  const WP = 'https://en.wikipedia.org/wiki/', WQ = 'https://en.wikiquote.org/wiki/';
  const SPORTS = [
    ['Do you believe in miracles? Yes!', 'The Miracle on Ice', 'Al Michaels', 1980, WP + 'Miracle_on_Ice'],
    ['The Giants win the pennant! The Giants win the pennant!', 'The Shot Heard ’Round the World', 'Russ Hodges', 1951, WP + 'Shot_Heard_%27Round_the_World_(baseball)'],
    ['Down goes Frazier!', 'Foreman vs. Frazier', 'Howard Cosell', 1973, WP + 'Howard_Cosell'],
    ['In a year that has been so improbable, the impossible has happened!', 'Kirk Gibson’s World Series home run', 'Vin Scully', 1988, WP + 'Kirk_Gibson%27s_1988_World_Series_home_run'],
    ['I don’t believe what I just saw!', 'Kirk Gibson’s World Series home run', 'Jack Buck', 1988, WP + 'Kirk_Gibson%27s_1988_World_Series_home_run'],
    ['Havlicek stole the ball!', 'Havlicek’s steal', 'Johnny Most', 1965, WP + 'John_Havlicek'],
    ['The band is out on the field!', 'The Play', 'Joe Starkey', 1982, WP + 'The_Play_(American_football)'],
    ['They think it’s all over... it is now!', 'The 1966 World Cup final', 'Kenneth Wolstenholme', 1966, WP + '1966_FIFA_World_Cup_final'],
    ['Go crazy, folks! Go crazy!', 'Ozzie Smith’s home run', 'Jack Buck', 1985, WP + '1985_National_League_Championship_Series'],
    ['Your boys took a hell of a beating!', 'Norway beats England', 'Bjørge Lillelien', 1981, WP + 'Bj%C3%B8rge_Lillelien'],
    ['Wide right!', 'Super Bowl XXV', null, 1991, WP + 'Wide_Right_(Buffalo_Bills)'],
    ['Henderson has scored for Canada!', 'The Summit Series', 'Foster Hewitt', 1972, WP + 'Summit_Series'],
  ];
  const SPEECHES = [
    ['Four score and seven years ago our fathers brought forth on this continent, a new nation.', 'Abraham Lincoln', 1863],
    ['A house divided against itself cannot stand.', 'Abraham Lincoln', 1858],
    ['The only thing we have to fear is fear itself.', 'Franklin D. Roosevelt', 1933],
    ['I have nothing to offer but blood, toil, tears and sweat.', 'Winston Churchill', 1940],
    ['We shall fight on the beaches.', 'Winston Churchill', 1940],
    ['Never in the field of human conflict was so much owed by so many to so few.', 'Winston Churchill', 1940],
    ['Ask not what your country can do for you; ask what you can do for your country.', 'John F. Kennedy', 1961],
    ['We choose to go to the Moon in this decade and do the other things, not because they are easy, but because they are hard.', 'John F. Kennedy', 1962],
    ['Ich bin ein Berliner.', 'John F. Kennedy', 1963],
    ['I have a dream that my four little children will one day live in a nation where they will not be judged by the color of their skin but by the content of their character.', 'Martin Luther King Jr.', 1963],
    ['Mr. Gorbachev, tear down this wall!', 'Ronald Reagan', 1987],
    ['Give me liberty, or give me death!', 'Patrick Henry', 1775],
    ['The ballot or the bullet.', 'Malcolm X', 1964],
    ['That’s one small step for man, one giant leap for mankind.', 'Neil Armstrong', 1969],
    ['The buck stops here.', 'Harry S. Truman', null],
    ['I am not a crook.', 'Richard Nixon', 1973],
    ['Read my lips: no new taxes.', 'George H. W. Bush', 1988],
    ['Ain’t I a woman?', 'Sojourner Truth', 1851],
    ['I will fight no more forever.', 'Chief Joseph', 1877],
    ['Yes we can.', 'Barack Obama', 2008],
    ['Speak softly and carry a big stick; you will go far.', 'Theodore Roosevelt', 1901],
  ];
  // Classic one-liners picked by hand from scripts/harvest-standup.mjs's candidates, then checked.
  const STANDUP = [
    ["I used to do drugs. I still do, but I used to, too.", "Mitch Hedberg"],
    ["I'm against picketing, but I don't know how to show it.", "Mitch Hedberg"],
    ["I haven't slept for ten days, because that would be too long.", "Mitch Hedberg"],
    ["A lot of people are afraid of heights; not me, I'm afraid of widths.", "Steven Wright"],
    ["Everywhere is walking distance if you've got the time.", "Steven Wright"],
    ["I bought some powdered water, but I don't know what to add.", "Steven Wright"],
    ["I told my doctor I broke my arm in two places. He told me to keep out of those places.", "Rodney Dangerfield"],
    ["My old man never liked me. He gave me my allowance in traveler's checks.", "Rodney Dangerfield"],
    ["I live in a tough neighborhood. They got a children's zoo. Last week, four kids escaped.", "Rodney Dangerfield"],
    ["I knew I was an unwanted baby when I saw that my bath toys were a toaster and a radio.", "Joan Rivers"],
    ["I wish I had a twin, so I could know what I'd look like without plastic surgery.", "Joan Rivers"],
    ["Most people work just hard enough not to get fired and get paid just enough money not to quit.", "George Carlin"],
    ["Comedy is the blues for people who can't sing.", "Chris Rock"],
    ["You can't be happy that fire cooks your food and be mad it burns your fingertips.", "Chris Rock"],
    ["In terms of like, instant relief, canceling plans is like heroin.", "John Mulaney"],
    ["I was raised Catholic. I don't know if you can tell that from the everything about me.", "John Mulaney"],
    ["Agatha Christie? We go back years, me and Ag. She's a … she's just a … she's dead, isn't she?", "Eddie Izzard"],
    ["I like my coffee like I like my women... in a plastic cup.", "Eddie Izzard"],
    ["I never forget a face, but in your case I'll be glad to make an exception.", "Groucho Marx"],
    ["Although it is generally known, I think it's about time to announce that I was born at a very early age.", "Groucho Marx"],
    ["Here's to our wives and girlfriends... may they never meet!", "Groucho Marx"],
    ["My wife will buy anything marked down. Last year she bought an escalator.", "Henny Youngman"],
    ["I take my wife everywhere, but she keeps finding her way back.", "Henny Youngman"],
    ["My first Hollywood picture wasn't released, it escaped.", "Henny Youngman"],
    ["When I was ten, my family moved to Downers Grove, Illinois. When I was twelve, I found them.", "Emo Philips"],
    ["How many people here have telekinetic powers? Raise my hand.", "Emo Philips"],
    ["My boyfriend and I broke up. He wanted to get married, and I didn't want him to.", "Rita Rudner"],
    ["I had teeth that stuck out so far, I used to eat other kids' candy bars by accident.", "Rita Rudner"],
    ["It takes a big man to cry, but it takes an even bigger man to laugh at that man.", "Jack Handey"],
    ["If you ever drop your keys into a river of molten lava, let 'em go, because man, they're gone.", "Jack Handey"],
  ];
  const SHELVES = {
    sports: { title: 'Sports calls', prompt: 'Which moment is this call from?', rows: SPORTS.map(([quote, answer, who, year, source]) => ({ quote, answer, who, year, source })) },
    standup: { title: 'Stand-up', prompt: 'Which comic said it?', rows: STANDUP.map(([quote, answer]) => ({ quote, answer, source: WQ + encodeURIComponent(answer.replace(/ /g, '_')) })) },
    speeches: { title: 'Speeches', prompt: 'Who said it?', rows: SPEECHES.map(([quote, answer, year]) => ({ quote, answer, year, source: WQ + encodeURIComponent(answer.replace(/ /g, '_')) })) },
  };
  // A shelf's lines in the game's shape, wrong answers drawn from the shelf's other answers.
  function questions(id, rand = Math.random) {
    const s = SHELVES[id], answers = [...new Set(s.rows.map(r => r.answer))];
    return s.rows.map(r => {
      const others = answers.filter(a => a !== r.answer).sort(() => rand() - 0.5).slice(0, 3);
      return { type: id, genre: id, quote: r.quote, answer: r.answer, year: r.year, source: r.source, character: r.who || undefined,
        options: [r.answer, ...others].sort(() => rand() - 0.5), prompt: s.prompt, noTally: true };
    });
  }
  const api = { SHELVES, questions };
  if (typeof module !== 'undefined') { module.exports = api; return; }
  root.Shelves = api;

  GENRES.sports = { color: '#0f4c81', text: '#fff' };
  GENRES.speeches = { color: '#5c6b8a', text: '#fff' };
  GENRES.standup = { color: '#ffd23f', text: '#111' };
  LABELS.standup = 'Stand-up';
  let on = false;
  for (const id of Object.keys(SHELVES)) $(`start-${id}`).onclick = () => {
    on = window.quotableOffBoard = true;
    startGame(false);
    pool = shuffle(questions(id)).slice(0, 10);
    nextQuestion();
  };
  const before = window.quotableBadge;
  window.quotableBadge = (event, d = {}) => {
    if (on && event === 'game') on = window.quotableOffBoard = false;
    return before(event, d);
  };
})(this);
