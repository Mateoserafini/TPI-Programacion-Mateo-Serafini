import unittest
from tests.conftest_db import setup_test_db, teardown_test_db


class TestCatalogo(unittest.TestCase):
    def setUp(self):
        self.client, self.engine, self.db_path = setup_test_db()

    def tearDown(self):
        teardown_test_db(self.engine, self.db_path)

    def test_categorias_crud_y_baja_logica(self):
        public_list = self.client.get("/api/v1/categorias")
        self.assertEqual(public_list.status_code, 200)
        self.assertEqual(len(public_list.json()), 4)

        unauth = self.client.post(
            "/api/v1/categorias",
            json={"nombre": "Empanadas", "descripcion": "Salteñas"},
        )
        self.assertEqual(unauth.status_code, 401)

        self.client.post(
            "/api/v1/auth/token",
            data={"username": "admin", "password": "Admin1234!"},
        )

        created = self.client.post(
            "/api/v1/categorias",
            json={"nombre": "Empanadas", "descripcion": "Salteñas"},
        )
        self.assertEqual(created.status_code, 201)
        cat_id = created.json()["id"]

        dup = self.client.post(
            "/api/v1/categorias",
            json={"nombre": "Empanadas", "descripcion": "Repetida"},
        )
        self.assertEqual(dup.status_code, 409)

        updated = self.client.put(
            f"/api/v1/categorias/{cat_id}",
            json={"descripcion": "Empanadas al horno"},
        )
        self.assertEqual(updated.status_code, 200)
        self.assertEqual(updated.json()["nombre"], "Empanadas")

        deleted = self.client.delete(f"/api/v1/categorias/{cat_id}")
        self.assertEqual(deleted.status_code, 204)

        get_deleted = self.client.get(f"/api/v1/categorias/{cat_id}")
        self.assertEqual(get_deleted.status_code, 404)

    def test_productos_filtros_paginacion_stock_y_baja(self):
        res = self.client.get("/api/v1/productos?skip=0&limit=3&search=hamburguesa")
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertEqual(body["total"], 3)
        self.assertEqual(len(body["items"]), 3)

        self.client.post(
            "/api/v1/auth/token",
            data={"username": "admin", "password": "Admin1234!"},
        )

        bad_cat = self.client.post(
            "/api/v1/productos",
            json={
                "nombre": "Pizza",
                "descripcion": "Muzzarella",
                "precio_base": 5000,
                "imagen_url": "",
                "stock": 10,
                "disponible": True,
                "categoria_id": 9999,
            },
        )
        self.assertEqual(bad_cat.status_code, 404)

        cat_id = self.client.get("/api/v1/categorias").json()[0]["id"]
        created = self.client.post(
            "/api/v1/productos",
            json={
                "nombre": "Hamburguesa Especial",
                "descripcion": "Triple queso",
                "precio_base": 11000,
                "imagen_url": "",
                "stock": 5,
                "disponible": True,
                "categoria_id": cat_id,
            },
        )
        self.assertEqual(created.status_code, 201)
        prod_id = created.json()["id"]

        patched = self.client.patch(
            f"/api/v1/productos/{prod_id}/stock",
            json={"stock": 20, "disponible": False},
        )
        self.assertEqual(patched.status_code, 200)
        self.assertEqual(patched.json()["stock"], 20)
        self.assertFalse(patched.json()["disponible"])

        deleted = self.client.delete(f"/api/v1/productos/{prod_id}")
        self.assertEqual(deleted.status_code, 204)
        self.assertEqual(self.client.get(f"/api/v1/productos/{prod_id}").status_code, 404)


if __name__ == "__main__":
    unittest.main()
