#!/usr/bin/env python3
"""
Modified Text Processor for Web App Integration
Accepts command-line arguments and outputs JSON to stdout
"""

import json
import os
import sys
import argparse
from typing import Dict, Any
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class WebTextProcessor:
    """Text processor optimized for web app integration with Promptlayer"""

    def __init__(self):
        """Initialize the TextProcessor with OpenAI client"""
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError(
                "OPENAI_API_KEY not found in environment variables.")

        # Use regular OpenAI client
        self.client = OpenAI(api_key=api_key)
        print("Using OpenAI client")

        self.tasks = {
            "summarize": self.summarize,
            "extract_key_points": self.extract_key_points,
            "classify": self.classify
        }

        # Prompt templates
        self.prompts = {
            "summarize": """Please provide a concise summary of the following text. Focus on the main ideas and key information.
Keep the summary clear and informative, approximately 2-3 sentences.

Text to summarize:
{text}

Summary:""",
            "extract_key_points": """Please extract the key points from the following text. Present them as a bulleted list.
Focus on the most important information and main arguments.

Text to analyze:
{text}

Key Points:""",
            "classify": """Please classify the following text into one of these categories: Opinion, Fact, or News.
Provide the classification and a brief explanation of why it fits that category.

Text to classify:
{text}

Classification:"""
        }

    def get_prompt_template(self, task: str, text: str) -> str:
        """Get prompt template from local templates"""
        return self.prompts[task].format(text=text)

    def summarize(self, text: str) -> str:
        """Summarize the given text"""
        prompt = self.get_prompt_template("summarize", text)
        return self._call_openai_api(prompt, "text_processor_summarize")

    def extract_key_points(self, text: str) -> str:
        """Extract key points from the given text"""
        prompt = self.get_prompt_template("extract_key_points", text)
        return self._call_openai_api(prompt, "text_processor_extract_key_points")

    def classify(self, text: str) -> str:
        """Classify the given text as Opinion, Fact, or News"""
        prompt = self.get_prompt_template("classify", text)
        return self._call_openai_api(prompt, "text_processor_classify")

    def _call_openai_api(self, prompt: str, prompt_name: str = None) -> str:
        """Make API call to OpenAI and return the response"""
        try:
            # Make the OpenAI API call
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that provides clear, concise responses."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )

            return response.choices[0].message.content.strip()

        except Exception as e:
            raise Exception(f"OpenAI API Error: {str(e)}")

    def process_text(self, text: str, task: str) -> Dict[str, Any]:
        """Process text using the selected task"""
        if task not in self.tasks:
            return {
                "success": False,
                "error": f"Invalid task: {task}. Available tasks: {list(self.tasks.keys())}",
                "task": task,
                "input": text,
                "output": None
            }

        try:
            task_function = self.tasks[task]
            output = task_function(text)

            return {
                "success": True,
                "task": task,
                "input": text,
                "output": output
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "task": task,
                "input": text,
                "output": None
            }


def main():
    """Main function for command-line usage"""
    parser = argparse.ArgumentParser(
        description='Process text using OpenAI API')
    parser.add_argument('--task', required=True,
                        choices=['summarize',
                                 'extract_key_points', 'classify'],
                        help='Task to perform')
    parser.add_argument('--text', required=True, help='Text to process')

    args = parser.parse_args()

    try:
        processor = WebTextProcessor()
        result = processor.process_text(args.text, args.task)

        # Output JSON to stdout for Node.js to capture
        print(json.dumps(result, indent=2))

        # Exit with appropriate code
        sys.exit(0 if result["success"] else 1)

    except Exception as e:
        error_result = {
            "success": False,
            "error": str(e),
            "task": args.task,
            "input": args.text,
            "output": None
        }
        print(json.dumps(error_result, indent=2))
        sys.exit(1)


if __name__ == "__main__":
    main()
