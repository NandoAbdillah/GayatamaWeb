import os
import io
import wave
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from piper import PiperVoice

MODEL_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'piper', 'id_ID-news_tts-medium.onnx')
PORT = int(os.environ.get('PIPER_PORT', 5005))

print(f"[Piper Server] Loading Indonesian voice model from: {MODEL_PATH}")
voice = PiperVoice.load(MODEL_PATH)
print("[Piper Server] Voice model loaded successfully into memory.")

class PiperHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200, content_type='application/json'):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        if self.path == '/info' or self.path == '/':
            info = {
                'status': 'ok',
                'voice': 'id_ID-news_tts-medium',
                'language': 'id_ID',
                'engine': 'Piper TTS (OHF-Voice/piper1-gpl)'
            }
            self._set_headers(200, 'application/json')
            self.wfile.write(json.dumps(info).encode('utf-8'))
        else:
            self._set_headers(404, 'application/json')
            self.wfile.write(json.dumps({'error': 'Not found'}).encode('utf-8'))

    def do_POST(self):
        if self.path == '/synthesize':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            text = ""
            try:
                data = json.loads(body)
                text = data.get('text', '')
            except Exception:
                text = body.strip()

            if not text:
                self._set_headers(400, 'application/json')
                self.wfile.write(json.dumps({'error': 'Missing text parameter'}).encode('utf-8'))
                return

            try:
                wav_buffer = io.BytesIO()
                with wave.open(wav_buffer, 'wb') as wav_file:
                    voice.synthesize_wav(text, wav_file)
                
                audio_data = wav_buffer.getvalue()
                self.send_response(200)
                self.send_header('Content-Type', 'audio/wav')
                self.send_header('Content-Length', str(len(audio_data)))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(audio_data)
            except Exception as e:
                print(f"[Piper Server Error] {e}")
                self._set_headers(500, 'application/json')
                self.wfile.write(json.dumps({'error': str(e)}).encode('utf-8'))
        else:
            self._set_headers(404, 'application/json')
            self.wfile.write(json.dumps({'error': 'Not found'}).encode('utf-8'))

    def log_message(self, format, *args):
        # Concise logging
        pass

def run():
    server_address = ('127.0.0.1', PORT)
    httpd = HTTPServer(server_address, PiperHandler)
    print(f"[Piper Server] Running on http://127.0.0.1:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        httpd.server_close()

if __name__ == '__main__':
    run()
