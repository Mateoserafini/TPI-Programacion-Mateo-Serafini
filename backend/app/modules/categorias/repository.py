from typing import List, Optional
from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.categorias.models import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_by_nombre(self, nombre: str) -> Optional[Categoria]:
        statement = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(statement).first()

    def list_activas(self) -> List[Categoria]:
        statement = select(Categoria).where(Categoria.activo == True).order_by(Categoria.id)
        return list(self.session.exec(statement).all())

    def get_activa_by_id(self, categoria_id: int) -> Optional[Categoria]:
        statement = select(Categoria).where(
            Categoria.id == categoria_id,
            Categoria.activo == True,
        )
        return self.session.exec(statement).first()
