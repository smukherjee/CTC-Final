from ..models.lr import create_tables

if __name__ == '__main__':
    print('Creating lrs table (if not exists)')
    create_tables()
    print('Done')
