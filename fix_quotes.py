import os

def fix_quotes(content):
    """Fix quotes that appear as code blocks"""
    # Fix backtick quotes
    content = content.replace("`'", "'")
    content = content.replace("`'", "'")
    content = content.replace('`"', '"')
    content = content.replace('`"', '"')
    
    # Fix smart quotes
    content = content.replace('\u201c', '"')  # opening double quote
    content = content.replace('\u201d', '"')  # closing double quote
    content = content.replace('\u2018', "'")  # opening single quote
    content = content.replace('\u2019', "'")  # closing single quote
    
    return content

def process_file(filepath):
    """Process a single markdown file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Apply fixes
        fixed_content = fix_quotes(content)
        
        # Write back only if changes were made
        if fixed_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"Fixed quotes in: {os.path.basename(filepath)}")
            
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
