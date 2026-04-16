"""
Standalone script to ingest the knowledge base into ChromaDB.
Run this ONCE before starting the server.

Usage:
    python scripts/ingest.py
    python scripts/ingest.py --kb-path /path/to/custom_kb.json
    python scripts/ingest.py --force  # Re-ingest even if data exists
"""

import argparse
import sys
import os
import time

# Add parent dir to path so we can import app modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.config import settings
from app.embeddings import embedding_service


def main():
    parser = argparse.ArgumentParser(description="Ingest KB into ChromaDB")
    parser.add_argument("--kb-path", default=settings.KB_FILE_PATH, help="Path to KB JSON file")
    parser.add_argument("--force", action="store_true", help="Force re-ingestion")
    args = parser.parse_args()

    if not os.path.exists(args.kb_path):
        print(f"ERROR: KB file not found: {args.kb_path}")
        sys.exit(1)

    current_count = embedding_service.collection.count()
    print(f"Current documents in ChromaDB: {current_count}")

    if current_count > 0 and not args.force:
        print("KB already ingested. Use --force to re-ingest.")
        return

    if args.force and current_count > 0:
        print("Force flag set. Will re-ingest...")

    start = time.time()
    embedding_service.ingest_knowledge_base(args.kb_path)
    elapsed = time.time() - start

    print(f"\nDone in {elapsed:.1f} seconds.")
    print(f"Total documents: {embedding_service.collection.count()}")


if __name__ == "__main__":
    main()
