import io
from pdfminer.high_level import extract_text_to_fp
from pdfminer.layout import LAParams


def extract_text(pdf_bytes: bytes) -> str:
    output = io.StringIO()
    extract_text_to_fp(
        io.BytesIO(pdf_bytes),
        output,
        laparams=LAParams(),
        output_type="text",
        codec="utf-8",
    )
    return output.getvalue()
