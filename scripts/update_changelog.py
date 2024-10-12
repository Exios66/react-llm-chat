import os
import re
import subprocess
from datetime import datetime
import semver
import sys

def get_latest_version():
    try:
        with open('CHANGELOG.md', 'r') as f:
            content = f.read()
        versions = re.findall(r'\[(\d+\.\d+\.\d+)\]', content)
        return max(versions, key=semver.Version.parse) if versions else '0.0.0'
    except Exception as e:
        print(f"Error reading CHANGELOG.md: {str(e)}")
        return '0.0.0'

def increment_version(version):
    try:
        v = semver.Version.parse(version)
        return str(v.bump_patch())
    except Exception as e:
        print(f"Error incrementing version: {str(e)}")
        return '0.0.1'

def get_staged_files():
    try:
        result = subprocess.run(['git', 'diff', '--cached', '--name-only'], capture_output=True, text=True)
        return result.stdout.strip().split('\n')
    except Exception as e:
        print(f"Error getting staged files: {str(e)}")
        return []

def get_commit_messages():
    try:
        result = subprocess.run(['git', 'diff', '--cached', '--format=%s'], capture_output=True, text=True)
        return [line for line in result.stdout.split('\n') if line.strip()]
    except Exception as e:
        print(f"Error getting commit messages: {str(e)}")
        return []

def categorize_changes(files, messages):
    categories = {
        'Added': [],
        'Changed': [],
        'Deprecated': [],
        'Removed': [],
        'Fixed': [],
        'Security': []
    }
    
    for file in files:
        if file.startswith('feat'):
            categories['Added'].append(f"New feature in {file}")
        elif file.startswith('fix'):
            categories['Fixed'].append(f"Bug fix in {file}")
        elif file.startswith('docs'):
            categories['Changed'].append(f"Documentation update in {file}")
        elif file.startswith('style'):
            categories['Changed'].append(f"Code style update in {file}")
        elif file.startswith('refactor'):
            categories['Changed'].append(f"Code refactoring in {file}")
        elif file.startswith('test'):
            categories['Changed'].append(f"Test update in {file}")
        else:
            categories['Changed'].append(f"Changes in {file}")
    
    for message in messages:
        if message.lower().startswith('add'):
            categories['Added'].append(message)
        elif message.lower().startswith(('change', 'update', 'modify')):
            categories['Changed'].append(message)
        elif message.lower().startswith('deprecate'):
            categories['Deprecated'].append(message)
        elif message.lower().startswith('remove'):
            categories['Removed'].append(message)
        elif message.lower().startswith('fix'):
            categories['Fixed'].append(message)
        elif message.lower().startswith('security'):
            categories['Security'].append(message)
        else:
            categories['Changed'].append(message)
    
    return categories

def update_changelog():
    try:
        latest_version = get_latest_version()
        new_version = increment_version(latest_version)
        files = get_staged_files()
        messages = get_commit_messages()
        categories = categorize_changes(files, messages)
        
        with open('CHANGELOG.md', 'r') as f:
            content = f.read()
        
        new_entry = f"\n## [{new_version}] - {datetime.now().strftime('%Y-%m-%d')}\n\n"
        
        for category, changes in categories.items():
            if changes:
                new_entry += f"### {category}\n\n"
                for change in changes:
                    new_entry += f"- {change}\n"
                new_entry += "\n"
        
        updated_content = re.sub(r'(## \[Unreleased\]\n\n)', f'\\1{new_entry}', content)
        
        with open('CHANGELOG.md', 'w') as f:
            f.write(updated_content)
        
        subprocess.run(['git', 'add', 'CHANGELOG.md'])
        print(f"CHANGELOG.md updated with version {new_version}")
        return True
    except Exception as e:
        print(f"Error updating CHANGELOG.md: {str(e)}")
        return False

if __name__ == "__main__":
    success = update_changelog()
    sys.exit(0 if success else 1)
