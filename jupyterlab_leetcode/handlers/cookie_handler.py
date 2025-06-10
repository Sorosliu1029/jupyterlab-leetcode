import json
import time
from http.cookiejar import Cookie
from typing import cast

import browser_cookie3
import tornado
from tornado.httpclient import AsyncHTTPClient
from tornado.httputil import HTTPHeaders

from ..utils.utils import first
from .base_handler import BaseHandler

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


class GetCookieHandler(BaseHandler):
    route = r"cookies"

    @tornado.web.authenticated
    def get(self):
        self.log.debug("Loading all cookies for LeetCode...")
        browser = self.get_query_argument("browser", "", strip=True)
        if not browser:
            self.set_status(400)
            self.finish(json.dumps({"message": "Browser parameter is required"}))
            return

        if browser not in BROWSER_COOKIE_METHOD_MAP:
            self.set_status(400)
            self.finish(json.dumps({"message": f"Unsupported browser: {browser}"}))
            return

        try:
            cj = BROWSER_COOKIE_METHOD_MAP[browser](domain_name="leetcode.com")
        except browser_cookie3.BrowserCookieError as e:
            self.set_status(418)
            self.finish(
                json.dumps(
                    {
                        "message": "Failed to retrieve cookies. Maybe not installed the browser?"
                    }
                )
            )
            return
        except Exception as e:
            self.set_status(418)
            self.finish(json.dumps({"message": str(e.args)}))
            return

        cookie_session = first(cj, lambda c: c.name == "LEETCODE_SESSION")
        cookie_csrf = first(cj, lambda c: c.name == "csrftoken")
        exist = bool(cookie_session and cookie_csrf)
        expired = exist and (
            cast(Cookie, cookie_session).is_expired()
            or cast(Cookie, cookie_csrf).is_expired()
        )
        checked = exist and not expired

        resp = {"exist": exist, "expired": expired, "checked": checked}

        if checked:
            cookie_session_expires = cast(Cookie, cookie_session).expires
            max_age = (
                cookie_session_expires - int(time.time())
                if cookie_session_expires is not None
                else 3600 * 24 * 14
            )
            self.set_cookie("leetcode_browser", browser, max_age=max_age)
            self.settings.update(
                leetcode_browser=browser,
                leetcode_cookiejar=cj,
                leetcode_headers=HTTPHeaders(
                    {
                        "Cookie": "; ".join(f"{c.name}={c.value}" for c in cj),
                        "Content-Type": "application/json",
                        "Origin": "https://leetcode.com",
                        "Referer": "https://leetcode.com/",
                        "X-CsrfToken": (
                            cookie_csrf.value
                            if cookie_csrf and cookie_csrf.value
                            else ""
                        ),
                    }
                ),
            )
            AsyncHTTPClient.configure(
                None, defaults=dict(user_agent=self.request.headers.get("user-agent"))
            )

        self.finish(json.dumps(resp))
