import json
with open('bill_notebook_gap_analysis.ipynb') as f:
    nb = json.load(f)
for i, cell in enumerate(nb['cells']):
    src = ''.join(cell['source'])
    cid = cell.get("id","?")
    if 'pd.read_excel' in src and 's1' in src:
        print(f'=== Cell {i} (id={cid}) ===')
        print(src[:3000])
        break
