import datetime
import json
from types import SimpleNamespace

import ai_service as ai_mod


class FakeDB:
    def __init__(self, rows):
        self._rows = rows

    def get_test_cases_for_embedding(self):
        return self._rows


def make_embedding(n):
    return [0.1] * n


def make_row(id_, createdAt, updatedAt, embedding):
    return {
        'id': id_,
        'name': 'tc',
        'description': 'd',
        'type': 'positive',
        'priority': 'medium',
        'steps': json.dumps([]),
        'expectedResult': '',
        'tags': json.dumps([]),
        'embedding': json.dumps(embedding),
        'createdAt': createdAt,
        'updatedAt': updatedAt,
        'aiGenerated': 0,
    }


def make_service_with_rows(rows, embedding_dim=3):
    svc = ai_mod.AIService.__new__(ai_mod.AIService)
    svc.model = SimpleNamespace(encode=lambda q: make_embedding(embedding_dim))
    svc.embedding_dimension = embedding_dim
    svc._db = FakeDB(rows)
    return svc


def test_semantic_search_handles_string_timestamps():
    rows = [make_row('1', '2026-02-08 10:56:56', '2026-02-08 10:56:56', make_embedding(3))]
    svc = make_service_with_rows(rows)

    res = svc.semantic_search('query', min_similarity=0.0, limit=10)
    assert isinstance(res, list)
    assert res and isinstance(res[0]['testCase']['createdAt'], str)
    assert res[0]['testCase']['createdAt'] == '2026-02-08 10:56:56'


def test_semantic_search_handles_datetime_objects():
    dt = datetime.datetime(2026, 2, 8, 10, 56, 56)
    rows = [make_row('2', dt, dt, make_embedding(3))]
    svc = make_service_with_rows(rows)

    res = svc.semantic_search('query', min_similarity=0.0, limit=10)
    assert isinstance(res, list)
    assert res and isinstance(res[0]['testCase']['createdAt'], str)
    assert res[0]['testCase']['createdAt'] == dt.isoformat()
