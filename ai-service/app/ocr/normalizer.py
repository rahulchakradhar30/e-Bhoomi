import re
import unicodedata

class TeluguNormalizer:
    """
    Telugu Text Normalizer for e-Bhoomi.
    Safe Unicode NFKC normalization, whitespace cleanup, preserving Telugu characters,
    numerals, linebreaks, and punctuation without altering semantic meaning.
    """

    def normalize(self, raw_text: str) -> str:
        if not raw_text:
            return ""

        # 1. Unicode NFKC Normalization
        text = unicodedata.normalize("NFKC", raw_text)

        # 2. Normalize carriage returns and repeated linebreaks
        text = text.replace("\r\n", "\n").replace("\r", "\n")

        # 3. Clean up horizontal trailing whitespace on individual lines
        lines = [re.sub(r"[ \t]+", " ", line).strip() for line in text.split("\n")]

        # 4. Rejoin non-empty lines while preserving logical block separation
        normalized_text = "\n".join(line for line in lines if line)

        return normalized_text
