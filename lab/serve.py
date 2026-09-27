# Local server for the gallery: serves claude_art/ and lets lab/thumbs.html save stills.
#   python lab/serve.py            (from claude_art/)  ->  http://localhost:8731/
# POST /save?name=<file>.jpg  with the image bytes as body  ->  writes thumbs/<file>.jpg
import http.server, os, re, sys, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
THUMBS = os.path.join(ROOT, 'thumbs')

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=ROOT, **kw)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')          # revalidate, so edits show but unchanged files come from cache
        super().end_headers()

    def do_POST(self):
        url = urllib.parse.urlparse(self.path)
        name = urllib.parse.parse_qs(url.query).get('name', [''])[0]
        if url.path != '/save' or not re.fullmatch(r'[a-z0-9-]+\.jpg', name):
            self.send_error(400); return
        os.makedirs(THUMBS, exist_ok=True)
        data = self.rfile.read(int(self.headers.get('Content-Length', 0)))
        with open(os.path.join(THUMBS, name), 'wb') as f: f.write(data)
        self.send_response(204); self.end_headers()

port = int(sys.argv[1]) if len(sys.argv) > 1 else 8731
http.server.ThreadingHTTPServer(('127.0.0.1', port), Handler).serve_forever()
