import json

import tornado
from tornado.httpclient import AsyncHTTPClient, HTTPRequest
from tornado.httputil import HTTPHeaders

from .base_handler import BaseHandler

LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"


class LeetCodeProfileHandler(BaseHandler):
    route = r"leetcode/profile"

    @tornado.web.authenticated
    async def get(self):
        client = AsyncHTTPClient()
        headers = HTTPHeaders(self.settings.get("leetcode_headers", {}))
        req = HTTPRequest(
            url=LEETCODE_GRAPHQL_URL,
            method="POST",
            headers=headers,
            body=json.dumps(
                {
                    "operationName": "globalData",
                    "variables": {},
                    "query": "query globalData { userStatus { isSignedIn username realName avatar } }",
                }
            ),
        )

        try:
            resp = await client.fetch(req)
        except Exception as e:
            self.log.error(f"Error fetching LeetCode profile: {e}")
            self.set_status(500)
            self.finish(json.dumps({"message": "Failed to fetch LeetCode profile"}))
            return
        else:
            self.finish(resp.body)
