import os
import re
import frontmatter as fm
from datetime import datetime

# Paths
SOURCE_DIR = "/home/bhuvanesh/Documents/Bhuvan/backup/hugo-export (1)/hugo-export/posts"
DEST_DIR = "/home/bhuvanesh/Documents/blogs/my-blog/content/blog"
IMAGE_SOURCE = "/home/bhuvanesh/Documents/Bhuvan/backup/hugo-export (1)/hugo-export/wp-content/uploads"
IMAGE_DEST = "/home/bhuvanesh/Documents/blogs/my-blog/static/images"

def fix_image_paths(content, post_date):
    """Fix image paths and copy images"""
    year = post_date.strftime("%Y")
    month = post_date.strftime("%m")
    img_dir = os.path.join(IMAGE_DEST, year, month)
    os.makedirs(img_dir, exist_ok=True)

    def replace_wp_image(match):
        url = match.group(1)
        base_name = url.split('/')[-1].split('-')[0]  # Get base filename without size suffixes
        ext = os.path.splitext(url)[1]
        target_filename = f"{base_name}{ext}"

        # Find and copy the original image
        for root, _, files in os.walk(IMAGE_SOURCE):
            for file in files:
                if file.startswith(base_name) and not re.search(r'-\d+x\d+', file):
                    src = os.path.join(root, file)
                    dest = os.path.join(img_dir, target_filename)
                    if not os.path.exists(dest):
                        os.system(f'cp "{src}" "{dest}"')
                    return f'\n![](/images/{year}/{month}/{target_filename})\n'
        return match.group(0)

    # Handle both HTML and markdown image syntax
    content = re.sub(r'<img[^>]*src="([^"]*)"[^>]*>', replace_wp_image, content)
    content = re.sub(r'!\[\]\((https?://[^\)]+)\)', replace_wp_image, content)
    return content

def convert_links(content):
    """Convert links to markdown format"""
    # Convert HTML links
    content = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>(.*?)</a>', r'[\2](\1)', content)
    
    # Find and store reference links
    ref_links = {}
    for match in re.finditer(r'\[(\d+)\]:\s*(\S+)', content):
        ref_links[match.group(1)] = match.group(2)
    
    # Convert reference links to inline
    for ref, url in ref_links.items():
        content = re.sub(r'\[([^\]]+)\]\[' + ref + r'\]', r'[\1](' + url + ')', content)
    
    # Remove reference definitions
    content = re.sub(r'\n\s*\[\d+\]:\s*.*$', '', content, flags=re.MULTILINE)
    return content

def clean_content(content):
    """Clean up formatting"""
    # Handle HTML figure tags
    content = re.sub(r'<figure[^>]*>(.*?)<figcaption>(.*?)</figcaption>.*?</figure>', 
                    r'\1\n*\2*\n', content, flags=re.DOTALL)
    
    # Remove other HTML tags
    content = re.sub(r'</?[^>]+/?>', '', content)
    
    # Fix HTML entities
    replacements = {
        '&#8217;': "'",
        '&#8220;': '"',
        '&#8221;': '"',
        '&#8211;': '–',
        '&#8212;': '—',
        '&amp;': '&',
        '&quot;': '"',
        '&nbsp;': ' '
    }
    for old, new in replacements.items():
        content = content.replace(old, new)
    
    # Fix paragraph spacing
    paragraphs = content.split('\n\n')
    paragraphs = [p.strip() for p in paragraphs if p.strip()]
    content = '\n\n'.join(paragraphs)
    
    return content

def convert_post(filename):
    """Convert a single post from Hugo to Zola format"""
    source_path = os.path.join(SOURCE_DIR, filename)
    dest_path = os.path.join(DEST_DIR, filename)
    
    with open(source_path, 'r', encoding='utf-8') as f:
        post = fm.load(f)
    
    # Process content
    content = post.content
    content = fix_image_paths(content, post.get('date'))
    content = convert_links(content)
    content = clean_content(content)
    
    # Create output
    output = f"""+++
title = "{post.get('title', '')}"
date = "{post.get('date').strftime('%Y-%m-%d')}"

[taxonomies]
tags = {str([tag.lower() for tag in post.get('categories', [])])}
+++

{content}
"""
    
    # Write the file
    with open(dest_path, 'w', encoding='utf-8') as f:
        f.write(output)
    
    print(f"Converted {filename}")

def main():
    # Test with one post first
    test_post = "2021-06-25-trillion-dollar-problems.md"
    convert_post(test_post)

if __name__ == "__main__":
    main()
