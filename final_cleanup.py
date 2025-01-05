import os

def cleanup_content(content):
    """Final cleanup of markdown content"""
    # Remove double underscores
    content = content.replace('thrive.__', 'thrive.')
    
    # Fix spaces in italics for publication names
    content = content.replace(' _', ' _')
    content = content.replace('_ ', '_')
    
    # Fix spaces between multiple italicized items
    content = content.replace('_, _', '_, _')
    
    # Remove extra blank lines
    while '\n\n\n' in content:
        content = content.replace('\n\n\n', '\n\n')
    
    return content

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    fixed = cleanup_content(content)
    
    if fixed != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed)
        print(f"Cleaned up formatting in {os.path.basename(filepath)}")

def main():
    blog_dir = "content/blog"
    for file in os.listdir(blog_dir):
        if file.endswith('.md'):
            filepath = os.path.join(blog_dir, file)
            process_file(filepath)

if __name__ == "__main__":
    main()
