from typing import Generator
from sqlmodel import SQLModel, Session, create_engine
from app.core.config import settings


def _build_engine():
    url = settings.DATABASE_URL
    if url.startswith("postgresql://"):
        url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
    connect_args = {"check_same_thread": False} if url.startswith("sqlite") else {}
    return create_engine(url, echo=False, connect_args=connect_args)


engine = _build_engine()


def session_factory() -> Session:
    return Session(engine)


def create_all_tables() -> None:
    from app.modules.usuarios.models import Usuario
    from app.modules.categorias.models import Categoria
    from app.modules.productos.models import Producto
    from app.modules.pedidos.models import Pedido, DetallePedido

    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    with session_factory() as session:
        yield session
