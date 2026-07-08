from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_db, disconnect_db
from app.api import shipments, incidents, recovery, simulation, chat, partners, audit
from app.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Connect to databases
    await connect_db()
    yield
    # Disconnect from databases
    await disconnect_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Sentinel AI Autonomous Supply Chain Recovery Engine API",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For demo purposes allow all, or configure to front-end address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(shipments.router, prefix="/api")
app.include_router(incidents.router, prefix="/api")
app.include_router(recovery.router, prefix="/api")
app.include_router(simulation.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(partners.router, prefix="/api")
app.include_router(audit.router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "Sentinel AI Engine",
        "docs_url": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=True)
