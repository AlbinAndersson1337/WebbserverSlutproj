document.addEventListener('DOMContentLoaded', (event) => {
  let selectedTodoID = null;

  const todoLists = document.querySelectorAll('.list-item');
  todoLists.forEach(div => {
    div.addEventListener('click', function() {
      // Deselect all other items
      todoLists.forEach(otherDiv => {
        otherDiv.style.backgroundColor = ""; 
      });

      // Highlight the selected item
      this.style.backgroundColor = "red"; 

      // Save the selected list ID
      selectedTodoID = this.querySelector('.divID').textContent.trim();
    });
  });

  const deleteButton = document.querySelector('.btn-delete');

  deleteButton.addEventListener('click', function() {
    //Om en todo är vald så skickas den till backend för att tas bort
    if (selectedTodoID) {
      console.log("clicked", selectedTodoID)
      //Inställningar för hur den ska skickas
        const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({listID: selectedTodoID})
        };
        fetch('/delete', options)
            .then(response => {
                if (response.ok) {
                    location.reload();
                } else {
                    throw new Error('Failed to send data');
                }
            })
    }
});
});
  const myListContainer = document.querySelector(".todo-lists");

  const addListButton = document.querySelector(".btn-add");
  const listNameInput = document.querySelector("#list-name-input");
  const saveListButton = document.querySelector("#save-list-button");

  addListButton.addEventListener("click", () => {
    console.log("Add list button clicked");
    listNameInput.classList.add("show");
    saveListButton.classList.add("show");
  });

  saveListButton.addEventListener("click", async () => {
    const listName = listNameInput.value.trim();
    if (listName) {
      try {
        const response = await fetch("/api/lists", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ list_name: listName }),
          credentials: "include",
        });

        if (response.ok) {
          const newList = await response.json();
          // Add the new list to "My Lists" on the page
          const listItem = document.createElement("div");
          listItem.classList.add('list-item');
          listItem.dataset.id = newList.id;
          myListContainer.appendChild(listItem);

          // Re-bind the event listener to the new item
          listItem.addEventListener('click', function() {
            todoLists.forEach(otherDiv => {
              otherDiv.style.backgroundColor = ""; 
            });
            this.style.backgroundColor = "red";
            selectedTodoID = this.dataset.id;
          });
          location.reload();

          // Re-bind the delete event listener to the new button
         
          // Clear input and hide the fields again
          listNameInput.value = "";
          listNameInput.classList.remove("show");
          saveListButton.classList.remove("show");
        } else {
          console.error("Failed to create the list");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  })
