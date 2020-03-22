// LS = LocalStorage

// Variables
let addTaskForm = document.querySelector('.add-task-form');
let addTaskBtn = document.querySelector('.add-task-btn');
let addTaskModal = document.querySelector('.app-add-task-modal');
let tasksList = document.querySelector(".tasks-list");

// Event Listeners
addTaskForm.addEventListener("submit", function () {
  let ID = IDGenerator();
  let taskText = addTaskForm.querySelector('#add-task-text').value;
  let taskDate = addTaskForm.querySelector('#add-task-date').value;

  this.reset();
  addTaskModal.classList.remove('active');

  addTask(taskText, ID, taskDate, false);
  addTaskLS(taskText, ID, taskDate)
})

tasksList.addEventListener("click", function (e) {

  let tasksItem = e.target.closest(".tasks-list__item");
  let ID = (tasksItem) ? tasksItem.dataset.id : null;

  if (e.target.classList.contains("tasks-list__item-state")) {

    let tasksDay = e.target.closest(".tasks-list__day");

    tasksItem.classList.toggle('tasks-list__item--done')

    isDayDone(tasksDay);
    setDoneLS(tasksItem.dataset.id, e.target.checked)
  }

  if (e.target.closest(".tasks-list__item-tool--rename")) {
    let taskText = tasksItem.querySelector(".tasks-list__item-text");
    let taskRenameBtn = e.target.closest(".tasks-list__item-tool--rename");

    if (taskRenameBtn.classList.contains("active")) {
      taskText.removeAttribute("contenteditable")
      renameTask(ID, taskText.textContent)
    } else {
      taskText.setAttribute("contenteditable", true)
    }

    setEndOfContenteditable(taskText);

    taskRenameBtn.classList.toggle("active")
  }

  if (e.target.closest(".tasks-list__item-tool--remove")) {
    // Если у дня больше нет тасков, удалить день также
    // 2 элемента это дата и последний таск который будет удален
    if (tasksItem.parentElement.children.length == 2) {
      tasksItem.parentElement.remove()
    }

    tasksItem.remove();
    removeTaskLS(ID);
  }

})

addTaskBtn.addEventListener("click", function () {
  addTaskModal.classList.add('active');
})

addTaskModal.addEventListener("click", function (e) {
  if (e.target.closest(".modal-close")) {
    addTaskModal.classList.remove('active');
  }
})

document.addEventListener("DOMContentLoaded", loadTasks)

// Functions

function IDGenerator() {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return '_' + Math.random().toString(36).substr(2, 9);
};

function createListItem(taskText, ID, isDone) {
  // List item
  let listItem = document.createElement("div");
  listItem.classList.add("tasks-list__item");
  listItem.setAttribute("data-id", ID);

  if (isDone) listItem.classList.add("tasks-list__item--done")

  listItem.innerHTML = `
    <input class="custom-checkbox tasks-list__item-state" ${(isDone) ? "checked" : ''}  id='${ID}' type="checkbox">
    <label class="custom-checkbox-label tasks-list__item-text" for="${ID}">${taskText}</label>

    <div class="tasks-list__item-tools">
      <button class="tasks-list__item-tool tasks-list__item-tool--rename">
        <svg class="icon-rename">
          <use xlink:href="img/sprite.svg#rename"></use>
        </svg>
        <svg class="icon-done">
          <use xlink:href="img/sprite.svg#done"></use>
        </svg>
      </button>
      <button class="tasks-list__item-tool tasks-list__item-tool--remove">
        <svg class="icon-trash">
          <use xlink:href="img/sprite.svg#trash"></use>
        </svg>
      </button>
    </div>
  `

  return listItem
}

function addTask(taskText, ID, taskDate, isDone) {
  let tasksDay = tasksList.querySelector(`[data-date="${taskDate}"]`);

  if (tasksDay) {
    tasksDay.appendChild(createListItem(taskText, ID, isDone))
  } else {
    // Создаем день для тасков
    let tasksDay = document.createElement("div");
    tasksDay.classList.add('tasks-list__day')
    tasksDay.dataset.date = taskDate;

    let tasksDays = document.querySelectorAll(".tasks-list__day");

    // Создаем дату для дня тасков
    let tasksDaysDate = document.createElement("span");
    tasksDaysDate.classList.add('tasks-list__day-date');
    tasksDaysDate.textContent = new Date(taskDate).toLocaleString(undefined, {
      weekday: 'long', month: 'long', day: 'numeric'
    })

    tasksDay.appendChild(tasksDaysDate)
    tasksDay.appendChild(createListItem(taskText, ID, isDone))

    // Цикл нужен для добавления элементов по порядку (сортировка по дате)

    for (let i = tasksDays.length; i > 0; i--) {
      let isLater = new Date(tasksDays[i - 1].dataset.date) < new Date(taskDate);

      if (isLater || (i == 1)) {
        let refChild = (!isLater && i == 1) ? tasksDays[i - 1] : tasksDays[i - 1].nextSibling;

        tasksList.insertBefore(tasksDay, refChild)

        return;
      }

    }

    // Return in loop
    tasksList.appendChild(tasksDay);

  }


}

function addTaskLS(taskText, ID, taskDate) {
  let tasks = getTasksFromLS();

  tasks.push({
    id: ID,
    text: taskText,
    date: taskDate,
    isDone: false
  })

  localStorage.setItem('tasks', JSON.stringify(tasks))
}

function removeTaskLS(ID) {
  let tasks = getTasksFromLS();

  tasks.find(function (item, index) {
    return (item.id == ID) ? tasks.splice(index, 1) : false;
  })

  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function getTasksFromLS() {
  return JSON.parse(localStorage.getItem('tasks')) || [];
}

function setDoneLS(ID, isDone) {
  let tasks = getTasksFromLS();

  tasks.find(function (item, index) {
    return (item.id == ID) ? (tasks[index].isDone = isDone) : false;
  })

  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function isDayDone(tasksDay) {
  if (!tasksDay.querySelectorAll(".tasks-list__item:not( .tasks-list__item--done )").length) {
    tasksDay.classList.add("tasks-list__day--done")
  } else {
    tasksDay.classList.remove("tasks-list__day--done")
  }
}

function renameTask(ID, taskText) {
  let tasks = getTasksFromLS();

  tasks.find(function (item, index) {
    return (item.id == ID) ? tasks[index].text = taskText : false;
  })

  localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
  let tasks = getTasksFromLS();
  // tasks.sort((a, b) => new Date(a.date) - new Date(b.date))  

  for (let task of tasks) {
    addTask(task.text, task.id, task.date, task.isDone)
  }

  let tasksDays = document.querySelectorAll(".tasks-list__day");

  tasksDays.forEach(taskDay => {
    isDayDone(taskDay)
  });

}

// Help Functions

function setEndOfContenteditable(contentEditableElement) {
  var range, selection;
  if (document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
  {
    range = document.createRange();//Create a range (a range is a like the selection but invisible)
    range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
    range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
    selection = window.getSelection();//get the selection object (allows you to change selection)
    selection.removeAllRanges();//remove any selections already made
    selection.addRange(range);//make the range you have just created the visible selection
  }
  else if (document.selection)//IE 8 and lower
  {
    range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
    range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
    range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
    range.select();//Select the range (make it the visible selection
  }
}