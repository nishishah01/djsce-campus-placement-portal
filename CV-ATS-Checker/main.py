import os #to handle files
import io #to read pdfs, docs in memory
import re #regex pattern matching
import uuid #unique file names
from datetime import datetime, timedelta
from typing import Tuple, Optional, List, Dict, Any
from fastapi import FastAPI, Form, File, UploadFile, Request, BackgroundTasks, HTTPException
import requests #to fetch resumes from URL
import json
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles #to serve uploaded files
from docx import Document
from pdfminer.high_level import extract_text
from pdf2image import convert_from_bytes
import pytesseract #OCR for scanned PDFs
import spacy #semantic similarity
import nltk

#Stop words in NLTK (Natural Language Toolkit) are high-frequency words 
# (e.g., "the," "is," "and") that are often removed 
# during text preprocessing to improve computational efficiency and focus on meaningful content
nltk_data_dir = os.path.join(os.path.dirname(__file__), "nltk_data")
nltk.data.path.append(nltk_data_dir)  #stores stopwords locally instead of downloading every time
from nltk.corpus import stopwords
try:
    STOP_WORDS = set(stopwords.words("english"))
except LookupError:
    nltk.download("stopwords", download_dir=nltk_data_dir) #if stopwords not found, download to local directory
    STOP_WORDS = set(stopwords.words("english"))


try:
    nlp = spacy.load("en_core_web_md") #loading medium NLP model for better semantic similarity; fallback to small if not available
except Exception:
    try:
        nlp = spacy.load("en_core_web_sm")
    except Exception:
        nlp = spacy.blank("en")

app = FastAPI(title="Professional ATS CV Checker", version="1.0.0") #creates api instance with title and version
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"]
)#allows requests from frrontend


uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")#creates a folder if not exist
ALLOWED_EXTS = [".pdf", ".docx"]

# -----------------------
# Utility functions
# -----------------------
BASIC_WORDS = set([
    "i", "you", "he", "she", "it", "we", "they",
    "a", "an", "the", "and", "or", "but", "if", "is",
    "are", "was", "were", "in", "on", "for", "of", "to",
    "with", "as", "by", "at", "from", "this", "that",
    "these", "those", "my", "your", "his", "her", "its",
    "our", "their", "be", "have", "has", "had", "not"
])

def get_extension(filename: str) -> str:
    return "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else "" #extracts pdfs or docs

def save_upload_file(upload_file: UploadFile) -> str:
    filename = os.path.basename(getattr(upload_file, "filename", "file"))
    safe_name = re.sub(r"[^A-Za-z0-9._-]", "_", filename) #sanitizes filename to prevent directory traversal and unsafe characters
    dest_name = f"{uuid.uuid4().hex}_{safe_name}" #generates unique filename to avoid collisions
    dest_path = os.path.join(uploads_dir, dest_name)

    upload_file.file.seek(0)
    with open(dest_path, "wb") as out_f:
        out_f.write(upload_file.file.read())

    return f"uploads/{dest_name}"

def cleanup_old_files():
    now = datetime.now()
    for fname in os.listdir(uploads_dir):
        fpath = os.path.join(uploads_dir, fname)
        if os.path.isfile(fpath):
            modified_time = datetime.fromtimestamp(os.path.getmtime(fpath))
            if now - modified_time > timedelta(hours=24):
                os.remove(fpath)

def extract_text_from_bytes(data: bytes, ext: str) -> str:
    if ext == ".docx":
        try:
            doc = Document(io.BytesIO(data))  #reads word file
            text = "\n".join(p.text for p in doc.paragraphs)
            return text
        except Exception:
            return ""

    if ext == ".pdf":
        try:
            text = extract_text(io.BytesIO(data))
            if text.strip():
                return text
        except Exception:
            pass
        try:
            images = convert_from_bytes(data) #if pdf is scanned, convert to images and use OCR to extract text
            text = "\n".join([pytesseract.image_to_string(img) for img in images])
            return text
        except Exception:
            return ""

    return ""

def extract_text_from_upload(upload_file) -> Tuple[str, str]:
    name = getattr(upload_file, "filename", "")
    ext = get_extension(name)
    if ext not in ALLOWED_EXTS:
        raise ValueError("Only .pdf and .docx are supported")

    upload_file.file.seek(0)
    data = upload_file.file.read()
    
    return extract_text_from_bytes(data, ext), ext

def clean_text(text: str) -> str: #lowercase and removes special characters
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s]", " ", text)
    return text

def extract_keywords(text: str):
    text = clean_text(text)
    words = set(text.split())
    # Remove stopwords and basic words
    return words - STOP_WORDS - BASIC_WORDS

def check_cv_format(text: str):
    warnings = []
    sections = ["experience", "education", "skills", "projects","certifications","achievements"]
    for s in sections:
        if s not in text.lower():
            warnings.append(f"Section '{s}' is missing")
    if not re.search(r"\b[\w.-]+@[\w.-]+\.\w{2,4}\b", text):
        warnings.append("No valid email found")
    if not re.search(r"\+?\d[\d\s-]{7,}\d", text):
        warnings.append("No valid phone number found")
    bullets = len(re.findall(r"[\u2022\-*]", text))
    if bullets < 3:
        warnings.append("Few bullet points; consider using bullets for clarity")
    return warnings


#uses spaCy similarity, which compares the semantic meaning of words rather than just exact matches, to find relevant keywords in the resume that match the job description, 
# even if they are not identical. 
# This allows for a more flexible and intelligent matching process, 
# improving the accuracy of the CV checker.
def semantic_match(resume_keywords, jd_keywords):
    matched = set()
    missing = set(jd_keywords)
    if not resume_keywords:
        return matched, missing
    resume_doc = nlp(" ".join(resume_keywords))
    resume_tokens = [t for t in resume_doc if (hasattr(t, "orth_") and t.orth_.strip())]
    if not resume_tokens:
        return matched, missing
    for word in jd_keywords:
        word_doc = nlp(word)
        sims = []
        for token in resume_tokens:
            try:
                sims.append(word_doc.similarity(token))
            except Exception:
                continue
        max_sim = max(sims) if sims else 0
        if max_sim >= 0.75:
            matched.add(word)
            missing.discard(word)
    return matched, missing

def compute_score(resume_text: str, job_description: str):
    resume_keywords = extract_keywords(resume_text)
    jd_keywords = extract_keywords(job_description)
    matched, missing = semantic_match(resume_keywords, jd_keywords)
#score calculation is based 
# on the percentage of matched keywords 
# and the number of formatting warnings.
#  The final score is an average 
# of the keyword match score and the format score, 
# giving a balanced evaluation of both content relevance and presentation quality.
    keyword_score = int(len(matched) / len(jd_keywords) * 100) if jd_keywords else 0
    warnings = check_cv_format(resume_text)
    format_score = max(0, 100 - len(warnings) * 10)
    final_score = int((keyword_score + format_score) / 2)

    suggestion = []
    if warnings:
        suggestion.append("Fix formatting issues")
    if missing:
        suggestion.append("Add missing important skills/keywords")
    # ⚠️ Add professional low-score warning
    if keyword_score < 50 or format_score < 50:
        suggestion.append("⚠️ CV has low match or poor format; review carefully.")

    return {
        "score": final_score,
        "keyword_score": keyword_score,
        "format_score": format_score,
        "matched": list(matched),
        "missing": list(missing),
        "warnings": warnings,
        "suggestion": suggestion,
        "cv_text": resume_text[:5000],
        "cv_file_url": None
    }

# -----------------------
# Routes
# -----------------------
@app.post("/api/rank")
async def rank_applicants(
    job_description_file: UploadFile = File(...),
    applicants: str = Form(...) # JSON string: [{"id": "...", "name": "...", "resumeUrl": "..."}]
):
    try:
        # Extract text from the uploaded JD file
        jd_text, _ = extract_text_from_upload(job_description_file)
        if not jd_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from the Job Description file.")

        try:
            applicants_list = json.loads(applicants)
        except json.JSONDecodeError:
            raise HTTPException(status_code=400, detail="Invalid JSON in applicants field.")

        results = []
        for applicant in applicants_list:
            app_id = applicant.get("id")
            name = applicant.get("name")
            resume_url = applicant.get("resumeUrl")

            if not resume_url:
                continue

            try:
                # Determine extension from URL tentatively or assume pdf
                ext = ".pdf"
                if ".docx" in resume_url.lower():
                    ext = ".docx"

                response = requests.get(resume_url, timeout=15)
                if response.status_code == 200:
                    resume_text = extract_text_from_bytes(response.content, ext)
                    r = compute_score(resume_text, jd_text)
                    r["id"] = app_id
                    r["name"] = name
                    r["resumeUrl"] = resume_url
                    results.append(r)
                else:
                    results.append({"id": app_id, "name": name, "score": 0, "error": "Failed to download resume"})
            except Exception as e:
                results.append({"id": app_id, "name": name, "score": 0, "error": str(e)})

        # Sort and get top 10
        sorted_results = sorted(results, key=lambda x: x.get("score", 0), reverse=True)
        return {"rankings": sorted_results[:10]}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
