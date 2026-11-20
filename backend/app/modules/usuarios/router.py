from typing import List
from fastapi import APIRouter, Depends
from app.core.deps import require_role
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork

router = APIRouter(prefix="/admin/usuarios", tags=["Usuarios"])


def get_usuario_service() -> UsuarioService:
    return UsuarioService(UsuarioUnitOfWork())


@router.get("", response_model=List[UserPublic])
def list_usuarios(
    _: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
) -> List[UserPublic]:
    return service.list_usuarios()


@router.post("/{user_id}/activar", response_model=UserPublic)
def activar_usuario(
    user_id: int,
    _: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    return service.activar_usuario(user_id)


@router.post("/{user_id}/desactivar", response_model=UserPublic)
def desactivar_usuario(
    user_id: int,
    current_user: Usuario = Depends(require_role(["admin"])),
    service: UsuarioService = Depends(get_usuario_service),
) -> UserPublic:
    assert current_user.id is not None
    return service.desactivar_usuario(user_id, current_user.id)
