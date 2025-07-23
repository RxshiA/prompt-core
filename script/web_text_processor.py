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
    """Text processor optimized for web app integration"""
    
    def __init__(self):
        """Initialize the TextProcessor with OpenAI client"""
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables.")
        
        self.client = OpenAI(api_key=api_key)
        self.tasks = {
            "summarize": self.summarize,
            "extract_key_points": self.extract_key_points,
            "classify": self.classify
        }
    
    def summarize(self, text: str) -> str:
        """Summarize the given text"""
        prompt = f"""
        Please provide a concise summary of the following text. Focus on the main ideas and key information.
        Keep the summary clear and informative, approximately 2-3 sentences.
        
        Text to summarize:
        {text}
        
        Summary:
        """
        
        return self._call_openai_api(prompt)
    
    def extract_key_points(self, text: str) -> str:
        """Extract key points from the given text"""
        prompt = f"""
        Please extract the key points from the following text. Present them as a bulleted list.
        Focus on the most important information and main arguments.
        
        Text to analyze:
        {text}
        
        Key Points:
        """
        
        return self._call_openai_api(prompt)
    
    def classify(self, text: str) -> str:
        """Classify the given text as Opinion, Fact, or News"""
        prompt = f"""
        Please classify the following text into one of these categories: Opinion, Fact, or News.
        Provide the classification and a brief explanation of why it fits that category.
        
        Text to classify:
        {text}
        
        Classification:
        """
        
        return self._call_openai_api(prompt)
    
    def _call_openai_api(self, prompt: str) -> str:
        """Make API call to OpenAI and return the response"""
        try:
            response = self.client.chat.completions.create(
                model="gpt-3.5-turbo",
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
    parser = argparse.ArgumentParser(description='Process text using OpenAI API')
    parser.add_argument('--task', required=True, 
                       choices=['summarize', 'extract_key_points', 'classify'],
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
