import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

MODEL_PATH = "./rubert-letter-classifier-final"
BASE_MODEL = "DeepPavlov/rubert-base-cased"

ID2LABEL = {
    0: "Запрос информации/документов",
    1: "Официальная жалоба или претензия",
    2: "Регуляторный запрос",
    3: "Партнёрское предложение",
    4: "Запрос на согласование",
    5: "Уведомление или информирование",
}

tokenizer = AutoTokenizer.from_pretrained(BASE_MODEL)
clf_model = AutoModelForSequenceClassification.from_pretrained(
    MODEL_PATH
).to(DEVICE)
clf_model.eval()


def classify_letter(text: str) -> dict:
    inputs = tokenizer(
        text,
        truncation=True,
        max_length=256,
        padding="max_length",
        return_tensors="pt",
    ).to(DEVICE)

    with torch.no_grad():
        logits = clf_model(**inputs).logits
        probs = torch.softmax(logits, dim=-1)[0].cpu().numpy()

    best_idx = int(probs.argmax())
    return {
        "type": ID2LABEL.get(best_idx, str(best_idx)),
        "confidence": float(probs[best_idx]),
        "probs": {
            ID2LABEL.get(i, str(i)): float(p)
            for i, p in enumerate(probs)
        },
    }
