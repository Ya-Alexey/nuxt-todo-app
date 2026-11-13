interface TaskPoint {
  id: string;
  title: string;
  checked: boolean;
}

interface Task {
  id: string;
  title: string;
  status: 'draft' | 'saved';
  createdAt: string;
  updatedAt: string;
  list: TaskPoint[];
}
