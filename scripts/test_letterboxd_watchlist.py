from letterboxd_watchlist import parse_watchlist_page, parse_rating

def test_parse_watchlist_page():
    html = '<div class="react-component" data-item-slug="robin-hood-1991" data-item-full-display-name="Robin Hood (1991)"></div>'
    films = parse_watchlist_page(html)
    assert films == [{"slug": "robin-hood-1991", "title": "Robin Hood (1991)"}]

def test_parse_watchlist_page_empty():
    assert parse_watchlist_page("<div>no posters here</div>") == []

def test_parse_rating():
    html = '<meta name="twitter:data2" content="2.89 out of 5">'
    assert parse_rating(html) == 2.89

def test_parse_rating_missing():
    assert parse_rating("<meta name=\"twitter:data2\" content=\"\">") is None

if __name__ == "__main__":
    test_parse_watchlist_page()
    test_parse_watchlist_page_empty()
    test_parse_rating()
    test_parse_rating_missing()
    print("all tests passed")
