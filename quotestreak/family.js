// Family mode (v60): only lines that are safe for kids, decided from real ratings, never by taste.
// Films: rated G, or PG when animated. Games: rated Everyone, Everyone 10+ or Kids to Adults. TV only
// when Wikidata calls it a children's series. Songs and first lines of books unless a word is on the
// list below. A title with no rating stays out. Loaded as window.Family; family.test.js requires it.
(function (root) {
  const WORDS = /\b(fuck\w*|shit\w*|bitch\w*|bastard\w*|damn\w*|hell|ass|asses|sex\w*|kill\w*|murder\w*|rape\w*|drug\w*|cocaine|whore\w*|slut\w*|dick\w*|cock\w*|puss\w*|naked|nude|blood\w*|gun\w*|suicid\w*|beer|drunk\w*|weed|virgin\w*|die|died|dead|death|devil\w*|slaughter\w*|cannibal\w*|abduct\w*|shred\w*|making out|neurotoxin|weapon\w*)\b/i;
  const GAMES = new Set(['Everyone', 'Everyone 10+', 'Kids to Adults', 'Early Childhood']);
  function ok(q) {
    if (WORDS.test(q.quote)) return false;
    if (q.type === 'movie') return q.rating === 'G' || (q.rating === 'PG' && q.genre === 'cartoon');
    if (q.type === 'game') return GAMES.has(q.rating);
    if (q.type === 'tv') return q.rating === "children's";
    return q.type === 'music' || q.type === 'book';
  }
  const api = { ok, WORDS };
  if (typeof module !== 'undefined') module.exports = api; else root.Family = api;
})(this);
