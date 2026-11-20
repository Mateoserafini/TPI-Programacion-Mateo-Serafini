from typing import Optional
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.models import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductoStockUpdate,
    ProductoUpdate,
    ProductosPaginados,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def list_productos(
        self,
        skip: int = 0,
        limit: int = 20,
        search: Optional[str] = None,
        categoria_id: Optional[int] = None,
        disponible: Optional[bool] = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, items = uow.productos.search(
                search=search,
                categoria_id=categoria_id,
                disponible=disponible,
                skip=skip,
                limit=limit,
            )
            return ProductosPaginados(
                total=total,
                items=[ProductoRead.model_validate(item) for item in items],
            )

    def get_by_id(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado("Producto no encontrado")
            return ProductoRead.model_validate(producto)

    def create(self, data: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_activa_by_id(data.categoria_id)
            if categoria is None:
                raise CategoriaNoEncontrada("Categoría no encontrada o dada de baja")
            producto = Producto(
                categoria_id=data.categoria_id,
                nombre=data.nombre,
                descripcion=data.descripcion,
                precio_base=data.precio_base,
                imagen_url=data.imagen_url,
                stock=data.stock,
                disponible=data.disponible,
                activo=True,
            )
            created = uow.productos.add(producto)
            return ProductoRead.model_validate(created)

    def update(self, producto_id: int, data: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado("Producto no encontrado")
            if data.categoria_id is not None:
                categoria = uow.categorias.get_activa_by_id(data.categoria_id)
                if categoria is None:
                    raise CategoriaNoEncontrada("Categoría no encontrada o dada de baja")
                producto.categoria_id = data.categoria_id
            if data.nombre is not None:
                producto.nombre = data.nombre
            if data.descripcion is not None:
                producto.descripcion = data.descripcion
            if data.precio_base is not None:
                producto.precio_base = data.precio_base
            if data.imagen_url is not None:
                producto.imagen_url = data.imagen_url
            if data.stock is not None:
                producto.stock = data.stock
            if data.disponible is not None:
                producto.disponible = data.disponible
            updated = uow.productos.add(producto)
            return ProductoRead.model_validate(updated)

    def update_stock(self, producto_id: int, data: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.stock = data.stock
            producto.disponible = data.disponible
            updated = uow.productos.add(producto)
            return ProductoRead.model_validate(updated)

    def delete(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_activo_by_id(producto_id)
            if producto is None:
                raise ProductoNoEncontrado("Producto no encontrado")
            producto.activo = False
            uow.productos.add(producto)
