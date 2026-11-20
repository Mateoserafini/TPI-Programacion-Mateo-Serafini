from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.categorias.models import Categoria
    from app.modules.pedidos.models import DetallePedido


class Producto(SQLModel, table=True):
    __tablename__ = "producto"

    id: Optional[int] = Field(default=None, primary_key=True)
    categoria_id: int = Field(foreign_key="categoria.id", nullable=False)
    nombre: str = Field(index=True, nullable=False, max_length=150)
    descripcion: str = Field(default="", max_length=1000)
    precio_base: float = Field(ge=0.0, nullable=False)
    imagen_url: str = Field(default="", max_length=500)
    stock: int = Field(default=0, ge=0, nullable=False)
    disponible: bool = Field(default=True, nullable=False)
    activo: bool = Field(default=True, nullable=False)

    categoria: Optional["Categoria"] = Relationship(back_populates="productos")
    detalles: List["DetallePedido"] = Relationship(back_populates="producto")
