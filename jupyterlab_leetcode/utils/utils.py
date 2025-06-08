import json
from collections.abc import Callable, Iterable, Mapping
from typing import Any, TypeVar

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
