import asyncio
import json
import os
from collections.abc import Mapping
from typing import Any, cast, overload

import tornado
from tornado.gen import multi
from tornado.httpclient import HTTPResponse
from tornado.httputil import HTTPServerRequest
from tornado.websocket import WebSocketHandler

from ..utils.notebook_generator import NotebookGenerator
from ..utils.utils import first, get_leetcode_cookie, request
from .base_handler import BaseHandler

LEETCODE_URL = "https://leetcode.com"
LEETCODE_GRAPHQL_URL = f"{LEETCODE_URL}/graphql"
MAX_CHECK_ATTEMPTS = 10


class LeetCodeHandler(BaseHandler):
    """Base handler for LeetCode-related requests."""

    async def prepare(self) -> None:
        """Prepare the handler by checking for LeetCode cookies."""
        await super().prepare()
        if not self.settings.get("leetcode_headers"):
            browser = self.get_cookie("leetcode_browser")
            if not browser:
                self.set_status(400)
                self.finish(
                    json.dumps({"message": "LeetCode browser cookie is required"})
                )
                return

            get_leetcode_cookie(
                browser, self.settings, self.request.headers.get("User-Agent", "")
            )

    @overload
    async def graphql(self, name: str, query: Mapping[str, Any]) -> None: ...

    @overload
    async def graphql(
        self, name: str, query: Mapping[str, Any], returnJson=True
    ) -> dict[str, Any]: ...

    async def graphql(self, name: str, query: Mapping[str, Any], returnJson=False):
        self.log.debug(f"Fetching LeetCode {name} data...")
        try:
            resp = await request(
                LEETCODE_GRAPHQL_URL,
                method="POST",
                headers=self.settings.get("leetcode_headers", {}),
                body=query,
            )
        except Exception as e:
            self.log.error(f"Error fetching LeetCode {name}: {e}")
            self.set_status(500)
            self.finish(json.dumps({"message": f"Failed to fetch LeetCode {name}"}))
            return
        else:
            if returnJson:
                return json.loads(resp.body)
            self.finish(resp.body)

    async def graphql_multi(
        self, name: str, queries: dict[str, Mapping[str, Any]]
    ) -> dict[str, HTTPResponse]:
        self.log.debug(f"Fetching LeetCode {name} data...")
        request_futures = dict(
            map(
                lambda kv: (
                    kv[0],
                    request(
                        url=LEETCODE_GRAPHQL_URL,
                        method="POST",
                        headers=self.settings.get("leetcode_headers", {}),
                        body=kv[1],
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
                                    isPremium
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


class LeetCodeSubmissionCalendarHandlar(LeetCodeHandler):
    route = r"leetcode/submission"

    @tornado.web.authenticated
    async def get(self):
        username = self.get_query_argument("username", "", strip=True)
        if not username:
            self.set_status(400)
            self.finish(json.dumps({"message": "Username parameter is required"}))
            return
        await self.graphql(
            name="submission_calendar",
            query={
                "query": """query userProfileCalendar($username: String!, $year: Int) {
                                        matchedUser(username: $username) {
                                            userCalendar(year: $year) {
                                                activeYears
                                                streak
                                                totalActiveDays
                                                dccBadges {
                                                    timestamp
                                                    badge {
                                                        name
                                                        icon
                                                    }
                                                }
                                                submissionCalendar
                                            }
                                        }
                                    }""",
                "variables": {"username": username},
            },
        )


class LeetCodeTopicHandlar(LeetCodeHandler):
    route = r"leetcode/topics"

    @tornado.web.authenticated
    async def get(self):
        await self.graphql(
            name="topic_tags",
            query={
                "query": """query questionTopicTags {
                                    questionTopicTags {
                                        edges {
                                            node {
                                                id
                                                name
                                                slug
                                                translatedName
                                                questionIds
                                            }
                                        }
                                    }
                                  }""",
            },
        )


class LeetCodeCompanyHandlar(LeetCodeHandler):
    route = r"leetcode/companies"

    @tornado.web.authenticated
    async def get(self):
        await self.graphql(
            name="question_tags",
            query={
                "query": """query CompanyTags {
                                    companyTags {
                                        name
                                        slug
                                    }
                                }""",
            },
        )


class LeetCodeQuestionHandler(LeetCodeHandler):
    route = r"leetcode/questions"

    @tornado.web.authenticated
    async def post(self):
        body = self.get_json_body()
        if not body:
            self.set_status(400)
            self.finish(json.dumps({"message": "Request body is required"}))
            return

        body = cast("dict[str, str|int]", body)
        skip = cast(int, body.get("skip", 0))
        limit = cast(int, body.get("limit", 0))
        query = cast("dict[str, Any]", body.get("query", ""))
        sortField = cast(str, body.get("sortField", "CUSTOM"))
        sortOrder = cast(str, body.get("sortOrder", "ASCENDING"))

        await self.graphql(
            name="question_list",
            query={
                "query": """query problemsetQuestionListV2($filters: QuestionFilterInput,
                                                                $limit: Int,
                                                                $searchKeyword: String,
                                                                $skip: Int,
                                                                $sortBy: QuestionSortByInput,
                                                                $categorySlug: String) {
                                              problemsetQuestionListV2(
                                                filters: $filters
                                                limit: $limit
                                                searchKeyword: $searchKeyword
                                                skip: $skip
                                                sortBy: $sortBy
                                                categorySlug: $categorySlug
                                              ) {
                                                questions {
                                                  id
                                                  titleSlug
                                                  title
                                                  translatedTitle
                                                  questionFrontendId
                                                  paidOnly
                                                  difficulty
                                                  topicTags {
                                                    name
                                                    slug
                                                    nameTranslated
                                                  }
                                                  status
                                                  isInMyFavorites
                                                  frequency
                                                  acRate
                                                }
                                                totalLength
                                                finishedLength
                                                hasMore
                                              }
                                            }""",
                "variables": {
                    "skip": skip,
                    "limit": limit,
                    "searchKeyword": query["keyword"],
                    "categorySlug": "algorithms",
                    "filters": {
                        "filterCombineType": "ALL",
                        "statusFilter": {
                            "questionStatuses": query["statuses"],
                            "operator": "IS",
                        },
                        "difficultyFilter": {
                            "difficulties": query["difficulties"],
                            "operator": "IS",
                        },
                        "languageFilter": {"languageSlugs": [], "operator": "IS"},
                        "topicFilter": {
                            "topicSlugs": query["topics"],
                            "operator": "IS",
                        },
                        "acceptanceFilter": {},
                        "frequencyFilter": {},
                        "frontendIdFilter": {},
                        "lastSubmittedFilter": {},
                        "publishedFilter": {},
                        "companyFilter": {
                            "companySlugs": query["companies"],
                            "operator": "IS",
                        },
                        "positionFilter": {"positionSlugs": [], "operator": "IS"},
                        "premiumFilter": {"premiumStatus": [], "operator": "IS"},
                    },
                    "sortBy": {"sortField": sortField, "sortOrder": sortOrder},
                },
            },
        )


class CreateNotebookHandler(LeetCodeHandler):
    route = r"notebook/create"

    async def get_question_detail(self, title_slug: str) -> dict[str, Any]:
        resp = await self.graphql(
            name="question_detail",
            query={
                "query": """query questionData($titleSlug: String!) {
                                        question(titleSlug: $titleSlug) {
                                            questionId
                                            questionFrontendId
                                            submitUrl
                                            questionDetailUrl
                                            title
                                            titleSlug
                                            content
                                            isPaidOnly
                                            difficulty
                                            likes
                                            dislikes
                                            isLiked
                                            similarQuestions
                                            exampleTestcaseList
                                            topicTags {
                                                name
                                                slug
                                                translatedName
                                            }
                                            codeSnippets {
                                                lang
                                                langSlug
                                                code
                                            }
                                            stats
                                            hints
                                            solution {
                                                id
                                                canSeeDetail
                                                paidOnly
                                                hasVideoSolution
                                                paidOnlyVideo
                                            }
                                            status
                                            sampleTestCase
                                        }
                                    }""",
                "variables": {"titleSlug": title_slug},
            },
            returnJson=True,
        )
        return resp

    @tornado.web.authenticated
    async def post(self):
        body = self.get_json_body()
        if not body:
            self.set_status(400)
            self.finish({"message": "Request body is required"})
            return

        body = cast("dict[str, str]", body)
        title_slug = cast(str, body.get("titleSlug", ""))
        if not title_slug:
            self.set_status(400)
            self.finish({"message": "titleSlug is required"})
            return

        question = await self.get_question_detail(title_slug)
        question = question.get("data", {}).get("question")
        if not question:
            self.set_status(404)
            self.finish({"message": "Question not found"})
            return

        notebook_generator = self.settings.get("notebook_generator")
        if not notebook_generator:
            notebook_generator = NotebookGenerator()
            self.settings.update(notebook_generator=notebook_generator)

        file_path = notebook_generator.generate(question)
        self.finish({"filePath": file_path, "question": question})


class SubmitNotebookHandler(LeetCodeHandler):
    route = r"notebook/submit"

    def get_solution(self, notebook):
        solution_cell = first(
            notebook["cells"],
            lambda c: c["cell_type"] == "code" and c["metadata"].get("isSolutionCode"),
        )
        if not solution_cell:
            return

        code = "".join(solution_cell["source"]).strip()
        return code if not code.endswith("pass") else None

    async def submit(self, file_path: str):
        if not os.path.exists(file_path):
            self.set_status(404)
            self.finish({"message": "Notebook file not found"})
            return

        with open(file_path, "r", encoding="utf-8") as f:
            notebook = json.load(f)

        question_info = notebook["metadata"]["leetcode_question_info"]
        if not question_info:
            self.set_status(400)
            self.finish({"message": "Notebook does not contain LeetCode question info"})
            return

        question_frontend_id = question_info["questionFrontendId"]
        question_submit_id = question_info["questionId"]
        submit_url = question_info["submitUrl"]
        sample_testcase = question_info["sampleTestCase"]
        if (
            not question_frontend_id
            or not question_submit_id
            or not submit_url
            or not sample_testcase
        ):
            self.set_status(400)
            self.finish({"message": "Invalid question info in notebook"})
            return

        solution_code = self.get_solution(notebook)
        if not solution_code:
            self.set_status(400)
            self.finish({"message": "No solution code found in notebook"})
            return

        resp = await request(
            f"{LEETCODE_URL}{submit_url}",
            method="POST",
            headers=self.settings.get("leetcode_headers", {}),
            body={
                "question_id": str(question_submit_id),
                "data_input": sample_testcase,
                "lang": "python3",
                "typed_code": solution_code,
                "test_mode": False,
                "judge_type": "large",
            },
        )

        self.finish(resp.body)

    @tornado.web.authenticated
    async def post(self):
        body = self.get_json_body()
        if not body:
            self.set_status(400)
            self.finish({"message": "Request body is required"})
            return

        body = cast("dict[str, str]", body)
        file_path = cast(str, body.get("filePath", ""))
        if not file_path:
            self.set_status(400)
            self.finish({"message": "filePath is required"})
            return

        await self.submit(file_path)


class LeetCodeWebSocketSubmitHandler(WebSocketHandler):
    route = r"websocket/submit"
    fibonacci = [0, 1, 1, 2, 3, 5]

    def __init__(
        self,
        application: tornado.web.Application,
        request: HTTPServerRequest,
        **kwargs: Any,
    ) -> None:
        super().__init__(application, request, **kwargs)
        self.submission_id: int = 0
        self.check_task: asyncio.Task | None = None
        self.check_result: Mapping[str, Any] = {}

    def open(self, *args: str, **kwargs: str):
        self.submission_id = int(self.get_query_argument("submission_id"))
        if self.submission_id:
            self.check_task = asyncio.create_task(self.check())

    async def check(self, cnt=0):
        if cnt > MAX_CHECK_ATTEMPTS:
            self.write_message(
                {
                    "type": "error",
                    "error": "Submission check timed out",
                    "submissionId": self.submission_id,
                }
            )
            return

        try:
            resp = await request(
                f"{LEETCODE_URL}/submissions/detail/{self.submission_id}/check/",
                method="GET",
                headers=self.settings.get("leetcode_headers", {}),
            )
        except Exception as e:
            self.write_message(
                {
                    "type": "error",
                    "error": "Submission check error",
                    "submissionId": self.submission_id,
                }
            )
            return

        self.check_result = json.loads(resp.body)
        self.write_message(
            {
                "type": "submissionResult",
                "result": self.check_result,
                "submissionId": self.submission_id,
            }
        )
        state = self.check_result.get("state")
        if state == "PENDING" or state == "STARTED":
            await asyncio.sleep(self.fibonacci[min(cnt, len(self.fibonacci) - 1)])
            await self.check(cnt + 1)

    def on_message(self, message):
        msg = json.loads(message)
        if msg.get("submissionId") != self.submission_id:
            self.write_message(
                {
                    "type": "error",
                    "error": "Submission ID mismatch",
                    "submissionId": self.submission_id,
                }
            )
            return

        self.write_message(
            {
                "type": "submissionResult",
                "result": self.check_result,
                "submissionId": self.submission_id,
            }
        )
