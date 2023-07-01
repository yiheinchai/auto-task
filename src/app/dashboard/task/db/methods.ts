import { addManyDbTask, getDbTasks, updateDbTask } from "@/utils/database";
import { convertDbTaskToTask } from "../utils/utils";
import { tOpenaiMessage, tTask, tTaskCreationForm } from "../lib/types";
import { call_gpt } from "@/external_api/openai";

export async function getTasks() {
  const tasks = await getDbTasks();
  const hierarchicalTasks = convertDbTaskToTask(tasks);
  return hierarchicalTasks;
}

function extractListItems(text: string) {
  const pattern = /\d+\.\s+(.*)/g;
  const matches = text.match(pattern);

  if (matches) {
    const items = matches.map((match) => match.replace(/\d+\.\s+/, ""));
    return items;
  }

  return [];
}

export async function executeGPTTask(task: tTask) {
  const prompt = `Task: ${task.name}`;
  const response = await call_gpt(prompt);
  const newChatHistory = [
    ...(task.chat_history || []),
    { role: "user", content: prompt },
    { role: "system", content: response },
  ];

  const updatedTask = await updateDbTask({
    id: task.id,
    execution_result: response,
    status: "DONE",
  });

  return updatedTask;
}

export async function generateGPTSubtasks(task: tTask) {
  const prompt = `Task: ${task.name}
  Description: ${task.description}
  
  What are the steps that needs to be taken?
  `;
  const response = await call_gpt(prompt);
  const newChatHistory = [
    ...(task.chat_history || []),
    { role: "user", content: prompt },
    { role: "system", content: response },
  ];
  const subtaskNamesAndDesc = extractListItems(response);
  const subtasks: tTaskCreationForm[] = subtaskNamesAndDesc.map((namesAndDesc) => {
    const [name, ...description] = namesAndDesc.split(":");
    return {
      name,
      parentId: task.id,
      description: description.join(" "),
      chat_history: newChatHistory as tOpenaiMessage[],
    };
  });
  const createdSubtasks = addManyDbTask(subtasks);

  return createdSubtasks;
}
