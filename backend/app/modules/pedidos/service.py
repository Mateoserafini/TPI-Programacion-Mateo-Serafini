from datetime import datetime, timezone
from typing import Dict, Optional, Set
from app.modules.pedidos.models import DetallePedido, Pedido
from app.modules.pedidos.schemas import (
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class TransicionInvalida(Exception):
    pass


TRANSICIONES_VALIDAS: Dict[str, Set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def crear_pedido(self, usuario_id: int, data: PedidoCreate) -> PedidoRead:
        with self.uow as uow:
            productos_vistos: Set[int] = set()
            for item in data.items:
                if item.producto_id in productos_vistos:
                    raise ProductoRepetido("No se permiten productos repetidos en el pedido")
                productos_vistos.add(item.producto_id)

            pedido = Pedido(
                usuario_id=usuario_id,
                estado="PENDIENTE",
                forma_pago=data.forma_pago,
                direccion_entrega=data.direccion_entrega,
                notas=data.notas,
                total=0.0,
            )
            pedido = uow.pedidos.add(pedido)
            assert pedido.id is not None

            total = 0.0
            for item in data.items:
                producto = uow.productos.get_activo_by_id(item.producto_id)
                if producto is None:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"El producto '{producto.nombre}' no está disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(
                        f"Stock insuficiente para '{producto.nombre}': disponible {producto.stock}, solicitado {item.cantidad}"
                    )

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = round(producto.precio_base * item.cantidad, 2)
                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=item.producto_id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )
                uow.pedidos.add_detalle(detalle)
                total += subtotal

            pedido.total = round(total, 2)
            pedido = uow.pedidos.add(pedido)
            return PedidoRead.model_validate(pedido)

    def listar_pedidos(
        self,
        usuario_id: int,
        role: str,
        skip: int = 0,
        limit: int = 20,
        estado: Optional[str] = None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            filtro_usuario = None if role == "admin" else usuario_id
            total, items = uow.pedidos.list_by_usuario(
                usuario_id=filtro_usuario,
                estado=estado,
                skip=skip,
                limit=limit,
            )
            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(item) for item in items],
            )

    def obtener_resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            counts = uow.pedidos.count_by_estado()
            pedidos_hoy = uow.pedidos.count_pedidos_hoy()
            ingresos_entregados = uow.pedidos.sum_ingresos_entregados()
            return ResumenPedidos(
                pendientes=counts.get("PENDIENTE", 0),
                en_preparacion=counts.get("EN_PREPARACION", 0),
                entregados=counts.get("ENTREGADO", 0),
                cancelados=counts.get("CANCELADO", 0),
                pedidos_hoy=pedidos_hoy,
                ingresos_entregados=round(ingresos_entregados, 2),
            )

    def obtener_pedido(self, pedido_id: int, usuario_id: int, role: str) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")
            if role != "admin" and pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tiene permiso para ver este pedido")
            return PedidoRead.model_validate(pedido)

    def _restituir_stock(self, uow: PedidoUnitOfWork, pedido: Pedido) -> None:
        for item in pedido.items:
            producto = uow.productos.get_by_id(item.producto_id)
            if producto is not None:
                producto.stock += item.cantidad
                uow.productos.add(producto)

    def cambiar_estado(self, pedido_id: int, nuevo_estado: str) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")
            permitidos = TRANSICIONES_VALIDAS.get(pedido.estado, set())
            if nuevo_estado not in permitidos:
                raise TransicionInvalida(
                    f"No se puede pasar el pedido de {pedido.estado} a {nuevo_estado}"
                )
            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(timezone.utc)
            if nuevo_estado == "CANCELADO":
                self._restituir_stock(uow, pedido)
            updated = uow.pedidos.add(pedido)
            return PedidoRead.model_validate(updated)

    def cancelar_pedido(self, pedido_id: int, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")
            if pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tiene permiso para cancelar este pedido")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se pueden cancelar pedidos en estado PENDIENTE")
            pedido.estado = "CANCELADO"
            pedido.updated_at = datetime.now(timezone.utc)
            self._restituir_stock(uow, pedido)
            updated = uow.pedidos.add(pedido)
            return PedidoRead.model_validate(updated)
