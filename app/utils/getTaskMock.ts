export function getTaskMock(): Task[] {
  return [
    {
      id: 'task-1',
      title: 'Подготовка к недельному спринту',
      status: 'saved',
      list: [
        { id: 'tp-1-1', title: 'Провести ревью бэклога', checked: true },
        { id: 'tp-1-2', title: 'Сформировать цели спринта', checked: true },
        {
          id: 'tp-1-3',
          title: 'Распределить задачи по команде',
          checked: false,
        },
      ],
    },
    {
      id: 'task-2',
      title: 'Запуск рекламной кампании',
      status: 'saved',
      list: [
        {
          id: 'tp-2-1',
          title: 'Согласовать бюджет с финдиректором',
          checked: true,
        },
        {
          id: 'tp-2-2',
          title: 'Утвердить баннеры у дизайнера',
          checked: false,
        },
        {
          id: 'tp-2-3',
          title: 'Настроить таргетинг в личном кабинете',
          checked: false,
        },
        { id: 'tp-2-4', title: 'Запустить тестовый показ', checked: false },
      ],
    },
    {
      id: 'task-3',
      title: 'Обновление документации проекта',
      status: 'saved',
      list: [
        {
          id: 'tp-3-1',
          title: 'Дописать README.md для нового модуля',
          checked: true,
        },
        {
          id: 'tp-3-2',
          title: 'Обновить схему базы данных в Miro',
          checked: true,
        },
      ],
    },
  ];
}
