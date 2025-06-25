import string
from random import choice

def generate_random_password(length: int = 10) -> str:

    characters = string.ascii_letters + string.digits + "!@#$%^&*()"
    return ''.join(choice(characters) for _ in range(length))
