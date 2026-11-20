from typing import TYPE_CHECKING, List, Optional
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    __tablename__ = "categoria"

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, index=True, nullable=False, min_length=2, max_length=100)
    descripcion: str = Field(default="", max_length=500)
    activo: bool = Field(default=True, nullable=False)

    productos: List["Producto"] = Relationship(back_populates="categoria")
