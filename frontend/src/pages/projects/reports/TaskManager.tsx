import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../../api/axios";
import "../projects.css";
export default function TaskManager() {
  const { projectId } = useParams();

  const [tasks, setTasks] = useState<any[]>([]);
  const [title, setTitle] = useState("");

  // Load tasks
  useEffect(() => {
    load();
  }, [projectId]);

  const load = async () => {
    const res = await api.get(`/task/project/${projectId}`);
    setTasks(res.data);
  };

  // Add task
  const addTask = async () => {
    if (!title) return;

    await api.post("/task", {
      projectId,
      title,
      status: "PENDING",
      priority: "NORMAL",
    });

    setTitle("");
    load();
  };

  // Update status
  const toggle = async (task: any) => {
    await api.patch(`/task/${task.id}`, {
      status: task.status === "DONE" ? "PENDING" : "DONE",
    });

    load();
  };

  // Delete
  const remove = async (id: string) => {
    await api.delete(`/task/${id}`);
    load();
  };

  return (
    <div className="card">
      <h4>✅ Task Manager</h4>

      {/* Add Task */}

      <div className="task-input">
        <input
          placeholder="New task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <button onClick={addTask}>Add</button>
      </div>

      {/* Task List */}

      {tasks.map((t) => (
        <div key={t.id} className="task-row">
          <span
            style={{
              textDecoration: t.status === "DONE" ? "line-through" : "none",
            }}
          >
            {t.title}
          </span>

          <div>
            <button onClick={() => toggle(t)}>✔</button>

            <button onClick={() => remove(t.id)}>❌</button>
          </div>
        </div>
      ))}
    </div>
  );
}
