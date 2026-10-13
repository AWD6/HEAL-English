from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from urllib.parse import urlparse, parse_qs, quote
from urllib.request import Request, urlopen

class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith('/google-tts') or self.path.startswith('/translate'):
            q=parse_qs(urlparse(self.path).query)
            tl=q.get('tl',['th'])[0]
            text=q.get('q',[''])[0]
            if self.path.startswith('/translate'):
                sl=q.get('sl',['auto'])[0]
                upstream='https://translate.googleapis.com/translate_a/single?client=gtx&sl='+quote(sl)+'&tl='+quote(tl)+'&dt=t&q='+quote(text)
                content_type='application/json; charset=utf-8'
            else:
                upstream='https://translate.googleapis.com/translate_tts?ie=UTF-8&client=tw-ob&tl='+quote(tl)+'&q='+quote(text)
                content_type='audio/mpeg'
            try:
                req=Request(upstream, headers={'User-Agent':'Mozilla/5.0','Accept':'*/*'})
                with urlopen(req, timeout=20) as r:
                    data=r.read()
                self.send_response(200)
                self.send_header('Content-Type',content_type)
                self.send_header('Content-Length',str(len(data)))
                self.send_header('Cache-Control','no-store')
                self.send_header('Access-Control-Allow-Origin','*')
                self.end_headers(); self.wfile.write(data)
            except Exception:
                self.send_error(502, 'Google service unavailable')
            return
        return super().do_GET()
    def log_message(self, fmt, *args):
        if self.path.startswith('/google-tts'):
            print(fmt % args, flush=True)

if __name__=='__main__':
    ThreadingHTTPServer(('0.0.0.0',4173),Handler).serve_forever()
