import base64, sys  
b = sys.stdin.read()  
exec(base64.b64decode(b.strip()).decode('utf-8'))  
