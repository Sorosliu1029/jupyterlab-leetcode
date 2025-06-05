import json

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
    route = r"cookies/[a-zA-Z0-9_-]+"

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

        self.finish(
            json.dumps(
                dict(
                    map(
                        lambda c: (
                            c.name,
                            {"name": c.name, "domain": c.domain, "value": c.value},
                        ),
                        cj,
                    )
                )
            )
        )
