import json
import os

def get_keys(obj, prefix=''):
    keys = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            keys.extend(get_keys(v, f"{prefix}.{k}" if prefix else k))
    else:
        keys.append(prefix)
    return keys

en_path = r'src\locales\en.json'
ta_path = r'src\locales\ta.json'

with open(en_path, 'r', encoding='utf-8') as f:
    en = json.load(f)

with open(ta_path, 'r', encoding='utf-8') as f:
    ta = json.load(f)

en_keys = set(get_keys(en))
ta_keys = set(get_keys(ta))

missing_in_ta = en_keys - ta_keys

with open('missing_keys.txt', 'w', encoding='utf-8') as f:
    f.write(f"Total keys in EN: {len(en_keys)}\n")
    f.write(f"Total keys in TA: {len(ta_keys)}\n\n")
    if missing_in_ta:
        f.write(f"Missing keys in TA ({len(missing_in_ta)}):\n")
        for k in sorted(missing_in_ta):
            f.write(f" - {k}\n")
    else:
        f.write("No missing keys in TA.\n")

print("Done")
