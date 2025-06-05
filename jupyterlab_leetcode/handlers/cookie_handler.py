import json
import time
from http.cookiejar import Cookie
from typing import cast

import browser_cookie3
import tornado

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
        self.log.info("Loading all cookies for LeetCode...")
        browser = self.get_query_argument("browser", "", strip=True)
        if not browser:
            self.set_status(400)
            self.finish(json.dumps({"message": "Browser parameter is required"}))
            return

        if browser not in BROWSER_COOKIE_METHOD_MAP:
            self.set_status(400)
            self.finish(json.dumps({"message": f"Unsupported browser: {browser}"}))
            return

        cj = BROWSER_COOKIE_METHOD_MAP[browser](domain_name="leetcode.com")
        cookie_session = next((c for c in cj if c.name == "LEETCODE_SESSION"), None)
        cookie_csrf = next((c for c in cj if c.name == "csrftoken"), None)
        exist = bool(cookie_session and cookie_csrf)
        expired = exist and (
            cast(Cookie, cookie_session).is_expired()
            or cast(Cookie, cookie_csrf).is_expired()
        )

        resp = {"exist": exist, "expired": expired}

        if exist and not expired:
            cookie_session_expires = cast(Cookie, cookie_session).expires
            max_age = (
                cookie_session_expires - int(time.time())
                if cookie_session_expires is not None
                else 3600 * 24 * 14
            )
            self.add_header(
                "Set-Cookie",
                f"leetcode_browser={browser}; Path=/; Max-Age={max_age}",
            )

        self.finish(json.dumps(resp))
