import json
import os
from typing import Any, Mapping, cast, overload

import tornado
from tornado.gen import multi
from tornado.httpclient import AsyncHTTPClient, HTTPRequest, HTTPResponse
from tornado.httputil import HTTPHeaders

from ..utils.notebook_generator import NotebookGenerator
from ..utils.utils import first
from .base_handler import BaseHandler

LEETCODE_URL = "https://leetcode.com"
LEETCODE_GRAPHQL_URL = f"{LEETCODE_URL}/graphql"

type QueryType = dict[str, str | Mapping[str, Any]]


class LeetCodeHandler(BaseHandler):
    """Base handler for LeetCode-related requests."""

    @overload
    async def graphql(self, name: str, query: QueryType) -> None: ...

    @overload
    async def graphql(
        self, name: str, query: QueryType, returnJson=True
    ) -> dict[str, Any]: ...

    async def graphql(self, name: str, query: QueryType, returnJson=False):
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
            if returnJson:
                return json.loads(resp.body)
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

    async def request_api(self, url: str, method: str, body: Mapping[str, Any]):
        self.log.debug(f"Requesting LeetCode API: {url} with method {method}")
        client = AsyncHTTPClient()
        req = HTTPRequest(
            url=f"{LEETCODE_URL}{url}",
            method=method,
            headers=HTTPHeaders(self.settings.get("leetcode_headers", {})),
            body=json.dumps(body),
        )
        try:
            resp = await client.fetch(req)
        except Exception as e:
            self.log.error(f"Error requesting LeetCode API: {e}")
            self.set_status(500)
            self.finish(json.dumps({"message": "Failed to request LeetCode API"}))
            return None
        else:
            return json.loads(resp.body) if resp.body else {}

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
        keyword = cast(str, body.get("keyword", ""))
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
                    "searchKeyword": keyword,
                    "categorySlug": "algorithms",
                    "filters": {
                        "filterCombineType": "ALL",
                        "statusFilter": {
                            "questionStatuses": ["TO_DO"],
                            "operator": "IS",
                        },
                        "difficultyFilter": {
                            "difficulties": ["MEDIUM", "HARD"],
                            "operator": "IS",
                        },
                        "languageFilter": {"languageSlugs": [], "operator": "IS"},
                        "topicFilter": {"topicSlugs": [], "operator": "IS"},
                        "acceptanceFilter": {},
                        "frequencyFilter": {},
                        "frontendIdFilter": {},
                        "lastSubmittedFilter": {},
                        "publishedFilter": {},
                        "companyFilter": {"companySlugs": [], "operator": "IS"},
                        "positionFilter": {"positionSlugs": [], "operator": "IS"},
                        "premiumFilter": {"premiumStatus": [], "operator": "IS"},
                    },
                    "sortBy": {"sortField": sortField, "sortOrder": sortOrder},
                },
            },
        )


class CreateNotebookHandler(LeetCodeHandler):
    route = r"notebook/create"

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
        self.finish({"filePath": file_path})


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

        resp = await self.request_api(
            submit_url,
            "POST",
            {
                "question_id": str(question_submit_id),
                "data_input": sample_testcase,
                "lang": "python3",
                "typed_code": solution_code,
                "test_mode": False,
                "judge_type": "large",
            },
        )

        self.finish(resp)

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
