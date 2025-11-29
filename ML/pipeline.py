from typing import Dict, Any

from classifier import classify_letter
from pdf_reader import pdf_file_to_text
from ya_client import (
    yagpt_summary,
    yagpt_extract_facts,
    yagpt_all_reply,
)


def process_email(email_text: str, style: str = "official") -> Dict[str, Any]:
    clf_res = classify_letter(email_text)
    letter_type = clf_res["type"]

    summary = yagpt_summary(email_text)

    facts = yagpt_extract_facts(email_text)

    replies = yagpt_all_reply(
        email_text=email_text,
        letter_type=letter_type,
        facts=facts,
        history=None,
    )

    drafts = [
        {"style": style_name, "text": reply_text}
        for style_name, reply_text in replies.items()
    ]

    return {
        "summary": summary,
        "letter_type": letter_type,
        "facts": facts,
        "drafts": drafts,
    }

def process_email_from_pdf(pdf_path: str, style: str = "official") -> Dict[str, Any]:
    text = pdf_file_to_text(pdf_path)
    return process_email(text, style=style)
