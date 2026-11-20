from typing import List
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def list_activas(self) -> List[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.list_activas()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def get_by_id(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            return CategoriaRead.model_validate(categoria)

    def create(self, data: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(data.nombre) is not None:
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            categoria = Categoria(
                nombre=data.nombre,
                descripcion=data.descripcion,
                activo=True,
            )
            created = uow.categorias.add(categoria)
            return CategoriaRead.model_validate(created)

    def update(self, categoria_id: int, data: CategoriaUpdate) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            if data.nombre is not None and data.nombre != categoria.nombre:
                if uow.categorias.get_by_nombre(data.nombre) is not None:
                    raise NombreDuplicado("Ya existe una categoría con ese nombre")
                categoria.nombre = data.nombre
            if data.descripcion is not None:
                categoria.descripcion = data.descripcion
            updated = uow.categorias.add(categoria)
            return CategoriaRead.model_validate(updated)

    def delete(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_activa_by_id(categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada("Categoría no encontrada")
            categoria.activo = False
            uow.categorias.add(categoria)
