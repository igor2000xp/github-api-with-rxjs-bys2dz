import { fromEvent, from, of } from 'rxjs'; 
import { debounceTime, map, filter, distinctUntilChanged, mergeMap, catchError } from 'rxjs/operators';

const input = document.querySelector('input');
const ul = document.querySelector('ul');

fromEvent(input, 'keyup').pipe(
  debounceTime(700),
  map(event => (event.target as HTMLInputElement).value),
  filter(val => val.length > 2),
  distinctUntilChanged(),
  mergeMap(value => {
    return from(getUsersRepsFromAPI(value)).pipe(
      catchError(err => of([]))
    )
  })
).subscribe({
  next: reps => recordRepsToList(reps)
})

const recordRepsToList = (reps) => {
  for (let i = 0; i < reps.length; i++) {

    // если элемент не существует, то создаем его
    if (!ul.children[i]) {
      const newEl = document.createElement('li');
      ul.appendChild(newEl);
    }

    // записываем название репозитория в элемент
    const li = ul.children[i];
    li.innerHTML = reps[i].name;
  }

  // удаляем оставшиеся элементы
  while (ul.children.length > reps.length) {
    ul.removeChild(ul.lastChild);
  }
}

const getUsersRepsFromAPI = (username) => {
  const url = `https://api.github.com/users/${ username }/repos`;
  return fetch(url)
    .then(response => {
      if(response.ok) {
        return response.json();
      }

      throw new Error('Ошибка');
    });
}