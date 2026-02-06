import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import TaskDetails from './pages/TaskDetails';
import Reminders from './pages/Reminders';
import Completed from './pages/Completed';
import { TaskProvider } from './context/TaskContext';
import { ReminderProvider } from './context/ReminderContext';

function App() {
  return (
    <Router>
      <TaskProvider>
        <ReminderProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/task/:id" element={<TaskDetails />} />
              <Route path="/reminders" element={<Reminders />} />
              <Route path="/completed" element={<Completed />} />
            </Routes>
          </Layout>
        </ReminderProvider>
      </TaskProvider>
    </Router>
  );
}

export default App;
