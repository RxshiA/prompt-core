# Python Script Component

This directory contains the Python script that handles text processing using OpenAI's API. It's designed to be called by the Node.js backend via command-line arguments.

## Files

- `web_text_processor.py` - Main processing script
- `requirements.txt` - Python dependencies
- `.env` - Environment variables (API key)

## Usage

```bash
python web_text_processor.py --task summarize --text "Your text here"
python web_text_processor.py --task extract_key_points --text "Your text here"
python web_text_processor.py --task classify --text "Your text here"
```

## Setup

```bash
pip install -r requirements.txt
# Add your OpenAI API key to .env file
```

## Output Format

The script outputs JSON to stdout:

```json
{
  "success": true,
  "task": "summarize",
  "input": "Your text here...",
  "output": "AI-generated result..."
}
```
