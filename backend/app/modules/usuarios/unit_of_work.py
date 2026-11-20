from typing import Optional
from sqlmodel import Session
from app.core.unit_of_work import UnitOfWork
from app.modules.usuarios.repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    def __init__(self, session: Optional[Session] = None):
        super().__init__(session)
        self.usuarios: UsuarioRepository

    def __enter__(self) -> "UsuarioUnitOfWork":
        super().__enter__()
        assert self.session is not None
        self.usuarios = UsuarioRepository(self.session)
        return self
