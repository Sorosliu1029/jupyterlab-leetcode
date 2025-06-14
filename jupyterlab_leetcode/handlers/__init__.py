from jupyter_server.utils import url_path_join

from .base_handler import BaseHandler
from .cookie_handler import GetCookieHandler
from .leetcode_handler import (CreateNotebookHandler, LeetCodeCompanyHandlar,
                               LeetCodeProfileHandler, LeetCodeQuestionHandler,
                               LeetCodeStatisticsHandler,
                               LeetCodeSubmissionCalendarHandlar,
                               LeetCodeTopicHandlar,
                               LeetCodeWebSocketSubmitHandler,
                               SubmitNotebookHandler)


def setup_handlers(web_app):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]
    handlers: list[type[BaseHandler]] = [
        GetCookieHandler,
        LeetCodeProfileHandler,
        LeetCodeStatisticsHandler,
        LeetCodeQuestionHandler,
        CreateNotebookHandler,
        SubmitNotebookHandler,
        LeetCodeWebSocketSubmitHandler,
        LeetCodeSubmissionCalendarHandlar,
        LeetCodeTopicHandlar,
        LeetCodeCompanyHandlar,
    ]

    web_app.add_handlers(
        host_pattern,
        list(
            map(
                lambda h: (url_path_join(base_url, "jupyterlab-leetcode", h.route), h),
                handlers,
            )
        ),
    )
