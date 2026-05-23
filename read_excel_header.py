import pandas as pd
import sys

try:
    # Load the excel file
    file_path = 'docs/rectcsampledata/CTC BILL NOTEBOOK Sample.xlsx'
    # Read the first few rows to find the header
    df = pd.read_excel(file_path, header=None, nrows=10)
    print("First 10 rows raw data to find header:")
    print(df.to_string())
    
    # Attempt to guess header row (usually row with most non-nulls or specific keywords like 'Date', 'LR No')
    # For now, let's just assume row 0 or 1 is header, but printing raw helps.
except Exception as e:
    print(f"Error reading excel: {e}")
