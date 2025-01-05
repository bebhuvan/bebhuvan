import os
import re

def fix_italics(content):
    """Fix italics formatting for publication names and emphasized words"""
    # List of publication names that should be italicized
    publications = [
        "GQ",
        "Los Angeles Times",
        "Wall Street Journal",
        "Time",
        "Sports Illustrated",
        "Business Insider",
        "The New Yorker",
        "The Washington Post",
        "The Atlantic",
        "The Economist",
        "Financial Times",
        "The Independent",
        "The New York Times",
        "The Daily",
        "The Intelligence",
        "The Indian Express"
    ]
    
    # Fix publication names
    for pub in publications:
        content = content.replace(f"_{pub}_", f"_{pub}_")  # Fix existing
        content = content.replace(f" {pub} ", f" _{pub}_ ")  # Add new
    
    # Fix emphasis words
    emphasis_words = [
        "manufacture",
        "dump",
        "seems",
        "save",
        "Idiocracy",
        "Substack panic"
    ]
    
    for word in emphasis_words:
        content = content.replace(f"_{word}_", f"_{word}_")  # Fix existing
        content = content.replace(f" {word} ", f" _{word}_ ")  # Add new
    
    return content

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fixed = fix_italics(content)
    
    if fixed != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed)
        print(f"Fixed italics in {os.path.basename(filepath)}")

def main():
    blog_dir = "content/blog"
    for file in os.listdir(blog_dir):
        if file.endswith('.md'):
            filepath = os.path.join(blog_dir, file)
            process_file(filepath)

if __name__ == "__main__":
    main()
