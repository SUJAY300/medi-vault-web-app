from pydantic import BaseModel
from typing import Dict, Any, Optional


class QueryRequest(BaseModel):
    query: str


class QueryResponse(BaseModel):
    answer: str
    metadata: Dict[str, Any]
    structured: Optional[Dict[str, Any]] = None
