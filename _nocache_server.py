#!/usr/bin/env python3
"""Local preview server that disables all caching, so edits always show up
on the next reload without needing cache-busting query strings or manual
hard-refreshes. Cove内部の確認用途のみ、納品物には含めない。"""
import http.server
import sys

class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8952
    http.server.test(HandlerClass=NoCacheHandler, port=port)
