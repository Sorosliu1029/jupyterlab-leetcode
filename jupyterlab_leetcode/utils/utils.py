from collections.abc import Callable, Iterable
from typing import TypeVar

T = TypeVar("T")


def first(iterable: Iterable[T], unary_predicate: Callable[[T], bool]) -> T | None:
    """Return the first item in an iterable that satisfies a condition"""
    return next((i for i in iterable if unary_predicate(i)), None)
