import asyncio
import json
import time
from flask import Blueprint, request, jsonify
from flask_cors import cross_origin
import requests
from bs4 import BeautifulSoup

crawl_bp = Blueprint('crawl', __name__)

@crawl_bp.route('/crawl', methods=['POST'])
@cross_origin()
def crawl_url():
    """
    Crawl a URL and return structured data
    """
    try:
        data = request.get_json()
        url = data.get('url')
        config = data.get('config', {})
        
        if not url:
            return jsonify({'error': 'URL is required'}), 400
        
        # Start timing
        start_time = time.time()
        
        # Simple web scraping using requests and BeautifulSoup
        # This is a simplified version since crawl4ai setup is complex
        headers = {
            'User-Agent': config.get('userAgent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36')
        }
        
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract title
        title = soup.find('title')
        title_text = title.get_text().strip() if title else 'No title found'
        
        # Extract meta description
        meta_desc = soup.find('meta', attrs={'name': 'description'})
        description = meta_desc.get('content', '') if meta_desc else ''
        
        # Extract all text content
        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()
        
        text_content = soup.get_text()
        lines = (line.strip() for line in text_content.splitlines())
        chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
        text = ' '.join(chunk for chunk in chunks if chunk)
        
        # Extract links
        links = []
        for link in soup.find_all('a', href=True):
            href = link['href']
            link_text = link.get_text().strip()
            if href.startswith('http') or href.startswith('/'):
                links.append({
                    'url': href,
                    'text': link_text
                })
        
        # Extract images
        images = []
        for img in soup.find_all('img', src=True):
            src = img['src']
            alt = img.get('alt', '')
            if src.startswith('http') or src.startswith('/'):
                images.append({
                    'url': src,
                    'alt': alt
                })
        
        # Generate markdown
        markdown_content = f"# {title_text}\\n\\n"
        if description:
            markdown_content += f"{description}\\n\\n"
        
        # Add main content (simplified)
        paragraphs = soup.find_all(['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
        for para in paragraphs[:10]:  # Limit to first 10 paragraphs
            text = para.get_text().strip()
            if text:
                if para.name.startswith('h'):
                    level = int(para.name[1])
                    markdown_content += f"{'#' * level} {text}\\n\\n"
                else:
                    markdown_content += f"{text}\\n\\n"
        
        if links:
            markdown_content += "## Links\\n\\n"
            for link in links[:5]:  # Limit to first 5 links
                markdown_content += f"- [{link['text']}]({link['url']})\\n"
        
        # Calculate metrics
        end_time = time.time()
        crawl_time = f"{end_time - start_time:.1f}s"
        word_count = len(text.split())
        
        result = {
            'success': True,
            'url': url,
            'title': title_text,
            'markdown': markdown_content,
            'extractedData': {
                'title': title_text,
                'description': description,
                'links': [link['url'] for link in links[:10]],
                'images': [img['url'] for img in images[:10]]
            },
            'metadata': {
                'crawlTime': crawl_time,
                'wordCount': word_count,
                'linkCount': len(links),
                'imageCount': len(images)
            }
        }
        
        return jsonify(result)
        
    except requests.RequestException as e:
        return jsonify({
            'success': False,
            'error': f'Failed to fetch URL: {str(e)}'
        }), 400
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'An error occurred: {str(e)}'
        }), 500

@crawl_bp.route('/health', methods=['GET'])
@cross_origin()
def health_check():
    """
    Health check endpoint
    """
    return jsonify({
        'status': 'healthy',
        'service': 'crawl4ai-backend',
        'version': '1.0.0'
    })

