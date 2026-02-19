import os
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.routes import router
from app.api.upload_routes import router as upload_router
from app.api.hardware_routes import router as hardware_router
from app.api.history_routes import router as history_router
from app.api.workorder_routes import router as workorder_router
from app.utils.logger import logger
from app.hardware import sensor_manager, camera_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler - initialize and cleanup resources"""
    # Startup
    logger.info("Initializing HELIOS AI Hardware Abstraction Layer...")
    await sensor_manager.initialize()
    await camera_manager.initialize()
    logger.info(f"Sensor mode: {sensor_manager.mode.value}")
    logger.info(f"Camera mode: {camera_manager.mode.value}")
    
    yield
    
    # Shutdown
    logger.info("Shutting down hardware connections...")
    await sensor_manager.shutdown()
    await camera_manager.shutdown()


app = FastAPI(
    title="HELIOS AI Backend",
    description="GenAI-Powered Solar Farm Management Platform",
    version="1.0.0",
    lifespan=lifespan,
)

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")
origins.append("*")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.include_router(upload_router)
app.include_router(hardware_router)
app.include_router(history_router)
app.include_router(workorder_router)

# Mount uploads directory for serving stored images
uploads_path = os.path.join(os.path.dirname(__file__), '..', 'uploads')
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

logger.info("HELIOS AI Backend started")
