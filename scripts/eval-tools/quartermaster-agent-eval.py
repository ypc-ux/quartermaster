#!/usr/bin/env python3
"""
Quartermaster Agent Eval — adapted from awesome-llm-apps eval tools
Checks quartermaster's TypeScript agents against quality criteria.
Usage: python3 quartermaster-agent-eval.py
"""

import os
import sys
import re
from pathlib import Path

AGENTS_DIR = Path(__file__).parent.parent.parent / 'src' / 'lib' / 'agents'

def check_agent_file(filepath):
    """Check a TypeScript agent file against quality criteria."""
    issues = []
    content = filepath.read_text()
    name = filepath.stem

    # 1. File exists and has content
    if len(content) < 50:
        issues.append(('ERROR', 'File too short (<50 chars)'))

    # 2. Has exports
    if 'export' not in content:
        issues.append(('WARN', 'No exports found'))

    # 3. Has description/comments
    if '/*' not in content and '//' not in content:
        issues.append(('WARN', 'No comments/documentation'))

    # 4. No hardcoded secrets
    secret_patterns = [r'["\']sk-[a-zA-Z0-9]{20,}', r'["\']sk-ant-[a-zA-Z0-9]{20,}',
                       r'api_key\s*=\s*["\'][^"\']{10,}', r'password\s*=\s*["\'][^"\']{6,}']
    for pat in secret_patterns:
        if re.search(pat, content, re.IGNORECASE):
            issues.append(('CRITICAL', f'Possible hardcoded secret: {pat[:30]}...'))

    # 5. Has function definitions
    if 'function ' not in content and '=>' not in content:
        issues.append(('WARN', 'No function definitions found'))

    # 6. Reasonable size (< 500 lines is healthy for an agent)
    lines = content.count('\n') + 1
    if lines > 500:
        issues.append(('WARN', f'Large file ({lines} lines) — consider splitting'))
    elif lines < 20:
        issues.append(('WARN', f'Small file ({lines} lines) — might be incomplete'))

    return issues

def main():
    if not AGENTS_DIR.exists():
        print(f"❌ Agents directory not found: {AGENTS_DIR}")
        return 1

    agent_files = [f for f in AGENTS_DIR.glob('*.ts') if f.name != 'index.ts']
    print(f"Found {len(agent_files)} agent files in quartermaster\n")

    total_issues = 0
    for f in sorted(agent_files):
        issues = check_agent_file(f)
        status = '✅' if not issues else ('⚠️' if all(i[0] != 'CRITICAL' for i in issues) else '❌')
        print(f"{status} {f.stem}: {len(issues)} issues")
        for severity, msg in issues:
            print(f"   {severity}: {msg}")
            total_issues += 1

    print(f"\n{'='*60}")
    print(f"Eval complete: {len(agent_files)} agents, {total_issues} total issues")
    print(f"{'='*60}")
    return 0 if total_issues == 0 else 1

if __name__ == '__main__':
    sys.exit(main())