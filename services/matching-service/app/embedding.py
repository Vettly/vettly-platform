from sentence_transformers import SentenceTransformer, util

from .config import settings

_model: SentenceTransformer | None = None


def load_model() -> None:
    global _model
    _model = SentenceTransformer(settings.embedding_model_name)


def get_model() -> SentenceTransformer:
    if _model is None:
        raise RuntimeError("Embedding model has not been loaded yet")
    return _model


def embed(texts: list[str]):
    return get_model().encode(texts, normalize_embeddings=True, convert_to_tensor=True)


def cosine_sim_matrix(a, b):
    return util.cos_sim(a, b)
