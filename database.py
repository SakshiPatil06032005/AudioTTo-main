
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Render persistent storage directory
DATA_DIR = os.getenv("DATA_DIR", BASE_DIR)

os.makedirs(DATA_DIR, exist_ok=True)

DB_PATH = os.getenv(
    "DATABASE_PATH",
    os.path.join(DATA_DIR, "audiotto.db")
)

DATABASE_URL = f"sqlite:///{DB_PATH}"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
