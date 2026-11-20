from typing import Optional
from sqlmodel import Session
from app.core.database import session_factory


class UnitOfWork:
    def __init__(self, session: Optional[Session] = None):
        self._external_session = session
        self.session: Optional[Session] = None

    def __enter__(self) -> "UnitOfWork":
        if self._external_session is not None:
            self.session = self._external_session
        else:
            self.session = session_factory()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        if self.session is None:
            return
        try:
            if exc_type is not None:
                self.rollback()
            else:
                self.commit()
        finally:
            if self._external_session is None:
                self.session.close()

    def commit(self) -> None:
        if self.session is not None:
            self.session.commit()

    def rollback(self) -> None:
        if self.session is not None:
            self.session.rollback()
