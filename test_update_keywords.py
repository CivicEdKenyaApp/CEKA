import pytest
from pathlib import Path
from update_keywords import (
    parse_keywords,
    merge_keywords,
    is_valid_keyword,
    update_meta_keywords,
    fetch_top_trends,   # we will mock this in integration tests
)
from unittest.mock import patch, MagicMock
from bs4 import BeautifulSoup

# ------------------------------------------------------------
# Tests for utility functions
# ------------------------------------------------------------
def test_parse_keywords():
    assert parse_keywords("a, b, c") == ["a", "b", "c"]
    assert parse_keywords("a, b, c,") == ["a", "b", "c"]
    assert parse_keywords("") == []
    assert parse_keywords("  one  ,  two  ") == ["one", "two"]

def test_merge_keywords_no_duplicates():
    existing = ["civic", "kenya"]
    new = ["democracy", "governance"]
    merged = merge_keywords(existing, new)
    assert merged == ["civic", "kenya", "democracy", "governance"]

def test_merge_keywords_with_duplicates_case_insensitive():
    existing = ["Civic", "Kenya"]
    new = ["civic", "kenya", "democracy"]
    merged = merge_keywords(existing, new)
    assert merged == ["Civic", "Kenya", "democracy"]  # original casing preserved

def test_is_valid_keyword():
    assert is_valid_keyword("democracy") is True
    assert is_valid_keyword("IEBC 2024") is True
    assert is_valid_keyword("a") is False          # too short
    assert is_valid_keyword("") is False
    assert is_valid_keyword("http://trend.com") is False
    assert is_valid_keyword("12345") is False      # no letters
    assert is_valid_keyword("x" * 101) is False    # too long

# ------------------------------------------------------------
# Tests for HTML manipulation (isolated, no disk writes)
# ------------------------------------------------------------
def test_update_meta_keywords_creates_tag_if_missing(tmp_path):
    html = tmp_path / "index.html"
    html.write_text("<html><head></head><body></body></html>")
    changed, added = update_meta_keywords(html, ["trend1", "trend2"], dry_run=False)
    assert changed is True
    content = html.read_text()
    assert 'name="keywords"' in content
    assert 'content="trend1, trend2"' in content

def test_update_meta_keywords_appends_not_overwrites(tmp_path):
    html = tmp_path / "index.html"
    html.write_text('<html><head><meta name="keywords" content="civic, kenya"></head></html>')
    changed, added = update_meta_keywords(html, ["democracy", "kenya"], dry_run=False)
    assert changed is True
    assert added == ["democracy"]   # kenya already present
    content = html.read_text()
    assert 'content="civic, kenya, democracy"' in content

def test_update_meta_keywords_no_change_if_same_content(tmp_path):
    html = tmp_path / "index.html"
    html.write_text('<html><head><meta name="keywords" content="a, b"></head></html>')
    changed, added = update_meta_keywords(html, ["b", "a"], dry_run=False)  # same set, order might differ
    # merge_keywords preserves order, so will become "a, b, b, a"? Actually existing = ["a","b"], new = ["b","a"] -> after merge: a,b,b,a? But our merge only appends if not already present, so "b" and "a" already exist, no new added. So merged = ["a","b"].
    assert changed is False
    assert added == []

def test_last_updated_meta_created_or_updated(tmp_path):
    html = tmp_path / "index.html"
    html.write_text("<html><head></head></html>")
    changed, _ = update_meta_keywords(html, ["test"], dry_run=False)
    assert changed is True
    soup = BeautifulSoup(html.read_text(), "html.parser")
    meta = soup.find("meta", attrs={"name": "last-updated"})
    assert meta is not None
    assert "content" in meta.attrs

def test_dry_run_does_not_write(tmp_path):
    html = tmp_path / "index.html"
    html.write_text("<html><head></head></html>")
    changed, _ = update_meta_keywords(html, ["trend"], dry_run=True)
    assert changed is True   # indicates we *would* change
    # file should still be empty head
    soup = BeautifulSoup(html.read_text(), "html.parser")
    assert soup.find("meta", attrs={"name": "keywords"}) is None

# ------------------------------------------------------------
# Mocked test for fetch_top_trends (integration‑light)
# ------------------------------------------------------------
@patch("update_keywords.TrendReq")
def test_fetch_top_trends_success(mock_trendreq):
    mock_instance = MagicMock()
    mock_trendreq.return_value = mock_instance
    # Mock the trending_searches DataFrame
    import pandas as pd
    df = pd.DataFrame(["trend1", "trend2", "invalid_http://x", ""])
    mock_instance.trending_searches.return_value = df

    result = fetch_top_trends(3)
    assert result == ["trend1", "trend2"]   # invalid filtered out

@patch("update_keywords.TrendReq")
def test_fetch_top_trends_empty(mock_trendreq):
    mock_instance = MagicMock()
    mock_trendreq.return_value = mock_instance
    mock_instance.trending_searches.return_value = pd.DataFrame()  # empty

    result = fetch_top_trends(5)
    assert result == []
