const fs = require('fs').promises;
const path = require('path');

async function convertToZola(content) {
    // Split frontmatter and content
    const parts = content.split('---\n');
    if (parts.length < 3) return null;
    
    // Parse frontmatter
    const frontmatter = parts[1];
    let mainContent = parts.slice(2).join('---\n');
    
    // Extract existing tags
    const tagMatch = frontmatter.match(/tags:\n((\s*- [^\n]+\n)*)/);
    const existingTags = tagMatch ? tagMatch[1]
        .split('\n')
        .filter(t => t.trim())
        .map(t => t.replace('- ', '').trim())
        : ['essays'];
    
    // Clean up frontmatter
    let newFrontmatter = frontmatter
        .replace('author: bebhuvan\n', '')
        .replace('type: post\n', '')
        .replace(/url:.*\n/, '')
        .replace(/categories:[\s\S]*?\n\n/, '')
        .replace(/tags:[\s\S]*?\n\n/, '')
        .replace(/featured_image:.*\n/, '');
        
    // Add tags back in correct Zola format
    newFrontmatter += 'taxonomies:\n';
    newFrontmatter += '    tags = [\n';
    existingTags.forEach((tag, index) => {
        newFrontmatter += `        "${tag}"${index < existingTags.length - 1 ? ',' : ''}\n`;
    });
    newFrontmatter += '    ]\n';
    
    // Rest of the conversion logic remains the same
    mainContent = mainContent.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/g, (match, p1) => {
        const cleanQuote = p1
            .replace(/<p>/g, '')
            .replace(/<\/p>/g, '\n')
            .replace(/<cite>/g, '\n— ')
            .replace(/<\/cite>/g, '')
            .trim();
        return `> ${cleanQuote}\n`;
    });
    
    // Clean up HTML elements
    mainContent = mainContent
        .replace(/<\/?figure[^>]*>/g, '')
        .replace(/<\/?figcaption[^>]*>/g, '')
        .replace(/<\/?div[^>]*>/g, '')
        .replace(/<\/?cite[^>]*>/g, '')
        .replace(/\{\s*\.wp-block[^}]*\}/g, '')
        .replace(/&#8217;/g, "'")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8230;/g, "...")
        .replace(/&amp;/g, "&")
        .replace(/\{\s*\.wp-block[^}]*\}/g, '')
        .replace(/<\/?hr[^>]*>/g, '---')
        .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
        .replace(/<em>(.*?)<\/em>/g, '_$1_')
        .replace(/<h(\d)[^>]*>(.*?)<\/h\1>/g, (match, level, content) => `\n${'#'.repeat(level)} ${content}\n`)
        .replace(/<\/?p[^>]*>/g, '\n\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/&nbsp;/g, ' ')
        .replace(/&#\d+;/g, function(match) {
            return String.fromCharCode(match.match(/\d+/)[0]);
        });

    // Fix image paths
    mainContent = mainContent.replace(
        /!\[([^\]]*)\]\((\/wp-content\/uploads\/[^)]+)\)/g,
        '![$1](/images$2)'
    );

    // Clean up multiple newlines
    mainContent = mainContent.replace(/\n{3,}/g, '\n\n');

    return `---\n${newFrontmatter}---\n${mainContent}`;
}

async function processDirectory(inputDir, outputDir) {
    const files = await fs.readdir(inputDir);
    
    for (const file of files) {
        if (!file.endsWith('.md')) continue;
        
        const content = await fs.readFile(path.join(inputDir, file), 'utf8');
        const converted = await convertToZola(content);
        
        if (converted) {
            await fs.writeFile(path.join(outputDir, file), converted);
            console.log(`Converted ${file}`);
        }
    }
}

// Main execution
const inputDir = process.argv[2];
const outputDir = process.argv[3];

if (!inputDir || !outputDir) {
    console.log('Usage: node convert.js <input-dir> <output-dir>');
    process.exit(1);
}

processDirectory(inputDir, outputDir).catch(console.error);
