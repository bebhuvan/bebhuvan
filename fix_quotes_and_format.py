import os

def fix_content(content):
    """Fix quotes and formatting issues"""
    # Remove WordPress classes and divs
    content = content.replace('{.wp-block-heading}', '')
    
    # Fix quotes
    content = content.replace('`"', '"')
    content = content.replace('`"', '"')
    content = content.replace('\u201c', '"')
    content = content.replace('\u201d', '"')
    content = content.replace('\u2018', "'")
    content = content.replace('\u2019', "'")
    
    # Remove WordPress comments and replies
    content = content.replace('Leave a Reply[Cancel reply](/wp-admin/export.php?type=hugo#respond)', '')
    
    # Fix extra spacing
    content = content.replace('  ', ' ')
    content = content.replace('\n\n\n', '\n\n')
    
    # Fix heading formatting
    lines = content.split('\n')
    fixed_lines = []
    for line in lines:
        if line.strip().endswith('{.wp-block-heading}'):
            line = line.replace('{.wp-block-heading}', '')
        fixed_lines.append(line)
    
    return '\n'.join(fixed_lines)

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
