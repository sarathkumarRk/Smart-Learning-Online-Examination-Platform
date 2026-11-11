from datetime import datetime, timedelta, timezone

import jwt
from jwt import InvalidTokenError
from pwdlib import PasswordHash

from app.config import settings


password_hash = PasswordHash.recommended()


# Hash Password
def hash_password(password: str):
    return password_hash.hash(password)


# Verify Password
def verify_password(
    plain_password: str,
    hashed_password: str,
):
    return password_hash.verify(
        plain_password,
        hashed_password,
    )


# Create JWT Access Token
def create_access_token(data: dict):
    to_encode = data.copy()

    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


# Verify JWT Access Token
def verify_access_token(token: str):
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        return payload

    except InvalidTokenError:
        return None
