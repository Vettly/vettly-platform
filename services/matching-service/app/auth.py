import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from .config import settings

bearer_scheme = HTTPBearer(auto_error=True)


def decode_token(credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme)) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=["HS256"],
            issuer=settings.jwt_issuer,
            audience=settings.jwt_audience,
        )
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc
    return payload


class AuthContext:
    def __init__(self, payload: dict, raw_token: str):
        self.payload = payload
        self.token = raw_token
        self.role = payload.get("role")


def get_auth_context(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    payload: dict = Depends(decode_token),
) -> AuthContext:
    return AuthContext(payload, credentials.credentials)


def require_recruiter(ctx: AuthContext = Depends(get_auth_context)) -> AuthContext:
    if ctx.role != "recruiter":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Recruiter role required")
    return ctx
