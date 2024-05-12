import JSConfetti from "js-confetti";

const confetti = new JSConfetti();

export function Celebrate(taskNum, completedNum) {
  if (completedNum == taskNum) {
    confetti.addConfetti();
  }
}

export function countComplete(tasks) {
  let completed = 0;

  tasks.forEach((task) => {
    if (task.complete) {
      completed += 1;
    }
  });

  return completed;
}
