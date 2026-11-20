from typing import Optional
from sqlmodel import Session
from app.core.unit_of_work import UnitOfWork
from app.modules.categorias.repository import CategoriaRepository


class CategoriaUnitOfWork(UnitOfWork):
    def __init__(self, session: Optional[Session] = None):
        super().__init__(session)
        self.categorias: CategoriaRepository

    def __enter__(self) -> "CategoriaUnitOfWork":
        super().__enter__()
        assert self.session is not None
        self.categorias = CategoriaRepository(self.session)
        return self
