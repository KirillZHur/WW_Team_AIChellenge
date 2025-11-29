import os
import json
from typing import Dict, Any, Optional, List

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(".env")

API_KEY = os.getenv("API_KEY")
FOLDER_ID = os.getenv("FOLDER_ID")

if API_KEY is None or FOLDER_ID is None:
    raise RuntimeError("Не заданы YC_API_KEY или YC_FOLDER_ID в .env")

BASE_URL = "https://rest-assistant.api.cloud.yandex.net/v1"


MODEL = f"gpt://{FOLDER_ID}/yandexgpt-lite/latest"

client = OpenAI(
    base_url=BASE_URL,
    api_key=API_KEY,
    project=FOLDER_ID,
)

def _call_yagpt(
    text: str,
    system_prompt: str,
    temperature: float = 0.2,
    max_tokens: int = 500,
) -> str:
    response = client.responses.create(
        model=MODEL,
        input=[
            {
                "role": "system",
                "content": system_prompt,
            },
            {
                "role": "user",
                "content": text,
            },
        ],
        temperature=temperature,
        max_output_tokens=max_tokens,
        metadata={"folderId": FOLDER_ID},
    )

    try:
        return response.output[0].content[0].text
    except Exception:
        return str(response)


def yagpt_summary(email_text: str) -> str:
    system_prompt = """
    Ты — помощник в юридическом департаменте банка.
    Твоя задача — кратко пересказать содержание входящего письма.

    Требования:
    - Пиши на русском языке.
    - Используй 2–4 предложения.
    - Отрази: кто пишет, по какому вопросу, чего ожидает от Банка.
    - Не добавляй новую информацию, которой нет в письме.
    - Не давай рекомендаций и не отвечай от лица Банка.
    - Пиши в нейтральном деловом стиле.
    """
    return _call_yagpt(email_text, system_prompt, temperature=0.1, max_tokens=250)


def yagpt_extract_facts(email_text: str) -> Dict[str, Any]:
    system_prompt = """
    Ты — помощник в юридическом департаменте банка.

    Задача:
    - Проанализируй входящее письмо.
    - Выдели ключевые признаки и верни строго JSON с полями:
      {
        "organizations": [строки],
        "dates": [строки],
        "doc_numbers": [строки],
        "requirements": "строка"
      }

    Требования:
    - Не добавляй полей, не перечисленных выше.
    - Если чего-то нет, используй пустой список или пустую строку.
    - Не пиши пояснений, только JSON.
    """
    raw = _call_yagpt(email_text, system_prompt, temperature=0.0, max_tokens=400)

    try:
        cleaned = raw.strip().strip("`")
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:].lstrip()
        data = json.loads(cleaned)
    except Exception:
        data = {}

    facts = dict(data) if isinstance(data, dict) else {}

    facts.setdefault("organizations", [])
    facts.setdefault("dates", [])
    facts.setdefault("doc_numbers", [])
    facts.setdefault("requirements", "")

    if not isinstance(facts["organizations"], list):
        facts["organizations"] = [str(facts["organizations"])]
    if not isinstance(facts["dates"], list):
        facts["dates"] = [str(facts["dates"])]
    if not isinstance(facts["doc_numbers"], list):
        facts["doc_numbers"] = [str(facts["doc_numbers"])]
    if not isinstance(facts["requirements"], str):
        facts["requirements"] = str(facts["requirements"])

    return facts


def yagpt_reply(
    email_text: str,
    letter_type: str,
    facts: Optional[Dict] = None,
    style: str = "official",
    history: Optional[List[str]] = None,
) -> str:
    class_instr = f"Тип письма (по классификатору): {letter_type}.\n"

    lt = letter_type.lower()
    if "жалоб" in lt or "претенз" in lt:
        class_instr += (
            "Это жалоба или претензия. В ответе важно поблагодарить за обратную связь, "
            "корректно отреагировать на недовольство, описать дальнейшие шаги, "
            "но не признавать юридическую вину.\n"
        )
    elif "запрос" in lt and "информац" in lt:
        class_instr += (
            "Это запрос информации или документов. В ответе нужно указать, какую информацию банк предоставит, "
            "в какие сроки и какие дополнительные данные могут потребоваться.\n"
        )
    elif "регулятор" in lt:
        class_instr += (
            "Это регуляторный запрос. Ответ должен быть максимально формальным, "
            "юридически выверенным и аккуратным.\n"
        )
    elif "партнер" in lt or "партнёр" in lt:
        class_instr += (
            "Это партнёрское предложение. Ответ должен быть вежливым, подчеркнуть интерес или корректно отказать, "
            "и предложить возможные дальнейшие шаги.\n"
        )
    elif "согласован" in lt:
        class_instr += (
            "Это запрос на согласование. В ответе нужно явно указать результат согласования "
            "(согласовано / требуется доработка / частично согласовано) и следующие шаги.\n"
        )
    elif "уведомлен" in lt or "уведомление" in lt:
        class_instr += (
            "Это уведомление. Ответ может быть кратким подтверждением получения и описанием дальнейших действий.\n"
        )

    if style == "official":
        style_instr = "Стиль: строго официальный, формальный, без лишних эмоций.\n"
    elif style == "corporate":
        style_instr = "Стиль: стандартный корпоративный деловой, нейтральный.\n"
    elif style == "client":
        style_instr = (
            "Стиль: клиентоориентированный, вежливый, более тёплый, но при этом официальный.\n"
        )
    elif style == "short":
        style_instr = (
            "Стиль: краткий информационный ответ. "
            "Сформулируй только ключевую информацию и базовые формулировки вежливости, без деталей.\n"
        )
    else:
        style_instr = "Стиль: стандартный корпоративный деловой.\n"

    if facts:
        orgs = ", ".join(facts.get("organizations", [])) or "—"
        dates = ", ".join(facts.get("dates", [])) or "—"
        docs = ", ".join(facts.get("doc_numbers", [])) or "—"
        req = facts.get("requirements") or "—"
        regs = ", ".join(facts.get("regulatory_refs", [])) or "—"

        contacts = facts.get("contacts", {})
        emails = ", ".join(contacts.get("emails", [])) or "—"
        phones = ", ".join(contacts.get("phones", [])) or "—"
        persons = ", ".join(contacts.get("person_names", [])) or "—"

        requisites = facts.get("requisites", {})
        inn = requisites.get("inn") or "—"
        kpp = requisites.get("kpp") or "—"
        ogrn = requisites.get("ogrn") or "—"
        accs = ", ".join(requisites.get("account_numbers", [])) or "—"

        facts_str = (
            "Выделенные факты:\n"
            f"- Организации: {orgs}\n"
            f"- Даты: {dates}\n"
            f"- Документы/договора: {docs}\n"
            f"- Требование/ожидание: {req}\n"
            f"- Нормативные акты: {regs}\n"
            f"- Контакты (email): {emails}\n"
            f"- Контакты (телефон): {phones}\n"
            f"- Представители/ФИО: {persons}\n"
            f"- ИНН: {inn}, КПП: {kpp}, ОГРН: {ogrn}\n"
            f"- Номера счетов: {accs}\n"
        )
    else:
        facts_str = "Выделенные факты: не удалось определить.\n"

    history_block = ""
    if history:
        if isinstance(history, list):
            joined = "\n---\n".join(history)
        else:
            joined = str(history)
        history_block = (
            "История предыдущей переписки с этим отправителем:\n"
            f"{joined}\n\n"
            "Учитывай эту историю при формировании ответа, но не переписывай её дословно.\n"
        )

    system_prompt = """
    Ты — сотрудник службы клиентской поддержки крупного банка.
    Ты готовишь официальный текст ответа на входящие письма клиентов, партнёров и регуляторов.

    Требования:
    - Не придумывай факты о продуктах, тарифах, договорах и нормативных актах.
    - Если каких-то данных явно нет в письме, напиши, что требуется дополнительная информация
      или что вопрос будет передан в профильное подразделение.
    - Соблюдай нейтральный, корректный и вежливый тон даже при жалобах и претензиях.
    - Не используй квадратные скобки вида [текст]. Если информации не хватает — используй нейтральные
      формулировки вроде «сотрудник Банка», «дата получения письма», «Служба клиентской поддержки Банка».
    - Ответ должен быть готовым текстом письма, который можно отправить от имени Банка.
    """

    user_text = (
        f"{class_instr}"
        f"{style_instr}\n"
        f"{history_block}"
        f"{facts_str}\n"
        f"Текст исходного письма:\n\"\"\"\n{email_text}\n\"\"\"\n\n"
        "Сформируй текст ответа (обращение, основной текст, финальная формула вежливости)."
    )

    return _call_yagpt(
        text=user_text,
        system_prompt=system_prompt,
        temperature=0.3 if style != "short" else 0.1,
        max_tokens=500 if style != "short" else 200,
    )

def yagpt_all_reply(
    email_text: str,
    letter_type: str,
    facts: Optional[Dict] = None,
    history: Optional[List[str]] = None,
) -> Dict[str, str]:
    styles = ["official", "corporate", "client"]
    replies = {}

    for st in styles:
        replies[st] = yagpt_reply(
            email_text=email_text,
            letter_type=letter_type,
            facts=facts,
            style=st,
            history=history,
        )

    return replies