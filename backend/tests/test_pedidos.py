import unittest
from tests.conftest_db import setup_test_db, teardown_test_db


class TestPedidosYReglasNegocio(unittest.TestCase):
    def setUp(self):
        self.client, self.engine, self.db_path = setup_test_db()
        self.client.post(
            "/api/v1/auth/register",
            json={
                "username": "comprador1",
                "full_name": "Comprador Uno",
                "email": "comprador1@example.com",
                "password": "Password123!",
            },
        )
        self.client.post(
            "/api/v1/auth/register",
            json={
                "username": "comprador2",
                "full_name": "Comprador Dos",
                "email": "comprador2@example.com",
                "password": "Password123!",
            },
        )

    def tearDown(self):
        teardown_test_db(self.engine, self.db_path)

    def test_rollback_transaccional_stock_y_productos_repetidos(self):
        prods = self.client.get("/api/v1/productos").json()["items"]
        p1, p2 = prods[0], prods[1]

        self.client.post(
            "/api/v1/auth/token",
            data={"username": "comprador1", "password": "Password123!"},
        )

        repetido = self.client.post(
            "/api/v1/pedidos",
            json={
                "items": [
                    {"producto_id": p1["id"], "cantidad": 1},
                    {"producto_id": p1["id"], "cantidad": 1},
                ],
                "forma_pago": "EFECTIVO",
                "direccion_entrega": "Av. Colón 1234",
                "notas": "",
            },
        )
        self.assertEqual(repetido.status_code, 400)

        falla_segundo = self.client.post(
            "/api/v1/pedidos",
            json={
                "items": [
                    {"producto_id": p1["id"], "cantidad": 2},
                    {"producto_id": p2["id"], "cantidad": p2["stock"] + 50},
                ],
                "forma_pago": "EFECTIVO",
                "direccion_entrega": "Av. Colón 1234",
                "notas": "",
            },
        )
        self.assertEqual(falla_segundo.status_code, 400)

        p1_after = self.client.get(f"/api/v1/productos/{p1['id']}").json()
        self.assertEqual(p1_after["stock"], p1["stock"])

    def test_inmutabilidad_precios_permisos_y_maquina_estados(self):
        p1 = self.client.get("/api/v1/productos").json()["items"][0]

        self.client.post(
            "/api/v1/auth/token",
            data={"username": "comprador1", "password": "Password123!"},
        )
        creado = self.client.post(
            "/api/v1/pedidos",
            json={
                "items": [{"producto_id": p1["id"], "cantidad": 2}],
                "forma_pago": "TRANSFERENCIA",
                "direccion_entrega": "Bv. San Juan 500",
                "notas": "Tocar timbre",
            },
        )
        self.assertEqual(creado.status_code, 201)
        pedido = creado.json()
        self.assertEqual(pedido["total"], p1["precio_base"] * 2)

        self.client.post(
            "/api/v1/auth/token",
            data={"username": "comprador2", "password": "Password123!"},
        )
        self.assertEqual(self.client.get(f"/api/v1/pedidos/{pedido['id']}").status_code, 403)
        self.assertEqual(
            self.client.patch(f"/api/v1/pedidos/{pedido['id']}/cancelar").status_code,
            403,
        )

        self.client.post(
            "/api/v1/auth/token",
            data={"username": "admin", "password": "Admin1234!"},
        )
        self.client.put(
            f"/api/v1/productos/{p1['id']}",
            json={"precio_base": p1["precio_base"] + 5000},
        )

        pedido_revisado = self.client.get(f"/api/v1/pedidos/{pedido['id']}").json()
        self.assertEqual(pedido_revisado["items"][0]["precio_unitario"], p1["precio_base"])
        self.assertEqual(pedido_revisado["total"], pedido["total"])

        invalido = self.client.patch(
            f"/api/v1/pedidos/{pedido['id']}/estado",
            json={"estado": "ENTREGADO"},
        )
        self.assertEqual(invalido.status_code, 400)

        prep = self.client.patch(
            f"/api/v1/pedidos/{pedido['id']}/estado",
            json={"estado": "EN_PREPARACION"},
        )
        self.assertEqual(prep.status_code, 200)

        self.client.post(
            "/api/v1/auth/token",
            data={"username": "comprador1", "password": "Password123!"},
        )
        cancel_tarde = self.client.patch(f"/api/v1/pedidos/{pedido['id']}/cancelar")
        self.assertEqual(cancel_tarde.status_code, 400)

        self.client.post(
            "/api/v1/auth/token",
            data={"username": "admin", "password": "Admin1234!"},
        )
        ent = self.client.patch(
            f"/api/v1/pedidos/{pedido['id']}/estado",
            json={"estado": "ENTREGADO"},
        )
        self.assertEqual(ent.status_code, 200)

        resumen = self.client.get("/api/v1/pedidos/resumen").json()
        self.assertEqual(resumen["entregados"], 1)
        self.assertEqual(resumen["ingresos_entregados"], pedido["total"])


if __name__ == "__main__":
    unittest.main()
