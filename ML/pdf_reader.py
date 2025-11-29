from pathlib import Path
import pdfplumber


def pdf_file_to_text(pdf_path: str) -> str:
    pdf_path = Path(pdf_path)
    if not pdf_path.is_file():
        raise FileNotFoundError(f"PDF-файл не найден: {pdf_path}")

    pages_text = []
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            pages_text.append(page_text.strip())

    text = "\n\n".join(pages_text).strip()
    return text
