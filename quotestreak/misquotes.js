// Misquotes (v23): the line everyone remembers, and the one that was actually said. Each entry shows
// the misquote; the player picks the real line from it, the misquote itself, and two near misses.
// Loaded by play.html as window.Misquotes and by modes.test.js through require.
(function (root) {
  const LIST = [
    { answer: 'The Empire Strikes Back', year: 1980, genre: 'scifi', who: 'Darth Vader', said: 'Luke, I am your father.',
      real: 'No, I am your father.', near: ['Luke, I am your father.', 'No, Luke. I am your father.', 'Luke, I’m your father.'] },
    { answer: 'Casablanca', year: 1942, genre: 'classic', who: 'Ilsa', said: 'Play it again, Sam.',
      real: 'Play it, Sam. Play ‘As Time Goes By.’', near: ['Play it again, Sam.', 'Sam, play it once more.', 'Play it again, Sam, for old times’ sake.'] },
    { answer: 'The Wizard of Oz', year: 1939, genre: 'classic', who: 'Dorothy', said: 'Toto, I don’t think we’re in Kansas anymore.',
      real: 'Toto, I’ve a feeling we’re not in Kansas anymore.', near: ['Toto, I don’t think we’re in Kansas anymore.', 'Toto, we’re not in Kansas anymore.', 'Toto, I have a feeling this isn’t Kansas.'] },
    { answer: 'Snow White and the Seven Dwarfs', year: 1937, genre: 'cartoon', who: 'The Queen', said: 'Mirror, mirror on the wall, who’s the fairest of them all?',
      real: 'Magic Mirror on the wall, who is the fairest one of all?', near: ['Mirror, mirror on the wall, who’s the fairest of them all?', 'Mirror on the wall, who is fairest of them all?', 'Magic Mirror, who’s the fairest in the land?'] },
    { answer: 'Jaws', year: 1975, genre: 'action', who: 'Brody', said: 'We’re gonna need a bigger boat.',
      real: 'You’re gonna need a bigger boat.', near: ['We’re gonna need a bigger boat.', 'We need a bigger boat.', 'You’re going to need a bigger boat, Quint.'] },
    { answer: 'Field of Dreams', year: 1989, genre: 'drama', who: 'The Voice', said: 'If you build it, they will come.',
      real: 'If you build it, he will come.', near: ['If you build it, they will come.', 'Build it and they will come.', 'If you build it, they’ll come.'] },
    { answer: 'The Silence of the Lambs', year: 1991, genre: 'drama', who: 'Hannibal Lecter', said: 'Hello, Clarice.',
      real: 'Good evening, Clarice.', near: ['Hello, Clarice.', 'Good morning, Clarice.', 'Well, hello, Clarice.'] },
    { answer: 'Forrest Gump', year: 1994, genre: 'drama', who: 'Forrest', said: 'Life is like a box of chocolates.',
      real: 'My mama always said life was like a box of chocolates.', near: ['Life is like a box of chocolates.', 'Mama always said life is like a box of chocolates.', 'My mama said life is a box of chocolates.'] },
    { answer: 'Wall Street', year: 1987, genre: 'drama', who: 'Gordon Gekko', said: 'Greed is good.',
      real: 'Greed, for lack of a better word, is good.', near: ['Greed is good.', 'Greed, for want of a better word, is good.', 'Greed is right. Greed is good.'] },
    { answer: 'Dirty Harry', year: 1971, genre: 'action', who: 'Harry Callahan', said: 'Do you feel lucky, punk?',
      real: 'You’ve got to ask yourself one question: “Do I feel lucky?” Well, do ya, punk?', near: ['Do you feel lucky, punk?', 'Are you feeling lucky, punk?', 'Ask yourself: do you feel lucky, punk?'] },
    { answer: 'The Treasure of the Sierra Madre', year: 1948, genre: 'classic', who: 'Gold Hat', said: 'We don’t need no stinking badges!',
      real: 'I don’t have to show you any stinking badges!', near: ['We don’t need no stinking badges!', 'Badges? We don’t need no stinking badges!', 'We ain’t got no stinking badges!'] },
    { answer: 'The Graduate', year: 1967, genre: 'comedy', who: 'Benjamin', said: 'Mrs. Robinson, are you trying to seduce me?',
      real: 'Mrs. Robinson, you’re trying to seduce me. Aren’t you?', near: ['Mrs. Robinson, are you trying to seduce me?', 'Mrs. Robinson, you’re trying to seduce me.', 'Are you trying to seduce me, Mrs. Robinson?'] },
    { answer: 'She Done Him Wrong', year: 1933, genre: 'comedy', who: 'Lady Lou', said: 'Why don’t you come up and see me sometime?',
      real: 'Why don’t you come up sometime and see me?', near: ['Why don’t you come up and see me sometime?', 'Come up and see me sometime.', 'Why don’t you come up and see me?'] },
    { answer: 'Sunset Boulevard', year: 1950, genre: 'classic', who: 'Norma Desmond', said: 'Mr. DeMille, I’m ready for my close-up.',
      real: 'All right, Mr. DeMille, I’m ready for my close-up.', near: ['Mr. DeMille, I’m ready for my close-up.', 'I’m ready for my close-up, Mr. DeMille.', 'Mr. DeMille, I am ready for my close-up now.'] },
    { answer: 'Cool Hand Luke', year: 1967, genre: 'drama', who: 'The Captain', said: 'What we have here is a failure to communicate.',
      real: 'What we’ve got here is failure to communicate.', near: ['What we have here is a failure to communicate.', 'What we have here is failure to communicate.', 'What we’ve got here is a failure to communicate.'] },
  ];
  // Questions in the game's shape: the misquote is shown, the real line is the answer.
  const questions = () => LIST.map(m => ({
    type: 'movie', genre: m.genre, year: m.year, quote: m.real, noTally: true, display: m.said, answer: m.real, character: `${m.who}, ${m.answer}`,
    options: [m.real, ...m.near.slice(0, 3)], prompt: `Everyone says this. What did ${m.who} really say in ${m.answer}?`,
  }));
  const api = { LIST, questions };
  if (typeof module !== 'undefined') module.exports = api; else root.Misquotes = api;
})(this);
