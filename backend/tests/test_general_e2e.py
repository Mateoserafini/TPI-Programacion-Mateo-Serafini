import unittest
from tests.conftest_db import setup_test_db, teardown_test_db


class TestGeneralFlujoE2E(unittest.TestCase):
    def setUp(self):
        self.client, self.engine, self.db_path = setup_test_db()

    def tearDown(self):
        teardown_test_db(self.engine, self.db_path)

    def test_flujo_completo_cliente_y_admin(self):
        reg = self.client.post(
            "/api/v1/auth/register",
            json={
                "username": "mateo_demo",
                "full_name": "Mateo Demo",
                "email": "mateo@demo.com",
                "password": "Password123!",
            },
        )
        self.assertEqual(reg.status_code, 201)

        login = self.client.post(
            "/api/v1/auth/token",
            data={"username": "mateo_demo", "password": "Password123!"},
        )
        self.assertEqual(login.status_code, 200)

        prod = self.client.get("/api/v1/productos").json()["items"][0]
        stock_inicial = prod["stock"]

        p1 = self.client.post(
            "/api/v1/pedidos",
            json={
                "items": [{"producto_id": prod["id"], "cantidad": 3}],
                "forma_pago": "EFECTIVO",
                "direccion_entrega": "Av. General Paz 100",
                "notas": "Llamar al llegar",
            },
        )
        self.assertEqual(p1.status_code, 201)
        p1_id = p1.json()["id"]

        self.assertEqual(
            self.client.get(f"/api/v1/productos/{prod['id']}").json()["stock"],
            stock_inicial - 3,
        )

        cancelado = self.client.patch(f"/api/v1/pedidos/{p1_id}/cancelar")
        self.assertEqual(cancelado.status_code, 200)
        self.assertEqual(cancelado.json()["estado"], "CANCELADO")
        self.assertEqual(
            self.client.get(f"/api/v1/productos/{prod['id']}").json()["stock"],
            stock_inicial,
        )

        p2 = self.client.post(
            "/api/v1/pedidos",
            json={
                "items": [{"producto_id": prod["id"], "cantidad": 2}],
                "forma_pago": "TRANSFERENCIA",
                "direccion_entrega": "Av. General Paz 100",
                "notas": "",
            },
        )
        self.assertEqual(p2.status_code, 201)
        p2_id = p2.json()["id"]

        self.client.post(
            "/api/v1/auth/token",
            data={"username": "admin", "password": "Admin1234!"},
        )
        self.assertEqual(
            self.client.patch(
                f"/api/v1/pedidos/{p2_id}/estado",
                json={"estado": "EN_PREPARACION"},
            ).status_code,
            200,
        )
        self.assertEqual(
            self.client.patch(
                f"/api/v1/pedidos/{p2_id}/estado",
                json={"estado": "ENTREGADO"},
            ).status_code,
            200,
        )

        resumen = self.client.get("/api/v1/pedidos/resumen").json()
        self.assertEqual(resumen["cancelados"], 1)
        self.assertEqual(resumen["entregados"], 1)
        self.assertEqual(resumen["pedidos_hoy"], 2)


if __name__ == "__main__":
    unittest.main()
