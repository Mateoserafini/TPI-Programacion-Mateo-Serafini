from typing import List, Optional, Tuple
from sqlalchemy import func
from sqlmodel import Session, select
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def get_activo_by_id(self, producto_id: int) -> Optional[Producto]:
        statement = select(Producto).where(
            Producto.id == producto_id,
            Producto.activo == True,
        )
        return self.session.exec(statement).first()

    def search(
        self,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
        skip: int = 0,
        limit: int = 20,
    ) -> Tuple[int, List[Producto]]:
        base_stmt = select(Producto).where(Producto.activo == True)
        count_stmt = select(func.count(Producto.id)).where(Producto.activo == True)

        if search:
            pattern = f"%{search}%"
            base_stmt = base_stmt.where(Producto.nombre.ilike(pattern))
            count_stmt = count_stmt.where(Producto.nombre.ilike(pattern))
        if categoria_id is not None:
            base_stmt = base_stmt.where(Producto.categoria_id == categoria_id)
            count_stmt = count_stmt.where(Producto.categoria_id == categoria_id)
        if disponible is not None:
            base_stmt = base_stmt.where(Producto.disponible == disponible)
            count_stmt = count_stmt.where(Producto.disponible == disponible)

        total = self.session.exec(count_stmt).one()
        items = list(self.session.exec(base_stmt.order_by(Producto.id).offset(skip).limit(limit)).all())
        return int(total), items
