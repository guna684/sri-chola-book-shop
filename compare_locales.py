import json
import os

def get_keys(obj, prefix=''):
    keys = set()
    if isinstance(obj, dict):
        for k, v in obj.items():
            full_key = f"{prefix}.{k}" if prefix else k
            keys.add(full_key)
            keys.update(get_keys(v, full_key))
    return keys

en_path = r'src\locales\en.json'
ta_path = r'src\locales\ta.json'

if not os.path.exists(en_path):
    # Try absolute path
    en_path = r'd:\book shop project\book shop project\ai-book-nook-main\src\locales\en.json'
    ta_path = r'd:\book shop project\book shop project\ai-book-nook-main\src\locales\ta.json'

with open(en_path, 'r', encoding='utf-8') as f:
    en_data = json.load(f)

with open(ta_path, 'r', encoding='utf-8') as f:
    ta_data = json.load(f)

en_keys_vals = {}
def get_keys_vals(obj, prefix='', target_dict=None):
    if isinstance(obj, dict):
        for k, v in obj.items():
            full_key = f"{prefix}.{k}" if prefix else k
            if isinstance(v, dict):
                get_keys_vals(v, full_key, target_dict)
            else:
                target_dict[full_key] = v

en_kv = {}
get_keys_vals(en_data, '', en_kv)
ta_kv = {}
get_keys_vals(ta_data, '', ta_kv)

print("Possibly untranslated (Tamil value == English value):")
for k, v in en_kv.items():
    if k in ta_kv and ta_kv[k] == v and v and not v.startswith('{{') and not v.isdigit():
        # Exclude common names or short codes if they are likely same
        if len(v) > 3 and not v.isupper():
            print(f"{k}: {v}")
