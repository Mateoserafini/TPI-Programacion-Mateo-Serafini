import unittest
from tests.conftest_db import setup_test_db, teardown_test_db


class TestAuthYUsuarios(unittest.TestCase):
    def setUp(self):
        self.client, self.engine, self.db_path = setup_test_db()

    def tearDown(self):
        teardown_test_db(self.engine, self.db_path)

    def test_registro_duplicado_login_me_y_logout(self):
        res = self.client.post(
            "/api/v1/auth/register",
            json={
                "username": "cliente_test",
                "full_name": "Cliente Test",
                "email": "cliente_test@example.com",
                "password": "Password123!",
            },
        )
        self.assertEqual(res.status_code, 201)
        data = res.json()
        self.assertEqual(data["role"], "user")
        self.assertNotIn("hashed_password", data)

        dup = self.client.post(
            "/api/v1/auth/register",
            json={
                "username": "cliente_test",
                "full_name": "Otro Nombre",
                "email": "otro@example.com",
                "password": "Password123!",
            },
        )
        self.assertEqual(dup.status_code, 409)

        bad_login = self.client.post(
            "/api/v1/auth/token",
            data={"username": "cliente_test", "password": "Incorrecta"},
        )
        self.assertEqual(bad_login.status_code, 401)

        login = self.client.post(
            "/api/v1/auth/token",
            data={"username": "cliente_test", "password": "Password123!"},
        )
        self.assertEqual(login.status_code, 200)
        self.assertIn("access_token", login.cookies)
        self.assertNotIn("access_token", login.json())

        me = self.client.get("/api/v1/auth/me")
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json()["username"], "cliente_test")

        forbidden = self.client.get("/api/v1/admin/usuarios")
        self.assertEqual(forbidden.status_code, 403)

        logout = self.client.post("/api/v1/auth/logout")
        self.assertEqual(logout.status_code, 200)

        me_after = self.client.get("/api/v1/auth/me")
        self.assertEqual(me_after.status_code, 401)

    def test_admin_activar_desactivar_y_autodesactivacion(self):
        reg = self.client.post(
            "/api/v1/auth/register",
            json={
                "username": "user2",
                "full_name": "Usuario Dos",
                "email": "user2@example.com",
                "password": "Password123!",
            },
        )
        user_id = reg.json()["id"]

        self.client.post(
            "/api/v1/auth/token",
            data={"username": "admin", "password": "Admin1234!"},
        )
        me_admin = self.client.get("/api/v1/auth/me").json()

        self_disable = self.client.post(f"/api/v1/admin/usuarios/{me_admin['id']}/desactivar")
        self.assertEqual(self_disable.status_code, 400)

        disable = self.client.post(f"/api/v1/admin/usuarios/{user_id}/desactivar")
        self.assertEqual(disable.status_code, 200)
        self.assertTrue(disable.json()["disabled"])

        disabled_login = self.client.post(
            "/api/v1/auth/token",
            data={"username": "user2", "password": "Password123!"},
        )
        self.assertEqual(disabled_login.status_code, 400)
        self.assertEqual(disabled_login.json()["detail"], "Cuenta de usuario desactivada")

        self.client.post(
            "/api/v1/auth/token",
            data={"username": "admin", "password": "Admin1234!"},
        )
        enable = self.client.post(f"/api/v1/admin/usuarios/{user_id}/activar")
        self.assertEqual(enable.status_code, 200)
        self.assertFalse(enable.json()["disabled"])


if __name__ == "__main__":
    unittest.main()
