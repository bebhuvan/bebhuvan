import os
import re

def fix_content(content):
    """Fix remaining formatting issues"""
    # Replace HTML entities
    content = content.replace('&nbsp;', ' ')
    
    # Fix multiple empty lines
    content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)
    
    # Fix spaces around blockquotes
    content = re.sub(r'\n\s*>\s*', '\n> ', content)
    
    # Clean up unnecessary formatting in links
    content = re.sub(r'\s*\n\s*\[(\d+)\]:\s*', '\n[\\1]: ', content)
    
    return content.strip() + '\n'

def process_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Apply fixes
        fixed_content = fix_content(content)
        
        # Write back only if changes were made
        if fixed_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"Fixed formatting in: {os.path.basename(filepath)}")
            
    except Exception as e:
        print(f"Error processing {filepath}: {str(e)}")

def main():
    blog_dir = "content/blog"
    for file in os.listdir(blog_dir):
        if file.endswith('.md'):
            filepath = os.path.join(blog_dir, file)
            process_file(filepath)

if __name__ == "__main__":
    main()
