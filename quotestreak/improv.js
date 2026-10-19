// Said or written (v52): famous lines, and whether the actor made them up on set or they were in the
// script. Only well-documented cases; each carries the one-line reason the reveal shows.
// Loaded by play.html as window.Improv and by modes.test.js through require.
(function (root) {
  const SET = 'Made up on set', SCRIPT = 'In the script';
  const LIST = [
    ['You talkin’ to me?', 'Taxi Driver', 1976, 'drama', SET, 'Robert De Niro made it up; the script only said Travis talks to himself in the mirror.'],
    ['Here’s Johnny!', 'The Shining', 1980, 'drama', SET, 'Jack Nicholson ad-libbed it, borrowing the way Johnny Carson was introduced on television.'],
    ['I know.', 'The Empire Strikes Back', 1980, 'scifi', SET, 'Harrison Ford’s idea; the script had Han answer ‘I love you too.’'],
    ['You’re gonna need a bigger boat.', 'Jaws', 1975, 'action', SET, 'Roy Scheider ad-libbed it.'],
    ['Leave the gun. Take the cannoli.', 'The Godfather', 1972, 'drama', SET, 'Richard Castellano added ‘Take the cannoli’ himself.'],
    ['Funny how? I mean, funny like I’m a clown? I amuse you?', 'Goodfellas', 1990, 'drama', SET, 'Joe Pesci built the scene in rehearsal from something that happened to him.'],
    ['All those moments will be lost in time, like tears in rain.', 'Blade Runner', 1982, 'scifi', SET, 'Rutger Hauer rewrote the speech himself.'],
    ['I’m the king of the world!', 'Titanic', 1997, 'drama', SET, 'Leonardo DiCaprio made it up on the day.'],
    ['I’ll be back.', 'The Terminator', 1984, 'action', SCRIPT, 'In the script. Arnold Schwarzenegger wanted to say ‘I will be back’; James Cameron kept it.'],
    ['Go ahead, make my day.', 'Sudden Impact', 1983, 'action', SCRIPT, 'In Joseph Stinson’s script.'],
    ['You can’t handle the truth!', 'A Few Good Men', 1992, 'drama', SCRIPT, 'Aaron Sorkin wrote it, first for his stage play.'],
    ['Show me the money!', 'Jerry Maguire', 1996, 'comedy', SCRIPT, 'Cameron Crowe wrote it.'],
    ['May the Force be with you.', 'Star Wars', 1977, 'scifi', SCRIPT, 'George Lucas wrote it.'],
    ['Bond. James Bond.', 'Dr. No', 1962, 'action', SCRIPT, 'In the script for the first Bond film.'],
    ['Frankly, my dear, I don’t give a damn.', 'Gone with the Wind', 1939, 'classic', SCRIPT, 'In the script, close to Margaret Mitchell’s novel.'],
    ['Hasta la vista, baby.', 'Terminator 2: Judgment Day', 1991, 'action', SCRIPT, 'In the script by James Cameron and William Wisher.'],
  ];
  const questions = () => LIST.map(([quote, title, year, genre, answer, why]) => ({
    type: 'movie', genre, quote, answer, options: [SET, SCRIPT], noTally: true, year: null,
    character: `${title}, ${year}. ${why}`, prompt: `${title}: made up on set, or in the script?`,
  }));
  const api = { LIST, SET, SCRIPT, questions };
  if (typeof module !== 'undefined') module.exports = api; else root.Improv = api;
})(this);
