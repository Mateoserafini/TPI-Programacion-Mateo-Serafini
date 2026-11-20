import os
import tempfile
from fastapi.testclient import TestClient
from sqlmodel import SQLModel, create_engine, Session
from app.core import database
from app.db.seed import seed
from app.main import app


def setup_test_db():
    fd, db_path = tempfile.mkstemp(suffix=".db")
    os.close(fd)
    test_engine = create_engine(
        f"sqlite:///{db_path}",
        echo=False,
        connect_args={"check_same_thread": False},
    )
    database.engine = test_engine

    def test_session_factory() -> Session:
        return Session(test_engine)

    database.session_factory = test_session_factory
    SQLModel.metadata.create_all(test_engine)
    seed()
    client = TestClient(app)
    return client, test_engine, db_path


def teardown_test_db(test_engine, db_path: str) -> None:
    test_engine.dispose()
    if os.path.exists(db_path):
        os.remove(db_path)
