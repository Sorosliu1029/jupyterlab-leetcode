import json

import tornado

from ..utils.utils import get_leetcode_cookie
from .base_handler import BaseHandler


class GetCookieHandler(BaseHandler):
    route = r"cookies"

    @tornado.web.authenticated
    def get(self):
        self.log.debug("Loading all cookies for LeetCode...")
        browser = self.get_query_argument("browser", "", strip=True)
        try:
            cookie = get_leetcode_cookie(
                browser, self.settings, self.request.headers.get("User-Agent", "")
            )
            if not cookie["expired"] and cookie["expires"]:
                self.set_cookie("leetcode_browser", browser, expires=cookie["expires"])
            self.finish(json.dumps(cookie))
        except Exception as e:
            self.set_status(400)
            self.finish(json.dumps({"message": str(e)}))
