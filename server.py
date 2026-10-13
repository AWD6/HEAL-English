from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs, quote
from urllib.request import Request, urlopen

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/translate'):
            q=parse_qs(urlparse(self.path).query)
            sl=q.get('sl',['auto'])[0]
            tl=q.get('tl',['th'])[0]
            text=q.get('q',[''])[0]
            upstream=('https://translate.googleapis.com/translate_a/single?client=gtx&dt=t'
                       '&sl='+quote(sl)+'&tl='+quote(tl)+'&q='+quote(text))
            try:
                req=Request(upstream, headers={'User-Agent':'Mozilla/5.0','Accept':'application/json'})
                with urlopen(req, timeout=15) as r:
                    data=r.read()
                self.send_response(200)
                self.send_header('Content-Type','application/json; charset=utf-8')
                self.send_header('Content-Length',str(len(data)))
                self.send_header('Cache-Control','no-store')
                self.send_header('Access-Control-Allow-Origin','*')
                self.end_headers(); self.wfile.write(data)
            except Exception:
                self.send_error(502, 'Google Translate unavailable')
            return
        if self.path.startswith('/google-tts'):
            q=parse_qs(urlparse(self.path).query)
            tl=q.get('tl',['th'])[0]
            text=q.get('q',[''])[0]
            upstream='https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl='+quote(tl)+'&q='+quote(text)
            try:
                req=Request(upstream, headers={'User-Agent':'Mozilla/5.0'})
                with urlopen(req, timeout=20) as r:
                    data=r.read()
                self.send_response(200)
                self.send_header('Content-Type','audio/mpeg')
                self.send_header('Content-Length',str(len(data)))
                self.send_header('Cache-Control','no-store')
                self.end_headers(); self.wfile.write(data)
            except Exception as e:
                self.send_error(502, 'Google TTS unavailable')
            return
        return super().do_GET()
    def log_message(self, fmt, *args):
        if self.path.startswith('/translate') or self.path.startswith('/google-tts'):
            print(fmt % args, flush=True)

if __name__=='__main__':
    ThreadingHTTPServer(('0.0.0.0',4173),Handler).serve_forever()
