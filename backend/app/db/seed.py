from sqlmodel import select
from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto
from app.modules.usuarios.models import Usuario


def seed() -> None:
    create_all_tables()
    with session_factory() as session:
        admin = session.exec(select(Usuario).where(Usuario.username == "admin")).first()
        if admin is None:
            admin = Usuario(
                username="admin",
                full_name="Administrador Food Store",
                email="admin@foodstore.com",
                hashed_password=hash_password("Admin1234!"),
                role="admin",
                disabled=False,
            )
            session.add(admin)

        categorias_data = [
            ("Hamburguesas", "Hamburguesas artesanales con carne vacuna seleccionada y pan brioche."),
            ("Papas y Acompañamientos", "Papas rústicas, bastones de mozzarella y aros de cebolla."),
            ("Bebidas", "Gaseosas, aguas saborizadas y jugos naturales bien fríos."),
            ("Postres", "Postres artesanales y helados para cerrar tu comida."),
        ]

        categorias_map = {}
        for nombre, descripcion in categorias_data:
            cat = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if cat is None:
                cat = Categoria(nombre=nombre, descripcion=descripcion, activo=True)
                session.add(cat)
                session.flush()
            categorias_map[nombre] = cat

        productos_data = [
            (
                "Hamburguesas",
                "Hamburguesa Clásica Doble Cheddar",
                "Doble medallón de carne vacuna de 120g, doble queso cheddar y salsa especial.",
                8500.0,
                "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
                25,
            ),
            (
                "Hamburguesas",
                "Hamburguesa Crispy Bacon BBQ",
                "Medallón de 150g, panceta ahumada crocante, cebolla caramelizada y barbacoa.",
                9400.0,
                "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=600&auto=format&fit=crop&q=80",
                18,
            ),
            (
                "Hamburguesas",
                "Hamburguesa Veggie NotBurger",
                "Medallón vegetal a la plancha, palta, tomate, rúcula y alioli suave.",
                8200.0,
                "https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&auto=format&fit=crop&q=80",
                15,
            ),
            (
                "Papas y Acompañamientos",
                "Papas Fritas con Cheddar y Bacon",
                "Porción abundante de papas crocantes bañadas en cheddar fundido y panceta.",
                4800.0,
                "https://images.unsplash.com/photo-1585109649139-366815a0d713?w=600&auto=format&fit=crop&q=80",
                30,
            ),
            (
                "Papas y Acompañamientos",
                "Aros de Cebolla Crocantes",
                "10 unidades de aros de cebolla rebozados acompañados de salsa ranch.",
                4200.0,
                "https://images.unsplash.com/photo-1639024471283-03518883512d?w=600&auto=format&fit=crop&q=80",
                20,
            ),
            (
                "Bebidas",
                "Gaseosa Cola 500ml",
                "Botella de 500ml servida bien fría.",
                2200.0,
                "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=600&auto=format&fit=crop&q=80",
                50,
            ),
            (
                "Bebidas",
                "Limonada Casera con Menta y Jengibre",
                "Vaso de 500ml de limonada natural recién exprimida.",
                2800.0,
                "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80",
                35,
            ),
            (
                "Postres",
                "Brownie Tibio con Helado",
                "Brownie artesanal de chocolate amargo y nueces con bocha de crema americana.",
                3900.0,
                "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80",
                16,
            ),
            (
                "Postres",
                "Cheesecake de Frutos Rojos",
                "Porción individual de cheesecake estilo New York con coulis de frutos rojos.",
                4500.0,
                "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80",
                12,
            ),
        ]

        for cat_nombre, nombre, descripcion, precio_base, imagen_url, stock in productos_data:
            existing = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
            if existing is None:
                categoria = categorias_map[cat_nombre]
                assert categoria.id is not None
                session.add(
                    Producto(
                        categoria_id=categoria.id,
                        nombre=nombre,
                        descripcion=descripcion,
                        precio_base=precio_base,
                        imagen_url=imagen_url,
                        stock=stock,
                        disponible=True,
                        activo=True,
                    )
                )

        session.commit()


if __name__ == "__main__":
    seed()
    print("Seed ejecutado correctamente.")
