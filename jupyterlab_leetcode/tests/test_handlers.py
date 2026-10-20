import json
import time
from http.cookiejar import Cookie, CookieJar

import pytest
from tornado.httpclient import HTTPClientError

from jupyterlab_leetcode.utils import utils


def make_cookie(name: str, value: str, expires: int) -> Cookie:
    return Cookie(
        version=0,
        name=name,
        value=value,
        port=None,
        port_specified=False,
        domain=".leetcode.com",
        domain_specified=True,
        domain_initial_dot=True,
        path="/",
        path_specified=True,
        secure=True,
        expires=expires,
        discard=False,
        comment=None,
        comment_url=None,
        rest={},
    )


def error_payload(error: HTTPClientError):
    assert error.response is not None
    return json.loads(error.response.body)


async def test_get_cookies_requires_browser(jp_fetch):
    with pytest.raises(HTTPClientError) as e:
        await jp_fetch("jupyterlab-leetcode", "cookies")

    assert e.value.code == 400
    payload = error_payload(e.value)
    assert payload == {"message": "Browser parameter is required"}


async def test_get_cookies_rejects_unsupported_browser(jp_fetch):
    with pytest.raises(HTTPClientError) as e:
        await jp_fetch("jupyterlab-leetcode", "cookies", params={"browser": "lynx"})

    assert e.value.code == 400
    payload = error_payload(e.value)
    assert payload == {"message": "Unsupported browser: lynx"}


async def test_get_cookies_from_browser(jp_fetch, monkeypatch):
    expires = int(time.time()) + 3600
    jar = CookieJar()
    jar.set_cookie(make_cookie("LEETCODE_SESSION", "session", expires))
    jar.set_cookie(make_cookie("csrftoken", "csrf", expires))
    monkeypatch.setitem(
        utils.BROWSER_COOKIE_METHOD_MAP, "chrome", lambda domain_name: jar
    )

    response = await jp_fetch(
        "jupyterlab-leetcode", "cookies", params={"browser": "chrome"}
    )

    assert response.code == 200
    payload = json.loads(response.body)
    assert payload == {
        "exist": True,
        "expired": False,
        "checked": True,
        "expires": expires,
    }
    assert "leetcode_browser=chrome" in response.headers.get("Set-Cookie", "")


async def test_get_cookies_missing_session(jp_fetch, monkeypatch):
    monkeypatch.setitem(
        utils.BROWSER_COOKIE_METHOD_MAP, "chrome", lambda domain_name: CookieJar()
    )

    response = await jp_fetch(
        "jupyterlab-leetcode", "cookies", params={"browser": "chrome"}
    )

    assert response.code == 200
    payload = json.loads(response.body)
    assert payload == {
        "exist": False,
        "expired": False,
        "checked": False,
        "expires": None,
    }
    assert "leetcode_browser" not in response.headers.get("Set-Cookie", "")


async def test_leetcode_handler_requires_browser_cookie(jp_fetch):
    with pytest.raises(HTTPClientError) as e:
        await jp_fetch("jupyterlab-leetcode", "leetcode", "profile")

    assert e.value.code == 400
    payload = error_payload(e.value)
    assert payload == {"message": "LeetCode browser cookie is required"}
