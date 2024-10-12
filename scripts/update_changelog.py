import os
import re
import subprocess
from datetime import datetime
import semver

def get_latest_version():
    with open('CHANGELOG.md', 'r') as f:
        content = f.read()
    versions = re.findall(r'\[(\d+\.\d+\.\d+)\]', content)
    return max(versions, key=semver.Version.parse) if versions else '0.0.0'

def increment_version(version):
    v = semver.Version.parse(version)
    return str(v.bump_patch())

def get_staged_files():
    result = subprocess.run(['git', 'diff', '--cached', '--name-only'], capture_output=True, text=True)
    return result.stdout.strip().split('\n')

def get_commit_messages():
    result = subprocess.run(['git', 'diff', '--cached', '--format=%s'], capture_output=True, text=True)
    return [line for line in result.stdout.split('\n') if line.strip()]

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

if __name__ == "__main__":
    update_changelog()
