import os

def fix_content(content):
    """Fix italics formatting"""
    # Fix italicized text by replacing _text_ with _text_
    content = content.replace('_GQ_', '_GQ_')
    content = content.replace('_The New Yorker_', '_The New Yorker_')
    content = content.replace('_Business Insider_', '_Business Insider_')
    content = content.replace('_The Washington Post_', '_The Washington Post_')
    content = content.replace('_The Atlantic_', '_The Atlantic_')
    content = content.replace('_Time_', '_Time_')
    content = content.replace('_Los Angeles Times_', '_Los Angeles Times_')
    content = content.replace('_The Economist_', '_The Economist_')
    content = content.replace('_Financial Times_', '_Financial Times_')
    content = content.replace('_The Independent_', '_The Independent_')
    content = content.replace('_The New York Times_', '_The New York Times_')
    content = content.replace('_The Intelligence_', '_The Intelligence_')
    content = content.replace('_The Daily_', '_The Daily_')
    content = content.replace('_manufacture_', '_manufacture_')
    content = content.replace('_dump_', '_dump_')
    content = content.replace('_seems_', '_seems_')
    content = content.replace('_save_', '_save_')
    content = content.replace('_Idiocracy_', '_Idiocracy_')
    content = content.replace('_Substack panic_', '_Substack panic_')
    
    return content

def process_file(filepath):
    """Process a single markdown file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Apply fixes
        fixed_content = fix_content(content)
        
        if fixed_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(fixed_content)
            print(f"Fixed italics in: {os.path.basename(filepath)}")
            
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
