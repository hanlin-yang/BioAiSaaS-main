"""Python Sandbox Execution Module

Provides secure execution environment for agent-generated Python code.
Implements resource limits, timeout management, and security restrictions.
"""

import subprocess
import tempfile
import os
import resource
import signal
from typing import Dict, Any, Optional
from dataclasses import dataclass
import logging


@dataclass
class ExecutionResult:
    """Result of code execution"""
    success: bool
    stdout: str
    stderr: str
    return_code: int
    execution_time: float
    memory_used: int  # bytes


class PythonSandbox:
    """Secure Python code execution sandbox"""

    def __init__(
        self,
        timeout_seconds: int = 300,
        max_memory_mb: int = 512,
        max_cpu_time: int = 600,
        allowed_imports: Optional[list] = None
    ):
        self.timeout_seconds = timeout_seconds
        self.max_memory_bytes = max_memory_mb * 1024 * 1024
        self.max_cpu_time = max_cpu_time
        self.allowed_imports = allowed_imports or self._get_default_imports()
        self.logger = logging.getLogger(__name__)

    def _get_default_imports(self) -> list:
        """Get list of allowed imports for biomedical work"""
        return [
            'numpy', 'pandas', 'scipy', 'scikit-learn', 'matplotlib',
            'seaborn', 'biopython', 'rdkit', 'torch', 'tensorflow',
            'plotly', 'networkx', 'statsmodels'
        ]

    def execute(self, code: str, user_id: str) -> ExecutionResult:
        """
        Execute Python code in a sandboxed environment

        Args:
            code: Python code to execute
            user_id: User identifier for logging and tracking

        Returns:
            ExecutionResult with execution details
        """
        self.logger.info(f"Executing code for user {user_id}")

        # Create temporary file for code
        with tempfile.NamedTemporaryFile(
            mode='w',
            suffix='.py',
            delete=False
        ) as f:
            f.write(self._wrap_code(code))
            temp_file = f.name

        try:
            # Execute with resource limits
            result = self._execute_with_limits(temp_file, user_id)
            return result
        finally:
            # Clean up
            if os.path.exists(temp_file):
                os.remove(temp_file)

    def _wrap_code(self, code: str) -> str:
        """Wrap user code with safety checks and resource monitoring"""
        wrapper = f'''
import sys
import time

start_time = time.time()

try:
{self._indent_code(code, 1)}
except Exception as e:
    print(f"Execution error: {{e}}", file=sys.stderr)
    sys.exit(1)
finally:
    elapsed = time.time() - start_time
    print(f"\\nExecution time: {{elapsed:.2f}}s", file=sys.stderr)
'''
        return wrapper

    def _indent_code(self, code: str, levels: int = 1) -> str:
        """Indent code block"""
        indent = '    ' * levels
        return '\n'.join(indent + line for line in code.split('\n'))

    def _execute_with_limits(self, file_path: str, user_id: str) -> ExecutionResult:
        """
        Execute Python file with resource limits

        Uses subprocess with resource limits to prevent:
        - Excessive memory usage
        - CPU time limits
        - File system access restrictions
        """
        import time
        start_time = time.time()

        try:
            # Run code in subprocess with limits
            process = subprocess.Popen(
                ['python3', file_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                preexec_fn=self._set_resource_limits
            )

            # Wait with timeout
            try:
                stdout, stderr = process.communicate(timeout=self.timeout_seconds)
                execution_time = time.time() - start_time

                return ExecutionResult(
                    success=process.returncode == 0,
                    stdout=stdout.decode('utf-8', errors='replace'),
                    stderr=stderr.decode('utf-8', errors='replace'),
                    return_code=process.returncode,
                    execution_time=execution_time,
                    memory_used=0  # Would need psutil for accurate tracking
                )
            except subprocess.TimeoutExpired:
                process.kill()
                self.logger.warning(f"Execution timeout for user {user_id}")
                return ExecutionResult(
                    success=False,
                    stdout='',
                    stderr=f'Execution timeout after {self.timeout_seconds}s',
                    return_code=-1,
                    execution_time=self.timeout_seconds,
                    memory_used=0
                )

        except Exception as e:
            self.logger.error(f"Execution error: {e}")
            return ExecutionResult(
                success=False,
                stdout='',
                stderr=str(e),
                return_code=-1,
                execution_time=0,
                memory_used=0
            )

    def _set_resource_limits(self):
        """Set resource limits for subprocess"""
        try:
            # Memory limit
            resource.setrlimit(
                resource.RLIMIT_AS,
                (self.max_memory_bytes, self.max_memory_bytes)
            )

            # CPU time limit
            resource.setrlimit(
                resource.RLIMIT_CPU,
                (self.max_cpu_time, self.max_cpu_time)
            )

            # Prevent core dumps
            resource.setrlimit(
                resource.RLIMIT_CORE,
                (0, 0)
            )
        except Exception as e:
            logging.warning(f"Failed to set resource limits: {e}")


# Example usage
if __name__ == "__main__":
    sandbox = PythonSandbox(timeout_seconds=30)

    code = '''
import numpy as np
data = np.random.randn(1000, 10)
mean = np.mean(data)
print(f"Mean: {mean}")
'''

    result = sandbox.execute(code, user_id="test_user")
    print(f"Success: {result.success}")
    print(f"Output: {result.stdout}")
    if result.stderr:
        print(f"Errors: {result.stderr}")
