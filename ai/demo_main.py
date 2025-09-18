from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import json
import random

app = FastAPI(title="Test Case AI Service Demo", version="1.0.0")

class EmbeddingRequest(BaseModel):
    text: str

class EmbeddingResponse(BaseModel):
    embedding: List[float]

class SearchRequest(BaseModel):
    query: str
    min_similarity: float = 0.7
    limit: int = 10

class SearchResult(BaseModel):
    testCase: dict
    similarity: float

# Demo data - dalam implementasi real ini akan diambil dari database
demo_test_cases = [
    {
        "id": "1",
        "name": "Login dengan kredensial valid",
        "description": "Memverifikasi bahwa user dapat login dengan email dan password yang benar",
        "type": "positive",
        "priority": "high",
        "steps": [
            {"step": "Buka halaman login", "expectedResult": "Halaman login ditampilkan"},
            {"step": "Masukkan email valid", "expectedResult": "Email berhasil diinput"},
            {"step": "Masukkan password valid", "expectedResult": "Password berhasil diinput"},
            {"step": "Klik tombol Login", "expectedResult": "User berhasil login"}
        ],
        "expectedResult": "User berhasil masuk ke sistem dan dapat mengakses dashboard",
        "tags": ["authentication", "login", "positive", "critical"],
        "createdAt": "2025-09-18T10:00:00Z",
        "updatedAt": "2025-09-18T10:00:00Z"
    },
    {
        "id": "2", 
        "name": "Login dengan password salah",
        "description": "Memverifikasi bahwa sistem menolak login dengan password yang salah",
        "type": "negative",
        "priority": "high",
        "steps": [
            {"step": "Buka halaman login", "expectedResult": "Halaman login ditampilkan"},
            {"step": "Masukkan email valid", "expectedResult": "Email berhasil diinput"},
            {"step": "Masukkan password salah", "expectedResult": "Password berhasil diinput"},
            {"step": "Klik tombol Login", "expectedResult": "Sistem menampilkan pesan error"}
        ],
        "expectedResult": "User tidak dapat login dan tetap berada di halaman login dengan pesan error",
        "tags": ["authentication", "login", "negative", "security"],
        "createdAt": "2025-09-18T10:05:00Z",
        "updatedAt": "2025-09-18T10:05:00Z"
    },
    {
        "id": "3",
        "name": "Menambahkan produk ke keranjang belanja",
        "description": "Memverifikasi functionality penambahan produk ke shopping cart",
        "type": "positive", 
        "priority": "high",
        "steps": [
            {"step": "Login sebagai customer", "expectedResult": "Berhasil login"},
            {"step": "Cari produk iPhone", "expectedResult": "Daftar produk ditampilkan"},
            {"step": "Klik produk yang diinginkan", "expectedResult": "Detail produk ditampilkan"},
            {"step": "Klik Add to Cart", "expectedResult": "Produk ditambahkan ke cart"}
        ],
        "expectedResult": "Produk berhasil ditambahkan ke cart dengan quantity yang benar",
        "tags": ["ecommerce", "cart", "shopping", "positive"],
        "createdAt": "2025-09-18T10:10:00Z",
        "updatedAt": "2025-09-18T10:10:00Z"
    },
    {
        "id": "4",
        "name": "API GET /users - Mengambil daftar user",
        "description": "Memverifikasi endpoint API untuk mengambil daftar semua user",
        "type": "positive",
        "priority": "medium",
        "steps": [
            {"step": "Setup API client", "expectedResult": "Client siap"},
            {"step": "Send GET request", "expectedResult": "Request terkirim"},
            {"step": "Verify status code 200", "expectedResult": "Status OK"},
            {"step": "Verify response body", "expectedResult": "Data user valid"}
        ],
        "expectedResult": "API mengembalikan daftar user dengan format yang benar",
        "tags": ["api", "get", "users", "positive"],
        "createdAt": "2025-09-18T10:15:00Z",
        "updatedAt": "2025-09-18T10:15:00Z"
    },
    {
        "id": "5",
        "name": "Pencarian produk dengan keyword valid", 
        "description": "Memverifikasi fungsi search dapat menemukan produk berdasarkan keyword",
        "type": "positive",
        "priority": "high",
        "steps": [
            {"step": "Buka halaman utama", "expectedResult": "Halaman ditampilkan"},
            {"step": "Masukkan keyword laptop", "expectedResult": "Keyword diinput"},
            {"step": "Klik search", "expectedResult": "Pencarian dimulai"},
            {"step": "Verify hasil", "expectedResult": "Produk laptop ditampilkan"}
        ],
        "expectedResult": "Sistem menampilkan hasil pencarian yang relevan",
        "tags": ["search", "products", "positive", "functionality"],
        "createdAt": "2025-09-18T10:20:00Z",
        "updatedAt": "2025-09-18T10:20:00Z"
    }
]

def calculate_similarity(query: str, test_case: dict) -> float:
    """Simple similarity calculation based on keyword matching"""
    query_lower = query.lower()
    
    # Combine all text fields from test case
    text_fields = [
        test_case.get("name", ""),
        test_case.get("description", ""), 
        test_case.get("expectedResult", ""),
        " ".join(test_case.get("tags", [])),
        " ".join([step.get("step", "") + " " + step.get("expectedResult", "") 
                 for step in test_case.get("steps", [])])
    ]
    
    combined_text = " ".join(text_fields).lower()
    
    # Simple keyword matching with weights
    query_words = query_lower.split()
    matches = 0
    total_words = len(query_words)
    
    for word in query_words:
        if word in combined_text:
            matches += 1
            
    base_similarity = matches / total_words if total_words > 0 else 0
    
    # Add some randomness to simulate real embedding similarity
    noise = random.uniform(-0.1, 0.1)
    similarity = min(1.0, max(0.0, base_similarity + noise))
    
    return round(similarity, 4)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Service Demo"}

@app.post("/generate-embedding", response_model=EmbeddingResponse)
async def generate_embedding(request: EmbeddingRequest):
    # Generate fake embedding (384 dimensions like real model)
    embedding = [random.uniform(-1, 1) for _ in range(384)]
    return EmbeddingResponse(embedding=embedding)

@app.post("/search", response_model=List[SearchResult])
async def semantic_search(request: SearchRequest):
    results = []
    
    for test_case in demo_test_cases:
        similarity = calculate_similarity(request.query, test_case)
        
        if similarity >= request.min_similarity:
            results.append(SearchResult(
                testCase=test_case,
                similarity=similarity
            ))
    
    # Sort by similarity (highest first) and limit results
    results.sort(key=lambda x: x.similarity, reverse=True)
    return results[:request.limit]

@app.get("/stats")
async def get_statistics():
    return {
        "total_test_cases": len(demo_test_cases),
        "embedded_test_cases": len(demo_test_cases), 
        "embedding_coverage": 100.0,
        "model_name": "demo-similarity-model",
        "embedding_dimension": 384
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)