"""Agent Orchestrator Module

Provides intelligent orchestration for multi-agent workflows using Swarm architecture.
Manages coordination, task distribution, and state management across agents.
"""

import asyncio
import logging
from typing import Dict, List, Any, Optional, Callable
from dataclasses import dataclass, field
from enum import Enum
import json
from datetime import datetime


class AgentRole(Enum):
    """Available agent roles in the swarm"""
    COORDINATOR = "coordinator"
    RESEARCHER = "researcher"
    ANALYST = "analyst"
    EXECUTOR = "executor"
    VALIDATOR = "validator"


class TaskStatus(Enum):
    """Task execution status"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


@dataclass
class AgentTask:
    """Represents a task to be executed by an agent"""
    task_id: str
    role: AgentRole
    description: str
    dependencies: List[str] = field(default_factory=list)
    status: TaskStatus = TaskStatus.PENDING
    result: Optional[Any] = None
    error: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.now)
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


@dataclass
class SwarmState:
    """Global state shared across the agent swarm"""
    user_id: str
    session_id: str
    context: Dict[str, Any] = field(default_factory=dict)
    completed_tasks: List[str] = field(default_factory=list)
    active_agents: Dict[str, Any] = field(default_factory=dict)


class AgentOrchestrator:
    """Orchestrates multi-agent workflows using Swarm architecture"""

    def __init__(self, user_id: str, session_id: str, max_parallel_agents: int = 5):
        self.user_id = user_id
        self.session_id = session_id
        self.max_parallel_agents = max_parallel_agents
        self.state = SwarmState(user_id=user_id, session_id=session_id)
        self.task_queue: List[AgentTask] = []
        self.logger = logging.getLogger(__name__)

    async def orchestrate(self, main_task: str, subtasks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Orchestrate a multi-agent workflow

        Args:
            main_task: High-level description of the main task
            subtasks: List of subtask specifications

        Returns:
            Dictionary containing orchestration results and metadata
        """
        self.logger.info(f"Starting orchestration for user {self.user_id}")

        # Create task graph
        tasks = self._create_task_graph(subtasks)

        # Execute tasks with dependency management
        results = await self._execute_task_graph(tasks)

        # Compile final result
        return {
            "main_task": main_task,
            "status": "completed",
            "results": results,
            "metadata": {
                "total_tasks": len(tasks),
                "completed_tasks": len([t for t in tasks if t.status == TaskStatus.COMPLETED]),
                "failed_tasks": len([t for t in tasks if t.status == TaskStatus.FAILED]),
                "session_id": self.session_id
            }
        }

    def _create_task_graph(self, subtasks: List[Dict[str, Any]]) -> List[AgentTask]:
        """Create a dependency graph of tasks"""
        tasks = []
        for i, subtask in enumerate(subtasks):
            task = AgentTask(
                task_id=f"task_{i}_{self.session_id}",
                role=AgentRole(subtask.get("role", "executor")),
                description=subtask["description"],
                dependencies=subtask.get("dependencies", [])
            )
            tasks.append(task)
        return tasks

    async def _execute_task_graph(self, tasks: List[AgentTask]) -> Dict[str, Any]:
        """Execute tasks respecting dependencies and parallelism constraints"""
        results = {}
        pending_tasks = tasks.copy()

        while pending_tasks:
            # Find tasks ready to execute (no pending dependencies)
            ready_tasks = [
                t for t in pending_tasks
                if all(dep in self.state.completed_tasks for dep in t.dependencies)
            ]

            if not ready_tasks:
                # Check for circular dependencies
                self.logger.error("Circular dependency detected or no ready tasks")
                break

            # Execute ready tasks in parallel (respecting max_parallel_agents)
            batch_size = min(len(ready_tasks), self.max_parallel_agents)
            batch = ready_tasks[:batch_size]

            batch_results = await asyncio.gather(
                *[self._execute_single_task(task) for task in batch],
                return_exceptions=True
            )

            # Update results and state
            for task, result in zip(batch, batch_results):
                if isinstance(result, Exception):
                    task.status = TaskStatus.FAILED
                    task.error = str(result)
                    self.logger.error(f"Task {task.task_id} failed: {result}")
                else:
                    task.status = TaskStatus.COMPLETED
                    task.result = result
                    self.state.completed_tasks.append(task.task_id)

                task.completed_at = datetime.now()
                results[task.task_id] = {
                    "status": task.status.value,
                    "result": task.result,
                    "error": task.error
                }

                pending_tasks.remove(task)

        return results

    async def _execute_single_task(self, task: AgentTask) -> Any:
        """
        Execute a single task

        This is a placeholder - in production, this would:
        - Initialize the appropriate agent based on role
        - Execute the task in a Python sandbox
        - Track resource usage and costs
        """
        task.status = TaskStatus.IN_PROGRESS
        task.started_at = datetime.now()

        self.logger.info(f"Executing task {task.task_id} with role {task.role.value}")

        # Simulate task execution
        await asyncio.sleep(0.1)  # Replace with actual agent execution

        # Return mock result
        return {
            "task_id": task.task_id,
            "output": f"Task {task.description} completed by {task.role.value}"
        }

    def get_swarm_status(self) -> Dict[str, Any]:
        """Get current status of the agent swarm"""
        return {
            "user_id": self.user_id,
            "session_id": self.session_id,
            "active_agents": list(self.state.active_agents.keys()),
            "completed_tasks": len(self.state.completed_tasks),
            "pending_tasks": len([t for t in self.task_queue if t.status == TaskStatus.PENDING])
        }


# Example usage
if __name__ == "__main__":
    async def demo():
        orchestrator = AgentOrchestrator(
            user_id="user_123",
            session_id="session_456"
        )

        subtasks = [
            {
                "role": "researcher",
                "description": "Gather biomedical literature on target protein",
                "dependencies": []
            },
            {
                "role": "analyst",
                "description": "Analyze protein structure and binding sites",
                "dependencies": ["task_0_session_456"]
            },
            {
                "role": "executor",
                "description": "Run molecular dynamics simulation",
                "dependencies": ["task_1_session_456"]
            }
        ]

        result = await orchestrator.orchestrate(
            main_task="Design inhibitor for target protein",
            subtasks=subtasks
        )

        print(json.dumps(result, indent=2, default=str))

    asyncio.run(demo())
