import json
import time
from collections.abc import Callable, Iterable, Mapping
from http.cookiejar import Cookie
from typing import Any, TypeVar, cast

import browser_cookie3
from tornado.concurrent import Future
from tornado.httpclient import AsyncHTTPClient, HTTPRequest, HTTPResponse
from tornado.httputil import HTTPHeaders

T = TypeVar("T")


def first(iterable: Iterable[T], unary_predicate: Callable[[T], bool]) -> T | None:
    """Return the first item in an iterable that satisfies a condition"""
    return next((i for i in iterable if unary_predicate(i)), None)


def request(
    url: str, method: str, headers: Mapping[str, str], body: Mapping[str, Any] = {}
) -> Future[HTTPResponse]:
    client = AsyncHTTPClient()
    req = HTTPRequest(
        url=url,
        method=method,
        headers=HTTPHeaders(headers),
        body=json.dumps(body) if body else None,
    )

    return client.fetch(req)


BROWSER_COOKIE_METHOD_MAP = {
    "chrome": browser_cookie3.chrome,
    "chromium": browser_cookie3.chromium,
    "opera": browser_cookie3.opera,
    "opera_gx": browser_cookie3.opera_gx,
    "brave": browser_cookie3.brave,
    "edge": browser_cookie3.edge,
    "vivaldi": browser_cookie3.vivaldi,
    "firefox": browser_cookie3.firefox,
    "librewolf": browser_cookie3.librewolf,
    "safari": browser_cookie3.safari,
    "arc": browser_cookie3.arc,
}


def get_leetcode_cookie(browser: str, settings: dict[str, Any], ua: str):
    if not browser:
        raise ValueError("Browser parameter is required")

    if browser not in BROWSER_COOKIE_METHOD_MAP:
        raise ValueError(f"Unsupported browser: {browser}")
    try:
        cj = BROWSER_COOKIE_METHOD_MAP[browser](domain_name="leetcode.com")
    except browser_cookie3.BrowserCookieError as e:
        raise Exception(f"Failed to retrieve cookies. Maybe {browser} not installed?")
    except Exception as e:
        raise Exception(f"An error occurred: {str(e)}")

    cookie_session = first(cj, lambda c: c.name == "LEETCODE_SESSION")
    cookie_csrf = first(cj, lambda c: c.name == "csrftoken")
    exist = bool(cookie_session and cookie_csrf)
    expired = exist and (
        cast(Cookie, cookie_session).is_expired()
        or cast(Cookie, cookie_csrf).is_expired()
    )
    checked = exist and not expired

    expires = None
    if checked:
        expires = cast(Cookie, cookie_session).expires

    settings.update(
        leetcode_headers=HTTPHeaders(
            {
                "Cookie": "; ".join(f"{c.name}={c.value}" for c in cj),
                "Content-Type": "application/json",
                "Origin": "https://leetcode.com",
                "Referer": "https://leetcode.com/",
                "X-CsrfToken": (
                    cookie_csrf.value if cookie_csrf and cookie_csrf.value else ""
                ),
            }
        ),
    )
    AsyncHTTPClient.configure(None, defaults=dict(user_agent=ua))
    return {"exist": exist, "expired": expired, "checked": checked, "expires": expires}
