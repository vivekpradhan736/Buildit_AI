const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash-exp",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "text/plain",
  };

  const CodeGenerationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };
  

    export const chatSession = model.startChat({
      generationConfig,
      history: [
      ],
    });

    export const GenAiCode=model.startChat({
     generationConfig:CodeGenerationConfig,
     history: [
      {
        role: "user",
        parts: [
          {text: "generate to do app:Generate a Project in React. Create multiple components, organizing them in separate folders with filenames using the .js extension, if needed. The output should use Tailwind CSS for styling, \nwithout any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary. Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from \"lucide-react\" and use it in JSX as <Heart className=\"\" />.\nalso you can use date-fns for date format and react-chartjs-2 chart, graph library\n\nReturn the response in JSON format with the following schema:\n{\n  \"projectTitle\": \"\",\n  \"explanation\": \"\",\n  \"files\": {\n    \"/App.js\": {\n      \"code\": \"\"\n    },\n    ...\n  },\n  \"generatedFiles\": []\n}\n\nHere’s the reformatted and improved version of your prompt:\n\nGenerate a programming code structure for a React project using Vite. Create multiple components, organizing them in separate folders with filenames using the .js extension, if needed. The output should use Tailwind CSS for styling, without any third-party dependencies or libraries, except for icons from the lucide-react library, which should only be used when necessary. Available icons include: Heart, Shield, Clock, Users, Play, Home, Search, Menu, User, Settings, Mail, Bell, Calendar, Star, Upload, Download, Trash, Edit, Plus, Minus, Check, X, and ArrowRight. For example, you can import an icon as import { Heart } from \"lucide-react\" and use it in JSX as <Heart className=\"\" />.\n\nReturn the response in JSON format with the following schema:\n\njson\nCopy code\n{\n  \"projectTitle\": \"\",\n  \"explanation\": \"\",\n  \"files\": {\n    \"/App.js\": {\n      \"code\": \"\"\n    },\n    ...\n  },\n  \"generatedFiles\": []\n}\nEnsure the files field contains all created files, and the generatedFiles field lists all the filenames. Each file's code should be included in the code field, following this example:\nfiles:{\n  \"/App.js\": {\n    \"code\": \"import React from 'react';\\nimport './styles.css';\\nexport default function App() {\\n  return (\\n    <div className='p-4 bg-gray-100 text-center'>\\n      <h1 className='text-2xl font-bold text-blue-500'>Hello, Tailwind CSS with Sandpack!</h1>\\n      <p className='mt-2 text-gray-700'>This is a live code editor.</p>\\n    </div>\\n  );\\n}\"\n  }\n}\n  Additionally, include an explanation of the project's structure, purpose, and functionality in the explanation field. Make the response concise and clear in one paragraph.\n  - When asked then only use this package to import, here are some packages available to import and use (date-fns,react-chartjs-2,\"firebase\",\"@google/generative-ai\" ) only when it required\n  \n  - For placeholder images, please use a https://archive.org/download/placeholder-image/placeholder-image.jpg\n  -Add Emoji icons whenever needed to give good user experinence\n  - all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.\n\n- By default, this template supports JSX syntax with Tailwind CSS classes, React hooks, and Lucide React for icons. Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.\n\n- Use icons from lucide-react for logos.\n\n- Use stock photos from unsplash where appropriate, only valid URLs you know exist. Do not download the images, only link to them in image tags.\n  "},
        ],
      },
      {
        role: "model",
        parts: [
          {text: "```json\n{\n  \"projectTitle\": \"To-Do App\",\n  \"explanation\": \"This React project implements a basic to-do list application using Vite, Tailwind CSS for styling, and Lucide React icons for visual elements. The application features a list of tasks, allowing users to add, mark as complete, and delete tasks.  The application uses date-fns for date formatting and React-chartjs-2 for potential future graphical visualization of task completion rates. The structure includes components like a TaskList, TaskForm, and TaskCard for managing and presenting tasks. Icons are used for UI elements like add, delete, and mark complete. The project is designed to be responsive and user-friendly, following a modern aesthetic with appropriate use of emoji for enhancing user experience. Image placeholders are used wherever needed.\",\n  \"files\": {\n    \"/App.js\": {\n      \"code\": \"import React, { useState } from 'react';\\nimport TaskList from './components/TaskList';\\nimport TaskForm from './components/TaskForm';\\nimport { Users } from 'lucide-react';\\n\\nfunction App() { \\n  const [tasks, setTasks] = useState([]);\\n\\n  const addTask = (newTask) => {\\n    setTasks([...tasks, { id: Date.now(), title: newTask, completed: false }]);\\n  };\\n\\n  const toggleComplete = (id) => {\\n    setTasks(tasks.map(task => task.id === id ? { ...task, completed: !task.completed } : task));\\n  };\\n\\n  const deleteTask = (id) => {\\n    setTasks(tasks.filter(task => task.id !== id));\\n  };\\n\\n  return (\\n    <div className=\\\"min-h-screen bg-gray-100 flex flex-col items-center justify-center p-8\\\">\\n      <h1 className=\\\"text-3xl font-bold text-blue-600 mb-6\\\"><span role=\\\"img\\\" aria-label=\\\"To-do\\\">✨</span> My To-Do List</h1>\\n      <div className=\\\"bg-white shadow-md rounded-lg p-6 w-full max-w-lg\\\">\\n          <TaskForm addTask={addTask} />\\n          <TaskList tasks={tasks} toggleComplete={toggleComplete} deleteTask={deleteTask}/>\\n      </div>\\n\\n    </div>\\n  );\\n}\\n\\nexport default App;\\n\"\n    },\n    \"/components/TaskForm.js\": {\n      \"code\": \"import React, { useState } from 'react';\\nimport { Plus } from 'lucide-react'; // Import the Plus icon\\n\\nfunction TaskForm({ addTask }) {\\n  const [newTask, setNewTask] = useState('');\\n\\n  const handleSubmit = (e) => {\\n    e.preventDefault();\\n    if (newTask.trim() !== '') {\\n      addTask(newTask);\\n      setNewTask('');\\n    }\\n  };\\n\\n  return (\\n    <form onSubmit={handleSubmit} className=\\\"mb-4\\\">\\n      <div className=\\\"flex items-center\\\">\\n        <input type=\\\"text\\\" value={newTask} onChange={(e) => setNewTask(e.target.value)} placeholder=\\\"Add a new task...\\\" className=\\\"px-4 py-2 border rounded-l-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500\\\"/>\\n        <button type=\\\"submit\\\" className=\\\"px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg\\\"><Plus className=\\\"h-5 w-5 mr-2\\\" /></button>\\n      </div>\\n    </form>\\n  );\\n}\\n\\nexport default TaskForm;\\n\"\n    },\n     \"/components/TaskList.js\": {\n      \"code\": \"import React from 'react';\\nimport { Check, X, Clock } from 'lucide-react';\\n\\nfunction TaskList({ tasks, toggleComplete, deleteTask }) {\\n\\n  return (\\n    <ul className=\\\"list-none mt-4\\\">\\n      {tasks.map(task => (\\n        <li key={task.id} className=\\\"flex items-center justify-between bg-white p-4 border border-gray-200 rounded-lg mb-2\\\">\\n          <div className=\\\"flex items-center\\\">\\n            <input type=\\\"checkbox\\\" checked={task.completed} onChange={() => toggleComplete(task.id)} className=\\\"mr-2 rounded-md h-5 w-5 text-blue-600 focus:ring-2 focus:ring-blue-500\\\" />\\n            <span className={task.completed ? 'line-through' : ''}>{task.title}</span>\\n          </div>\\n          <div className=\\\"flex space-x-2\\\">\\n            <button onClick={() => deleteTask(task.id)} className=\\\"text-red-500 hover:text-red-700 focus:outline-none\\\">{<X className=\\\"h-4 w-4\\\" />}</button>\\n            <p className=\\\"text-gray-500\\\">{new Date(task.id).toLocaleString()}</p>\\n          </div>\\n        </li>\\n      ))}\\n    </ul>\\n  );\\n}\\n\\nexport default TaskList;\\n\"\n    },\n    \"/styles.css\": {\n      \"code\": \"\"\n    }\n  },\n  \"generatedFiles\": [\n    \"/App.js\",\n    \"/components/TaskForm.js\",\n    \"/components/TaskList.js\",\n    \"/styles.css\"\n  ]\n}\n```"},
        ],
      },
    ],
    })
  
   // const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    //console.log(result.response.text());
  
  
