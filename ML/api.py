from typing import Literal, Dict, List, Any

from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel

from pipeline import process_email, process_email_from_pdf

class AnalyzeRequest(BaseModel):
    text: str
    style: Literal["official", "corporate", "client"] = "official"

class Draft(BaseModel):
    style: str
    text: str

class AnalyzeResponse(BaseModel):
    summary: str
    letter_type: str
    facts: Dict[str, Any]
    drafts: List[Draft]

app = FastAPI(
    title="Email Processing API",
    description="Классификация письма, саммари и генерация ответа",
    version="1.0.0",
)

@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest) -> AnalyzeResponse:
    result = process_email(req.text, style=req.style)

    return AnalyzeResponse(**result)

@app.post("/analyze_pdf", response_model=AnalyzeResponse)
async def analyze_pdf(
    file: UploadFile = File(...),
    style: Literal["official", "corporate", "client"] = "official"
):
    import tempfile

    suffix = "." + file.filename.split(".")[-1]
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
    temp_file.write(await file.read())
    temp_file.close()

    result = process_email_from_pdf(temp_file.name, style=style)

    return AnalyzeResponse(**result)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=False)
