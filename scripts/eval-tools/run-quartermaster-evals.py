#!/usr/bin/env python3
"""
Quartermaster Eval Adapter
Runs the awesome-llm-apps eval tools against quartermaster's agent skills.
Usage: python3 run-quartermaster-evals.py [agent-name]
"""

import os
import sys
import subprocess
from pathlib import Path

TOOLS_DIR = Path(__file__).parent
SCRIPTS_DIR = TOOLS_DIR.parent
QUARTERMASTER_ROOT = SCRIPTS_DIR.parent
AGENTS_DIR = QUARTERMASTER_ROOT / 'src' / 'lib' / 'agents'
EVALS_DIR = TOOLS_DIR

def get_agent_skills():
    """Discover agent skills from quartermaster's agent registry."""
    # Map quartermaster agents to skill-like structures
    agents = []
    agent_files = AGENTS_DIR.glob('*.ts')
    for f in agent_files:
        if f.name == 'index.ts':
            continue
        agents.append({
            'name': f.stem.replace('-', '_'),
            'path': str(f),
            'type': 'typescript',
        })
    return agents

def run_skill_lint(skill_dir, strict=False):
    """Run skill_lint.py against a skill directory."""
    cmd = [sys.executable, str(EVALS_DIR / 'skill_lint.py'), skill_dir]
    if strict:
        cmd.append('--strict')
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout, result.stderr, result.returncode

def run_skill_scanner(skill_dir):
    """Run skill_scanner.py against a skill directory."""
    cmd = [sys.executable, str(EVALS_DIR / 'skill_scanner.py'), skill_dir]
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.stdout, result.stderr, result.returncode

def main():
    agents = get_agent_skills()
    print(f"Found {len(agents)} agent files in quartermaster")
    
    for agent in agents:
        print(f"\n{'='*60}")
        print(f"Agent: {agent['name']}")
        print(f"{'='*60}")
        
        # Run lint
        stdout, stderr, rc = run_skill_lint(agent['path'])
        if rc == 0:
            print(f"  ✅ Lint: PASS")
        else:
            print(f"  ❌ Lint: FAIL (exit {rc})")
            if stdout:
                print(f"     {stdout[:200]}")
        
        # Run scanner
        stdout, stderr, rc = run_skill_scanner(agent['path'])
        if rc == 0:
            print(f"  ✅ Security: PASS")
        else:
            print(f"  ❌ Security: FAIL (exit {rc})")
            if stdout:
                print(f"     {stdout[:200]}")
    
    print(f"\n{'='*60}")
    print(f"Eval run complete: {len(agents)} agents checked")
    print(f"{'='*60}")

if __name__ == '__main__':
    main()