# Append one pass to portrait.json:  python addmark.py '{"dir":"down","a":0.2,"b":0.3,...}'
import json, sys
p = json.load(open('portrait.json', encoding='utf8'))
p['marks'].append(json.loads(sys.argv[1]))
json.dump(p, open('portrait.json', 'w', encoding='utf8'), indent=1)
print('round', len(p['marks']))
