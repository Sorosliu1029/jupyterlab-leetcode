import json
from typing import cast

import tornado
from tornado.gen import multi
from tornado.httpclient import AsyncHTTPClient, HTTPRequest, HTTPResponse
from tornado.httputil import HTTPHeaders

from .base_handler import BaseHandler

LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql"

type QueryType = dict[str, str | dict[str, str]]


class LeetCodeHandler(BaseHandler):
    """Base handler for LeetCode-related requests."""

    async def graphql(self, name: str, query: QueryType) -> None:
        self.log.debug(f"Fetching LeetCode {name} data...")
        client = AsyncHTTPClient()
        req = HTTPRequest(
            url=LEETCODE_GRAPHQL_URL,
            method="POST",
            headers=HTTPHeaders(self.settings.get("leetcode_headers", {})),
            body=json.dumps(query),
        )

        try:
            resp = await client.fetch(req)
        except Exception as e:
            self.log.error(f"Error fetching LeetCode {name}: {e}")
            self.set_status(500)
            self.finish(json.dumps({"message": f"Failed to fetch LeetCode {name}"}))
            return
        else:
            self.finish(resp.body)

    async def graphql_multi(
        self, name: str, queries: dict[str, QueryType]
    ) -> dict[str, HTTPResponse]:
        self.log.debug(f"Fetching LeetCode {name} data...")
        client = AsyncHTTPClient()
        request_futures = dict(
            map(
                lambda kv: (
                    kv[0],
                    client.fetch(
                        HTTPRequest(
                            url=LEETCODE_GRAPHQL_URL,
                            method="POST",
                            headers=HTTPHeaders(
                                self.settings.get("leetcode_headers", {})
                            ),
                            body=json.dumps(kv[1]),
                        ),
                    ),
                ),
                queries.items(),
            )
        )

        try:
            responses = await multi(request_futures)
        except Exception as e:
            self.log.error(f"Error fetching LeetCode {name}: {e}")
            self.set_status(500)
            self.finish(json.dumps({"message": f"Failed to fetch LeetCode {name}"}))
            return {}
        else:
            return cast("dict[str, HTTPResponse]", responses)


class LeetCodeProfileHandler(LeetCodeHandler):
    route = r"leetcode/profile"

    @tornado.web.authenticated
    async def get(self):
        await self.graphql(
            name="profile",
            query={
                "query": """query globalData {
                                userStatus {
                                    isSignedIn
                                    username
                                    realName
                                    avatar
                                }
                            }"""
            },
        )


class LeetCodeStatisticsHandler(LeetCodeHandler):
    route = r"leetcode/statistics"

    @tornado.web.authenticated
    async def get(self):
        username = self.get_query_argument("username", "", strip=True)
        if not username:
            self.set_status(400)
            self.finish(json.dumps({"message": "Username parameter is required"}))
            return

        responses = await self.graphql_multi(
            name="statistics",
            queries={
                "userSessionProgress": {
                    "query": """query userSessionProgress($username: String!) {
                                          allQuestionsCount {
                                            difficulty
                                            count
                                          }
                                          matchedUser(username: $username) {
                                            submitStats {
                                              acSubmissionNum {
                                                difficulty
                                                count
                                              }
                                              totalSubmissionNum {
                                                difficulty
                                                count
                                              }
                                            }
                                          }
                                        }""",
                    "variables": {"username": username},
                },
                "userProfileUserQuestionProgressV2": {
                    "query": """query userProfileUserQuestionProgressV2($userSlug: String!) {
                                          userProfileUserQuestionProgressV2(userSlug: $userSlug) {
                                            numAcceptedQuestions {
                                              count
                                              difficulty
                                            }
                                            numFailedQuestions {
                                              count
                                              difficulty
                                            }
                                            numUntouchedQuestions {
                                              count
                                              difficulty
                                            }
                                            userSessionBeatsPercentage {
                                              difficulty
                                              percentage
                                            }
                                            totalQuestionBeatsPercentage
                                          }
                                        }""",
                    "variables": {"userSlug": username},
                },
                "userPublicProfile": {
                    "query": """query userPublicProfile($username: String!) {
                                          matchedUser(username: $username) {
                                            username
                                            profile {
                                              ranking
                                            }
                                          }
                                        }""",
                    "variables": {"username": username},
                },
            },
        )

        if not responses:
            return

        res = dict(
            map(
                lambda kv: (kv[0], json.loads(kv[1].body).get("data", {})),
                responses.items(),
            )
        )
        self.finish(res)
