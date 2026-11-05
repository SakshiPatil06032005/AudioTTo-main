
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

# Install system dependencies:
# ffmpeg for audio/video processing
# pdflatex and LaTeX packages for PDF generation
# libgomp1 for native ML libraries

RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libgomp1 \
    texlive-latex-base \
    texlive-latex-recommended \
    texlive-latex-extra \
    texlive-pictures \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install -r requirements.txt

COPY . .

RUN mkdir -p /tmp/output /tmp/temp_uploads

EXPOSE 10000

CMD ["sh", "-c", "uvicorn gui_app:app --host 0.0.0.0 --port ${PORT:-10000}"]
