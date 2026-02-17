"""Run all seed scripts for masters.
Run inside backend container:

python /app/app/scripts/seed_all_masters.py
"""
import os
import sys
from subprocess import run

# Ensure project root is on sys.path when running individual scripts
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))

SCRIPTS = [
    os.path.join(os.path.dirname(__file__), 'seed_dr_masters.py'),
    os.path.join(os.path.dirname(__file__), 'seed_users_templates.py'),
]


def main():
    for s in SCRIPTS:
        print(f"Running {s}")
        # Use the same Python executable that launched this script
        res = run([sys.executable, s])
        if res.returncode != 0:
            print(f"Script {s} failed with code {res.returncode}")
            return
    print("All seeding scripts ran successfully.")


if __name__ == "__main__":
    main()
